const child_process = require("child_process");
const fs = require("fs");
const path = require("path");

// Check if models directory exists and has the required files
const modelsDirectory = path.join(__dirname, "..", "models");
const requiredFiles = ["falcon_params.pv", "cheetah_params.pv", "falconModel.js", "cheetahModel.js"];

console.log("Checking for required model files...");
let allFilesExist = true;

requiredFiles.forEach(file => {
  const filePath = path.join(modelsDirectory, file);
  if (!fs.existsSync(filePath)) {
    console.error(`Missing required file: ${file}`);
    allFilesExist = false;
  } else {
    console.log(`✓ Found: ${file}`);
  }
});

if (!allFilesExist) {
  console.error("Some required model files are missing. Please ensure all model files are copied to the models directory.");
  process.exit(1);
}

console.log("All model files found. Starting HTTP server...");
console.log("Combined Audio Application starting on http://localhost:5000");
console.log("Features:");
console.log("- Speech-to-text transcription (Cheetah)");
console.log("- Speaker diarization (Falcon)");
console.log("- Combined processing mode");
console.log("- Live recording and file upload support");
console.log("\nPress Ctrl+C to stop the server");

const command = process.platform === "win32" ? "npx.cmd" : "npx";

child_process.execSync(`${command} http-server -a localhost -p 8000`, {
  shell: true,
  stdio: "inherit",
});
