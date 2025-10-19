# Servo Test Script Guide

Quick reference for testing the PCA9685 and HS-755MG servos before deploying production code.

---

## Quick Start

```bash
# 1. Wire up hardware (see WIRING.md)
# 2. Connect Beetle to computer
# 3. Flash test code
pixi run servo-test
```

This will upload the test code and open the serial monitor.

---

## Serial Commands

Once the test script is running, enter these commands in the serial monitor:

| Command | Action |
|---------|--------|
| `i` | Scan I2C bus for PCA9685 |
| `0` | Test HEAD servo (full sweep) |
| `1` | Test LEFT ARM servo (full sweep) |
| `2` | Test RIGHT ARM servo (full sweep) |
| `a` | Test ALL servos simultaneously |
| `c` | Center all servos to 90° |
| `s` | Show system status |
| `h` | Show help menu |

---

## Testing Sequence

### 1. Initial Power-On

**Before** turning on servo power:
1. Upload test code: `pixi run test-flash`
2. Open serial monitor: `pixi run test-monitor`
3. Verify I2C detection shows PCA9685

**Expected output:**
```
=== SERVO TEST ===
PCA9685 + 3x HS-755MG

> Init I2C...
> I2C scan...
  0x40 <- PCA9685!
> Init PCA9685...
  OK - 50Hz
> Centering servos...
  OK

=== COMMANDS ===
...
Cmd:
```

**If PCA9685 not detected:**
- Check SDA/SCL wiring to Beetle
- Check VCC/GND to PCA9685 logic side
- Verify I2C address (default 0x40)

### 2. Turn On Servo Power

**Now** turn on the 5V power supply for servos:
- Servos should move to center position (90°)
- Built-in LED should turn ON

**If servos don't move:**
- Check V+ and GND connections to PCA9685 power side
- Verify common ground (Beetle GND, PCA9685 GND, Power Supply GND)
- Check power supply is delivering 5V

### 3. Test Individual Servos

Enter `0` to test head servo:
```
Cmd: 0

> HEAD test
  Head sweep:
    0->180 OK
    180->0 OK
  Done
```

**Watch for:**
- Smooth movement from 0° to 180° and back
- No jittering or stuttering
- Servo returns to 90° center

Repeat with `1` (left arm) and `2` (right arm).

### 4. Test All Servos Together

Enter `a` to test all servos simultaneously:
```
Cmd: a

> ALL servos test
  All sweep:
    0->180 OK
    180->0 OK
  Done
```

**Watch for:**
- All three servos moving together
- No brownouts or power issues
- Smooth synchronized movement

### 5. Center Position

Enter `c` to return all servos to 90° center:
```
Cmd: c

> Center all
  OK
```

---

## Troubleshooting

### PCA9685 Not Detected

**Symptom:**
```
> I2C scan...
  None found
  Check SDA/SCL/VCC/GND
  FAIL - Check wiring
```

**Fix:**
1. Verify Beetle SDA → PCA9685 SDA
2. Verify Beetle SCL → PCA9685 SCL
3. Check VCC (5V) and GND connections
4. Run `i` command to rescan

### Servos Jitter or Don't Move

**Power Issue:**
- Check V+ connection to PCA9685
- Verify power supply is ON and 5V
- Check current capacity (need 5A for 3x HS-755MG)
- Verify common ground

**Wiring Issue:**
- Check servo connectors fully seated
- Verify orientation: Brown-Red-Orange (GND-V+-Signal)
- Test one servo at a time to isolate issue

### Servo Moves Wrong Direction

**Not a problem!** Different servos may rotate opposite directions. This is fine - the production code will account for this. Just verify each servo moves smoothly.

### Limited Range (doesn't reach 0° or 180°)

**Pulse width adjustment needed:**
1. Edit `arduino/servo_test/servo_test.ino`
2. Adjust `SERVOMIN` and `SERVOMAX`:
   ```cpp
   #define SERVOMIN  150   // Decrease for more counter-clockwise
   #define SERVOMAX  600   // Increase for more clockwise
   ```
