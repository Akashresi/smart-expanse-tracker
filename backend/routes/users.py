# backend/routes/users.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import crud
import schemas

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/", response_model=list[schemas.UserResponse])
def get_all_users(db: Session = Depends(get_db)):
    """Fetch all users"""
    return crud.get_all_users(db=db)

@router.get("/{user_id}", response_model=schemas.UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    """Fetch user by ID"""
    user = crud.get_user_by_id(db=db, user_id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user