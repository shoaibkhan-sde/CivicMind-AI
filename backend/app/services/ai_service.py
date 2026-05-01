import os
import logging

# Force stable v1 API version globally to avoid v1beta 404s
# This MUST happen BEFORE google.generativeai is imported
os.environ["GOOGLE_GENERATIVE_AI_API_VERSION"] = "v1"

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
        # Ensure v1 is set
        os.environ["GOOGLE_GENERATIVE_AI_API_VERSION"] = "v1"
        
        # Read keys directly from environment for maximum reliability
        api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
        project = os.environ.get("GOOGLE_CLOUD_PROJECT")
        location = os.environ.get("GOOGLE_CLOUD_LOCATION", "us-central1")
        model_name = os.environ.get("GEMINI_MODEL", "gemini-1.5-flash")

        if api_key:
            genai.configure(api_key=api_key)
            cls._model = genai.GenerativeModel(
                model_name=model_name,
                system_instruction=(
                    "You are SAGE — a wise, warm civic mentor owl who guides Indian citizens. "
                    "Max 3 sentences. Emoji start."
                )
            )
            cls._use_vertex = False
            logger.info("Gemini API initialized with model: %s", model_name)
            return

        if project and VERTEX_AVAILABLE:
            try:
                vertexai.init(project=project, location=location)
                cls._model = GenerativeModel(model_name)
                cls._use_vertex = True
                logger.info("Vertex AI initialized with model: %s", model_name)
                return
            except Exception as e:
                logger.warning("Vertex AI initialization failed: %s", str(e))
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
        
        primary_model_name = os.environ.get("GEMINI_MODEL", "gemini-1.5-flash")
        # List of models to try in order. If one fails (like 404), we try the next.
        model_aliases = [primary_model_name, "gemini-1.5-flash", "gemini-1.5-flash-8b", "gemini-pro"]
        
        last_error = None
        use_vertex_for_attempt = cls._use_vertex

        for m_name in model_aliases:
            try:
                current_model = model
                
                # If we're on a fallback attempt, we re-initialize for Gemini API with the new alias
                if (m_name != primary_model_name or not use_vertex_for_attempt) and not cls._use_vertex:
                    current_model = genai.GenerativeModel(
                        model_name=m_name,
                        system_instruction=(
                            "You are SAGE — a wise, warm civic mentor owl who guides Indian citizens. "
                            "Max 3 sentences. Emoji start."
                        )
                    )

                MAX_HISTORY = 10
                recent_history = history[-MAX_HISTORY:] if history else []
                
                if use_vertex_for_attempt:
                    from vertexai.generative_models import Content, Part
                    if m_name != primary_model_name:
                        current_model = GenerativeModel(m_name)
                    
                    chat_history = []
                    for msg in recent_history:
                        chat_history.append(Content(
                            role="user" if msg["role"] == "user" else "model",
                            parts=[Part.from_text(msg["content"])]
                        ))
                    chat = current_model.start_chat(history=chat_history)
                else:
                    chat_history = []
                    for msg in recent_history:
                        chat_history.append({
                            "role": "user" if msg["role"] == "user" else "model",
                            "parts": [msg["content"]]
                        })
                    chat = current_model.start_chat(history=chat_history)
                
                full_message = f"{system_context}\n\nUser: {message}" if system_context else message
                response = chat.send_message(full_message)
                
                if response.text:
                    return response.text.strip(), None
                
                last_error = f"Empty response from model {m_name}"
            except Exception as e:
                last_error = str(e)
                logger.error(f"AI Attempt failed (Vertex={use_vertex_for_attempt}, Model={m_name}): {last_error}", exc_info=True)
                
                # If Vertex failed, try Gemini API next
                if use_vertex_for_attempt:
                    use_vertex_for_attempt = False
                    continue

                if "404" in last_error or "not found" in last_error.lower():
                    continue
                break

        logger.error("All AI model attempts exhausted. Last Error: %s", last_error)
        return None, last_error

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
