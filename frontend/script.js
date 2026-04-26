document.addEventListener("DOMContentLoaded", () => {
  const API_BASE = "http://127.0.0.1:8000";

  let expectedDots = [];
  let actualDots = [];

  // Random mode state
  const letters = "abcdefghijklmnopqrstuvwxyz".split("");
  let currentTarget = null;
  let currentExpected = [];
  let isRandomMode = false;

  let currentStudentName = "";

  const studentNameInput = document.getElementById("studentName");
  const startSessionBtn = document.getElementById("startSessionBtn");
  const currentStudentDisplay = document.getElementById("currentStudentDisplay");

  const dotButtons = document.querySelectorAll(".dot");

  const expectedDotsText = document.getElementById("expectedDotsText");
  const actualDotsText = document.getElementById("actualDotsText");

  const submitBtn = document.getElementById("submitBtn");
  const clearExpectedBtn = document.getElementById("clearExpectedBtn");
  const clearActualBtn = document.getElementById("clearActualBtn");
  const loadStatsBtn = document.getElementById("loadStatsBtn");
  const generateBtn = document.getElementById("generateBtn");

  const resultBox = document.getElementById("resultBox");
  const explanationBox = document.getElementById("explanationBox");
  const statsBox = document.getElementById("statsBox");

const targetLetterText = document.getElementById("targetLetterText");
const expectedCell = document.getElementById("expectedCell");

const manualModeBtn = document.getElementById("manualModeBtn");
const randomModeBtn = document.getElementById("randomModeBtn");

  function sortDots(dots) {
    return [...dots].sort((a, b) => a - b);
  }

  function updateDotsText() {
    expectedDots = sortDots(expectedDots);
    actualDots = sortDots(actualDots);

    expectedDotsText.textContent =
      expectedDots.length > 0
        ? `Selected: ${expectedDots.join(", ")}`
        : "Selected: None";

    actualDotsText.textContent =
      actualDots.length > 0
        ? `Selected: ${actualDots.join(", ")}`
        : "Selected: None";
  }

  function renderResult(data) {
    resultBox.innerHTML = `
      <h3>Result</h3>
      <p><strong>Student:</strong> ${currentStudentName}</p>
      <p><strong>Correct:</strong> ${data.isCorrect}</p>
      <p><strong>Error Type:</strong> ${data.errorType || "None"}</p>
      <p><strong>Missing Dots:</strong> ${
        data.diff?.missingDots?.length
          ? data.diff.missingDots.join(", ")
          : "None"
      }</p>
      <p><strong>Extra Dots:</strong> ${
        data.diff?.extraDots?.length
          ? data.diff.extraDots.join(", ")
          : "None"
      }</p>
    `;

    explanationBox.innerHTML = `
      <h3>Explanation</h3>
      <p><strong>Message:</strong> ${data.feedback?.message || "No message"}</p>
      <p><strong>Suggestion:</strong> ${data.feedback?.suggestion || "No suggestion"}</p>
    `;
  }

  function renderStats(data) {
    statsBox.innerHTML = `
      <h3>Statistics</h3>
      <p><strong>Student:</strong> ${currentStudentName}</p>
      <p><strong>Total Attempts:</strong> ${data.totalAttempts ?? 0}</p>
      <p><strong>Correct Attempts:</strong> ${data.correctAttempts ?? 0}</p>
      <p><strong>Accuracy:</strong> ${data.accuracy ?? 0}</p>
    `;
  }

  function renderError(box, message) {
    box.innerHTML = `<p><strong>Error:</strong> ${message}</p>`;
  }

  function updateModeButtons() {
    if (isRandomMode) {
      manualModeBtn.classList.remove("active");
      manualModeBtn.classList.add("inactive");

      randomModeBtn.classList.remove("inactive");
      randomModeBtn.classList.add("active");

      generateBtn.disabled = false;
      generateBtn.classList.remove("disabled-btn");
      generateBtn.classList.add("enabled-btn");

      expectedCell.classList.add("disabled");
    } else {
      manualModeBtn.classList.remove("inactive");
      manualModeBtn.classList.add("active");

      randomModeBtn.classList.remove("active");
      randomModeBtn.classList.add("inactive");

      generateBtn.disabled = true;
      generateBtn.classList.remove("enabled-btn");
      generateBtn.classList.add("disabled-btn");

      expectedCell.classList.remove("disabled");
    }
  }

  function setManualMode() {
    isRandomMode = false;
    currentTarget = null;
    currentExpected = [];
    targetLetterText.textContent = "Target: None";
    expectedCell.classList.remove("disabled");
    updateModeButtons();
  }

  function setRandomMode(letter = null, dots = []) {
    isRandomMode = true;
    currentTarget = letter;
    currentExpected = sortDots(dots);

    targetLetterText.textContent = letter
      ? `Target: ${letter.toUpperCase()}`
      : "Target: None";

    expectedCell.classList.add("disabled");
    updateModeButtons();
  }

  function toggleDot(group, dotNumber, button) {
    dotNumber = Number(dotNumber);

    // In random mode, expected dots should not be editable
    if (isRandomMode && group === "expected") {
      return;
    }

    if (group === "expected") {
      if (expectedDots.includes(dotNumber)) {
        expectedDots = expectedDots.filter((dot) => dot !== dotNumber);
        button.classList.remove("active");
      } else {
        expectedDots.push(dotNumber);
        button.classList.add("active");
      }
    }

    if (group === "actual") {
      if (actualDots.includes(dotNumber)) {
        actualDots = actualDots.filter((dot) => dot !== dotNumber);
        button.classList.remove("active");
      } else {
        actualDots.push(dotNumber);
        button.classList.add("active");
      }
    }

    updateDotsText();
  }

  async function loadStats() {
    statsBox.innerHTML = "<p>Loading statistics...</p>";

    try {
      if (!currentStudentName) {
        renderError(statsBox, "Please start a session first.");
        return;
      }

      const response = await fetch(
        `${API_BASE}/stats/summary?student_name=${encodeURIComponent(currentStudentName)}`
      );

      if (!response.ok) {
        const errorText = await response.text();
        renderError(statsBox, errorText);
        return;
      }

      const data = await response.json();
      renderStats(data);
    } catch (error) {
      renderError(statsBox, error.message);
    }
  }

async function generateRandomLetter() {
  if (!currentStudentName) {
    renderError(resultBox, "Please start a session first.");
    explanationBox.innerHTML = "";
    return;
  }

  resultBox.innerHTML = "<p>Generating random letter...</p>";
  explanationBox.innerHTML = "<p>Please enter the Braille dots for the target letter.</p>";

  try {
    const response = await fetch(
      `${API_BASE}/practice/personalized-target?student_name=${encodeURIComponent(currentStudentName)}`
    );

    if (!response.ok) {
      throw new Error("Failed to generate personalized letter.");
    }

    const data = await response.json();

    const randomLetter = data.letter;
    const dots = data.dots || [];
    const reason = data.reason;

    // ⭐关键：更新 random mode 状态
    setRandomMode(randomLetter, dots);

    // 清空 actual dots
    actualDots = [];
    document
      .querySelectorAll('.dot[data-group="actual"]')
      .forEach((button) => button.classList.remove("active"));

    updateDotsText();

    resultBox.innerHTML = `
      <h3>Random Practice</h3>
      <p><strong>New target generated.</strong></p>
      <p>Enter the Braille pattern for letter <strong>${randomLetter.toUpperCase()}</strong>.</p>
      <p><strong>Practice Reason:</strong> ${reason}</p>
    `;

    explanationBox.innerHTML = `
      <h3>Explanation</h3>
      <p>The system selected this letter based on your practice history.</p>
    `;
  } catch (error) {
    renderError(resultBox, error.message);
    explanationBox.innerHTML = "";
  }
}

  dotButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const group = button.dataset.group;
      const dotNumber = button.dataset.dot;
      toggleDot(group, dotNumber, button);
    });
  });

  startSessionBtn.addEventListener("click", () => {
    const enteredName = studentNameInput.value.trim();

    if (!enteredName) {
      alert("Please enter your name first.");
      return;
    }

    currentStudentName = enteredName;
    currentStudentDisplay.textContent = `Current Student: ${currentStudentName}`;
  });

  clearExpectedBtn.addEventListener("click", () => {
    expectedDots = [];

    document
      .querySelectorAll('.dot[data-group="expected"]')
      .forEach((button) => {
        button.classList.remove("active");
      });

    setManualMode();
    updateDotsText();
  });

  clearActualBtn.addEventListener("click", () => {
    actualDots = [];

    document
      .querySelectorAll('.dot[data-group="actual"]')
      .forEach((button) => {
        button.classList.remove("active");
      });

    updateDotsText();
  });

  manualModeBtn.addEventListener("click", () => {
    setManualMode();
  });

  randomModeBtn.addEventListener("click", () => {
    setRandomMode();

    resultBox.innerHTML = `
      <h3>Random Practice</h3>
      <p><strong>Random mode is active.</strong></p>
      <p>Click "Generate Random Letter" to get a new target.</p>
    `;

    explanationBox.innerHTML = `
      <h3>Explanation</h3>
      <p>The system will generate the expected Braille pattern automatically in random mode.</p>
    `;
  });
  generateBtn.addEventListener("click", generateRandomLetter);

  submitBtn.addEventListener("click", async () => {
    let expectedToUse = expectedDots;

    if (isRandomMode && currentExpected.length > 0) {
      expectedToUse = currentExpected;
    }

    if (expectedToUse.length === 0 || actualDots.length === 0) {
      renderError(resultBox, "Please select dots before submitting.");
      explanationBox.innerHTML = `
        <p>Please complete the required Braille input before submitting.</p>
      `;
      return;
    }

    resultBox.innerHTML = "<p>Loading result...</p>";
    explanationBox.innerHTML = "<p>Generating explanation...</p>";

    if (!currentStudentName) {
      renderError(resultBox, "Please start a session by entering your name.");
      explanationBox.innerHTML = "";
      return;
    }

    const payload = {
      student_name: currentStudentName, //add student's name
      target_letter: isRandomMode ? currentTarget : "",
      expected: sortDots(expectedToUse),
      actual: sortDots(actualDots)
    };

    try {
      const response = await fetch(`${API_BASE}/practice/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        renderError(resultBox, errorText);
        explanationBox.innerHTML = "";
        return;
      }

      const data = await response.json();
      renderResult(data);
      loadStats();
    } catch (error) {
      renderError(resultBox, error.message);
      explanationBox.innerHTML = "";
    }
  });

  loadStatsBtn.addEventListener("click", loadStats);

  updateDotsText();
  updateModeButtons();
});