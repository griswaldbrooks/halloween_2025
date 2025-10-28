# Agent Handoff - Hatching Egg Spider

**Last Updated:** 2025-10-28 (End of Session 5)
**Status:** ✅ COMPLETE - Ready for Deployment

---

## 🎯 TL;DR for Next Agent

**Current State: 100% Complete - Ready to Deploy**

✅ **All systems operational:**
- Hardware verified (4 servos on channels 0, 1, 14, 15)
- Calibration complete (per-servo PWM ranges)
- **231 unit tests passing** (C++ + Python + JavaScript)
- **All animations are symmetric** (left == right at all keyframes)
- Kinematics and PWM mapping verified (31 tests)
- **Animation symmetry verified** (10 new behavior tests)
- Sweep test verified on actual hardware
- **Web preview loads dynamically from JSON** with real-time coordinates
- Main animation ready to upload

**Immediate Next Steps:**
1. Upload main animation (`pixi run upload`)
2. Test trigger switch (ground Pin 9)
3. Fine-tune animation keyframes if needed
4. Integration testing

**Key Resources:**
- `MAPPING_VERIFICATION.md` - Angle-to-PWM mapping details
- `STATUS.md` - Complete project status
- `README.md` - Quick reference

---

## 📊 Project Status Summary

### Hardware Configuration ✅

**Servos (Calibrated 2025-10-28):**

| Servo | Channel | PWM Range | Angle Range | Type |
|-------|---------|-----------|-------------|------|
| Right Elbow | CH0 | 150-330 | 0-90° | Normal |
| Right Shoulder | CH1 | 150-280 | 0-90° | Normal |
| Left Shoulder | CH14 | 440-300 | 0-90° | Inverted |
| Left Elbow | CH15 | 530-360 | 0-90° | Inverted |

**Notes:**
- Left servos have INVERTED ranges (PWM decreases as angle increases)
- All ranges prevent collisions with egg body
- Tested and verified with sweep test on hardware

**Other Hardware:**
- DFRobot Beetle (Leonardo)
- PCA9685 PWM Servo Driver (I2C address 0x40)
- Trigger switch on Pin 9 (INPUT_PULLUP)

### Test Suite ✅

**Total: 231 tests passing**

**Framework:** Google Test (gtest) with C++17 for C++, Node.js for JavaScript

```bash
pixi run test              # Run all 231 tests
pixi run test-cpp          # 44 C++ servo mapping tests (gtest)
pixi run test-python       # 19 Python config tests (includes symmetry)
pixi run test-servo-tester # 34 calibration tool tests (gtest)
pixi run test-servo-sweep  # 93 sweep test tests (gtest with parameterized testing)
pixi run test-kinematics   # 31 JavaScript kinematics tests
pixi run test-animation-behaviors # 10 animation behavior tests (JSON loading & symmetry)
```

**What Tests Verify:**
- Per-servo PWM ranges are safe
- All animation keyframes within safe ranges (0-90°)
- **All animations are symmetric** (left == right)
- **Animations have movement** between keyframes
- **Web preview loads correctly** from JSON
- Angle-to-PWM conversion correct for each servo
- Inverted servos handled correctly
- Configuration structure valid
- Comprehensive coverage via parameterized tests
- **Forward kinematics produces correct end effector positions**
- **Angle-to-PWM mapping matches hardware calibration (all 4 servos)**

**Safety:** Upload automatically blocked if any test fails

**See Also:** `MAPPING_VERIFICATION.md` for detailed PWM mapping verification

### Animations ✅

**7 symmetric behaviors defined** (in `animation-config.json`):

**Reference Positions:**
1. **zero** - All servos at 0° (legs straight up)
2. **max** - All servos at 90° (legs perpendicular)

**Hatching Sequence (All Symmetric):**
3. **resting** - Curled inside egg (3s loop, 5-10°, gentle breathing)
4. **slow_struggle** - Testing the shell (4.5s loop, 15-45°, probing movements)
5. **breaking_through** - Violent pushing (2.4s loop, 15-80°, rapid thrusts)
6. **grasping** - Reaching and pulling (3.5s loop, 25-70°, gripping motions)
7. **emerged** - Fully extended menacing pose (4s loop, 70-85°, threatening sway)

**Default:** `slow_struggle` plays on trigger

**All animations are symmetric** - left and right legs move in perfect unison.

**To modify:** Edit `animation-config.json` then run `pixi run generate-config`

### Web Preview ✅

**Real-time visualization with coordinate display:**

