import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# API kalitni sozlash (GEMINI_API_KEY yoki GOOGLE_API_KEY ni o'qiydi)
api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

def get_llm_response(system_prompt: str, history_messages: list, user_message: str) -> str:
    """
    Gemini orqali javob olish funksiyasi
    """
    # Ishlatiladigan model (masalan, gemini-1.5-pro yoki gemini-1.5-flash)
    model_name = os.getenv("GEMINI_MODEL", "gemini-1.5-pro")
    
    # System instruction bilan modelni yaratish
    model = genai.GenerativeModel(
        model_name=model_name,
        system_instruction=system_prompt
    )
    
    # Oldingi xabarlarni Gemini qabul qiladigan formatga o'tkazish
    gemini_history = []
    for msg in history_messages:
        role = "user" if msg.role == "user" else "model"
        gemini_history.append({"role": role, "parts": [msg.content]})
        
    # Chat seansini boshlash va xabar yuborish
    chat = model.start_chat(history=gemini_history)
    response = chat.send_message(user_message)
    
    return response.text