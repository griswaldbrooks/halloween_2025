#!/bin/bash
# Upload servo tester to DFRobot Beetle

set -e

ARDUINO_CLI=".pixi/bin/arduino-cli"
CONFIG_FILE=".arduino15/arduino-cli.yaml"
SKETCH_DIR="arduino/servo_tester"

echo "Servo Tester - Arduino Upload"
echo "=============================="
echo ""

# Find Beetle port
echo "Detecting Beetle..."
PORT=$($ARDUINO_CLI board list --config-file $CONFIG_FILE | grep "Arduino Leonardo" | awk '{print $1}' | head -1)

if [ -z "$PORT" ]; then
    echo "❌ No Beetle found!"
    echo "   - Is the Beetle plugged in?"
    echo "   - Try pressing the reset button twice"
    exit 1
fi

echo "✓ Found Beetle on $PORT"
echo ""

# Compile and upload
echo "Compiling and uploading..."
$ARDUINO_CLI compile --fqbn arduino:avr:leonardo --config-file $CONFIG_FILE $SKETCH_DIR
$ARDUINO_CLI upload -p $PORT --fqbn arduino:avr:leonardo --config-file $CONFIG_FILE $SKETCH_DIR

echo ""
echo "✓ Upload complete!"
echo ""
echo "To open serial monitor: pixi run servo-monitor"
