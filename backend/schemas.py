# backend/schemas.py
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import date as DateType

# ... (UserBase, UserCreate, UserResponse schemas are fine) ...
class UserBase(BaseModel):
    name: str
    email: str
class UserCreate(UserBase):
    password: str
    date_of_birth: Optional[DateType] = None
    age: Optional[int] = None
    gender: Optional[str] = None
class UserResponse(UserBase):
    id: int
    date_of_birth: Optional[DateType] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)


# ... (SavingGoal schemas are fine) ...
class SavingGoalBase(BaseModel):
    title: str
    target_amount: float
    user_id: int
class SavingGoalCreate(SavingGoalBase):
    pass
class SavingGoalUpdate(BaseModel):
    saved_amount: float
class SavingGoalResponse(SavingGoalBase):
    id: int
    saved_amount: float
    model_config = ConfigDict(from_attributes=True)

# ... (Expense schemas are fine) ...
class ExpenseBase(BaseModel):
  category: str
  amount: float
  date: Optional[DateType] = Field(default_factory=DateType.today) 
  user_id: int
  description: Optional[str] = None
class ExpenseCreate(ExpenseBase):
    pass
class ExpenseResponse(ExpenseBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

# ... (Chatbot schemas are fine) ...
class ChatRequest(BaseModel):
    message: str = Field(..., description="User message for chatbot")
class ChatReply(BaseModel):
    reply: str = Field(..., description="Chatbot's generated response")


# ---------- AUTH SCHEMAS ----------
class LoginRequest(BaseModel):
    email: str
    password: str

# ✅ This schema now matches the /register response
class RegisterResponse(BaseModel):
    message: str
    access_token: str
    token_type: str
    user: UserResponse

# ✅ ADD THIS SCHEMA for the /login response
class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class UserVerifyRequest(BaseModel):
    email: str
    name: str
    date_of_birth: DateType

class PasswordResetRequest(BaseModel):
    email: str
    new_password: str