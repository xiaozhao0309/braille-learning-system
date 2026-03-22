console.log("script.js loaded");
alert("script.js loaded");

const API_BASE = "http://127.0.0.1:8000";

function parseDots(input) {
  return input
    .split(",")
    .map(item => item.trim())
    .filter(item => item !== "")
    .map(Number)
    .filter(num => !isNaN(num));
}

window.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded");

  const submitBtn = document.getElementById("submitBtn");
  const statsBtn = document.getElementById("statsBtn");
  const expectedInputEl = document.getElementById("expected");
  const actualInputEl = document.getElementById("actual");
  const resultBox = document.getElementById("result");
  const statsBox = document.getElementById("stats");

  console.log("submitBtn:", submitBtn);
  console.log("statsBtn:", statsBtn);
  console.log("expected:", expectedInputEl);
  console.log("actual:", actualInputEl);
  console.log("resultBox:", resultBox);
  console.log("statsBox:", statsBox);

  if (!submitBtn || !statsBtn || !expectedInputEl || !actualInputEl || !resultBox || !statsBox) {
    console.error("One or more required elements were not found.");
    return;
  }

  submitBtn.addEventListener("click", async (event) => {
    event.preventDefault();
    console.log("submitBtn clicked");

    const expectedInput = expectedInputEl.value;
    const actualInput = actualInputEl.value;

    console.log("expectedInput:", expectedInput);
    console.log("actualInput:", actualInput);

    const expected = parseDots(expectedInput);
    const actual = parseDots(actualInput);

    console.log("parsed expected:", expected);
    console.log("parsed actual:", actual);

    resultBox.textContent = "Loading...";

    try {
      const response = await fetch(`${API_BASE}/practice/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ expected, actual })
      });

      console.log("response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("response not ok:", errorText);
        resultBox.textContent = `Request failed: ${response.status}\n${errorText}`;
        return;
      }

      const data = await response.json();
      console.log("practice response data:", data);

      const isCorrect = data.isCorrect ?? "N/A";
      const errorType = data.errorType ?? "N/A";
      const missingDots = data.diff?.missingDots?.join(", ") || "None";
      const extraDots = data.diff?.extraDots?.join(", ") || "None";
      const message = data.feedback?.message || "No feedback message";
      const suggestion = data.feedback?.suggestion || "No suggestion";

      resultBox.textContent =
        `Correct: ${isCorrect}\n` +
        `Error Type: ${errorType}\n` +
        `Missing Dots: ${missingDots}\n` +
        `Extra Dots: ${extraDots}\n` +
        `Message: ${message}\n` +
        `Suggestion: ${suggestion}`;

      console.log("resultBox updated");
    } catch (error) {
      console.error("submit error:", error);
      resultBox.textContent = `Failed to connect to backend.\n${error.message}`;
    }
  });

  statsBtn.addEventListener("click", async (event) => {
    event.preventDefault();
    console.log("statsBtn clicked");

    try {
      const response = await fetch(`${API_BASE}/stats/summary`);
      console.log("stats response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        statsBox.textContent = `Request failed: ${response.status}\n${errorText}`;
        return;
      }

      const data = await response.json();
      console.log("stats response data:", data);

      statsBox.textContent =
        `Total Attempts: ${data.totalAttempts}\n` +
        `Correct Attempts: ${data.correctAttempts}\n` +
        `Accuracy: ${data.accuracy}`;
    } catch (error) {
      console.error("stats error:", error);
      statsBox.textContent = `Failed to load stats summary.\n${error.message}`;
    }
  });
});