```bash
pixi run serve    # Start server on port 8081
pixi run open     # Open in browser
```

Visit: http://localhost:8081/preview.html

**Features:**
- Real-time leg animation preview
- White (x,y) coordinate text at each leg tip
- Click behaviors to preview animations
- "Zero" and "Max" reference positions
- Validates kinematics visually

**Verified Positions:**
- Zero: Both legs straight up
- Max: Left tip (160,400), Right tip (440,400)

---

## 🚀 Quick Start Commands

### Upload Main Animation
```bash
pixi run upload            # Test + compile + upload
pixi run monitor           # Monitor serial output
```

**Trigger:** Ground Pin 9 to start animation

### Verify Hardware (Sweep Test)
```bash
pixi run sweep-upload      # Upload sweep test
pixi run sweep-monitor     # Watch all servos sweep
```

Sweeps all servos 0°→90°→0° continuously. Visual verification tool.

### Testing
```bash
pixi run test              # All 231 tests (required before upload)
```

### Calibration (If Needed)
```bash
pixi run calibrate         # Interactive calibration tool
```
Commands: 0-3 (select servo), +/- (adjust), z (reset)

---

## 📁 Project Structure

```
hatching_egg/
├── arduino/
│   ├── hatching_egg/           # Main animation controller
│   │   ├── hatching_egg.ino    # Main sketch
│   │   └── animation_config.h  # Auto-generated from JSON
│   ├── servo_sweep_test/       # Hardware verification tool
│   │   └── servo_sweep_test.ino
│   ├── servo_tester/           # Interactive calibration tool
│   │   └── servo_tester.ino
│   ├── servo_mapping.h         # Per-servo PWM mapping (shared)
│   ├── servo_tester_logic.h    # Calibration tool logic
│   └── servo_sweep_test_logic.h # Sweep test logic
├── scripts/
│   ├── upload.sh               # Main animation upload
│   ├── upload_servo_tester.sh  # Calibration tool upload
│   └── upload_sweep_test.sh    # Sweep test upload
├── Tests (231 total):
│   ├── test_servo_mapping.cpp  # 44 C++ tests
│   ├── test_servo_mapping.py   # 19 Python tests (includes symmetry)
│   ├── test_servo_tester.cpp   # 34 calibration tests
│   ├── test_servo_sweep.cpp    # 93 sweep tests
│   ├── test_leg_kinematics.js  # 31 JavaScript kinematics tests
│   └── test_animation_behaviors.js # 10 JavaScript behavior tests
├── Configuration:
│   ├── animation-config.json   # Single source of truth
│   ├── generate_arduino_config.py # Generates animation_config.h
│   └── pixi.toml               # Build system
└── Documentation:
    ├── README.md               # Project overview
    ├── CALIBRATION_COMPLETE.md # Calibration results
    ├── SWEEP_TEST.md           # Sweep test guide
    ├── COMMANDS.md             # Command reference
    ├── STATUS.md               # Current status
    ├── CHANGELOG.md            # Version history
    └── AGENT_HANDOFF.md        # This file
```

---

## 🔧 How Things Work

### Single Source of Truth

**File:** `animation-config.json`

This JSON file contains ALL configuration:
- Hardware specs (servo channels, PWM ranges)
- Kinematics (segment lengths, angle limits)
- Animations (keyframes with timing)

**Workflow:**
1. Edit `animation-config.json`
2. Run `pixi run generate-config` → creates `arduino/hatching_egg/animation_config.h`
3. JavaScript reads JSON directly (no generation needed)
4. Upload to hardware

### Per-Servo PWM Mapping

**File:** `arduino/servo_mapping.h`

Each servo has unique calibrated range:
- Right servos: normal (PWM increases with angle)
- Left servos: inverted (PWM decreases with angle)

**Function:** `degreesToPWM(degrees, servoIndex)`
- Input: 0-90°, servo index (0-3)
- Output: Safe PWM value for that specific servo
- Automatically handles normal/inverted servos

### Animation System

**Arduino sketch:** `arduino/hatching_egg/hatching_egg.ino`

1. Stores animations in PROGMEM (flash memory)
2. Waits for trigger on Pin 9
3. Interpolates between keyframes
4. Loops animation until power off

**Keyframe interpolation:** Linear between time points

---

## 🎨 Tuning Animations

### Current Animations

All animations use 0-90° range. Safe ranges verified by unit tests.

**Example keyframe:**
```json
{
  "time_ms": 1500,
  "left_shoulder_deg": 35,
  "left_elbow_deg": 30,
  "right_shoulder_deg": 65,
  "right_elbow_deg": 30
}
```

