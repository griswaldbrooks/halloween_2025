# Agent Handoff - Twitching Body Animatronic

## Status: ✅ COMPLETE - Production Ready

**Last Updated:** 2025-10-19 16:10
**Project:** Twitching Body Animatronic for Chamber 4 (Victim Room)

---

## Summary

**The twitching body animatronic is fully functional and tested with hardware.**

- 3-servo system (head, left arm, right arm)
- Controlled via PCA9685 PWM driver over I2C
- Autonomous operation (no sensors, no computer needed)
- Creepy movements: still → slow twitches → quick jerks
- Arms move in opposite directions for dramatic effect

---

## Quick Start (For Next Agent/User)

```bash
cd twitching_body

# Deploy to hardware
pixi run deploy          # Flash + monitor

# Or just upload
pixi run arduino-flash   # Upload only

# Test hardware interactively
pixi run servo-test      # Interactive testing
```

**Center Button:** Ground Pin 9 during operation to center servos at 90° (useful for installing servo horns).

---

## Hardware Configuration

### Components
- DFRobot Beetle (DFR0282) - Leonardo-compatible Arduino
- PCA9685 16-channel PWM driver (I2C address 0x40)
- 3x HS-755MG high-torque servos
- 5V 5A+ power supply (external, for servos)

### Wiring
```
Beetle (I2C) → PCA9685 → Servos (CH0/CH1/CH2)
             ↑
      5V 5A+ Power Supply
```

**Critical:** All grounds must be connected (Beetle + PCA9685 + Power Supply).

**Details:** See `WIRING.md` for complete diagrams.

---

## What Works

### Hardware
- ✅ PCA9685 I2C communication (address 0x40)
- ✅ All three servos move smoothly
- ✅ Calibrated pulse widths (600-2400µs) prevent stalling
- ✅ No excessive current draw (<500mA idle)
- ✅ Center button on Pin 9

### Software
- ✅ Production code uses PCA9685 (not direct Servo library)
- ✅ Integer overflow fix applied
- ✅ Opposite arm motion implemented
- ✅ Memory optimized (491 bytes RAM, 19%)
- ✅ Autonomous operation
- ✅ 5 varying cycles for unpredictability

### Behavior
- ✅ Still (70-85% of time, 6-15 seconds)
- ✅ Slow movements (±15°, arms opposite directions)
- ✅ Quick jerks (±35°, arms opposite directions)
- ✅ LED feedback on Pin 13

---

## Key Issues Resolved This Session

### 1. Pulse Width Calibration (CRITICAL FIX)
**Problem:** Original test code had pulse widths of 150-600µs
**Symptom:** Servos stalled, twitched, drew 2A+ when idle
**Solution:** Calibrated to 600-2400µs through hardware testing
**Result:** Smooth movement, normal current draw

### 2. Integer Overflow
**Problem:** Pulse calculation `(pulse_us * 4096) / 20000` overflowed int
**Solution:** Cast to long: `((long)pulse_us * 4096) / 20000`
**Result:** Correct PWM values, no negative microseconds

### 3. Upload Command Syntax
**Problem:** `arduino-cli upload` didn't accept sketch path as argument
**Solution:** Use `cd` into sketch directory + `--input-dir .`
**Result:** Uploads work reliably

### 4. Center Button
**Added:** Pin 9 can be grounded anytime to center servos at 90°
**Use case:** Installing servo horns at neutral position
**Result:** Much easier hardware assembly

### 5. Opposite Arm Motion
**Added:** Arms move in mirror directions (one up, one down)
**Result:** More dramatic and unsettling movements

---

## Files

### Documentation (All Up-to-Date)
- `README.md` - Complete setup guide ⭐ START HERE
- `WIRING.md` - Detailed wiring diagrams
- `SERVO_TEST.md` - Interactive testing guide
- `TROUBLESHOOTING.md` - Problem-solving
- `CHANGELOG.md` - Complete history of changes
- `AGENT_HANDOFF.md` - This file

