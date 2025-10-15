#!/bin/bash
# DFRobot Beetle Hardware-in-the-Loop Test
# Automated test suite for Beetle compatibility

echo "🧪 DFRobot Beetle Hardware Test"
echo "================================"
echo ""

# Test 1: Board Detection
echo "1️⃣ Checking board detection..."
if .pixi/bin/arduino-cli board list | grep -q "Leonardo"; then
    echo "✓ Beetle detected as Arduino Leonardo"
else
    echo "❌ Beetle not found - is it connected?"
    exit 1
fi
echo ""

# Test 2: Pin Configuration
echo "2️⃣ Verifying pin configuration..."
if grep -q "SWITCH_PIN = 9" arduino/motion_trigger/motion_trigger.ino; then
    echo "✓ Code uses Pin 9 (Beetle-compatible)"
else
    echo "❌ Code not using Pin 9! Check motion_trigger.ino"
    exit 1
fi
echo ""

# Test 3: Compilation
echo "3️⃣ Compiling code..."
if pixi run arduino-compile > /tmp/beetle_compile.log 2>&1; then
    echo "✓ Compilation successful"
else
    echo "❌ Compilation failed - see /tmp/beetle_compile.log"
    cat /tmp/beetle_compile.log
    exit 1
fi
echo ""

# Test 4: Upload
echo "4️⃣ Uploading to Beetle..."
if pixi run arduino-upload > /tmp/beetle_upload.log 2>&1; then
    echo "✓ Upload successful"
else
    echo "❌ Upload failed - see /tmp/beetle_upload.log"
    cat /tmp/beetle_upload.log
    exit 1
fi
echo ""

# Test 5: Startup Wait
echo "5️⃣ Waiting for Arduino startup..."
sleep 3
echo ""

echo "✅ Automated tests complete!"
echo ""
echo "📋 Next: Manual verification required"
echo "   Run: pixi run beetle-monitor-test"
echo "   Expected: See 'STARTUP' and 'READY' messages"
echo "   Then: Press the switch connected to Pin 9"
echo "   Expected: See 'TRIGGER' message and LED lights up"
echo ""
echo "📖 Full test guide: See BEETLE_TEST.md"
