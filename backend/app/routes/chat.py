from flask import Blueprint, request, jsonify
from ..services.ai_service import AIService
from ..utils.security import sanitize_text, require_auth, require_json
from ..extensions import limiter
import logging

chat_bp = Blueprint("chat", __name__)
logger = logging.getLogger(__name__)

@chat_bp.route("/", methods=["POST"])
@require_json
@require_auth
@limiter.limit("10 per minute")
def chat():
    try:
        from ..utils.security import ChatRequest
        from pydantic import ValidationError
        
        try:
            data = ChatRequest(**request.get_json())
        except ValidationError as e:
            return jsonify({"error": e.errors(), "code": "VALIDATION_ERROR"}), 400
            
        try:
            message = sanitize_text(data.message)
        except ValueError as e:
            return jsonify({"error": str(e), "code": "INVALID_INPUT"}), 400
            
        # Build Context Prompt
        app_context = data.appContext
        history = data.history

        stage = str(app_context.get("currentStage", "general"))[:50]
        level = int(app_context.get("userLevel", 1))
        
        system_context = f"[Context - Level: {level}, Stage: {stage}]"
        
        # Check if history is too long and needs summarization
        # (This is a simplified version of the sliding window)
        if len(history) > 15:
            summary = AIService.summarize_history(history[:-10])
            history = [{"role": "assistant", "content": f"Summary of previous chat: {summary}"}] + history[-10:]

        reply, error = AIService.generate_reply(message, history=history, system_context=system_context)
        
        if error:
            return jsonify({"error": "AI failed", "details": error}), 503
            
        return jsonify({"reply": reply}), 200

    except Exception as e:
        logger.error("Chat error: %s", str(e), exc_info=True)
        return jsonify({"error": "Internal server error"}), 500
