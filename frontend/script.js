document.addEventListener("DOMContentLoaded", () => {
  const API_BASE = "http://127.0.0.1:8000";

  let expectedDots = [];
  let actualDots = [];

  const dotButtons = document.querySelectorAll(".dot");

  const expectedDotsText = document.getElementById("expectedDotsText");
  const actualDotsText = document.getElementById("actualDotsText");

  const submitBtn = document.getElementById("submitBtn");
  const clearExpectedBtn = document.getElementById("clearExpectedBtn");
  const clearActualBtn = document.getElementById("clearActualBtn");
  const loadStatsBtn = document.getElementById("loadStatsBtn");

  const resultBox = document.getElementById("resultBox");
  const explanationBox = document.getElementById("explanationBox");
  const statsBox = document.getElementById("statsBox");

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
      <p><strong>Total Attempts:</strong> ${data.totalAttempts ?? 0}</p>
      <p><strong>Correct Attempts:</strong> ${data.correctAttempts ?? 0}</p>
      <p><strong>Accuracy:</strong> ${data.accuracy ?? 0}</p>
    `;
  }

  function renderError(box, message) {
    box.innerHTML = `<p><strong>Error:</strong> ${message}</p>`;
  }

  function toggleDot(group, dotNumber, button) {
    dotNumber = Number(dotNumber);

    if (group === "expected") {
      if (expectedDots.includes(dotNumber)) {
        expectedDots = expectedDots.filter(dot => dot !== dotNumber);
        button.classList.remove("active");
      } else {
        expectedDots.push(dotNumber);
        button.classList.add("active");
      }
    }

    if (group === "actual") {
      if (actualDots.includes(dotNumber)) {
        actualDots = actualDots.filter(dot => dot !== dotNumber);
        button.classList.remove("active");
      } else {
        actualDots.push(dotNumber);
        button.classList.add("active");
      }
    }

    updateDotsText();
  }

  dotButtons.forEach(button => {
    button.addEventListener("click", () => {
      const group = button.dataset.group;
      const dotNumber = button.dataset.dot;
      toggleDot(group, dotNumber, button);
    });
  });

  clearExpectedBtn.addEventListener("click", () => {
    expectedDots = [];
    document
      .querySelectorAll('.dot[data-group="expected"]')
      .forEach(button => button.classList.remove("active"));
    updateDotsText();
  });

  clearActualBtn.addEventListener("click", () => {
    actualDots = [];
    document
      .querySelectorAll('.dot[data-group="actual"]')
      .forEach(button => button.classList.remove("active"));
    updateDotsText();
  });

  async function loadStats() {
    statsBox.innerHTML = "<p>Loading statistics...</p>";

    try {
      const response = await fetch(`${API_BASE}/stats/summary`);

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

  submitBtn.addEventListener("click", async () => {
    if (expectedDots.length === 0 || actualDots.length === 0) {
      renderError(resultBox, "Please select dots for both expected and actual input.");
      explanationBox.innerHTML = `<p>Please complete both Braille cells before submitting.</p>`;
      return;
    }

    resultBox.innerHTML = "<p>Loading result...</p>";
    explanationBox.innerHTML = "<p>Generating explanation...</p>";

    const payload = {
      expected: sortDots(expectedDots),
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
});