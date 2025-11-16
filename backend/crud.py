# backend/crud.py
from sqlalchemy.orm import Session  # ✅ FIX: Import Session
from sqlalchemy import func, extract
from datetime import datetime, timedelta , date as DateType
from models import User, Expense, SavingGoal
import schemas
from passlib.context import CryptContext
from typing import Optional  # ✅ FIX: Import Optional

# ----------------------------
# Password Hashing Setup
# ----------------------------
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception:
        return False

# ----------------------------
# User CRUD
# ----------------------------
def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email).first()

def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    return db.query(User).filter(User.id == user_id).first()

def get_all_users(db: Session) -> list[User]:
    return db.query(User).all()

def create_user(db: Session, user: schemas.UserCreate) -> User:
    hashed_password = hash_password(user.password)
    new_user = User(
        name=user.name,
        email=user.email,
        password=hashed_password,
        date_of_birth=user.date_of_birth,
        age=user.age,
        gender=user.gender
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

# ----------------------------
# Expense CRUD
# ----------------------------
def get_expenses_by_user(db: Session, user_id: int) -> list[Expense]:
    return db.query(Expense).filter(Expense.user_id == user_id).order_by(Expense.date.desc()).all()

def get_all_expenses(db: Session) -> list[Expense]:
    return db.query(Expense).all()

def create_expense(db: Session, expense: schemas.ExpenseCreate) -> Expense:
    new_expense = Expense(**expense.model_dump())
    db.add(new_expense)
    db.commit()
    db.refresh(new_expense)
    return new_expense

def analyze_user_expenses(db: Session, user_id: int) -> dict:
    now = datetime.now().date()
    start_of_week = now - timedelta(days=now.weekday())
    start_of_last_week = start_of_week - timedelta(days=7)
    end_of_last_week = start_of_week - timedelta(days=1)
    start_of_month = now.replace(day=1)
    end_of_last_month = start_of_month - timedelta(days=1)
    start_of_last_month = end_of_last_month.replace(day=1)
    user_expenses_query = db.query(Expense).filter(Expense.user_id == user_id)
    def sum_in_range(start_date, end_date):
        total = user_expenses_query.filter(
            Expense.date >= start_date,
            Expense.date <= end_date
        ).with_entities(func.sum(Expense.amount)).scalar()
        return total or 0.0
    this_week_spent = sum_in_range(start_of_week, now)
    last_week_spent = sum_in_range(start_of_last_week, end_of_last_week)
    this_month_spent = sum_in_range(start_of_month, now)
    last_month_spent = sum_in_range(start_of_last_month, end_of_last_month)
    saved_this_week = max(last_week_spent - this_week_spent, 0)
    saved_this_month = max(last_month_spent - this_month_spent, 0)
    return {
        "this_week_spent": this_week_spent,
        "last_week_spent": last_week_spent,
        "this_month_spent": this_month_spent,
        "last_month_spent": last_month_spent,
        "saved_this_week": saved_this_week,
        "saved_this_month": saved_this_month,
    }

# ----------------------------
# SavingGoal CRUD
# ----------------------------
def get_goals_by_user(db: Session, user_id: int) -> list[SavingGoal]:
    return db.query(SavingGoal).filter(SavingGoal.user_id == user_id).all()

def get_goal_by_id(db: Session, goal_id: int) -> Optional[SavingGoal]:
    return db.query(SavingGoal).filter(SavingGoal.id == goal_id).first()

def create_saving_goal(db: Session, goal: schemas.SavingGoalCreate) -> SavingGoal:
    new_goal = SavingGoal(
        **goal.model_dump(),
        saved_amount=0
    )
    db.add(new_goal)
    db.commit()
    db.refresh(new_goal)
    return new_goal

def update_saving_goal_amount(db: Session, goal_id: int, user_id: int, goal_update: schemas.SavingGoalUpdate) -> Optional[SavingGoal]:
    goal = db.query(SavingGoal).filter(
        SavingGoal.id == goal_id,
        SavingGoal.user_id == user_id
    ).first()
    if not goal:
        return None
    goal.saved_amount = goal_update.saved_amount
    db.commit()
    db.refresh(goal)
    return goal

def verify_user_details(db: Session, details: schemas.UserVerifyRequest) -> Optional[User]:
    """
    Finds a user only if email, name, AND date_of_birth match.
    """
    return db.query(User).filter(
        User.email == details.email,
        User.name == details.name,
        User.date_of_birth == details.date_of_birth
    ).first()

# ✅ ADD THIS NEW FUNCTION TO UPDATE PASSWORD
def update_user_password_by_email(db: Session, email: str, new_password: str) -> Optional[User]:
    """
    Finds a user by email and updates their password with a new hash.
    """
    user = get_user_by_email(db, email=email)
    if user:
        user.password = hash_password(new_password)
        db.commit()
        db.refresh(user)
        return user
    return None