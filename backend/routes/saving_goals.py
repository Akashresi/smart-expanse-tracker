# backend/routes/saving_goals.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import crud
import schemas

router = APIRouter(prefix="/goals", tags=["Saving Goals"])

@router.get("/user/{user_id}", response_model=list[schemas.SavingGoalResponse])
def get_goals_for_user(user_id: int, db: Session = Depends(get_db)):
    """✅ FIX: Fetch all saving goals for a *specific user*"""
    return crud.get_goals_by_user(db=db, user_id=user_id)

@router.post("/", response_model=schemas.SavingGoalResponse)
def add_goal(goal: schemas.SavingGoalCreate, db: Session = Depends(get_db)):
    """✅ FIX: Add a new saving goal using a Pydantic schema"""
    if not crud.get_user_by_id(db, user_id=goal.user_id):
         raise HTTPException(status_code=404, detail="User not found")
         
    return crud.create_saving_goal(db=db, goal=goal)

@router.patch("/{goal_id}", response_model=schemas.SavingGoalResponse)
def update_saved_amount(
    goal_id: int, 
    req: schemas.SavingGoalUpdate, 
    user_id: int, # ✅ Add user_id as query param for security
    db: Session = Depends(get_db)
):
    """
    ✅ BUG FIX: Update saved amount for a goal.
    This now SETS the amount, it does not ADD to it.
    It also ensures the goal belongs to the user.
    """
    updated_goal = crud.update_saving_goal_amount(
        db=db, 
        goal_id=goal_id, 
        user_id=user_id, 
        goal_update=req
    )
    if not updated_goal:
        raise HTTPException(status_code=404, detail="Goal not found or user does not own goal")
    
    return updated_goal