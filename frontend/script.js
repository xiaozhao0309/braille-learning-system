console.log("script.js loaded");
//alert("script.js loaded");

// Base URL of the backend API
const API_BASE = "http://127.0.0.1:8000";

// Convert user input string (e.g., "1,2,3") into an array of numbers [1,2,3]
function parseDots(input) {
  return input
    .split(",")
    .map(item => item.trim())
    .filter(item => item !== "")
    .map(Number)
    .filter(num => !isNaN(num));
}

// Run code after the page is fully loaded
window.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded");

  // Get elements from the HTML page
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

 // Check elements，stop if any required element is missing
  if (!submitBtn || !statsBtn || !expectedInputEl || !actualInputEl || !resultBox || !statsBox) {
    console.error("One or more required elements were not found.");
    return;
  }

  // ===================== Submit Practice =====================
  submitBtn.addEventListener("click", async (event) => {
    event.preventDefault();
    console.log("submitBtn clicked");

    // Get user input values
    const expectedInput = expectedInputEl.value;
    const actualInput = actualInputEl.value;

    console.log("expectedInput:", expectedInput);
    console.log("actualInput:", actualInput);

    // Convert input strings into arrays
    const expected = parseDots(expectedInput);
    const actual = parseDots(actualInput);

    console.log("parsed expected:", expected);
    console.log("parsed actual:", actual);

    resultBox.textContent = "Loading...";

    try {
    // Send POST request to backend
      const response = await fetch(`${API_BASE}/practice/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ expected, actual })
      });

      console.log("response status:", response.status);
    // If request failed
      if (!response.ok) {
        const errorText = await response.text();
        console.error("response not ok:", errorText);
        resultBox.textContent = `Request failed: ${response.status}\n${errorText}`;
        return;
      }

      // Parse response JSON
      const data = await response.json();
      console.log("practice response data:", data);

      // Extract result fields (with fallback values)
      const isCorrect = data.isCorrect ?? "N/A";
      const errorType = data.errorType ?? "N/A";
      const missingDots = data.diff?.missingDots?.join(", ") || "None";
      const extraDots = data.diff?.extraDots?.join(", ") || "None";
      const message = data.feedback?.message || "No feedback message";
      const suggestion = data.feedback?.suggestion || "No suggestion";

      // Display result on the page
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

   // ===================== Get Statistics =====================
  statsBtn.addEventListener("click", async (event) => {
    event.preventDefault();
    console.log("statsBtn clicked");

    try {
        // Send GET request to backend
      const response = await fetch(`${API_BASE}/stats/summary`);
      console.log("stats response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        statsBox.textContent = `Request failed: ${response.status}\n${errorText}`;
        return;
      }

      // Parse response JSON
      const data = await response.json();
      console.log("stats response data:", data);

      // Display statistics
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