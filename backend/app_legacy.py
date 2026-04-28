"""
CivicMind AI — Flask Backend
Provides AI chat via Gemini 1.5 Flash, simulation, quiz, and analytics endpoints.
Secured with flask-limiter (rate limiting), flask-talisman (security headers),
and input sanitization. All configuration via environment variables.
"""

import json
import logging
import os
import re
import time
from datetime import datetime, timezone
from functools import wraps
from typing import Any

from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_talisman import Talisman
import firebase_admin
from firebase_admin import auth, credentials

# ── Environment & Logging ────────────────────────────────────────────────────

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler()],
)
logger = logging.getLogger(__name__)

# ── App initialization ────────────────────────────────────────────────────────

app = Flask(__name__)
app.secret_key = os.environ.get("FLASK_SECRET_KEY", "dev-secret-change-in-production")

# ── Firebase Admin initialization ───────────────────────────────────────────

try:
    cred_path = os.path.join(os.path.dirname(__file__), "serviceAccountKey.json")
    if os.path.exists(cred_path):
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
        logger.info("Firebase Admin initialized with service account")
    else:
        firebase_admin.initialize_app()
        logger.info("Firebase Admin initialized with default credentials")
except Exception as e:
    logger.error("Failed to initialize Firebase Admin: %s", str(e))

is_dev = os.environ.get("FLASK_ENV", "development") == "development"

# ── CORS ─────────────────────────────────────────────────────────────────────

CORS(
    app,
    origins=(
        ["http://localhost:3000", "http://localhost:3001",
         "http://localhost:3002", "http://localhost:3003"]
        if is_dev else []
    ),
    supports_credentials=False,
)

# ── Rate limiting ─────────────────────────────────────────────────────────────

limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://",
)

# ── Security headers via Talisman ─────────────────────────────────────────────

csp = {
    "default-src": "'self'",
    "script-src": [
        "'self'",
        "https://www.googletagmanager.com",
        "https://www.google-analytics.com",
    ],
    "connect-src": [
        "'self'",
        "https://firebaseio.com",
        "https://*.googleapis.com",
        "https://generativelanguage.googleapis.com",
        "https://*.firebaseio.com",
    ],
    "font-src": ["'self'", "https://fonts.gstatic.com"],
    "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
    "img-src": ["'self'", "data:", "https:"],
    "frame-ancestors": "'none'",
}

Talisman(
    app,
    content_security_policy=csp if not is_dev else False,
    force_https=not is_dev,
    strict_transport_security=not is_dev,
    session_cookie_secure=not is_dev,
    frame_options="DENY",
)

# ── Gemini AI client ──────────────────────────────────────────────────────────

try:
    import google.generativeai as genai

    gemini_api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    if not gemini_api_key:
        logger.warning("GEMINI_API_KEY not set — AI chat will return an error")
        gemini_model = None
    else:
        genai.configure(api_key=gemini_api_key)
        gemini_model = genai.GenerativeModel(
            model_name="gemini-flash-latest",
            system_instruction=(
                "You are SAGE — a wise, warm civic mentor owl who guides Indian citizens "
                "through understanding their democratic process. "
                "ALWAYS speak in the first person. Be encouraging, never condescending. "
                "Use simple analogies. Max 3 sentences per response. "
                "Start responses with a relevant emoji. "
                "If user is a beginner (level < 3): use cricket/Bollywood analogies. "
                "If user is intermediate (level 3-6): use real political examples. "
                "If user is advanced (level 7+): use constitutional references. "
                "Never answer anything unrelated to Indian democracy and elections. "
                "If asked off-topic, redirect warmly: 'That's interesting! But let's "
                "focus on your civic journey!'"
            ),
        )
        logger.info("Sage Mentor (Gemini 1.5 Flash Latest) initialized")
except ImportError:
    logger.error("google-generativeai package not installed")
    gemini_model = None


# ── Utility functions ─────────────────────────────────────────────────────────


def sanitize_text(text: str, max_length: int = 500) -> str:
    """
    Strip HTML/script tags, trim whitespace, and enforce maximum length.

    Args:
        text: Raw user input string.
        max_length: Maximum allowed character count.

    Returns:
        Cleaned string.

    Raises:
        ValueError: If input is empty after sanitization or exceeds max_length.
    """
    if not isinstance(text, str):
        raise ValueError("Input must be a string")

    cleaned = re.sub(r"<script[^>]*>.*?</script>", "", text, flags=re.DOTALL | re.IGNORECASE)
    cleaned = re.sub(r"<[^>]+>", "", cleaned)
    cleaned = cleaned.strip()

    if not cleaned:
        raise ValueError("Input cannot be empty")

    if len(cleaned) > max_length:
        raise ValueError(f"Input must not exceed {max_length} characters")

    return cleaned


