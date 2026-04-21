"""
CivicMind AI — Flask Backend
Provides AI chat via Gemini 1.5 Flash and quiz submission endpoints.
Secured with flask-limiter (rate limiting), flask-talisman (security headers),
and input sanitization. All configuration via environment variables.
"""

import logging
import os
import re
import time
from datetime import datetime
from typing import Any

from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_talisman import Talisman

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

is_dev = os.environ.get("FLASK_ENV", "development") == "development"

# ── CORS — restrict to localhost:3000 in development ─────────────────────────

CORS(
    app,
    origins=["http://localhost:3000"] if is_dev else [],
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
    x_frame_options="DENY",
)

# ── Gemini AI client ──────────────────────────────────────────────────────────

try:
    import google.generativeai as genai

    gemini_api_key = os.environ.get("GEMINI_API_KEY")
    if not gemini_api_key:
        logger.warning("GEMINI_API_KEY not set — AI chat will return an error")
        gemini_model = None
    else:
        genai.configure(api_key=gemini_api_key)
        gemini_model = genai.GenerativeModel(
            model_name="gemini-1.5-flash",
            system_instruction=(
                "You are CivicMind, an expert election education assistant. "
                "Explain election processes in simple, easy-to-understand language. "
                "Keep answers concise (maximum 3 sentences). "
                "Focus on civic education, voting rights, election timelines, and democratic processes. "
                "If asked anything unrelated to elections or civics, politely redirect the user "
                "back to election-related topics."
            ),
        )
        logger.info("Gemini 1.5 Flash model initialized")
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

    # Strip script tags and HTML
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
    from functools import wraps

    @wraps(func)
    def wrapper(*args, **kwargs):
        if not request.is_json:
            return json_error(
                "Content-Type must be application/json",
                "INVALID_CONTENT_TYPE",
                415,
            )
        return func(*args, **kwargs)

    return wrapper


# ── Quiz answer data ──────────────────────────────────────────────────────────

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
@limiter.limit("10 per minute")
def chat() -> tuple[Any, int]:
    """
    AI chat endpoint powered by Gemini 1.5 Flash.

    Accepts JSON body: { "message": str, "context": str }
    Sanitizes input, sends to Gemini, returns { "reply": str, "timestamp": str }

    Returns:
        JSON response with AI reply or structured error.
    """
    try:
        data = request.get_json(silent=True) or {}
        raw_message = data.get("message", "")
        context = data.get("context", "election_education")

        # Validate and sanitize message
        try:
            message = sanitize_text(raw_message, max_length=500)
        except ValueError as ve:
            return json_error(str(ve), "INVALID_INPUT", 400)

        if gemini_model is None:
            return json_error(
                "AI service is not available — GEMINI_API_KEY not configured",
                "AI_UNAVAILABLE",
                503,
            )

        logger.info("Chat request received", extra={"context": context, "msg_length": len(message)})

        # Call Gemini
        response = gemini_model.generate_content(message)
        reply_text = response.text.strip() if response.text else "I could not generate a response. Please try again."

        return (
            jsonify(
                {
                    "reply": reply_text,
                    "timestamp": datetime.utcnow().isoformat(),
                }
            ),
            200,
        )

    except Exception as e:
        logger.error("Chat endpoint error: %s", str(e))
        return json_error("Internal server error. Please try again.", "INTERNAL_ERROR", 500)


@app.route("/api/quiz/submit", methods=["POST"])
@require_json
@limiter.limit("20 per minute")
def quiz_submit() -> tuple[Any, int]:
    """
    Quiz submission endpoint. Calculates score and returns per-answer feedback.

    Accepts JSON body: { "answers": [{"questionId": str, "selectedIndex": int}], "quizId": str }
    Returns: { "score": int, "total": int, "feedback": list[dict] }
    """
    try:
        data = request.get_json(silent=True) or {}
        answers = data.get("answers", [])
        quiz_id = data.get("quizId", "default")

        # Validate answers array
        if not isinstance(answers, list):
            return json_error("'answers' must be an array", "INVALID_INPUT", 400)

        if len(answers) > 20:
            return json_error("'answers' must not exceed 20 items", "INVALID_INPUT", 400)

        for item in answers:
            if not isinstance(item, dict):
                return json_error("Each answer must be an object", "INVALID_INPUT", 400)
            if not isinstance(item.get("selectedIndex"), int):
                return json_error("Each answer must have an integer 'selectedIndex'", "INVALID_INPUT", 400)

        logger.info("Quiz submission received", extra={"quiz_id": quiz_id, "count": len(answers)})

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
        logger.error("Quiz submit error: %s", str(e))
        return json_error("Internal server error. Please try again.", "INTERNAL_ERROR", 500)


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
    response = jsonify({"error": "Rate limit exceeded. Please wait before retrying.", "code": "RATE_LIMITED"})
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
    debug = is_dev
    logger.info("Starting CivicMind AI backend on port %d (debug=%s)", port, debug)
    app.run(host="0.0.0.0", port=port, debug=debug)
