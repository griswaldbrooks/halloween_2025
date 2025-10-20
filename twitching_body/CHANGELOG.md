# Changelog

## 2025-10-19 - VIOLENT Thrashing Quick Jerks (Final Polish!)

### Changed
- **Quick jerks now MUCH more violent and visible** (after final testing)
  - Duration: 150-400ms → **600-1000ms** (much longer so violence is visible!)
  - Speed: 5°/step at 3ms → **15°/step at 0ms** (MAXIMUM SPEED!)
  - **THRASHING:** Targets now change every 100ms during the jerk
  - Creates violent back-and-forth movement instead of single motion

### How Thrashing Works
During quick jerk state (600-1000ms):
- Every 100ms, pick NEW random positions for all servos
- Servos snap to new targets at maximum speed (15° steps, no delay)
- Creates 6-10 rapid position changes during one jerk
- Effect: Violent frustrated/panicked struggling - highly visible!

### Result
Quick jerks are now dramatic, violent, and impossible to miss. Creates intense "trying to escape" effect with rapid thrashing back and forth.

**Behavior Summary:**
- **Slow (8-18s):** Smooth pulling up/dropping down - working perfectly ✓
- **Still (2-5s):** Brief pauses - perfect ✓
- **Quick (0.6-1s):** VIOLENT THRASHING - now dramatic and visible! ✓
- **Head:** Perfect throughout ✓

---

## 2025-10-19 - Dramatic Arm Movements (No Small Motions!)

### Changed
- **Arms now ALWAYS use extreme positions** (final tuning based on dressed rehearsal)
  - Slow movements: Arms go to extremes (0-30° or 150-180°) - NO small movements!
  - Random function was picking small values - FIXED
  - Arms no longer change target mid-movement - complete full sweep
  - Creates "pulling up" then "dropping down" effect

- **Quick jerks now completely chaotic**
  - Arms pick random positions (0-180°), not necessarily opposite
  - Creates frustrated/escaping/panicked effect
  - More unpredictable and startling

- **Head unchanged** (working perfectly with full range variations)

### Problem Solved
Previously, `random(-90, 91)` could give small values like ±5°, creating tiny movements that were invisible when animatronic was dressed. Now arms ALWAYS go to extreme positions for maximum visibility and dramatic effect.

### Behavior
- **Slow:** Arms sweep between extreme positions (pulling up/dropping down)
- **Quick:** Arms snap to random chaotic positions (frustrated struggling)
- **Head:** Full range with variations (unchanged - perfect!)

---

## 2025-10-19 - Full Range Slow Movements (Final Tuning)

### Changed
- **Slow movements now use FULL servo range** (after second round of testing)
  - Slow movement range: ±70° → **±90°** (complete 0-180° sweep)
  - Slow and quick movements now have identical range
  - **Difference is purely speed:** slow is smooth/gradual, quick is fast/snappy

### Rationale
After testing with the dressed animatronic, the ±70° slow movements weren't going through enough range to properly react with the physical system. Full range (0-180°) creates maximum visual impact and proper mechanical response.

### Result
Slow movements now sweep through the complete servo range, making them highly visible and dramatic. Combined with the long duration (8-18s), this creates sustained, unsettling motion.

---

## 2025-10-19 - Extreme Movement Tuning (After Dress Rehearsal)

### Changed
- **Made slow movement the dominant behavior** (after real-world testing with dressed animatronic)
  - Slow movement now 50-70% of time (was 10-20%)
  - Still time reduced to 20-40% (was 70-85%)
  - Slow movements last **8-18 seconds** (was 2-4 seconds)
  - Slow movement range increased to ±70° (was ±55°)

- **Enhanced movement extremity and visibility**
  - Slow movements are now BIG and very noticeable
  - Quick jerks are faster and snappier (5°/step at 3ms, was 3°/step at 5ms)
  - Slow movements smoother (1°/step at 40ms, was 1°/step at 30ms)

- **New cycle timings** (slow movement is now the default state)
  - Cycle 1: 3s still, 12s slow, 0.25s jerk
  - Cycle 2: 2s still, 15s slow, 0.3s jerk
  - Cycle 3: 4s still, 10s slow, 0.2s jerk
  - Cycle 4: 2.5s still, 18s slow, 0.35s jerk (most dramatic)
  - Cycle 5: 5s still, 8s slow, 0.4s jerk

### Rationale
Based on testing with the fully dressed animatronic:
- Slow movements were too subtle and short - needed to be the main behavior
- Still periods were too long - body looked dead instead of struggling
- Quick jerks needed to be snappier for maximum scare impact
- Longer slow movements create sustained creepy effect

### Result
Animatronic now looks actively struggling and suffering rather than mostly dead with occasional twitches. Much more effective for haunted house atmosphere.

---

## 2025-10-19 - Raspberry Pi Audio Loop System

### Added
- **Raspberry Pi audio loop setup** (`raspberry_pi_audio/`)
  - Auto-play MP3 on boot with no user interaction
  - Systemd service for reliable continuous playback
  - Automated setup script (`setup.sh`)
  - Helper scripts for testing, volume control, and playlists
  - Comprehensive documentation with troubleshooting
  - Service file template with proper configuration
  - Works alongside twitching body for complete victim room effect

### Features
- Infinite loop playback using mpg123
- Starts automatically 10-30 seconds after boot
- Systemd restart on failure for reliability
- Volume control and audio output configuration
- Support for single file or playlist mode
- No login or user interaction required

### Files
- `raspberry_pi_audio/README.md` - Complete setup guide
- `raspberry_pi_audio/setup.sh` - Automated installation script
- `raspberry_pi_audio/audio-loop.service` - Systemd service template
- `raspberry_pi_audio/scripts/test-audio.sh` - Audio playback testing
- `raspberry_pi_audio/scripts/set-volume.sh` - Volume control
- `raspberry_pi_audio/scripts/create-playlist.sh` - Playlist generator
- `raspberry_pi_audio/audio/` - Audio files directory

---

## 2025-10-19 - Dramatic Movement Ranges (Hardware Tuning)

### Changed
- **Increased movement ranges for dramatic effect** (after hardware testing)
  - Slow movement: ±15° → **±55°** (3.67x increase)
  - Quick jerk: ±35° → **±90°** (2.57x increase, max safe range)
  - Slow movements now as large as previous quick jerks plus 20°
  - Quick jerks now utilize full servo range for maximum scare impact
  - Arms still move in opposite directions for dramatic effect

### Technical Notes
- ±90° is maximum safe range (0-180° servo limits with 90° rest position)
- `constrain()` function prevents servo damage if limits exceeded
- Tested and verified with actual HS-755MG servos

---

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