def json_error(message: str, code: str, status: int) -> tuple[Any, int]:
    """
    Return a structured JSON error response.

    Args:
        message: Human-readable error description.
        code: Machine-readable error code string.
        status: HTTP status code.

    Returns:
        Tuple of (Flask response, HTTP status).
    """
    return jsonify({"error": message, "code": code}), status


def require_json(func):
    """
    Decorator that enforces Content-Type: application/json on POST routes.

    Args:
        func: The route function to wrap.

    Returns:
        Wrapped function that validates Content-Type first.
    """
    @wraps(func)
    def wrapper(*args, **kwargs):
        if request.method == "OPTIONS":
            return "", 200
        if not request.is_json:
            return json_error(
                "Content-Type must be application/json",
                "INVALID_CONTENT_TYPE",
                415,
            )
        return func(*args, **kwargs)

    return wrapper


def require_auth(func):
    """
    Soft auth decorator. Verifies Firebase ID Token if present in Authorization header.
    Sets request.user to the decoded token dict if valid, or None for guests/anonymous.
    Never hard-blocks a request — guests proceed with request.user = None.

    Args:
        func: The route function to wrap.

    Returns:
        Wrapped function with request.user populated.
    """
    @wraps(func)
    def wrapper(*args, **kwargs):
        if request.method == "OPTIONS":
            return "", 200

        # Default: treat as guest
        request.user = None

        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            id_token = auth_header.split("Bearer ", 1)[1].strip()

            # Reject placeholder tokens from uninitialized frontend state
            if id_token and id_token not in ("undefined", "null", ""):
                try:
                    decoded_token = auth.verify_id_token(id_token)
                    request.user = decoded_token
                    logger.debug("Auth verified for uid: %s", decoded_token.get("uid"))
                except Exception as e:
                    # Invalid token — continue as guest, do not block
                    logger.warning(
                        "Auth token invalid, continuing as guest: %s", str(e)
                    )

        return func(*args, **kwargs)

    return wrapper


# ── Quiz answer key ───────────────────────────────────────────────────────────

QUIZ_ANSWERS: dict[str, int] = {
    "q1": 1,
    "q2": 1,
    "q3": 1,
    "q4": 1,
    "q5": 2,
    "q6": 1,
    "q7": 2,
    "q8": 1,
    "q9": 1,
    "q10": 1,
}


# ── Routes ────────────────────────────────────────────────────────────────────


@app.route("/api/health", methods=["GET"])
def health_check() -> tuple[Any, int]:
    """
    Health check endpoint for deployment monitoring.

    Returns:
        JSON with status and timestamp.
    """
    return jsonify({"status": "ok", "timestamp": datetime.utcnow().isoformat()}), 200


@app.route("/api/chat", methods=["POST"])
@require_json
@require_auth
@limiter.limit("10 per minute")
def chat() -> tuple[Any, int]:
    """
    AI chat endpoint powered by Gemini 1.5 Flash (Sage the Mentor).

    Accepts JSON body:
        {
            "message": str,
            "appContext": {
                "currentStage": str,
                "userLevel": int,
                "xp": int,
                "weakTopics": list[str],
                "lastWrongAnswer": str,
                "questionsAsked": int
            }
        }

    Returns:
        JSON { "reply": str, "timestamp": str } or structured error.
    """
    try:
        data = request.get_json(silent=True) or {}
        raw_message = data.get("message", "")

        # FIX 1: null-safe appContext parsing
        # data.get("appContext", {}) returns None if key exists with null value
        raw_context = data.get("appContext")
        app_context = raw_context if isinstance(raw_context, dict) else {}

        # Validate and sanitize message
        try:
            message = sanitize_text(raw_message, max_length=500)
        except ValueError as ve:
            return json_error(str(ve), "INVALID_INPUT", 400)

        if gemini_model is None:
            return json_error("AI service is not available", "AI_UNAVAILABLE", 503)

        # Extract context fields safely
        stage = str(app_context.get("currentStage", "general"))[:50]
        level = int(app_context.get("userLevel", 1))
        weak_topics = app_context.get("weakTopics", [])
        last_wrong = str(app_context.get("lastWrongAnswer", ""))[:100]

        # FIX 2: safe request.user access (may be None for guests)
        user_email = request.user.get("email") if request.user else "guest"
        user_uid = request.user.get("uid") if request.user else "anonymous"
        logger.info(
            "Chat request received",
            extra={"user": user_email, "level": level, "stage": stage},
        )

        # Build context-aware prompt
        weak_str = ", ".join(weak_topics) if weak_topics else "none identified yet"
        prompt = (
            f"[User Level: {level} | Current Stage: {stage} | "
            f"Weak Topics: {weak_str} | Last Wrong Answer: {last_wrong or 'none'}]\n\n"
            f"User asks: {message}"
        )

        # Call Gemini with inner error handling
        try:
            response = gemini_model.generate_content(prompt)
            if response.candidates and response.candidates[0].content.parts:
                reply_text = response.text.strip()
            else:
                reply_text = (
                    "🦉 I'm focusing my owl-wisdom... Could you rephrase that? "
                    "Let's keep exploring your civic journey!"
                )
        except Exception as gen_err:
            logger.error("Gemini call failed: %s", str(gen_err))
            reply_text = "🦉 My owl-senses are a bit foggy right now. Could you try again in a moment?"

        return jsonify({"reply": reply_text, "timestamp": datetime.now(timezone.utc).isoformat()}), 200

    except Exception as e:
        logger.error("Chat endpoint error: %s", str(e), exc_info=True)
        return json_error("Internal server error. Please try again.", "INTERNAL_ERROR", 500)


