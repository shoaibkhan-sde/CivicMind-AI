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

        message = sanitize_text(data.message)
        history = data.history
        app_context = data.appContext
        
        # Build system context based on app state
        system_context = ""
        if app_context:
            stage = app_context.get("currentStage")
            if isinstance(stage, dict):
                system_context = f"User is currently at stage: {stage.get('title', 'Unknown')}. Focus on {stage.get('description', 'learning')}."
            elif isinstance(stage, str):
                system_context = f"User is currently at stage: {stage}."

        reply, error = AIService.generate_reply(message, history=history, system_context=system_context)
        
        if error:
            logger.error(f"AI Chat failed. Detail: {error}")
            return jsonify({"error": "AI failed", "details": error}), 503
            
        return jsonify({"reply": reply}), 200

    except Exception as e:
        logger.error("Chat error: %s", str(e), exc_info=True)
        return jsonify({"error": "Internal server error"}), 500
