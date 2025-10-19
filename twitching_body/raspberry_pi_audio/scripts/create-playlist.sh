#!/bin/bash
# Create M3U playlist from all MP3 files in audio/ directory

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"
AUDIO_DIR="$SCRIPT_DIR/audio"
PLAYLIST="$AUDIO_DIR/playlist.m3u"

echo "========================================"
echo "  Creating Audio Playlist"
echo "========================================"
echo

# Check for MP3 files
MP3_COUNT=$(ls -1 "$AUDIO_DIR"/*.mp3 2>/dev/null | wc -l)

if [ "$MP3_COUNT" -eq 0 ]; then
    echo "❌ No MP3 files found in $AUDIO_DIR/"
    exit 1
fi

echo "Found $MP3_COUNT MP3 file(s)"
echo

# Create playlist with absolute paths
ls "$AUDIO_DIR"/*.mp3 > "$PLAYLIST"

echo "✓ Playlist created: $PLAYLIST"
echo
echo "Contents:"
cat "$PLAYLIST"
echo
echo "========================================"
echo "To use this playlist:"
echo "1. Edit /etc/systemd/system/audio-loop.service"
echo "2. Change ExecStart line to:"
echo "   ExecStart=/usr/bin/mpg123 --loop -1 --list $PLAYLIST"
echo "3. Run:"
echo "   sudo systemctl daemon-reload"
echo "   sudo systemctl restart audio-loop.service"
echo "========================================"
