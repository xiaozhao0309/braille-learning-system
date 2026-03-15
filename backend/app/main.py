from fastapi import FastAPI, HTTPException
from app.braille.braille_map import get_braille_pattern

app = FastAPI()


@app.get("/")
def root():
    return {"message": "Braille Learning System API is running"}


@app.get("/braille/{letter}")
def read_braille(letter: str):
    pattern = get_braille_pattern(letter)
    if pattern is None:
        raise HTTPException(status_code=404, detail="Letter not found")
    return {
        "letter": letter.lower(),
        "braille_dots": pattern
    }