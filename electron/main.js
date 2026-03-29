// import Electron
const { app, BrowserWindow } = require("electron");

// import Node.js path
const path = require("path");

// Function to create the main window
function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 850,
    title: "Braille Learning System",

    // Web settings
    webPreferences: {
      // Link to preload script
      preload: path.join(__dirname, "preload.js"),
      // Enable isolation for security
      contextIsolation: true,
      // Disable Node.js in frontend for safety
      nodeIntegration: false
    }
  });

  // Load the frontend HTML file
  win.loadFile(path.join(__dirname, "../frontend/index.html"));
}

// Run when Electron is ready
app.whenReady().then(() => {
  createWindow();
});

// Close app when all windows are closed
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});