# backend/ai/ai_model.py
import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    # Use gemini-1.5-flash for fast text tasks
    model = genai.GenerativeModel("gemini-1.5-flash")
else:
    model = None

def get_ai_reply(query: str, expenses_context: str) -> str:
    if not model:
        return "I need a GEMINI_API_KEY configured in the backend .env file to give you real AI advice!"
    
    prompt = f"""
You are What-bot, a smart, concise financial assistant for the Smart Expense Tracker app.
Here is the user's recent expense data for context (JSON):
{expenses_context}

User question: {query}

Provide a helpful, precise, and encouraging response. Keep it concise (max 3-4 sentences). Do not use markdown headers, just plain conversational text.
"""
    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print("AI Chat Error:", e)
        return "Sorry, I encountered an error while trying to process your request."

def scan_notification(text: str) -> dict:
    """
    Uses Gemini to extract structured expense/income data from a raw SMS or notification.
    """
    if not model:
        # Fallback heuristic logic if no AI key
        t = text.lower()
        is_credit = "credited" in t or "added" in t or "received" in t
        src = "cash" if "cash" in t else "bank"
        import re
        match = re.search(r'\d+(\.\d+)?', t)
        amt = float(match.group(0)) if match else 0.0
        return {
            "amount": amt,
            "source": src,
            "category": "Misc",
            "type": "credit" if is_credit else "debit"
        }

    prompt = f"""
Extract transaction details from the following SMS or app notification.
Notification: "{text}"

Return EXACTLY a JSON object with the following keys and valid data types:
- "amount": (float) the transaction amount
- "source": (string) either "bank" or "cash"
- "category": (string) a short 1-word category like "Food", "Travel", "Shopping", "Salary", "Bills", "Misc"
- "type": (string) either "credit" (money received) or "debit" (money spent)

Do not return any markdown formatting, backticks, or extra text. ONLY return the JSON string.
"""
    try:
        response = model.generate_content(prompt)
        res_text = response.text.strip()
        if res_text.startswith("```json"):
            res_text = res_text[7:]
        if res_text.endswith("```"):
            res_text = res_text[:-3]
        return json.loads(res_text.strip())
    except Exception as e:
        print("AI Scan Error:", e)
        return {"amount": 0.0, "source": "bank", "category": "Misc", "type": "debit"}
