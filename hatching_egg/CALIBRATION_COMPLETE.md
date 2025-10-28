# Calibration Complete - Hatching Egg Spider

**Date:** 2025-10-28
**Status:** ✅ READY TO UPLOAD

---

## Calibrated PWM Ranges (Hardware Tested)

### Right Leg (Normal Servos)
- **Right Elbow (CH0)**: PWM 150 (0°) to 330 (90°)
  - 0° = parallel to leg
  - 90° = perpendicular to leg
- **Right Shoulder (CH1)**: PWM 150 (0°) to 280 (90°)
  - 0° = straight up
  - 90° = perpendicular to body

### Left Leg (Inverted Servos)
- **Left Shoulder (CH14)**: PWM 440 (0°) to 300 (90°)
  - 0° = straight up
  - 90° = perpendicular to body
  - **Inverted range** (440 > 300)
- **Left Elbow (CH15)**: PWM 530 (0°) to 360 (90°)
  - 0° = parallel to leg
  - 90° = perpendicular to leg
  - **Inverted range** (530 > 360)

---

## What Was Updated

### 1. Configuration Files
✅ **animation-config.json**
- Updated all servo PWM ranges to calibrated values
- Changed angle range from 0-180° to 0-90°
- Updated all animation keyframes to use 0-90° range
- Added comments explaining each range

### 2. Arduino Code
✅ **arduino/servo_mapping.h** (v2)
- New per-servo PWM mapping system
- Supports both normal and inverted servo ranges
- Enforces calibrated PWM limits per servo
- Prevents servos from going outside safe ranges

✅ **arduino/hatching_egg/hatching_egg.ino**
- Updated setServo() to map 0-90° instead of 0-180°
- Per-servo PWM ranges already supported (no change needed)

✅ **arduino/hatching_egg/animation_config.h**
- Auto-generated from animation-config.json
- Contains all calibrated PWM ranges

### 3. Unit Tests
✅ **test_servo_mapping_v2.cpp** (44 C++ tests)
- Tests each servo's 0°, 45°, 90° mapping
- Tests inverted ranges (left servos)
- Tests PWM safety checks
- Tests animation keyframe safety
- All tests passing ✅

✅ **test_servo_mapping_v2.py** (13 Python tests)
- Tests configuration structure
- Tests calibrated PWM ranges
- Tests 0-90° angle constraints
- Tests all animation keyframes
- All tests passing ✅

✅ **test_servo_tester.cpp** (37 tests)
- Tests calibration tool logic
- All tests passing ✅

**Total:** 94 tests - all passing ✅

### 4. Animations
Updated all 4 animations to use 0-90° range:

✅ **resting** - All servos at 0° (safe position)
✅ **slow_struggle** - Gentle struggling (angles: 0-65°)
✅ **breaking_through** - Violent pushing (angles: 0-80°)
✅ **grasping** - Reaching and closing (angles: 0-80°)

---

## Safety Features

1. **Per-Servo Range Enforcement**
   - Each servo has its own min/max PWM values
   - Arduino code constrains to 0-90°
   - Impossible to exceed safe range

2. **Unit Test Protection**
   - 94 tests verify all angles are safe
   - `pixi run test` must pass before upload
   - Upload automatically blocked if tests fail

3. **Inverted Range Support**
   - Left servos (CH14, CH15) have inverted ranges
   - Mapping handles both normal and inverted correctly
   - No risk of servos taking strange paths

4. **Hardware Verified**
   - All PWM ranges tested with actual hardware
   - No collisions in safe ranges
   - Smooth servo movement confirmed

---

## How to Upload

```bash
# 1. Run tests (REQUIRED - automatically blocks unsafe uploads)
pixi run test

# 2. Upload to hardware
pixi run upload

# 3. Monitor serial output
pixi run monitor
```

**To trigger animation:** Ground Pin 9

---

## Expected Behavior

1. **On Power-Up:**
   - All servos move to 0° (resting position)
   - Serial prints "Ready! Waiting for trigger..."

2. **On Trigger (Pin 9 grounded):**
   - Plays "slow_struggle" animation (default)
   - Loops continuously until power off

3. **Servo Movement:**
   - Right leg: normal servo operation (150→higher PWM)
   - Left leg: inverted servo operation (higher→lower PWM)
   - No collisions with egg body
   - Smooth interpolation between keyframes

---

## Servo Angle Reference

| Servo | 0° (Zero) | 90° (Max) | Direction |
|-------|-----------|-----------|-----------|
| Right Elbow | PWM 150 (parallel to leg) | PWM 330 (perpendicular) | Normal |
| Right Shoulder | PWM 150 (straight up) | PWM 280 (perpendicular) | Normal |
| Left Shoulder | PWM 440 (straight up) | PWM 300 (perpendicular) | **Inverted** |
| Left Elbow | PWM 530 (parallel to leg) | PWM 360 (perpendicular) | **Inverted** |

---

## Test Results

```
========================================
Tests Passed: 94
Tests Failed: 0
========================================

✅ C++ Servo Mapping: 44/44 passed
✅ Python Config Tests: 13/13 passed
✅ Servo Tester Logic: 37/37 passed

✅ ALL TESTS PASSED - Safe to upload
```

**Compilation:**
- Sketch size: 10,980 bytes (38% of flash)
- Global variables: 403 bytes (15% of RAM)
- ✅ Compiles successfully

---

## Files Modified

**Configuration:**
- `animation-config.json` - Updated with calibrated ranges

**Arduino Code:**
- `arduino/servo_mapping.h` - New v2 with per-servo ranges
- `arduino/hatching_egg/hatching_egg.ino` - Updated to 0-90° mapping
- `arduino/hatching_egg/animation_config.h` - Auto-generated

**Tests:**
- `test_servo_mapping_v2.cpp` - New C++ tests
- `test_servo_mapping_v2.py` - New Python tests
- `pixi.toml` - Updated test commands

**Documentation:**
- `CALIBRATION_COMPLETE.md` - This file
- `STATUS.md` - Updated with calibration complete status

---

## Next Steps

1. ✅ **Calibration Complete**
2. **Ready to Upload** - Run `pixi run upload`
3. **Test Animations** - Ground Pin 9 to trigger
4. **Fine-Tune** - Adjust animation keyframes if needed
5. **Integration** - Connect to trigger system

---

**Status:** 🎉 CALIBRATION COMPLETE - READY FOR DEPLOYMENT

All servos calibrated, tested, and verified safe for operation!
