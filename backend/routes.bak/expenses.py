# my-app/backend/routes/expenses.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from database import SessionLocal
from models import Expense
from schemas import ExpenseCreate, ExpenseOut

router = APIRouter(prefix="/expenses", tags=["Expenses"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=ExpenseOut)
def add_expense(expense: ExpenseCreate, db: Session = Depends(get_db)):
    new_exp = Expense(
        user_id=expense.user_id,
        title=expense.title,
        category=expense.category,
        amount=expense.amount,
        description=expense.description,
        date=expense.date or None,
    )
    db.add(new_exp)
    db.commit()
    db.refresh(new_exp)
    return new_exp

@router.get("/", response_model=List[ExpenseOut])
def list_expenses(user_id: Optional[int] = Query(None), db: Session = Depends(get_db)):
    if user_id is not None:
        result = db.query(Expense).filter(Expense.user_id == user_id).all()
    else:
        result = db.query(Expense).all()
    return result

@router.get("/{user_id}", response_model=List[ExpenseOut])
def get_expenses_for_user(user_id: int, db: Session = Depends(get_db)):
    expenses = db.query(Expense).filter(Expense.user_id == user_id).all()
    return expenses
