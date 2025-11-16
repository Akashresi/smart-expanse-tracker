# backend/routes/auth.py
from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
import crud
import schemas
from database import get_db
from datetime import timedelta
from auth_utils import create_access_token, get_current_user # ✅ Import
import models # ✅ Import models

router = APIRouter(prefix="/auth", tags=["Authentication"])

ACCESS_TOKEN_EXPIRE_MINUTES = 30

@router.post("/register", response_model=schemas.RegisterResponse)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    existing = crud.get_user_by_email(db, email=user.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    new_user = crud.create_user(db=db, user=user)
    
    # ✅ Create a token for the new user
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": new_user.email}, expires_delta=access_token_expires
    )
    
    return {
        "message": "User registered successfully",
        # ✅ Return token and user object
        "access_token": access_token,
        "token_type": "bearer",
        "user": schemas.UserResponse.model_validate(new_user)
    }

@router.post("/login") # ✅ This will be our token endpoint
def login(credentials: schemas.LoginRequest, db: Session = Depends(get_db)):
    existing = crud.get_user_by_email(db, email=credentials.email)
    
    if not existing or not crud.verify_password(credentials.password, existing.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # ✅ Create and return a token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": existing.email}, expires_delta=access_token_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": schemas.UserResponse.model_validate(existing)
    }

# ✅ ADD A NEW ROUTE to get the current user's data from their token
@router.get("/users/me", response_model=schemas.UserResponse)
async def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user

# ... (your /verify-details and /reset-password routes are fine) ...
router.post("/verify-details")
def verify_user_for_reset(details: schemas.UserVerifyRequest, db: Session = Depends(get_db)):
    user = crud.verify_user_details(db, details=details)
    if not user:
        raise HTTPException(status_code=404, detail="User details do not match.")
    return {"message": "User verified successfully."}

@router.post("/reset-password")
def reset_password(request: schemas.PasswordResetRequest, db: Session = Depends(get_db)):
    user = crud.update_user_password_by_email(
        db, 
        email=request.email, 
        new_password=request.new_password
    )
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    return {"message": "Password updated successfully."}