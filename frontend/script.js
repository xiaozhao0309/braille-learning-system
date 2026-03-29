document.addEventListener("DOMContentLoaded", () => {
  const API_BASE = "http://127.0.0.1:8000";

  // Define two arrays to store the currently selected points
  let expectedDots = [];
  let actualDots = [];

  // Get all dot buttons
  const dotButtons = document.querySelectorAll(".dot");

  // Get text display elements
  const expectedDotsText = document.getElementById("expectedDotsText");
  const actualDotsText = document.getElementById("actualDotsText");

  // Get buttons
  const submitBtn = document.getElementById("submitBtn");
  const clearExpectedBtn = document.getElementById("clearExpectedBtn");
  const clearActualBtn = document.getElementById("clearActualBtn");
  const loadStatsBtn = document.getElementById("loadStatsBtn");

  // Get result boxes
  const resultBox = document.getElementById("resultBox");
  const statsBox = document.getElementById("statsBox");

  // Update selected dots text
  function updateDotsText() {
    expectedDots.sort((a, b) => a - b); //Sort by numbers
    actualDots.sort((a, b) => a - b);  //Sort by numbers

    expectedDotsText.textContent =
      expectedDots.length > 0
        ? `Selected: ${expectedDots.join(", ")}`
        : "Selected: None";

    actualDotsText.textContent =
      actualDots.length > 0
        ? `Selected: ${actualDots.join(", ")}`
        : "Selected: None";
  }

  // Toggle dot selection
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

  // Add click event to each dot
  dotButtons.forEach(button => {
    button.addEventListener("click", () => {
      const group = button.dataset.group;
      const dotNumber = button.dataset.dot;
      toggleDot(group, dotNumber, button);
    });
  });

  // Clear expected dots
  clearExpectedBtn.addEventListener("click", () => {
    expectedDots = [];
    document.querySelectorAll('.dot[data-group="expected"]').forEach(button => {
      button.classList.remove("active");
    });
    updateDotsText();
  });

  // Clear actual dots
  clearActualBtn.addEventListener("click", () => {
    actualDots = [];
    document.querySelectorAll('.dot[data-group="actual"]').forEach(button => {
      button.classList.remove("active");
    });
    updateDotsText();
  });

  // Submit practice
  submitBtn.addEventListener("click", async () => {
    resultBox.innerHTML = "<p>Loading...</p>";

    try {
      const response = await fetch(`${API_BASE}/practice/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          expected: expectedDots,
          actual: actualDots
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        resultBox.innerHTML = `<p>Error: ${errorText}</p>`;
        return;
      }

      const data = await response.json();

      resultBox.innerHTML = `
        <p>Correct: ${data.isCorrect}</p>
        <p>Error Type: ${data.errorType || "None"}</p>
        <p>Missing Dots: ${data.diff?.missingDots?.length ? data.diff.missingDots.join(", ") : "None"}</p>
        <p>Extra Dots: ${data.diff?.extraDots?.length ? data.diff.extraDots.join(", ") : "None"}</p>
        <p>Message: ${data.ai?.explanation || "No message"}</p>
        <p>Suggestion: ${data.ai?.practiceSuggestion || "No suggestion"}</p>
      `;
    } catch (error) {
      resultBox.innerHTML = `<p>Error: ${error.message}</p>`;
    }
  });

  // Load statistics
  loadStatsBtn.addEventListener("click", async () => {
    statsBox.innerHTML = "<p>Loading...</p>";

    try {
      const response = await fetch(`${API_BASE}/stats/summary`);

      if (!response.ok) {
        const errorText = await response.text();
        statsBox.innerHTML = `<p>Error: ${errorText}</p>`;
        return;
      }

      const data = await response.json();

      statsBox.innerHTML = `
      <p>Total Attempts: ${data.totalAttempts ?? 0}</p>
      <p>Correct Attempts: ${data.correctAttempts ?? 0}</p>
      <p>Accuracy: ${data.accuracy ?? 0}</p>
    `;

    } catch (error) {
      statsBox.innerHTML = `<p>Error: ${error.message}</p>`;
    }
  });

  updateDotsText();
});