### Code (Production Ready)
- `arduino/twitching_servos/twitching_servos.ino` - ✅ Production code (PCA9685)
- `arduino/servo_test/servo_test.ino` - Interactive testing tool

### Scripts
- `scripts/beetle_test.sh` - Hardware verification
- `scripts/integration_test.sh` - System test
- `scripts/kill_arduino.sh` - Process cleanup

### Configuration
- `pixi.toml` - All Pixi tasks (updated and working)

---

## Production Code Details

**File:** `arduino/twitching_servos/twitching_servos.ino`

**Key Settings:**
```cpp
// Calibrated pulse widths for HS-755MG
#define SERVOMIN  600
#define SERVOMAX  2400
#define SERVO_FREQ 50

// Movement ranges
const int SLOW_MOVEMENT_RANGE = 15;  // ±15 degrees
const int QUICK_JERK_RANGE = 35;     // ±35 degrees

// PCA9685 channels
#define HEAD_CHANNEL 0
#define LEFT_ARM_CHANNEL 1
#define RIGHT_ARM_CHANNEL 2

// Center button
const int CENTER_BUTTON_PIN = 9  // Ground to center servos
```

**Memory Usage:**
- Flash: 13,198 bytes (46%)
- RAM: 491 bytes (19%)

---

## Testing

### Quick Test
```bash
pixi run servo-test
# In monitor: i, 0, 1, 2, a, c, p, +, -, <, >
```

### Deployment
```bash
pixi run deploy          # Flash + monitor
# Watch for: "STARTUP", state transitions, servo movement logs
```

---

## Next Steps (If Continuing Work)

### For Deployment in Haunted House
1. Install servos in prop body (cocooned victim)
2. Use center button (Pin 9) to position servo horns
3. Secure wiring
4. Connect external 5V 5A+ power supply
5. Deploy code: `pixi run arduino-flash`
6. Test in Chamber 4
7. Fine-tune movement ranges if needed

### For Further Development (Optional)
- Add more servo channels (PCA9685 supports up to 16)
- Adjust movement ranges/timing in code
- Add sound triggers
- Integrate with room lighting

---

## Important Notes

**✅ DO:**
- Use external 5V 5A+ power supply for servos
- Connect all grounds together
- Use `pixi run` commands (not system tools)
- Test with `servo-test` before modifying production code

**❌ DON'T:**
- Change pulse width settings (600-2400µs) - these are calibrated!
- Power servos from Beetle 5V pin (insufficient current)
- Modify code without testing first
- Forget common ground

---

## For Next Agent

**If you need to modify this project:**

1. **Read `README.md`** - Complete overview
2. **Test current code:** `pixi run deploy`
3. **Make changes** to `arduino/twitching_servos/twitching_servos.ino`
4. **Test:** `pixi run arduino-flash`
5. **Document changes** in `CHANGELOG.md`

**If starting a new chamber effect:**

Use this project as a template:
- Pixi-based environment
- PCA9685 for servo control
- Auto port detection
- Memory optimization (F() macro)
- Interactive testing tools
- Comprehensive documentation

---

## Session Summary (2025-10-19)

**Duration:** ~3 hours
**Status Change:** "Needs PCA9685 update" → "COMPLETE and tested"

**Major Accomplishments:**
1. ✅ Updated production code to use PCA9685
2. ✅ Calibrated pulse widths (fixed stalling)
3. ✅ Fixed integer overflow bug
4. ✅ Added center button feature
5. ✅ Implemented opposite arm motion
6. ✅ Increased movement ranges (+7° slow, +10° jerks)
7. ✅ Fixed upload command syntax
8. ✅ Tested with actual hardware
9. ✅ Updated all documentation
10. ✅ Removed obsolete files

**Project is production-ready for haunted house deployment!**

---

**Questions? Check:**
- `README.md` for setup/usage
- `TROUBLESHOOTING.md` for common issues
- `WIRING.md` for connection diagrams
- `CHANGELOG.md` for complete history
