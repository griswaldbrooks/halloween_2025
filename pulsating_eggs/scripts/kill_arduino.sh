#!/bin/bash
# Kill all stuck Arduino processes
# Use when uploads hang or processes consume CPU

echo "Killing stuck Arduino processes..."

# Kill avrdude (the actual programmer)
pkill -9 avrdude 2>/dev/null && echo "  ✓ Killed avrdude"

# Kill arduino-cli upload processes
pkill -f "arduino-cli upload" 2>/dev/null && echo "  ✓ Killed arduino-cli upload"

# Kill arduino-cli monitor processes
pkill -f "arduino-cli monitor" 2>/dev/null && echo "  ✓ Killed arduino-cli monitor"

# Kill discovery processes
pkill -f "mdns-discovery" 2>/dev/null && echo "  ✓ Killed mdns-discovery"
pkill -f "serial-discovery" 2>/dev/null && echo "  ✓ Killed serial-discovery"

# Wait a moment
sleep 1

# Verify
if ps aux | grep -i arduino | grep -v grep > /dev/null; then
    echo ""
    echo "⚠️  Some processes still running:"
    ps aux | grep -i arduino | grep -v grep
else
    echo ""
    echo "✅ All Arduino processes killed"
fi

# Check serial ports
echo ""
echo "Serial port status:"
if lsof /dev/ttyACM* 2>/dev/null; then
    echo "⚠️  Processes still holding serial ports above"
else
    echo "✅ No processes holding serial ports"
fi
