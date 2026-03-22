from fastapi import FastAPI, Body
from app.braille.braille_map import get_braille, translate_word
from app.braille.rule_engine import evaluate_braille
from app.braille.feedback import generate_feedback
from app.database import init_db, save_record

app = FastAPI()
init_db()

@app.get("/")
def root():
    return {"message": "Braille Learning API is running"}


@app.get("/health")
def health():
    return {"status": "ok"}


# 获取单个字母盲文
@app.get("/braille/{letter}")
def get_letter(letter: str):
    dots = get_braille(letter)
    if dots:
        return {
            "letter": letter,
            "dots": dots
        }
    return {"error": "Letter not found"}


# 单词翻译
@app.get("/translate/{word}")
def translate(word: str):
    return {
        "word": word,
        "result": translate_word(word)
    }
 
# 提醒输入错误    
@app.post("/practice/submit")
def submit_practice(data: dict = Body(...)):
    expected = data.get("expected", [])
    actual = data.get("actual", [])

    result = evaluate_braille(expected, actual)

    feedback = generate_feedback(
        result["errorType"],
        result["diff"]["missingDots"],
        result["diff"]["extraDots"]
    )
     # 保存记录
    save_record(expected, actual, result["isCorrect"])

    return {
        **result,
        "feedback": feedback
    }