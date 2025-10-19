#!/bin/bash
# Test audio playback on Raspberry Pi

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"

echo "========================================"
echo "  Audio Playback Test"
echo "========================================"
echo

# Check for audio files
if [ ! -d "$SCRIPT_DIR/audio" ] || [ -z "$(ls -A $SCRIPT_DIR/audio/*.mp3 2>/dev/null)" ]; then
    echo "❌ No MP3 files found in $SCRIPT_DIR/audio/"
    echo "   Please add MP3 files to test"
    exit 1
fi

# List available audio devices
echo "Available audio devices:"
aplay -l
echo

# List MP3 files
echo "Available MP3 files:"
ls -1 "$SCRIPT_DIR/audio"/*.mp3
echo

# Get first MP3 file
AUDIO_FILE=$(ls "$SCRIPT_DIR/audio"/*.mp3 | head -n 1)

echo "Testing audio playback..."
echo "File: $AUDIO_FILE"
echo
echo "Press Ctrl+C to stop"
echo "========================================"
echo

# Test playback
mpg123 "$AUDIO_FILE"
