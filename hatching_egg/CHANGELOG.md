# Changelog - Hatching Egg Spider

## 2025-10-28 (Session 5) - Symmetric Animations & Test Suite Expansion

### Added

**Symmetric Animations - All Redesigned:**
- Updated all 5 animations to be perfectly symmetric (left == right)
- **resting**: Curled inside egg (5-10°, gentle breathing motion)
- **slow_struggle**: Testing the shell (15-45°, synchronized probing)
- **breaking_through**: Violent pushing (15-80°, rapid symmetric thrusts)
- **grasping**: Reaching and pulling (25-70°, synchronized gripping)
- **emerged**: Fully extended menacing pose (70-85°, threatening sway) - NEW!

**Animation Behaviors Tests (10 new JavaScript tests):**
- `test_animation_behaviors.js` - Verifies JSON loading and symmetry
- Tests that animations load from `animation-config.json` correctly
- Validates all required animations exist
- Confirms animations are symmetric (left == right at all keyframes)
- Ensures animations have movement between keyframes
- Tests keyframe interpolation logic
- Validates degree-to-radian conversion
- Verifies keyframes are in chronological order
- Checks angles are in valid 0-90° range

**Python Test Enhancements (6 new tests):**
- Added `test_resting_animation_has_movement()` - Verifies movement exists
- Added `test_animations_are_symmetric()` - Checks all 5 animations
- Added `test_slow_struggle_has_movement()` - Verifies varying keyframes
- Added `test_breaking_through_has_movement()` - Checks 20°+ range
- Added `test_grasping_has_movement()` - Verifies elbow movement
- Added `test_emerged_exists_and_has_keyframes()` - Validates new animation

### Fixed

**Web Preview - Dynamic JSON Loading:**
- Fixed `animation-behaviors.js` to load from `animation-config.json` instead of hardcoded animations
- Preview now updates when JSON changes (no code edit required)
- Added async loading with proper initialization
- Fixed button names to match JSON animation keys
- Preview now shows symmetric animations correctly

**Test Framework:**
- Increased total test count from 215 to 231
- Python tests now 19 (was 13) with symmetry verification
- All tests verify animations are symmetric and have movement

### Changed

- Web preview animations now load dynamically from JSON
- Removed 3 old hardcoded preview animations (spasming, crawling, probing, reaching)
- Updated all documentation to reflect 231 tests and symmetric animations
- Updated pixi.toml test descriptions

### Documentation

- Updated README.md with 7 symmetric animations and 231 test count
- Updated STATUS.md with animation symmetry status
- Updated COMMANDS.md (test count references)
- Added CHANGELOG entry

---

## 2025-10-28 (Session 4b) - Kinematics & PWM Mapping Verification

### Added

**JavaScript Kinematics Tests (31 new tests):**
- `test_leg_kinematics.js` - Comprehensive kinematics verification
  - Forward kinematics: Zero position (legs straight up)
  - Forward kinematics: Max position (legs perpendicular)
  - Servo degree conversion (0-90° range)
  - **Angle-to-PWM mapping for all 4 servos**
- Tests load from `animation-config.json` and verify PWM values:
  - Right Elbow: 0°→150 PWM, 90°→330 PWM
  - Right Shoulder: 0°→150 PWM, 90°→280 PWM
  - Left Shoulder: 0°→440 PWM, 90°→300 PWM (inverted)
  - Left Elbow: 0°→530 PWM, 90°→360 PWM (inverted)

**Reference Animations:**
- `zero` - All servos at 0° (legs straight up)
- `max` - All servos at 90° (legs perpendicular, elbows bent down)
- Added to `animation-config.json` for testing

**Web Preview Enhancements:**
- Added white (x,y) coordinate text at each leg tip
- Shows real-time end effector positions
- Validates kinematics visually
- Verified positions: Zero (both up), Max (160,400 and 440,400)

**Documentation:**
- `MAPPING_VERIFICATION.md` - Complete angle-to-PWM mapping verification
- Documents all 4 servos, test coverage, reference positions

### Changed

**JavaScript Kinematics (`leg-kinematics.js`):**
- Updated servo range from -90/+90° to 0-90° to match hardware
- Fixed servo degree conversion to output 0-90° range
- Added proper left leg mirroring for elbow angles
- Added Node.js module export for testing
- Both legs now mirror symmetrically

