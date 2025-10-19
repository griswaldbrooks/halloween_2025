#!/bin/bash
# Raspberry Pi Audio Loop - Automated Setup Script
# Halloween 2025 - Chamber 4 (Victim Room)

set -e  # Exit on error

echo "========================================"
echo "  Raspberry Pi Audio Loop Setup"
echo "  Halloween 2025 - Haunted House"
echo "========================================"
echo

# Check if running on Raspberry Pi
if [ ! -f /proc/device-tree/model ]; then
    echo "⚠️  Warning: This doesn't appear to be a Raspberry Pi"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Get absolute path to this script's directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo "📁 Working directory: $SCRIPT_DIR"
echo

# Step 1: Update package list
echo "📦 Updating package list..."
sudo apt update

# Step 2: Install audio player
echo "🔊 Installing mpg123 audio player..."
sudo apt install -y mpg123 alsa-utils

# Step 3: Check for audio file
echo "🎵 Checking for audio files..."
if [ ! -d "audio" ]; then
    mkdir -p audio
    echo "   Created audio/ directory"
fi

# Copy sample audio if it exists in parent assets directory
if [ -f "../assets/crying-ghost.mp3" ] && [ ! -f "audio/crying-ghost.mp3" ]; then
    cp "../assets/crying-ghost.mp3" audio/
    echo "   ✓ Copied crying-ghost.mp3 from assets"
fi

if [ ! -f "audio/crying-ghost.mp3" ]; then
    echo "   ⚠️  No audio file found!"
    echo "   Please copy your MP3 file to: $SCRIPT_DIR/audio/crying-ghost.mp3"
    echo "   Or update audio-loop.service to point to your file"
    echo
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Step 4: Test audio output
echo "🔧 Detecting audio devices..."
aplay -l

echo
echo "🔊 Setting audio output to headphone jack..."
amixer cset numid=3 1 2>/dev/null || echo "   (Could not set audio output - configure manually if needed)"

# Step 5: Set volume
echo "🔊 Setting volume to 75%..."
amixer set PCM 75% 2>/dev/null || echo "   (Could not set volume - adjust manually if needed)"

# Step 6: Update service file with correct paths
echo "📝 Configuring systemd service..."
SERVICE_FILE="audio-loop.service"
TEMP_SERVICE="/tmp/audio-loop.service.tmp"

# Replace placeholder path with actual path
sed "s|/home/pi/halloween_2025/twitching_body/raspberry_pi_audio|$SCRIPT_DIR|g" \
    "$SERVICE_FILE" > "$TEMP_SERVICE"

# Install service
sudo cp "$TEMP_SERVICE" /etc/systemd/system/audio-loop.service
rm "$TEMP_SERVICE"

# Step 7: Enable and start service
echo "🚀 Enabling audio loop service..."
sudo systemctl daemon-reload
sudo systemctl enable audio-loop.service
sudo systemctl start audio-loop.service

# Step 8: Check status
echo
echo "✅ Setup complete!"
echo
echo "Checking service status..."
sleep 2
sudo systemctl status audio-loop.service --no-pager || true

echo
echo "========================================"
echo "  Installation Summary"
echo "========================================"
echo "✓ mpg123 installed"
echo "✓ Service installed and enabled"
echo "✓ Audio output configured"
echo "✓ Volume set to 75%"
echo
echo "Audio should be playing now!"
echo "If you don't hear audio, check troubleshooting in README.md"
echo
echo "Useful commands:"
echo "  Stop audio:    sudo systemctl stop audio-loop.service"
echo "  Start audio:   sudo systemctl start audio-loop.service"
echo "  Check status:  sudo systemctl status audio-loop.service"
echo "  View logs:     journalctl -u audio-loop.service -f"
echo "  Set volume:    ./scripts/set-volume.sh 75"
echo
echo "To test auto-start on boot:"
echo "  sudo reboot"
echo
echo "========================================"
