# DFRobot Beetle Hardware Test Guide

## Problem Detection

The DFRobot Beetle (DFR0282) is Leonardo-compatible but has limited pins. This test ensures:
1. Pin 9 is correctly wired and working
2. Arduino code compiles for the Beetle
3. Switch triggers are detected
4. Serial communication works properly

## Pre-Test Checklist

- [ ] DFRobot Beetle connected via USB
- [ ] Momentary switch wired: Pin 9 → Switch → GND
- [ ] Board detected at `/dev/ttyACM0`

## Test 1: Board Detection

```bash
pixi run arduino-detect
```

**Expected output:**
```
Port         Protocol Type              Board Name       FQBN                 Core
/dev/ttyACM0 serial   Serial Port (USB) Arduino Leonardo arduino:avr:leonardo arduino:avr
```

**Note:** Beetle reports as "Arduino Leonardo" - this is correct!

## Test 2: Verify Pin Configuration

Check that the Arduino code uses Pin 9:

```bash
grep "SWITCH_PIN" arduino/motion_trigger/motion_trigger.ino
```

**Expected:**
```cpp
const int SWITCH_PIN = 9;         // Momentary switch pin (Pin 9 for Beetle compatibility)
```

## Test 3: Compile Code

```bash
pixi run arduino-compile
```

**Expected:**
- ✓ Compilation successful
- No errors about missing pins

**If errors occur:** Check that code doesn't reference unavailable pins (2, 3, 4, etc.)

## Test 4: Flash the Beetle

```bash
pixi run arduino-flash
```

**Expected:**
```
Sketch uses X bytes (XX%) of program storage space
Global variables use X bytes (XX%) of dynamic memory
```

**If upload fails:**
- Check USB cable connection
- Try unplugging and replugging the Beetle
- Verify permissions: `pixi run check-permissions`

## Test 5: Serial Monitor Test

```bash
pixi run arduino-monitor
```

**On startup, you should see:**
```
STARTUP
Switch trigger ready
Press switch to trigger scare
READY
```

**Test actions:**

### 5a. Press the switch
**Expected:**
```
Switch pressed at: X seconds
TRIGGER
```

**LED Behavior:** Built-in LED (Pin 13) should turn ON

### 5b. Release the switch
**Expected:**
```
SWITCH_RELEASED
```

**LED Behavior:** Built-in LED should turn OFF

### 5c. Press switch again within 3 seconds
**Expected:**
```
COOLDOWN
Wait X more seconds
```

### 5d. Wait 3+ seconds, then press again
**Expected:**
```
Switch pressed at: Y seconds
TRIGGER
```

## Test 6: Status Command

Send serial commands from another terminal while monitor is running:

```bash
echo "STATUS" > /dev/ttyACM0
```

**Expected in monitor:**
```
Switch: RELEASED (or PRESSED)
Cooldown: Ready (or X ms remaining)
```

## Test 7: Full System Integration Test

### 7a. Start the server (in new terminal)
```bash
pixi run start
```

**Expected:**
```
╔════════════════════════════════════════════════════════╗
║     🕷️  SPIDER WINDOW SCARE - SERVER RUNNING 🕷️       ║
╚════════════════════════════════════════════════════════╝
  Web interface: http://localhost:3000
  Serial port: auto @ 9600 baud

✓ Found Arduino at: /dev/ttyACM0
✓ Serial port /dev/ttyACM0 opened
  Baud rate: 9600
```

### 7b. Open web interface
```bash
# Open browser to http://localhost:3000
```

### 7c. Press the switch
**Expected:**
- Server console: `🕷️  MOTION DETECTED - Triggering scare!`
- Browser: Jump scare video plays

### 7d. Press 'T' in browser
**Expected:**
- Manual test trigger
- Video plays

## Troubleshooting

### Issue: "No such pin: 2"
**Solution:** Code is still using Pin 2. Update to Pin 9 in motion_trigger.ino

### Issue: Switch seems reversed (triggers when released)
**Cause:** Switch wiring or type mismatch

