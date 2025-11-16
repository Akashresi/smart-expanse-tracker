from fastapi import APIRouter
from schemas import ChatRequest, ChatReply

router = APIRouter(prefix="/chatbot", tags=["Chatbot"])

@router.post("/", response_model=ChatReply)
def chat_with_bot(request: ChatRequest):
    # Simple placeholder logic
    user_msg = request.message
    return ChatReply(reply=f"Bot reply to: {user_msg}")
