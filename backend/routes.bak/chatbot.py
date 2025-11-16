# my-app/backend/routes/chatbot.py
from fastapi import APIRouter
from schemas import ChatRequest

router = APIRouter(prefix="/chatbot", tags=["Chatbot"])

@router.post("/ask")
def ask_bot(data: ChatRequest):
    # Placeholder simple reply — replace with ai.ai_model.get_ai_reply if present
    query = data.query.lower()
    if "save" in query or "saving" in query:
        reply = "Try the 50/30/20 saving rule and automate transfers."
    else:
        reply = f"I heard: {data.query}"
    return {"reply": reply}
