import random
from fastapi import FastAPI, Body   
from app.braille.braille_map import get_braille, translate_word #获取字母对应的盲文
from app.braille.rule_engine import evaluate_braille    #检验盲文
from app.braille.feedback import generate_feedback  #反馈内容
from app.braille.ai_feedback import generate_ai_explanation  # Week 6 接ai反馈
from app.database import init_db, save_record, get_summary, get_wrong_letters #数据库
from fastapi.middleware.cors import CORSMiddleware  #连接前后端，后端允许跨域

app = FastAPI()
#为了前端调用后端
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
    
    # Week 6: generate a more detailed AI-assisted explanation
    # At this stage, this is still local rule-based logic.
    # It prepares the project structure for real AI integration in Week 7.
    ai_explanation = generate_ai_explanation(
        target_letter,
        expected,
        actual,
        result
    )
     # 保存记录到数据库
    save_record(student_name, target_letter, expected, actual, result["isCorrect"])

    return {
        **result,
        "feedback": feedback,
        "aiExplanation": ai_explanation  # Week 6: send AI-assisted explanation to frontend
    }
    
# 统计正确率
@app.get("/stats/summary")
def stats_summary(student_name: str):
    return get_summary(student_name)

# 随机字母比例
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