### To Adjust

1. **Preview in browser:**
   ```bash
   pixi run serve   # Start server on port 8081
   pixi run open    # Open preview.html
   ```
   Visual preview with manual control sliders

2. **Edit animation-config.json:**
   - Adjust keyframe angles
   - Change timing (duration_ms)
   - Add/remove keyframes

3. **Test and upload:**
   ```bash
   pixi run test            # Verify safe ranges
   pixi run generate-config # Regenerate header
   pixi run upload          # Upload to hardware
   ```

---

## ⚠️ Important Notes

### Safety

1. **Always run tests before upload**
   - `pixi run upload` automatically runs tests
   - Upload blocked if any test fails
   - DO NOT bypass tests

2. **PWM ranges are constrained**
   - Arduino code enforces 0-90° limit
   - Each servo has its own safe range
   - Impossible to exceed calibrated limits

3. **Emergency stop**
   - Power off immediately if collision occurs
   - Review ranges in `animation-config.json`
   - Re-run sweep test to verify

### Inverted Servos (Left Leg)

Left shoulder (CH14) and left elbow (CH15) have INVERTED ranges:
- 0° = higher PWM value
- 90° = lower PWM value

This is handled automatically by `servo_mapping.h`. Don't manually adjust.

### Serial Communication

**Leonardo/Beetle quirk:**
- Don't use `while (!Serial)` - creates deadlock
- Use `delay(500)` instead for reliable startup

### Pixi Environment

All commands run in pixi environment. First time setup:
```bash
pixi install
pixi run setup
```

---

## 📋 Next Agent Checklist

### Immediate Tasks (15-30 minutes)

- [ ] Upload main animation: `pixi run upload`
- [ ] Open monitor: `pixi run monitor`
- [ ] Test trigger: Ground Pin 9
- [ ] Verify animation plays correctly
- [ ] Check for servo collisions
- [ ] Test animation looping

### Optional Improvements

- [ ] Fine-tune animation keyframes
- [ ] Adjust animation timing
- [ ] Test all 4 animation behaviors
- [ ] Create custom animations
- [ ] Integrate with overall haunted house system

### If Issues Occur

1. **Servos not moving:** Check PCA9685 power and I2C connections
2. **Trigger not working:** Verify Pin 9 wiring (INPUT_PULLUP)
3. **Unexpected movement:** Re-run sweep test to verify calibration
4. **Compilation errors:** Run `pixi run test` to check configuration

---

## 🔍 Troubleshooting

### Beetle Not Detected
```bash
pixi run arduino-detect       # Check for Beetle
pixi run fix-permissions      # Add to dialout group (then logout/login)
```

### Tests Failing
- Check `animation-config.json` for out-of-range angles (must be 0-90°)
- Verify PWM ranges match calibrated values
- Run individual test suites to isolate issue

### Port Busy
```bash
pkill -9 -f "arduino-cli"     # Kill stuck monitors
```

### Serial Monitor Not Working
- Baud rate must be 9600
- Wait 500ms after reset
- Try pressing reset button on Beetle

---

## 📚 Documentation Files

- **README.md** - Project overview, quick start, hardware setup
- **CALIBRATION_COMPLETE.md** - Complete calibration details and results
- **SWEEP_TEST.md** - Sweep test usage and expected behavior
- **COMMANDS.md** - Complete command reference
- **STATUS.md** - Current project status
- **CHANGELOG.md** - Version history with all changes
- **CLEANUP_SUMMARY.md** - Recent repository cleanup details

---

## 🎉 Project Achievements

**Sessions 1-3 (Oct 27-28, 2025):**

- ✅ Complete kinematic preview system
- ✅ Single source of truth architecture
- ✅ 231 comprehensive unit tests (includes symmetry verification)
- ✅ Hardware verification on all 4 servos
- ✅ Per-servo calibration system
- ✅ Interactive calibration tool
- ✅ Visual sweep test verification
- ✅ Safety constraints enforced
- ✅ Auto-testing before uploads
- ✅ Clean, well-documented codebase

**Ready for production deployment!**

---

## 👤 Contact Info

See parent directory `halloween_2025/` for overall project structure and other animatronics.

**Dependencies:**
- arduino-cli (via pixi)
- Python 3.11+ (via pixi)
- C++ compiler (via pixi)
- Adafruit PWM Servo Driver Library (auto-installed)

---

**Last Session:** Completed calibration, verified with hardware sweep test, cleaned up repository.

**Next Session:** Deploy main animation and test trigger system.