3. Recompile and upload: `pixi run test-flash`
4. Test again with `a` command

---

## Expected Behavior

### Normal Operation

**I2C Scan:**
- Should detect exactly 1 device at 0x40 (PCA9685)

**Individual Servo Test:**
- Servo sweeps from 0° → 180° over ~2 seconds
- Brief pause
- Sweeps back 180° → 0° over ~2 seconds
- Returns to center (90°)

**All Servos Test:**
- All three servos move in sync
- Faster sweep (~3 seconds each direction)
- All return to center

**LED Indicator:**
- 3 quick blinks on startup
- Solid ON when PCA9685 detected
- Rapid blinking if PCA9685 not found

### Power Consumption

**HS-755MG Specs:**
- Idle: ~10-50mA per servo
- Moving: ~500-800mA per servo
- Stall: ~2.5A per servo (max)

**During "All Servos" test:**
- Expect 1.5-2.5A draw from power supply
- Normal operation for 3x HS-755MG

---

## Calibration Notes

### Rest Positions

Once testing is complete, note the center positions:
- All servos should be at 90° when entering `c` command
- If a servo arm is not centered, physically adjust the horn attachment
- Don't rely on software to compensate for mechanical misalignment

### Movement Ranges

For the production code, you may want different rest positions:
- Head tilted down: 70-80°
- Arms hanging: 100-110°

Note these values for updating the production code later.

---

## Pixi Commands

| Command | Description |
|---------|-------------|
| `pixi run servo-test` | Flash test code + open monitor |
| `pixi run test-flash` | Upload test code only |
| `pixi run test-monitor` | Open serial monitor only |
| `pixi run test-compile` | Compile without uploading |
| `pixi run test-clean` | Clean build artifacts |

---

## After Testing

Once all servos test successfully:

1. **Note any adjustments:**
   - Pulse width changes
   - Direction reversals needed
   - Preferred rest positions

2. **Power off:**
   - Turn off servo power supply
   - Disconnect Beetle USB

3. **Ready for production:**
   - Update production code with calibration values
   - Flash production code: `pixi run arduino-flash`

---

## Serial Monitor Settings

**Baud Rate:** 9600
**Line Ending:** Newline or No line ending
**Commands:** Single character (no Enter needed)

---

## Memory Usage

Memory-optimized for Beetle/Leonardo limited RAM:
- **Flash:** 11,610 bytes (40% of 28KB)
- **RAM:** 387 bytes (15% of 2.5KB)
- Leaves 2,173 bytes for stack/heap

Uses F() macro to store strings in flash memory instead of RAM.

---

## Example Test Session

```
=== SERVO TEST ===
PCA9685 + 3x HS-755MG

> Init I2C...
> I2C scan...
  0x40 <- PCA9685!
> Init PCA9685...
  OK - 50Hz
> Centering servos...
  OK

=== COMMANDS ===
...
Cmd: i

> I2C scan...
  0x40 <- PCA9685!

Cmd: 0

> HEAD test
  Head sweep:
    0->180 OK
    180->0 OK
  Done

Cmd: 1

> LEFT ARM test
  Left sweep:
    0->180 OK
    180->0 OK
  Done

Cmd: 2

> RIGHT ARM test
  Right sweep:
    0->180 OK
    180->0 OK
  Done

Cmd: a

> ALL servos test
  All sweep:
    0->180 OK
    180->0 OK
  Done

Cmd: c

> Center all
  OK

Cmd: s

=== STATUS ===
PCA9685: 0x40
Detected: YES
PWM: 50Hz
Servos:
  CH0=Head
  CH1=LeftArm
  CH2=RightArm
Pulse: 150-600us

Cmd:
```

---

## Next Steps

After successful testing:
1. See `WIRING.md` for complete wiring diagram
2. Update production code if needed
3. Deploy with `pixi run deploy`
