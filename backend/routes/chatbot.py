from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from schemas import ChatRequest, ChatReply, ScanRequest, ScanResponse
from auth_utils import get_current_user
from database import get_db
import crud
import models
from ai.ai_model import get_ai_reply, scan_notification
import json

router = APIRouter(prefix="/chatbot", tags=["Chatbot"])

@router.post("/", response_model=ChatReply)
def chat_with_bot(
    request: ChatRequest, 
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Fetch recent expenses to give AI context
    expenses = crud.get_user_expenses(db, user_id=current_user.id)
    # Convert to a simple dict list for the prompt
    context_data = [
        {"amount": e.amount, "category": e.category, "type": e.type, "date": str(e.date)} 
        for e in expenses[-10:] # last 10 expenses
    ]
    context_str = json.dumps(context_data)
    
    reply = get_ai_reply(request.message, context_str)
    return ChatReply(reply=reply)

@router.post("/scan", response_model=ScanResponse)
def scan_text(request: ScanRequest, current_user: models.User = Depends(get_current_user)):
    result = scan_notification(request.text)
    return ScanResponse(
        amount=result.get("amount", 0.0),
        source=result.get("source", "bank"),
        category=result.get("category", "Misc"),
        type=result.get("type", "debit")
    )
