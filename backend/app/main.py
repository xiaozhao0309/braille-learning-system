from fastapi import FastAPI, Body   
from app.braille.braille_map import get_braille, translate_word #获取字母对应的盲文
from app.braille.rule_engine import evaluate_braille    #检验盲文
from app.braille.feedback import generate_feedback  #反馈话术
from app.database import init_db, save_record, get_summary  #数据库
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
    expected = data.get("expected", [])
    actual = data.get("actual", [])

    result = evaluate_braille(expected, actual)

    feedback = generate_feedback(
        result["errorType"],
        result["diff"]["missingDots"],
        result["diff"]["extraDots"]
    )
     # 保存记录到数据库
    save_record(expected, actual, result["isCorrect"])

    return {
        **result,
        "feedback": feedback
    }
    
# 统计正确率
@app.get("/stats/summary")
def stats_summary():
    return get_summary()