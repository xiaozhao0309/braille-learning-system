from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def root():
    return {"message": "Braille Learning System API is running"}