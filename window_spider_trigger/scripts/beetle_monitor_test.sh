#!/bin/bash
# Interactive Beetle Switch Test
# Opens serial monitor for manual switch testing

echo "🔍 Starting interactive Beetle switch test..."
echo ""
echo "The serial monitor will open. You should see:"
echo "  1. 'STARTUP' message"
echo "  2. 'READY' message"
echo "  3. When you press the switch: 'TRIGGER' message"
echo "  4. When you release: 'SWITCH_RELEASED' message"
echo ""
echo "LED on Pin 13 should light when switch is pressed."
echo ""
echo "Press Ctrl+C to exit when done testing."
echo ""
sleep 2
pixi run arduino-monitor
