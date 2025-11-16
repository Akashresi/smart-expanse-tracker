from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import users, expenses, chatbot, auth, saving_goals
from database import engine, Base
Base.metadata.create_all(bind=engine)
app = FastAPI(title="Personal Finance Backend API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(users.router)
app.include_router(expenses.router)
app.include_router(chatbot.router)
app.include_router(auth.router)
app.include_router(saving_goals.router)
@app.get("/")
def root():
    return {"message": "Backend is running successfully!"}
