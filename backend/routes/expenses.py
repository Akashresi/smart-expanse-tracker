# backend/routes/expenses.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import crud
import schemas
import models # ✅ Import models
from auth_utils import get_current_user # ✅ Import the dependency

router = APIRouter(prefix="/expenses", tags=["Expenses"])

# ❗️ This route is now protected.
# We get the user from the token, not a URL parameter.
@router.get("/", response_model=list[schemas.ExpenseResponse])
def get_expenses_by_user(
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    """Get all expenses for the *currently authenticated* user"""
    return crud.get_expenses_by_user(db=db, user_id=current_user.id)

# ❗️ This route is now protected.
@router.post("/", response_model=schemas.ExpenseResponse)
def create_expense(
    expense: schemas.ExpenseCreate, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    """Create a new expense for the *currently authenticated* user"""
    
    # ✅ Check if the user_id in the payload matches the token user
    if expense.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to create expense for this user")
        
    return crud.create_expense(db=db, expense=expense)

# ❗️ This route is now protected.
@router.get("/analysis/{user_id}")
def analyze_expenses(
    user_id: int, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    """Analyze weekly, monthly spending and behavioral savings pattern"""
    # ✅ Check if the user_id in the URL matches the token user
    if user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this analysis")

    return crud.analyze_user_expenses(db=db, user_id=user_id)