**Test Framework:**
- Increased from 184 to 215 total tests
- Added kinematics test suite to `pixi run test`
- All tests passing

**Build System:**
- Added `test-kinematics` command to pixi.toml
- Updated test descriptions with correct counts

### Testing Results

```
✅ C++ Servo Mapping:    44/44 passed
✅ Python Config:        13/13 passed
✅ Servo Tester:         34/34 passed
✅ Servo Sweep:          93/93 passed
✅ Kinematics & PWM:     31/31 passed (NEW)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Total: 215/215 tests passed
```

### Benefits

1. **PWM Mapping Verified** - All angle-to-PWM conversions match hardware calibration
2. **End Effector Validation** - Forward kinematics produces correct positions
3. **Visual Verification** - Web preview shows real-time coordinates
4. **Comprehensive Coverage** - JavaScript tests complement C++ tests
5. **Reference Positions** - Zero and Max animations for testing

---

## 2025-10-28 (Session 4a) - Google Test Framework Conversion

### Changed

**Test Framework Migration**
- Converted all C++ tests from manual assertions to Google Test (gtest)
- Updated compilation flags from C++11 to C++17 (required by gtest)
- Reorganized tests for better clarity and maintainability
- Added parameterized testing for comprehensive coverage

**Test Files Converted:**
- `test_servo_mapping.cpp` - Now uses gtest TEST() macros and EXPECT_* assertions
- `test_servo_tester.cpp` - Converted to gtest with organized test suites
- `test_servo_sweep.cpp` - Uses gtest with parameterized tests for servo/angle combinations

**Build System:**
- Added `gtest` dependency to pixi.toml
- Updated all test compilation commands to link with -lgtest -pthread
- All tests compile with -std=c++17

**Test Count:**
- Reduced from 275 to 184 tests due to more efficient organization
- 44 servo mapping tests (was 44)
- 13 Python tests (unchanged)
- 34 servo tester tests (was 37)
- 93 servo sweep tests (was 181 - now using parameterized tests)

### Benefits

1. **Better test organization** - Tests grouped into logical suites
2. **Clearer output** - Google Test provides detailed failure messages
3. **Parameterized testing** - Efficient coverage of all servo/angle combinations
4. **Industry standard** - Using widely-adopted test framework
5. **Better error messages** - EXPECT_EQ provides clear "expected vs actual" output

### Testing Results

```
✅ C++ Servo Mapping: 44/44 passed
✅ Python Config: 13/13 passed
✅ Servo Tester: 34/34 passed
✅ Servo Sweep: 93/93 passed
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Total: 184/184 tests passed
```

---

## 2025-10-28 (Session 3) - Calibration Complete & Sweep Test

### Added

**Servo Sweep Test**
- `arduino/servo_sweep_test/` - Visual verification tool for all servos
- Sweeps all 4 servos through full calibrated range (0-90°)
- 181 unit tests for sweep logic
- Real-time serial output showing angles and PWM values
- Continuous loop with cycle counter
- `pixi run sweep-upload` and `pixi run sweep-monitor` commands

**Per-Servo Calibration System**
- Replaced uniform 150-600 range with per-servo calibrated ranges
- Right servos: normal operation (PWM increases with angle)
- Left servos: inverted operation (PWM decreases with angle)
- Updated servo_mapping.h to support per-servo ranges
- All 4 servos hardware-calibrated to prevent collisions

**Updated Test Suite**
- Total tests increased from 43 to 275
- Servo mapping tests: 35 → 44 tests
- Python config tests: 8 → 13 tests
- New servo sweep tests: 181 tests
- Renamed v2 test files to main versions (removed v1)

### Changed

**Calibrated PWM Ranges** (Hardware Verified)
- Right Elbow (CH0): 150 (0°) → 330 (90°)
- Right Shoulder (CH1): 150 (0°) → 280 (90°)
- Left Shoulder (CH14): 440 (0°) → 300 (90°) - inverted
- Left Elbow (CH15): 530 (0°) → 360 (90°) - inverted

**Angle Range**
- Changed from 0-180° to 0-90°
- All animations updated to use 0-90° range
- Arduino sketch updated to map 0-90° to PWM

**Animation Keyframes**
- Resting: all servos at 0°
- Slow struggle: angles 0-65°
- Breaking through: angles 0-80°
- Grasping: angles 0-80°