**Solution 1:** Swap switch terminals
**Solution 2:** Use Normally Closed (NC) terminal instead of NO
**Solution 3:** Invert logic in code:
```cpp
if (switchState == HIGH && !switchPressed) { // Change LOW to HIGH
```

### Issue: Random/constant triggers
**Cause:** Floating pin or poor connection

**Solutions:**
- Verify using `INPUT_PULLUP` in code (line 38)
- Check wire connections are secure
- Try shorter wires
- Check switch quality

### Issue: LED doesn't light up
**Cause:** Pin 13 conflict or Beetle variant

**Note:** Some Beetle variants may not have accessible LED on Pin 13. This doesn't affect functionality - only visual feedback.

### Issue: Upload fails "ser_open(): can't open device"
**Solutions:**
1. Check permissions: `sudo usermod -a -G dialout $USER` (then logout/login)
2. Close any serial monitors/programs using the port
3. Unplug and replug the Beetle
4. Try different USB port/cable

## Pin Verification Table

| Pin | Beetle Availability | Current Use | Status |
|-----|-------------------|-------------|---------|
| 0 (RX) | ⚠️ Serial | Unused | Avoid |
| 1 (TX) | ⚠️ Serial | Unused | Avoid |
| 2 | ❌ Not available | - | - |
| 9 | ✅ Available | **Switch Input** | ✅ Used |
| 10 | ✅ Available | Unused | Available |
| 11 | ✅ Available | Unused | Available |
| 13 | ✅ Available | **LED Output** | ✅ Used |
| A0 | ✅ Available | Unused | Available |
| A1 | ✅ Available | Unused | Available |
| A2 | ✅ Available | Unused | Available |

## Success Criteria

All tests must pass:
- [x] Board detected as Arduino Leonardo
- [x] Code compiles without errors
- [x] Code uploads successfully
- [x] "STARTUP" and "READY" messages appear
- [x] Switch press triggers "TRIGGER" message
- [x] Switch release triggers "SWITCH_RELEASED" message
- [x] LED responds to switch presses
- [x] 3-second cooldown works
- [x] Server connects to Arduino
- [x] Web interface triggers video on switch press

## Hardware-in-the-Loop Test Script

For automated testing, add to `pixi.toml`:

```toml
beetle-test = """
echo "🧪 Beetle Hardware Test"
echo ""
echo "1️⃣ Checking board detection..."
.pixi/bin/arduino-cli board list | grep -q "Leonardo" && echo "✓ Beetle detected" || (echo "❌ Beetle not found" && exit 1)
echo ""
echo "2️⃣ Compiling code..."
pixi run arduino-compile > /dev/null && echo "✓ Compilation successful" || (echo "❌ Compilation failed" && exit 1)
echo ""
echo "3️⃣ Uploading to Beetle..."
pixi run arduino-upload > /dev/null && echo "✓ Upload successful" || (echo "❌ Upload failed" && exit 1)
echo ""
echo "4️⃣ Checking serial connection..."
sleep 2
timeout 5 .pixi/bin/arduino-cli monitor -p /dev/ttyACM0 -c baudrate=9600 | grep -q "READY" && echo "✓ Arduino ready" || echo "⚠️ Could not verify READY message (check manually)"
echo ""
echo "✅ Automated tests complete!"
echo ""
echo "🔧 Manual test required:"
echo "   Run: pixi run arduino-monitor"
echo "   Then press the switch and verify TRIGGER message"
"""
```

## Post-Test Documentation

After successful testing, document your setup:

```bash
# Create hardware config file
cat > hardware_config.txt << EOF
Board: DFRobot Beetle (DFR0282)
FQBN: arduino:avr:leonardo
Port: /dev/ttyACM0
Switch Pin: 9
LED Pin: 13
Switch Type: Normally Open (NO)
Switch Location: [Describe your physical setup]
Tested: $(date)
EOF
```

## Next Steps

Once all tests pass:
1. Document your physical switch mounting
2. Test with actual prop/object
3. Run extended soak test (leave running for 30+ minutes)
4. Test multiple rapid triggers
5. Document any quirks or adjustments needed

---

**Last Updated:** 2025-10-14
