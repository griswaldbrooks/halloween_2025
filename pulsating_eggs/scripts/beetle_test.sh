#!/bin/bash
# Beetle Hardware Test for Pulsating Egg Sacs
# Tests Arduino detection and code upload

set -e

echo "╔════════════════════════════════════════════════════════╗"
echo "║     🎃 BEETLE HARDWARE TEST - Pulsating Eggs 🎃       ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Test 1: Check if arduino-cli exists
echo "▶ Test 1: Arduino CLI installation"
if [ -f ".pixi/bin/arduino-cli" ]; then
    echo "  ✅ Arduino CLI found"
    .pixi/bin/arduino-cli version
else
    echo "  ❌ Arduino CLI not found. Run: pixi run setup"
    exit 1
fi
echo ""

# Test 2: Detect Beetle
echo "▶ Test 2: Beetle detection"
BOARDS=$(.pixi/bin/arduino-cli board list 2>&1)
echo "$BOARDS"
if echo "$BOARDS" | grep -q "Leonardo\|/dev/ttyACM"; then
    echo "  ✅ Beetle detected"
else
    echo "  ❌ Beetle not detected. Check USB connection."
    exit 1
fi
echo ""

# Test 3: Compile Arduino sketch
echo "▶ Test 3: Compile sketch"
if .pixi/bin/arduino-cli compile --fqbn arduino:avr:leonardo --config-file .arduino15/arduino-cli.yaml arduino/pulsating_eggs 2>&1; then
    echo "  ✅ Compilation successful"
else
    echo "  ❌ Compilation failed"
    exit 1
fi
echo ""

# Test 4: Upload sketch
echo "▶ Test 4: Upload to Beetle"
echo "  This will flash the pulsating_eggs code to the Beetle..."
PORT=$(.pixi/bin/arduino-cli board list | grep Leonardo | awk '{print $1}' | head -n 1)
if [ -z "$PORT" ]; then
    echo "  ❌ No Leonardo port found"
    exit 1
fi
echo "  Using port: $PORT"
if .pixi/bin/arduino-cli upload -p $PORT --fqbn arduino:avr:leonardo --config-file .arduino15/arduino-cli.yaml arduino/pulsating_eggs 2>&1; then
    echo "  ✅ Upload successful"
else
    echo "  ❌ Upload failed. Check permissions or close any serial monitors."
    exit 1
fi
echo ""

echo "╔════════════════════════════════════════════════════════╗"
echo "║           ✅ ALL HARDWARE TESTS PASSED ✅              ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""
echo "Next steps:"
echo "  1. Run: pixi run arduino-monitor"
echo "  2. Watch the serial output for mode changes"
echo "  3. Observe LEDs for pulsating patterns"
echo ""
