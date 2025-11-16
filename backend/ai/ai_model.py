# backend/ai/ai_model.py
def get_ai_reply(query: str) -> str:
    q = query.lower()
    if "food" in q:
        return "You’ve spent a lot on food; try a weekly meal plan to reduce costs."
    if "travel" in q:
        return "Travel expenses are high — consider public transport or carpooling."
    if "saving" in q or "save" in q:
        return "Set a fixed monthly target and automate transfers to savings."
    # default
    return "I need more data to give precise advice — try adding some expense entries first."
