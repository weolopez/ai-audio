// Global variables
let falcon = null;
let cheetah = null;
let isRecording = false;
let audioData = [];
let timer = null;
let currentTimer = 0.0;
let audioContext = null;

// Initialize audio context
window.onload = function () {
  audioContext = new (window.AudioContext || window.webKitAudioContext)({
    sampleRate: 16000,
  });
  
  setupEventListeners();
};

function setupEventListeners() {
  // File upload listener
  const fileSelector = document.getElementById("audioFile");
  fileSelector.addEventListener("change", handleFileUpload);
  
  // Recording listeners
  const recordButton = document.getElementById("recordButton");
  const stopButton = document.getElementById("stopButton");
  
  recordButton.addEventListener("click", startRecording);
  stopButton.addEventListener("click", stopRecording);
}

function writeMessage(message) {
  console.log(message);
  document.getElementById("status").innerHTML = message;
}

function clearResults() {
  document.getElementById("transcription-result").innerHTML = "Transcription will appear here...";
  clearDiarizationTable();
  document.getElementById("diarization-placeholder").style.display = "block";
}

function getSelectedMode() {
  const modeInputs = document.querySelectorAll('input[name="mode"]');
  for (const input of modeInputs) {
    if (input.checked) {
      return input.value;
    }
  }
  return "transcription"; // default
}

async function initializeEngines() {
  const accessKey = document.getElementById("accessKey").value.trim();
  
  if (!accessKey) {
    writeMessage("Please enter your Picovoice AccessKey");
    return;
  }
  
  writeMessage("Initializing engines. Please wait...");
  
  try {
    // Initialize Falcon (diarization)
    writeMessage("Loading Falcon (diarization)...");
    falcon = await FalconWeb.FalconWorker.create(accessKey, falconModel);
    writeMessage("Falcon loaded successfully");
    
    // Initialize Cheetah (speech-to-text)  
    writeMessage("Loading Cheetah (speech-to-text)...");
    cheetah = await CheetahWeb.CheetahWorker.create(
      accessKey,
      cheetahTranscriptionCallback,
      cheetahModel,
      { enableAutomaticPunctuation: true }
    );
    writeMessage("Cheetah loaded successfully");
    
    // Show main controls
    document.getElementById("mainControls").classList.remove("hidden");
    document.getElementById("initializeBtn").disabled = true;
    
    writeMessage("All engines ready! You can now process audio.");
    
  } catch (err) {
    writeMessage(`Error initializing engines: ${err.message || err}`);
  }
}

function cheetahTranscriptionCallback(cheetahTranscript) {
  const mode = getSelectedMode();
  if (mode === "transcription" || mode === "both") {
    const resultDiv = document.getElementById("transcription-result");
    if (resultDiv.innerHTML === "Transcription will appear here...") {
      resultDiv.innerHTML = "";
    }
    resultDiv.innerHTML += cheetahTranscript.transcript;
    if (cheetahTranscript.isEndpoint) {
      resultDiv.innerHTML += "<br>";
    }
  }
}

async function handleFileUpload(event) {
  const fileList = event.target.files;
  if (!fileList || fileList.length === 0) return;
  
  const mode = getSelectedMode();
  clearResults();
  
  writeMessage("Loading audio file...");
  
  try {
    const audioBuffer = await readAudioFile(fileList[0]);
    const i16PCM = convertToInt16PCM(audioBuffer);
    
    await processAudio(i16PCM, mode);
    
  } catch (err) {
    writeMessage(`Error processing file: ${err.message || err}`);
  }
}

function readAudioFile(selectedFile) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function (ev) {
      const wavBytes = reader.result;
      audioContext.decodeAudioData(wavBytes, resolve, reject);
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(selectedFile);
  });
}

function convertToInt16PCM(audioBuffer) {
  const f32PCM = audioBuffer.getChannelData(0);
  const i16PCM = new Int16Array(f32PCM.length);
  
  const INT16_MAX = 32767;
  const INT16_MIN = -32768;
  
  i16PCM.set(
    f32PCM.map((f) => {
      let i = Math.trunc(f * INT16_MAX);
      if (i > INT16_MAX) i = INT16_MAX;
      if (i < INT16_MIN) i = INT16_MIN;
      return i;
    })
  );
  
  return i16PCM;
}

async function processAudio(audioData, mode) {
  try {
    if (mode === "transcription") {
      writeMessage("Processing speech-to-text...");
      // For file processing with Cheetah, we need to process frame by frame
      await processCheetahFrames(audioData);
      writeMessage("Speech-to-text processing complete!");
      
    } else if (mode === "diarization") {
      writeMessage("Processing speaker diarization...");
      const { segments } = await falcon.process(audioData, { transfer: true });
      displayDiarizationResults(segments);
      writeMessage("Speaker diarization complete!");
      
    } else if (mode === "both") {
      writeMessage("Processing both speech-to-text and diarization...");
      
      // Process with Cheetah first
      await processCheetahFrames(audioData);
      
      // Then process with Falcon
      const { segments } = await falcon.process(audioData, { transfer: true });
      displayDiarizationResults(segments);
      
      writeMessage("Both processing tasks complete!");
    }
  } catch (err) {
    writeMessage(`Error during processing: ${err.message || err}`);
  }
}

