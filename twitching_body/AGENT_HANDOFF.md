# Agent Handoff - Twitching Body Animatronic

## Status: ✅ COMPLETE - Production Ready & Tuned

**Last Updated:** 2025-10-19 18:30
**Project:** Twitching Body Animatronic for Chamber 4 (Victim Room)

---

## Summary

**Fully functional animatronic tested and tuned with dressed prop.**

- 3-servo system (head, left arm, right arm)
- PCA9685 PWM driver over I2C
- Autonomous operation (no computer needed after programming)
- Realistic struggling victim behavior with violent thrashing

---

## Quick Start

```bash
cd twitching_body
pixi run deploy          # Flash + monitor
```

**Center Button:** Ground Pin 9 to center servos at 90° (for servo horn installation).

---

## Hardware

- DFRobot Beetle (DFR0282)
- PCA9685 16-channel PWM driver (I2C 0x40)
- 3x HS-755MG high-torque servos
- 5V 5A+ external power supply

**Critical:** Common ground (Beetle + PCA9685 + Power Supply)

---

## Final Tuned Behavior

**After extensive testing with dressed animatronic:**

1. **Slow Movements (50-70% of time, 8-18 seconds)**
   - Head: Full 0-180° range with variations ✓
   - Arms: ALWAYS extreme positions (0-30° or 150-180°) ✓
   - Effect: Struggling to pull himself up, then dropping

2. **Brief Still (20-40% of time, 2-5 seconds)**
   - Short pauses between movements

3. **VIOLENT Thrashing (5% of time, 0.6-1 second)**
   - Targets change every 100ms (6-10 position changes)
   - Maximum speed (15°/step, 0ms delay)
   - Effect: Frustrated/panicked violent struggling

**Key:** NO small movements - all arm motions are dramatic and visible when dressed.

---

## Key Tuning Sessions

### Session 1: Initial Movement Ranges
- Increased from ±15° to ±55° to ±70° to ±90°
- Made slow movements dominant (50-70% vs 10-20%)
- Reduced still time from 70-85% to 20-40%

### Session 2: Eliminate Small Movements
- Fixed random() picking invisible small values
- Arms now ALWAYS go to extremes (0-30° or 150-180°)
- Removed mid-movement target changes for full sweeps

### Session 3: Violent Thrashing
- Increased quick jerk duration (150-400ms → 600-1000ms)
- Added thrashing (targets change every 100ms)
- Maximum speed (15°/step at 0ms delay)

---

## Files

**Essential:**
- `README.md` - Complete setup guide
- `WIRING.md` - Wiring diagrams
- `CHANGELOG.md` - Complete tuning history
- `arduino/twitching_servos/twitching_servos.ino` - Production code

**Testing:**
- `SERVO_TEST.md` - Interactive testing guide
- `arduino/servo_test/servo_test.ino` - Test sketch
- `scripts/` - Testing utilities

**Audio:**
- `raspberry_pi_audio/` - Victim moaning audio loop system

---

## Production Code Key Settings

```cpp
// Movement ranges - both use extremes
const int SLOW_MOVEMENT_RANGE = 90;
const int QUICK_JERK_RANGE = 90;

// Speed
const int SLOW_MOVEMENT_DELAY = 40;   // Smooth
const int QUICK_MOVEMENT_DELAY = 0;   // Maximum speed

// Cycle durations (ms)
{3000, 12000, 800},   // still, slow, violent jerk
{2000, 15000, 1000},  // longest jerk
{4000, 10000, 600},
{2500, 18000, 900},
{5000, 8000, 700}
```

---

## Deployment

1. Install servos in prop body
2. Use center button (Pin 9) to position servo horns at 90°
3. Connect external 5V 5A+ power supply
4. Upload: `pixi run arduino-flash`
5. Test movements are visible when dressed

---

## Audio System

Raspberry Pi auto-plays victim moaning sounds on loop:

```bash
cd raspberry_pi_audio
./setup.sh
sudo reboot
```

See `raspberry_pi_audio/README.md` for details.

---

## For Next Agent

**This project is COMPLETE.** All movements are tuned for maximum dramatic effect with dressed animatronic.

If modifications needed:
1. Read `README.md` for full context
2. Test with `pixi run servo-test` before changing production code
3. Document changes in `CHANGELOG.md`

**Movement tuning complete - DO NOT change movement ranges without physical testing!**

---

## Critical Learnings

1. **Test with dressed prop** - movements look different when dressed
2. **No small movements** - they're invisible, always use extremes
3. **Thrashing > single motion** - rapid position changes are more dramatic
4. **Longer quick jerks** - need 600-1000ms to be visible
5. **Calibrated pulse widths** - 600-2400µs prevents servo stalling

---

**Project Status:** ✅ Production-ready for haunted house deployment