@app.route("/api/quiz/submit", methods=["POST"])
@require_json
@limiter.limit("20 per minute")
def quiz_submit() -> tuple[Any, int]:
    """
    Quiz submission endpoint. Calculates score and returns per-answer feedback.

    Accepts JSON body:
        { "answers": [{"questionId": str, "selectedIndex": int}], "quizId": str }

    Returns:
        JSON { "score": int, "total": int, "feedback": list[dict] }
    """
    try:
        data = request.get_json(silent=True) or {}
        answers = data.get("answers", [])
        quiz_id = str(data.get("quizId", "default"))[:50]

        if not isinstance(answers, list):
            return json_error("'answers' must be an array", "INVALID_INPUT", 400)

        if len(answers) > 20:
            return json_error("'answers' must not exceed 20 items", "INVALID_INPUT", 400)

        for item in answers:
            if not isinstance(item, dict):
                return json_error("Each answer must be an object", "INVALID_INPUT", 400)
            if not isinstance(item.get("selectedIndex"), int):
                return json_error(
                    "Each answer must have an integer 'selectedIndex'",
                    "INVALID_INPUT",
                    400,
                )

        logger.info(
            "Quiz submission received",
            extra={"quiz_id": quiz_id, "count": len(answers)},
        )

        score = 0
        feedback = []

        for item in answers:
            question_id = str(item.get("questionId", ""))
            selected = item.get("selectedIndex", -1)
            correct = QUIZ_ANSWERS.get(question_id)
            is_correct = correct is not None and selected == correct

            if is_correct:
                score += 1

            feedback.append(
                {
                    "questionId": question_id,
                    "isCorrect": is_correct,
                    "correctIndex": correct,
                }
            )

        return jsonify({"score": score, "total": len(answers), "feedback": feedback}), 200

    except Exception as e:
        logger.error("Quiz submit error: %s", str(e), exc_info=True)
        return json_error("Internal server error. Please try again.", "INTERNAL_ERROR", 500)


