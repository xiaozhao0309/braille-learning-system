import random

from fastapi import Body, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.braille.ai_feedback import generate_ai_explanation
from app.braille.braille_map import get_braille, translate_word
from app.braille.feedback import generate_feedback
from app.braille.rule_engine import evaluate_braille
from app.database import (
    get_recent_attempts,
    get_summary,
    get_wrong_letters,
    init_db,
    save_record,
)

app = FastAPI()

# Allow the frontend application to access the API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()

@app.get("/")
def root():
    return {"message": "Braille Learning API is running"}


@app.get("/health")
def health():
    return {"status": "ok"}


# Return the Braille dots for one letter.
@app.get("/braille/{letter}")
def get_letter(letter: str):
    dots = get_braille(letter)
    if dots:
        return {
            "letter": letter,
            "dots": dots
        }
    return {"error": "Letter not found"}


# Translate a word into Braille dot patterns.
@app.get("/translate/{word}")
def translate(word: str):
    return {
        "word": word,
        "result": translate_word(word)
    }
 
# Evaluate and save one Braille practice submission.
@app.post("/practice/submit")
def submit_practice(data: dict = Body(...)):
    student_name = data.get("student_name", "Anonymous")
    expected = data.get("expected", [])
    actual = data.get("actual", [])
    result = evaluate_braille(expected, actual)
    print(f"Student: {student_name}, Expected: {expected}, Actual: {actual}") #confirm data

    feedback = generate_feedback(
        result["errorType"],
        result["diff"]["missingDots"],
        result["diff"]["extraDots"]
    )
    target_letter = data.get("target_letter", "")
    
    # Generate detailed feedback using AI or the rule-based fallback.   
    wrong_letters = get_wrong_letters(student_name)
    ai_explanation = generate_ai_explanation(
        target_letter,
        expected,
        actual,
        result,
        wrong_letters 
    )
    # Save the completed attempt to the database.
    save_record(student_name, target_letter, expected, actual, result["isCorrect"])

    return {
        **result,
        "feedback": feedback,
        "aiExplanation": ai_explanation 
    }
    
# Return summary statistics for one student.
@app.get("/stats/summary")
def stats_summary(student_name: str):
    return get_summary(student_name)

# Return recent practice attempts for one student.
@app.get("/stats/history")
def stats_history(student_name: str, limit: int = 10):
    return {
        "studentName": student_name,
        "history": get_recent_attempts(student_name, limit)
    }

# Return a personalised practice target for one student.
@app.get("/practice/personalized-target")
def personalized_target(student_name: str):
    wrong_letters = get_wrong_letters(student_name)

    use_wrong_letter = wrong_letters and random.random() < 0.7

    if use_wrong_letter:
        letter = random.choice(wrong_letters)
        reason = "frequently incorrect"
    else:
        letter = random.choice("abcdefghijklmnopqrstuvwxyz")
        reason = "normal random practice"

    dots = get_braille(letter)

    return {
        "letter": letter,
        "dots": dots,
        "reason": reason
    }