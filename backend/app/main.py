from fastapi import FastAPI

from app.braille.braille_map import get_braille, translate_word

app = FastAPI()


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