@app.route("/api/simulate", methods=["POST"])
@require_json
@require_auth
@limiter.limit("20 per minute")
def simulate() -> tuple[Any, int]:
    """
    Generates a narrative consequence for a candidate simulation decision.

    Accepts JSON body:
        {
            "day": int,
            "phase": str,
            "decision": str,
            "stats": { "trust": int, "reach": int, "momentum": int },
            "constituency": str
        }

    Returns:
        JSON { "narrative": str, "stat_changes": dict, "xp_earned": int }
    """
    try:
        data = request.get_json(silent=True) or {}

        # Sanitize all string inputs
        try:
            decision = sanitize_text(str(data.get("decision", "proceed")), max_length=200)
        except ValueError:
            decision = "proceed with the campaign"

        raw_stats = data.get("stats")
        stats = raw_stats if isinstance(raw_stats, dict) else {}
        day = max(1, min(int(data.get("day", 1)), 30))
        constituency = str(data.get("constituency", "Rural"))[:50]
        phase = str(data.get("phase", "campaign"))[:30]

        if gemini_model is None:
            return json_error("AI service is not available", "AI_UNAVAILABLE", 503)

        prompt = (
            f"You are narrating an Indian election simulation. "
            f"A candidate in a {constituency} constituency (phase: {phase}) "
            f"just chose on Day {day}: {decision}\n"
            f"Current Stats — Trust: {stats.get('trust', 0)}, "
            f"Reach: {stats.get('reach', 0)}, "
            f"Momentum: {stats.get('momentum', 0)}\n\n"
            "Write exactly 2 sentences describing the immediate consequence. "
            "Be specific, realistic, and educational about Indian election politics."
        )

        # FIX 3: Gemini call wrapped in its own try/except
        try:
            response = gemini_model.generate_content(prompt)
            narrative = (
                response.text.strip()
                if response.text
                else "The campaign continues to unfold across the constituency."
            )
        except Exception as gen_err:
            logger.error("Gemini simulate call failed: %s", str(gen_err))
            narrative = (
                "Your decision echoes through the constituency. "
                "The campaign evolves as voters watch closely."
            )

        return jsonify(
            {
                "narrative": narrative,
                "stat_changes": {"trust": 2, "reach": 5, "momentum": 3},
                "xp_earned": 20,
            }
        ), 200

    except Exception as e:
        logger.error("Simulate endpoint error: %s", str(e), exc_info=True)
        return json_error("Internal server error.", "INTERNAL_ERROR", 500)


@app.route("/api/quiz/adaptive", methods=["POST"])
@require_json
@require_auth
def quiz_adaptive() -> tuple[Any, int]:
    """
    Returns adaptive quiz routing signal based on user performance.

    Accepts JSON body:
        {
            "userId": str,
            "stage": str,
            "lastResult": bool,
            "currentDifficulty": str,
            "weakTopics": list[str]
        }

    Returns:
        JSON { "status": str, "nextDifficulty": str, "focusTopic": str | None }
    """
    try:
        data = request.get_json(silent=True) or {}
        last_result = bool(data.get("lastResult", True))
        current_difficulty = str(data.get("currentDifficulty", "easy"))
        weak_topics = data.get("weakTopics", [])
        weak_topics = weak_topics if isinstance(weak_topics, list) else []

        # Adaptive difficulty logic
        difficulty_map = {
            ("easy", True): "medium",
            ("easy", False): "easy",
            ("medium", True): "hard",
            ("medium", False): "easy",
            ("hard", True): "hard",
            ("hard", False): "medium",
        }
        next_difficulty = difficulty_map.get(
            (current_difficulty, last_result), "easy"
        )
        focus_topic = weak_topics[0] if weak_topics else None

        return jsonify(
            {
                "status": "ready",
                "nextDifficulty": next_difficulty,
                "focusTopic": focus_topic,
            }
        ), 200

    except Exception as e:
        logger.error("Quiz adaptive error: %s", str(e), exc_info=True)
        return json_error("Internal server error.", "INTERNAL_ERROR", 500)


@app.route("/api/analytics/confusion", methods=["POST"])
@require_json
@require_auth
def analytics_confusion() -> tuple[Any, int]:
    """
    Logs a confusion event and returns a contextual Sage encouragement message.

    Accepts JSON body:
        { "userId": str, "stage": str, "trigger": str, "topic": str }

    Returns:
        JSON { "logged": bool, "sage_message": str }
    """
    try:
        data = request.get_json(silent=True) or {}
        topic = str(data.get("topic", "democracy"))[:100]
        stage = str(data.get("stage", "general"))[:50]
        trigger = str(data.get("trigger", "unknown"))[:50]

        logger.info(
            "Confusion event logged",
            extra={"topic": topic, "stage": stage, "trigger": trigger},
        )

        # Default fallback message (used if Gemini unavailable or fails)
        fallback = f"🦉 Don't worry about {topic} — it confuses many people at first! Let's break it down together."

        if gemini_model is None:
            return jsonify({"logged": True, "sage_message": fallback}), 200

        prompt = (
            f"Sage the civic owl mentor: The user is confused about '{topic}' "
            f"while on the '{stage}' stage. "
            "Give them one warm, encouraging sentence and offer to explain it simply."
        )

        try:
            response = gemini_model.generate_content(prompt)
            message = response.text.strip() if response.text else fallback
        except Exception as gen_err:
            logger.error("Gemini confusion message failed: %s", str(gen_err))
            message = fallback

        return jsonify({"logged": True, "sage_message": message}), 200

    except Exception as e:
        logger.error("Analytics confusion error: %s", str(e), exc_info=True)
        # Always return 200 for analytics — never block the user flow
        return jsonify(
            {"logged": False, "sage_message": "🦉 I'm here to help! Don't give up."}
        ), 200


