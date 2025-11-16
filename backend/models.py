from sqlalchemy import Column, Integer, String, Float, ForeignKey, Date, Text
from sqlalchemy.orm import relationship
from database import Base
from sqlalchemy.sql import func


# ---------- USER MODEL ----------
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=True)
    email = Column(String(150), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=False)

    # ✅ Added new profile fields
    date_of_birth = Column(Date, nullable=True)
    age = Column(Integer, nullable=True)
    gender = Column(String(20), nullable=True)

    # Relationships
    expenses = relationship("Expense", back_populates="user", cascade="all, delete")
    saving_goals = relationship("SavingGoal", back_populates="user", cascade="all, delete")


# ---------- EXPENSE MODEL ----------
class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    category = Column(String(50), nullable=False)
    amount = Column(Float, nullable=False)
    description = Column(Text, nullable=True)
    date = Column(Date, server_default=func.current_date())

    user = relationship("User", back_populates="expenses")


# ---------- SAVING GOAL MODEL ----------
class SavingGoal(Base):
    __tablename__ = "saving_goals"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100), nullable=False)
    target_amount = Column(Float, nullable=False)
    saved_amount = Column(Float, default=0.0)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))

    user = relationship("User", back_populates="saving_goals")
