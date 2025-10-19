#!/bin/bash
# Set system volume on Raspberry Pi

VOLUME=${1:-75}

if [ "$VOLUME" -lt 0 ] || [ "$VOLUME" -gt 100 ]; then
    echo "❌ Volume must be between 0 and 100"
    echo "Usage: $0 [volume]"
    echo "Example: $0 75"
    exit 1
fi

echo "Setting volume to ${VOLUME}%..."
amixer set PCM ${VOLUME}%

echo "✓ Volume set to ${VOLUME}%"
echo
echo "Current volume:"
amixer get PCM | grep -o '[0-9]*%' | head -n 1
