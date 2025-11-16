# my-app/backend/routes/users.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import SessionLocal
from models import User
from schemas import UserCreate, UserOut, LoginRequest

router = APIRouter(prefix="/users", tags=["Users"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    # Check existing
    existing = db.query(User).filter(User.email == user.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")
    # NOTE: Passwords are stored as plain text here (mirrors original). For production, hash!
    new_user = User(name=user.name, email=user.email, password=user.password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login")
def login_user(login_req: LoginRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == login_req.email, User.password == login_req.password).first()
    if existing:
        return {"message": "Login successful", "user_id": existing.id}
    raise HTTPException(status_code=401, detail="Invalid credentials")

@router.get("/{user_id}", response_model=UserOut)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
