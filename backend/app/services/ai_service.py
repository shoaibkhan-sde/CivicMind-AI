import os
import logging
import google.generativeai as genai
from flask import current_app

# For Vertex AI
try:
    import vertexai
    from vertexai.generative_models import GenerativeModel, ChatSession
    VERTEX_AVAILABLE = True
except ImportError:
    VERTEX_AVAILABLE = False

logger = logging.getLogger(__name__)

class AIService:
    _model = None
    _use_vertex = False

    @classmethod
    def init_ai(cls):
        """Initialize AI engine (Vertex AI or Gemini API)."""
        api_key = current_app.config.get("GEMINI_API_KEY")
        project = current_app.config.get("VERTEX_PROJECT")
        location = current_app.config.get("VERTEX_LOCATION", "us-central1")

        if project and VERTEX_AVAILABLE:
            try:
                vertexai.init(project=project, location=location)
                cls._model = GenerativeModel("gemini-1.5-flash")
                cls._use_vertex = True
                logger.info("Vertex AI initialized successfully")
                return
            except Exception as e:
                logger.warning("Vertex AI initialization failed, falling back to Gemini API: %s", str(e))

        if api_key:
            genai.configure(api_key=api_key)
            cls._model = genai.GenerativeModel(
                model_name="gemini-1.5-flash",
                system_instruction=(
                    "You are SAGE — a wise, warm civic mentor owl who guides Indian citizens. "
                    "Max 3 sentences. Emoji start."
                )
            )
            cls._use_vertex = False
            logger.info("Gemini API initialized successfully")
        else:
            logger.error("No AI credentials found")

    @classmethod
    def get_model(cls):
        if cls._model is None:
            cls.init_ai()
        return cls._model

    @classmethod
    def generate_reply(cls, message: str, history: list = None, system_context: str = ""):
        model = cls.get_model()
        if not model:
            return None, "AI Service Unavailable"
        
        try:
            MAX_HISTORY = 10
            recent_history = history[-MAX_HISTORY:] if history else []
            
            if cls._use_vertex:
                # Vertex AI format
                from vertexai.generative_models import Content, Part
                chat_history = []
                for msg in recent_history:
                    chat_history.append(Content(
                        role="user" if msg["role"] == "user" else "model",
                        parts=[Part.from_text(msg["content"])]
                    ))
                chat = model.start_chat(history=chat_history)
            else:
                # Gemini API format
                chat_history = []
                for msg in recent_history:
                    chat_history.append({
                        "role": "user" if msg["role"] == "user" else "model",
                        "parts": [msg["content"]]
                    })
                chat = model.start_chat(history=chat_history)
            
            full_message = f"{system_context}\n\nUser: {message}" if system_context else message
            response = chat.send_message(full_message)
            
            if response.text:
                return response.text.strip(), None
            return None, "Empty response from AI"
        except Exception as e:
            logger.error("AI Generation error: %s", str(e))
            return None, str(e)

    @classmethod
    def summarize_history(cls, history: list):
        model = cls.get_model()
        if not model or not history:
            return ""
        try:
            history_text = "\n".join([f"{m['role']}: {m['content']}" for m in history])
            prompt = f"Summarize in 2 sentences:\n\n{history_text}"
            response = model.generate_content(prompt)
            return response.text.strip() if response.text else ""
        except Exception as e:
            logger.error("Summarization error: %s", str(e))
            return ""