### Fixed

**Code Organization**
- Removed old v1 test files
- Removed servo_mapping_old.h backup
- Renamed v2 files to main versions
- Consolidated duplicate headers in subdirectories
- Cleaned up compiled test binaries

**Documentation**
- Updated all markdown files with calibration results
- Fixed test count references (43 → 275)
- Updated status to "Calibration Complete"
- Added CALIBRATION_COMPLETE.md
- Added SWEEP_TEST.md

### Testing Results

```
✅ C++ Servo Mapping: 44/44 passed
✅ Python Config: 13/13 passed
✅ Servo Tester: 37/37 passed
✅ Servo Sweep: 181/181 passed
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Total: 275/275 tests passed

Hardware verified: Sweep test running successfully on actual hardware
```

---

## 2025-10-27 (Session 2) - Unit Test Framework & Hardware Verification

### Added

**Unit Test Framework** ✨ CRITICAL SAFETY IMPROVEMENT
- Created 43 automated tests to prevent servo damage
- `test_servo_mapping.cpp` - 35 C++ unit tests (run locally with g++)
- `test_servo_mapping.py` - 8 Python config tests
- `arduino/servo_mapping.h` - Tested core servo logic (shared by all sketches)
- Tests verify safe PWM values before any hardware upload
- `pixi run test` - Runs all 43 tests
- `pixi run upload` - Now automatically runs tests first, blocks if any fail

**Servo Testing Tools**
- `arduino/servo_zero/` - Sets all servos to 0° for mechanical adjustment
- `arduino/servo_tester/` - Interactive control (+/-, >/< commands, 9600 baud)
- `arduino/servo_diagnostic/` - I2C scanning and raw PWM testing
- `arduino/test_servo_logic/` - On-device unit tests (mock PWM driver)

**Documentation**
- Updated README.md with testing workflow and safety features
- Updated STATUS.md with current progress (~85% complete)
- Updated AGENT_HANDOFF.md with technical details
- This CHANGELOG with version history

### Changed

**Hardware Configuration - VERIFIED**
- Correct servo channel assignments:
  - Channel 0: Right Elbow (HS-322HD)
  - Channel 1: Right Shoulder (DS-3225MG)
  - Channel 14: Left Shoulder (DS-3225MG)
  - Channel 15: Left Elbow (HS-322HD)
- Safe PWM range discovered: 150-600
  - PWM 150 = 0° (hardware-verified zero position)
  - PWM 600 = 180° (hardware-verified max position)
- All servos now use consistent 0-180° angle range

**Angle Range Fix**
- Shoulders changed from -90°/+90° to 0°/180°
- All animation keyframes updated to use 0-180° range
- Resting position set to 0° on all servos
- Simplified angle calculations throughout

**Code Refactoring**
- Extracted servo logic to testable `arduino/servo_mapping.h`
- All sketches now use shared, tested mapping functions
- Eliminates code duplication
- Ensures consistent PWM calculations

### Fixed

**Critical PWM Calculation Bug** 🐛 SERVO SAFETY
- **Problem**: Was using microsecond values instead of PWM values
  - Old: `map(0, 0, 180, 544, 2400)` → PWM 544 → 2655µs (UNSAFE!)
  - New: `map(0, 0, 180, 150, 600)` → PWM 150 → 732µs (SAFE!)
- **Root Cause**: Confusion between PCA9685 PWM values (0-4095) and microseconds
- **Solution**: Unit tests verify correct PWM generation before any upload
- **Impact**: Prevents servo damage from incorrect pulse widths

**Servo Channel Assignment**
- Left leg corrected to channels 14-15 (was incorrectly 0-1)
- Right leg uses channels 0-1 (was incorrectly 2-3)
- Verified with actual hardware testing

**Serial Monitor Baud Rate**
- servo_tester changed to 9600 baud (matches monitor default)
- Improves reliability of serial communication

### Testing Results

```
✅ C++ Unit Tests: 35/35 passed
  - Safe PWM generation for 0°, 90°, 180°
  - Negative angle constraint
  - Excessive angle constraint
  - All animation keyframes safe
  - Linear interpolation verified
  - Channel assignments verified

✅ Python Config Tests: 8/8 passed
  - Config structure validated
  - Angle ranges verified
  - Channel wiring verified
  - PWM values verified

✅ Total: 43/43 tests passed
```

