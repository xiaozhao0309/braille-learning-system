# Braille Learning System

This project is a desktop prototype for practising English Braille letters.

Users can select Braille dots, submit an answer, receive feedback, and review their learning records.

## Main Functions

- Six-dot Braille input
- Manual and Random practice modes
- Immediate answer checking
- Missing-dot and extra-dot detection
- Student practice records
- Learning statistics
- Recent practice history
- AI-assisted explanations
- Rule-based feedback when AI is unavailable
- Voice feedback

## Technologies

- Frontend: Electron, HTML, CSS, JavaScript
- Backend: Python and FastAPI
- Database: SQLite
- AI: Claude API
- Voice: Web Speech API
- Deployment: Render

## Project Structure

```text
braille-learning-system/
├── backend/
│   ├── app/
│   └── requirements.txt
├── frontend/
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   └── package.json
└── README.md
```

## Run the Backend

Open a terminal in the project folder:

```bash
cd backend
```

Create and activate a virtual environment.

macOS or Linux:

```bash
python3 -m venv venv
source venv/bin/activate
```

Windows:

```bash
python -m venv venv
venv\Scripts\activate
```

Install the required packages:

```bash
pip install -r requirements.txt
```

Set the Claude API key:

macOS or Linux:

```bash
export ANTHROPIC_API_KEY="your_api_key"
```

Windows PowerShell:

```powershell
$env:ANTHROPIC_API_KEY="your_api_key"
```

Start the backend:

```bash
uvicorn app.main:app --reload
```

The local backend address is:

```text
http://127.0.0.1:8000
```

## Run the Frontend

Open another terminal:

```bash
cd frontend
npm install
npm start
```

## Backend Address

The current deployed backend is:

```text
https://braille-learning-backend.onrender.com
```

The backend address is set in `frontend/script.js`.

To use the local backend, change it to:

```javascript
const API_BASE = "http://127.0.0.1:8000";
```

## Main API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/health` | Check backend status |
| GET | `/braille/{letter}` | Get Braille dots for a letter |
| POST | `/practice/submit` | Submit and check an answer |
| GET | `/stats/summary` | Load student statistics |
| GET | `/stats/history` | Load recent practice records |
| GET | `/practice/personalized-target` | Generate a practice letter |

## How to Use

1. Open the Electron application.
2. Enter a student name.
3. Select Manual or Random mode.
4. Select the Braille dots.
5. Submit the answer.
6. Read or listen to the feedback.
7. View statistics and recent practice history.

## Important Notes

- Do not upload the API key to GitHub.
- The system can use rule-based feedback if the AI service is unavailable.
- SQLite is suitable for this prototype, but cloud records may be lost after the Render service restarts.
- The current version does not include physical Braille hardware.

## Author

Yuechao Zhao  
Student ID: 1683705  
COMPX576-26A Programming Project
