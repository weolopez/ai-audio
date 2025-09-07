# Combined Speech-to-Text and Speaker Diarization

This application combines Picovoice's Cheetah (speech-to-text) and Falcon (speaker diarization) engines into a unified web interface that supports both live recording and file upload processing.

## Features

- **Speech-to-Text Transcription**: Real-time and file-based audio transcription using Cheetah
- **Speaker Diarization**: Identify different speakers in audio using Falcon
- **Combined Processing**: Process audio for both transcription and diarization simultaneously
- **Live Recording**: Record audio directly in the browser (up to 2 minutes)
- **File Upload**: Upload audio files for processing
- **Multiple Processing Modes**: Choose between transcription only, diarization only, or both

## Prerequisites

1. **Picovoice AccessKey**: Get your free AccessKey from [Picovoice Console](https://console.picovoice.ai/)
2. **Modern Web Browser**: Chrome, Firefox, Safari, or Edge with WebAssembly support
3. **Microphone Access**: Required for live recording features

## Installation & Setup

1. Install dependencies:
```bash
npm install
```

2. Start the application:
```bash
npm start
```

3. Open your browser and navigate to `http://localhost:5000`

## Usage

### 1. Initialize Engines
- Enter your Picovoice AccessKey in the setup section
- Click "Initialize Engines" to load both Cheetah and Falcon
- Wait for both engines to load successfully

### 2. Choose Processing Mode
- **Speech-to-Text Only**: Real-time transcription of audio
- **Speaker Diarization Only**: Identify different speakers with timestamps
- **Both**: Combined transcription and diarization

### 3. Process Audio

#### File Upload
- Click "Upload Audio File" and select an audio file
- Supported formats: WAV, MP3, M4A, and other common audio formats
- Processing will begin automatically

#### Live Recording
- Click "🎤 Start Live Recording" to begin recording
- Recording is limited to 2 minutes maximum
- Click "⏹️ Stop Recording" to process the recorded audio

### 4. View Results

#### Transcription Results
- Real-time transcription appears in the "Transcription Results" section
- Text is updated as speech is processed

#### Diarization Results
- Speaker segments appear in a table with:
  - Start time (seconds)
  - End time (seconds)
  - Speaker identifier
  - Segment duration

## Processing Modes Explained

### Speech-to-Text Only
- Uses Cheetah engine for real-time transcription
- Best for: Meeting transcripts, dictation, voice notes
- Output: Text transcription with automatic punctuation

### Speaker Diarization Only
- Uses Falcon engine to identify speaker changes
- Best for: Meeting analysis, interview processing
- Output: Time-stamped speaker segments

### Combined Mode
- Uses both engines for comprehensive audio analysis
- Best for: Complete meeting analysis with both content and speaker identification
- Output: Both transcription text and speaker timeline

## Technical Details

### Audio Processing
- Sample Rate: 16kHz
- Format: 16-bit Linear PCM
- Frame Size: 512 samples
- All processing occurs in the browser (no data sent to external servers)

### Browser Compatibility
- Chrome 66+ (recommended)
- Firefox 60+
- Safari 12+
- Edge 79+

### Performance Notes
- First load may take longer due to WebAssembly model loading
- Larger audio files require more processing time
- Live recording provides real-time results for transcription

## Troubleshooting

### Common Issues

1. **"Please enter your Picovoice AccessKey"**
   - Get your free AccessKey from https://console.picovoice.ai/

2. **"Error initializing engines"**
   - Check your AccessKey is valid
   - Ensure you have a stable internet connection for initial model download
   - Try refreshing the page

3. **"Microphone access denied"**
   - Allow microphone permissions in your browser
   - Check browser security settings

4. **"No audio detected"**
   - Check microphone is working
   - Ensure audio file is not corrupted
   - Try a different audio format

### Browser Permissions
- Microphone access is required for live recording
- Allow when prompted by your browser

## Development

### Project Structure
```
combined-audio/
├── index.html                 # Main application interface
├── package.json              # Dependencies and scripts
├── models/                    # AI model files
│   ├── falconModel.js        # Falcon (diarization) model config
│   ├── cheetahModel.js       # Cheetah (transcription) model config
│   ├── falcon_params.pv      # Falcon model parameters
│   └── cheetah_params.pv     # Cheetah model parameters
└── scripts/
    ├── combined-audio.js     # Main application logic
    └── run_demo.js          # Development server script
```

### Key Dependencies
- `@picovoice/falcon-web`: Speaker diarization engine
- `@picovoice/cheetah-web`: Speech-to-text engine
- `@picovoice/web-voice-processor`: Audio capture and processing

## License

Apache-2.0

## Support

For technical support and documentation:
- [Picovoice Documentation](https://picovoice.ai/docs/)
- [Cheetah Documentation](https://picovoice.ai/docs/cheetah/)
- [Falcon Documentation](https://picovoice.ai/docs/falcon/)