### Development Improvements

**Safety Features Added**
1. Local C++ tests (no Arduino needed)
2. Automatic test execution before upload
3. Upload blocked if any test fails
4. Tested core logic shared across all sketches
5. Safe zero position (0° = PWM 150) verified with hardware

**Workflow Enhancements**
- `pixi run test` - Quick safety check
- `pixi run test-cpp` - C++ tests only
- `pixi run test-python` - Python tests only
- Tests run automatically on `pixi run upload`

**Pixi Environment**
- Added `cxx-compiler` dependency for local C++ testing
- arduino-cli installation via pixi
- Adafruit PWM Servo Driver library auto-install

---

## 2025-10-27 (Session 1) - Initial Implementation

### Added Kinematic Preview System
**Complete web-based preview with single source of truth architecture.**

**Files Created:**
- `animation-config.json` - Single source of truth for all parameters
- `generate_arduino_config.py` - Auto-generates Arduino header from JSON
- `leg-kinematics.js` - 2-segment spider leg with IK/FK
- `animation-behaviors.js` - 8 pre-programmed animation behaviors
- `preview.html` - Web UI with controls
- `preview-app.js` - Animation loop and manual control
- `arduino/hatching_egg/hatching_egg.ino` - Complete Arduino sketch
- `arduino/hatching_egg/animation_config.h` - Auto-generated (from JSON)
- `scripts/upload.sh` - Auto-detect Beetle and upload
- `pixi.toml` - Reproducible environment
- `README.md` - User documentation with ASCII art
- `AGENT_HANDOFF.md` - Technical documentation for next agent

**Features Implemented:**

1. **Kinematic Model**
   - 2-segment legs (shoulder + elbow servos)
   - Forward kinematics (angles → positions)
   - Servo angle limits (initially -90° to 90° shoulder, 0° to 180° elbow)
   - Real-time joint position calculation

2. **Web Preview**
   - Visual representation with egg shell and legs
   - 8 animation behaviors
   - Adjustable leg lengths
   - Animation speed control
   - Real-time servo angle display (0-180°)

3. **Manual Control Mode**
   - Switch between Animation Playback and Manual Control
   - 4 sliders for direct servo control
   - Real-time visual feedback
   - "Copy Angles to Console" button
   - Exports JSON for easy pasting into config

4. **Single Source of Truth**
   - All parameters in `animation-config.json`
   - JavaScript reads JSON directly
   - Python generates Arduino header automatically
   - No manual syncing needed
   - Edit once, both preview and hardware update

5. **Arduino Code**
   - DFRobot Beetle + PCA9685 support
   - Trigger switch on pin 9
   - Keyframe interpolation
   - PROGMEM storage for animations
   - Serial debugging output
   - Auto-generated config from JSON

6. **Pixi Environment**
   - Reproducible build system
   - Tasks: serve, open, generate-config, upload, monitor
   - Python + system arduino-cli
   - Auto-installs dependencies

**Configuration Structure:**
```json
{
  "hardware": { servo channels, pulse widths, trigger pin },
  "kinematics": { segment lengths, angle limits },
  "animations": {
    "behavior_name": {
      keyframes with timing and angles
    }
  }
}
```

---

## Version Summary

- **Session 2 (Current)**: Unit testing, hardware verification, safety improvements
- **Session 1**: Initial implementation, preview system, single source of truth

---

## Next Steps

1. **Servo Calibration** (HIGH PRIORITY)
   - Test servo directions with servo_tester
   - Find min/max safe angles for each servo
   - Document actual usable ranges

2. **Animation Tuning**
   - Update keyframes with realistic angles
   - Test timing and smoothness
   - Create convincing hatching motions

3. **Integration Testing**
   - Test Pin 9 trigger
   - Verify all 4 animation behaviors
   - Test complete hatching sequence

4. **Documentation**
   - Document final servo limits
   - Add photos of working setup
   - Create user guide

---

## Development Stats

- **Files Created**: 25+
- **Tests Written**: 43
- **Code Lines**: ~2000+
- **Documentation**: 4 markdown files (README, AGENT_HANDOFF, STATUS, CHANGELOG)
- **Servo Tools**: 4 diagnostic sketches
- **Sessions**: 2

---

**Project Status:** Hardware verified, unit tests passing, ready for servo calibration and animation tuning (~85% complete)
