# Changelog

## 2025-10-19 - Production Code COMPLETE ✅

### Major Update: Fully Working Production Code

**Status:** Project complete and tested with hardware!

### Added
- **PCA9685 integration in production code**
  - Updated `twitching_servos.ino` to use Adafruit PWM Servo Driver
  - Replaced direct Servo library with I2C PWM control
  - All three servos controlled via PCA9685 channels 0, 1, 2

- **Calibrated pulse width settings**
  - SERVOMIN: 600µs (was 150µs - caused stalling)
  - SERVOMAX: 2400µs (was 600µs - caused stalling)
  - Values calibrated through hardware testing to prevent servo strain

- **Integer overflow fix**
  - Added `(long)` cast in pulse width calculation
  - Prevents overflow: `((long)pulse_us * 4096) / 20000`
  - Fixed negative microsecond display bug

- **Center button feature (Pin 9)**
  - Press/ground Pin 9 anytime during operation to center servos at 90°
  - LED turns ON while button held
  - Resumes normal behavior when released
  - Useful for installing servo horns at neutral position

- **Opposite arm motion**
  - Arms now move in mirror directions for more dramatic effect
  - Left arm up → Right arm down (and vice versa)
  - Creates asymmetric, unsettling movements

- **Larger movement ranges**
  - Slow movements: 8° → 15° (nearly doubled)
  - Quick jerks: 25° → 35° (+10 degrees)
  - Much more visible and dramatic motion

### Fixed
- **Servo stalling and high current draw**
  - Root cause: Incorrect pulse width range (150-600µs)
  - HS-755MG servos need 600-2400µs range
  - Servos were trying to move beyond mechanical limits
  - Drew 2A+ when idle due to stalling
  - Now draws normal ~100-300mA when idle

- **Upload command syntax error**
  - Updated pixi.toml upload commands to use `--input-dir` flag correctly
  - Changed to `cd` into sketch directory for upload
  - Fixed both `arduino-upload` and `test-upload` tasks

### Tested and Verified
- ✅ PCA9685 detected at I2C address 0x40
- ✅ All three servos move smoothly across full range
- ✅ No servo buzzing, twitching, or stalling
- ✅ Normal current draw (<500mA idle, <2A under load)
- ✅ Center button works during any state
- ✅ Opposite arm motion working correctly
- ✅ Interactive servo test commands all functional
- ✅ Production code uploads and runs autonomously

### Documentation
- **Complete rewrite of README.md**
  - Removed all "needs PCA9685 update" warnings
  - Marked project as COMPLETE
  - Added calibrated pulse width settings
  - Documented opposite arm motion behavior
  - Added center button usage instructions

- **Removed obsolete files**
  - Deleted TEST_RESULTS.md (replaced by working system)

## 2025-10-19 - Interactive Servo Test

### Added
- **Enhanced servo test with interactive controls**
  - Position tracking for all servos
  - `p` - Show current positions
  - `<` `>` - Select servo (Head, Left Arm, Right Arm)
  - `+` `-` - Adjust ±10 degrees
  - `.` `,` - Fine adjust ±1 degree
  - More intuitive testing workflow

- **Improved serial output**
  - Verbose pulse width display
  - Channel and angle feedback
  - Clear position reporting

## 2025-10-19 - Pixi Shell Command Fix

### Fixed
- **Fixed `head -1` command parsing error in pixi.toml**
  - Changed `head -1` → `head -n 1` (POSIX standard)
  - Wrapped commands in `bash -c` with proper escaping
  - Fixed: arduino-upload, arduino-monitor, test-upload, test-monitor
  - Fixed: scripts/beetle_test.sh
  - Error was: "accepts at most 1 arg(s), received 2"
  - Now properly auto-detects Beetle port on upload

## 2025-10-19 - Port Auto-Detection Fix

### Fixed
- **Auto-detect Beetle port instead of hardcoded /dev/ttyACM0**
  - Updated pixi.toml: arduino-upload, arduino-monitor, test-upload, test-monitor
  - Updated scripts/beetle_test.sh
  - Now works regardless of which /dev/ttyACM* port the Beetle appears on
  - Fixes upload failures when Beetle is on different port

## 2025-10-19 - Memory Optimization

### Changed
- **Applied F() macro to all Serial string literals**
  - RAM usage reduced from 576 bytes (22%) to 302 bytes (11%)
  - 274 bytes RAM saved (47% reduction)
  - Flash increased slightly: 9,436 → 9,554 bytes (still 67% free)
  - More stable operation with increased RAM headroom

## 2025-10-19 - Initial Development

### Features
- **3-servo animatronic control** (head, left arm, right arm)
- **Autonomous behavior system** - No sensors, always running
- **Three-state behavior pattern**:
  - Still (6-15 seconds)
  - Slow uncomfortable movement (2-4 seconds)
  - Quick jerks (150-400ms)
- **5 predefined cycles** for variety and unpredictability
- **Pixi-based development environment**
- **Standalone operation** - No computer needed after flashing

### Arduino Code
- State machine for behavior transitions
- Smooth movement interpolation
- LED feedback on Pin 13
- Serial debugging output
- Configurable rest positions, ranges, and timing

### Testing Suite
- `pixi run status` - System overview
- `pixi run integration-test` - Full system test
- `pixi run beetle-test` - Hardware verification
- `pixi run servo-test` - Interactive hardware testing
- `pixi run arduino-monitor` - Serial output monitoring

### Documentation
- README.md - Complete setup and usage
- WIRING.md - Complete wiring diagrams
- SERVO_TEST.md - Interactive testing guide
- TROUBLESHOOTING.md - Common issues and solutions
- CHANGELOG.md - This file

### Configuration Files
- pixi.toml - Pixi task definitions
- Arduino sketch with configurable parameters

---

## Version Info

**Current Version:** 1.0.0 - PRODUCTION READY
**Platform:** Linux (Pixi-managed)
**Arduino:** Leonardo-compatible (Beetle DFR0282)
**Status:** ✅ COMPLETE - Tested and Working

---

## Summary

**All major issues resolved:**
- ✅ PCA9685 integration complete
- ✅ Pulse width calibration fixed
- ✅ Servo stalling eliminated
- ✅ Integer overflow fixed
- ✅ Opposite arm motion implemented
- ✅ Center button added
- ✅ Upload commands fixed
- ✅ Hardware tested and verified

**Ready for deployment in haunted house!**
