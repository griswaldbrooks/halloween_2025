# Angle-to-PWM Mapping Verification

## Overview

This document verifies that the joint angles (0-90°) correctly map to the calibrated PWM values across all systems: JSON configuration, JavaScript preview, C++ tests, and Arduino firmware.

## Verified Mappings

### Right Leg (Normal Operation)

**Right Elbow (Channel 0):**
- 0° → PWM 150 (parallel to upper leg segment)
- 90° → PWM 330 (perpendicular to upper leg segment)

**Right Shoulder (Channel 1):**
- 0° → PWM 150 (straight up from body)
- 90° → PWM 280 (perpendicular to body, horizontal)

### Left Leg (Inverted Operation)

**Left Shoulder (Channel 14):**
- 0° → PWM 440 (straight up from body)
- 90° → PWM 300 (perpendicular to body, horizontal)

**Left Elbow (Channel 15):**
- 0° → PWM 530 (parallel to upper leg segment)
- 90° → PWM 360 (perpendicular to upper leg segment)

## Test Coverage

### JavaScript Kinematics Tests (31 tests)

**Test 1: Zero Position (10 tests)**
- Verifies both legs point straight up at 0°
- Validates end effector positions: (240, 120) and (360, 120)

**Test 2: Max Position (9 tests)**
- Verifies perpendicular extension at 90°
- Validates end effector positions: (160, 400) and (440, 400)
- Confirms symmetric mirroring

**Test 3: Servo Degree Conversion (4 tests)**
- 0° internal angle → 0° servo degrees
- 90° internal angle → 90° servo degrees

**Test 4: Angle-to-PWM Mapping (8 tests)**
- Verifies all four servos map correctly to calibrated PWM values
- Tests both 0° and 90° positions
- Validates inverted servo behavior

### C++ Hardware Tests (171 tests)

- `test_servo_mapping.cpp` - 44 tests for per-servo PWM ranges
- `test_servo_tester.cpp` - 34 tests for calibration tool logic
- `test_servo_sweep.cpp` - 93 tests for sweep verification

### Python Config Tests (13 tests)

- Validates animation-config.json structure
- Verifies PWM ranges match hardware
- Confirms channel assignments

## Reference Animations

Added to `animation-config.json`:

**zero** - All servos at 0° (legs straight up)
**max** - All servos at 90° (legs perpendicular, elbows bent down)

## Verification Commands

```bash
# Run all tests
pixi run test                    # 215 tests total

# Run specific test suites
pixi run test-kinematics         # 31 kinematics tests
pixi run test-cpp                # 44 C++ mapping tests
pixi run test-python             # 13 Python config tests

# Generate Arduino config
pixi run generate-config         # Creates animation_config.h

# Preview in browser
pixi run serve
pixi run open                    # View at http://localhost:8081/preview.html
```

## Visual Verification

The preview shows white coordinate text at each end effector:
- **Zero position**: Both tips point up
- **Max position**: Left tip at (160, 400), Right tip at (440, 400)

## Status

✅ All 215 tests pass
✅ Angle-to-PWM mapping verified across all systems
✅ JSON, JavaScript, C++, and Arduino code all consistent
✅ Reference positions match expected end effector coordinates