async function processCheetahFrames(audioData) {
  // Process audio in chunks for Cheetah
  const frameSize = 512;
  const totalFrames = Math.ceil(audioData.length / frameSize);
  
  for (let i = 0; i < totalFrames; i++) {
    const start = i * frameSize;
    const end = Math.min(start + frameSize, audioData.length);
    const frame = audioData.slice(start, end);
    
    // Pad frame if necessary
    if (frame.length < frameSize) {
      const paddedFrame = new Int16Array(frameSize);
      paddedFrame.set(frame);
      await cheetah.process(paddedFrame);
    } else {
      await cheetah.process(frame);
    }
  }
  
  // Flush any remaining audio
  await cheetah.flush();
}

function displayDiarizationResults(segments) {
  document.getElementById("diarization-placeholder").style.display = "none";
  const table = document.getElementById("diarization-table");
  const tbody = table.querySelector("tbody");
  
  // Clear existing rows
  tbody.innerHTML = "";
  
  segments.forEach((segment) => {
    const row = tbody.insertRow();
    const startCell = row.insertCell(0);
    const endCell = row.insertCell(1);
    const speakerCell = row.insertCell(2);
    const durationCell = row.insertCell(3);
    
    startCell.textContent = segment.startSec.toFixed(3);
    endCell.textContent = segment.endSec.toFixed(3);
    speakerCell.textContent = segment.speakerTag;
    durationCell.textContent = (segment.endSec - segment.startSec).toFixed(3);
  });
  
  table.classList.remove("hidden");
}

function clearDiarizationTable() {
  const table = document.getElementById("diarization-table");
  const tbody = table.querySelector("tbody");
  tbody.innerHTML = "";
  table.classList.add("hidden");
}

async function startRecording() {
  if (!cheetah && !falcon) {
    writeMessage("Please initialize the engines first");
    return;
  }
  
  const mode = getSelectedMode();
  clearResults();
  
  isRecording = true;
  currentTimer = 0.0;
  audioData = [];
  
  // Update UI
  document.getElementById("recordButton").classList.add("hidden");
  document.getElementById("stopButton").classList.remove("hidden");
  document.getElementById("timer").classList.remove("hidden");
  
  try {
    if (mode === "transcription" || mode === "both") {
      writeMessage("Starting live transcription...");
      await window.WebVoiceProcessor.WebVoiceProcessor.subscribe(cheetah);
    }
    
    if (mode === "diarization" || mode === "both") {
      // For diarization, we need to collect audio data
      const recorderEngine = {
        onmessage: (event) => {
          if (event.data.command === "process") {
            audioData.push(event.data.inputFrame);
          }
        },
      };
      
      if (mode === "diarization") {
        writeMessage("Recording audio for diarization...");
        await window.WebVoiceProcessor.WebVoiceProcessor.subscribe(recorderEngine);
      } else {
        // For "both" mode, we need a different approach since we can only subscribe once
        writeMessage("Recording audio for transcription and diarization...");
        const combinedEngine = {
          onmessage: async (event) => {
            if (event.data.command === "process") {
              // Collect for diarization
              audioData.push(event.data.inputFrame);
              // Process for transcription
              await cheetah.process(event.data.inputFrame);
            }
          },
        };
        await window.WebVoiceProcessor.WebVoiceProcessor.unsubscribe(cheetah);
        await window.WebVoiceProcessor.WebVoiceProcessor.subscribe(combinedEngine);
      }
    }
    
    // Start timer
    timer = setInterval(() => {
      currentTimer += 0.1;
      document.getElementById("timer").textContent = `${currentTimer.toFixed(1)}s / 120s`;
      
      if (Math.floor(currentTimer) >= 120) {
        stopRecording();
      }
    }, 100);
    
  } catch (err) {
    writeMessage(`Error starting recording: ${err.message || err}`);
    resetRecordingUI();
  }
}

async function stopRecording() {
  if (!isRecording) return;
  
  isRecording = false;
  clearInterval(timer);
  
  // Update UI
  resetRecordingUI();
  
  try {
    writeMessage("Stopping recording...");
    await window.WebVoiceProcessor.WebVoiceProcessor.unsubscribe();
    
    const mode = getSelectedMode();
    
    if (mode === "diarization" || (mode === "both" && audioData.length > 0)) {
      writeMessage("Processing recorded audio for diarization...");
      
      // Combine all audio frames
      const frames = new Int16Array(audioData.length * 512);
      for (let i = 0; i < audioData.length; i++) {
        frames.set(audioData[i], i * 512);
      }
      
      const { segments } = await falcon.process(frames, { transfer: true });
      displayDiarizationResults(segments);
    }
    
    writeMessage("Recording processing complete!");
    
  } catch (err) {
    writeMessage(`Error stopping recording: ${err.message || err}`);
  }
}

function resetRecordingUI() {
  document.getElementById("recordButton").classList.remove("hidden");
  document.getElementById("stopButton").classList.add("hidden");
  document.getElementById("timer").classList.add("hidden");
}