@app.route("/api/generate-quiz", methods=["POST"])
@require_json
@require_auth
@limiter.limit("15 per minute")
def generate_quiz() -> tuple[Any, int]:
    """
    Generates a unique civic quiz question using Gemini AI.

    Accepts JSON body:
        { "stage": str, "difficulty": str }

    Returns:
        JSON quiz question object with options, correctIndex, explanation, xpReward.
    """
    try:
        data = request.get_json(silent=True) or {}
        stage = str(data.get("stage", "announcement"))[:50]
        difficulty = str(data.get("difficulty", "easy"))[:20]

        if gemini_model is None:
            return json_error("AI service is not available", "AI_UNAVAILABLE", 503)

        prompt = (
            f"You are Sage, a Civic Mentor. Generate a unique, high-quality "
            f"multiple-choice quiz question about the '{stage}' stage of the "
            f"Indian Election process. Difficulty level: '{difficulty}'.\n\n"
            "Respond ONLY with a valid JSON object — no markdown, no backticks:\n"
            "{\n"
            '  "question": "The question text",\n'
            '  "options": ["Option A", "Option B", "Option C", "Option D"],\n'
            '  "correctIndex": 0,\n'
            '  "explanation": "Why this is correct",\n'
            '  "wrongExplanations": ["Why A is wrong", "Why B is wrong", "Why C is wrong", "Why D is wrong"],\n'
            '  "xpReward": 50\n'
            "}\n"
            "Ensure the question is factually accurate about Indian elections."
        )

        try:
            response = gemini_model.generate_content(prompt)
            text = response.text.strip() if response.text else ""

            # Strip markdown code fences if present
            if "```json" in text:
                text = text.split("```json")[1].split("```")[0].strip()
            elif "```" in text:
                text = text.split("```")[1].split("```")[0].strip()

            quiz_data = json.loads(text)

            # Validate required fields
            required = ["question", "options", "correctIndex", "explanation"]
            for field in required:
                if field not in quiz_data:
                    raise ValueError(f"Missing field: {field}")

            return jsonify(quiz_data), 200

        except (json.JSONDecodeError, ValueError, KeyError) as parse_err:
            logger.error("Quiz JSON parse error: %s", str(parse_err))
            # Structured fallback question
            return jsonify(
                {
                    "question": f"Who is the constitutional authority that conducts elections in India?",
                    "options": ["Prime Minister", "President", "Election Commission of India", "Parliament"],
                    "correctIndex": 2,
                    "explanation": "The Election Commission of India (ECI) is an autonomous constitutional authority responsible for administering elections.",
                    "wrongExplanations": [
                        "The Prime Minister is a candidate, not an election authority.",
                        "The President appoints the Chief Election Commissioner but does not conduct elections.",
                        "Parliament makes electoral laws but does not administer elections.",
                    ],
                    "xpReward": 20,
                }
            ), 200

    except Exception as e:
        logger.error("Generate quiz error: %s", str(e), exc_info=True)
        return json_error("Internal server error.", "INTERNAL_ERROR", 500)


# ── Error handlers ────────────────────────────────────────────────────────────


@app.errorhandler(404)
def not_found(e: Exception) -> tuple[Any, int]:
    """Handle 404 Not Found errors with structured JSON."""
    return json_error("Endpoint not found", "NOT_FOUND", 404)


@app.errorhandler(405)
def method_not_allowed(e: Exception) -> tuple[Any, int]:
    """Handle 405 Method Not Allowed errors with structured JSON."""
    return json_error("Method not allowed", "METHOD_NOT_ALLOWED", 405)


@app.errorhandler(429)
def rate_limit_exceeded(e: Exception) -> tuple[Any, int]:
    """Handle rate limit errors with structured JSON and Retry-After header."""
    response = jsonify(
        {
            "error": "Rate limit exceeded. Please wait before retrying.",
            "code": "RATE_LIMITED",
        }
    )
    response.status_code = 429
    response.headers["Retry-After"] = "60"
    return response, 429


@app.errorhandler(500)
def internal_error(e: Exception) -> tuple[Any, int]:
    """Handle unexpected 500 errors with structured JSON."""
    logger.error("Unhandled 500 error: %s", str(e))
    return json_error("Internal server error", "INTERNAL_ERROR", 500)


# ── Entry point ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    logger.info("Starting CivicMind AI backend on port %d (debug=%s)", port, is_dev)
    # use_reloader=False avoids [WinError 10038] on Windows
    app.run(host="0.0.0.0", port=port, debug=is_dev, use_reloader=False)