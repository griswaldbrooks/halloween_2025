# Changelog

## 2025-10-14 (Late Evening) - Agent Continuity & Documentation

### Added
- **Agent continuity guidelines** in `.claude/claude.md`
  - Progressive documentation protocol
  - Pixi-exclusive environment requirements
  - Automated testing guidelines
  - Emergency recovery procedures
  - Best practices for agent handoffs

### Updated
- `FIXES_SUMMARY.md` - Documented current session status
- `CHANGELOG.md` - This entry

### Verified
- ✅ Video symlinks present and correct
- ✅ Integration test script functional
- ✅ All previous fixes still operational
- ✅ System ready for deployment testing

### Tested
- ✅ `pixi run integration-test` - All checks passed (2025-10-14 23:05)
  - Video files present
  - Server startup successful
  - Arduino connection working
  - Web interface accessible
  - Static file serving operational

### Changed (23:15) - Video Playback Behavior
- **Modified video system** from dual-video to single-video
  - Removed: idle loop video concept
  - Now uses: Single `spider_jump1.mp4` video
  - Behavior: Paused at start, plays on trigger, resets when done

**Files modified:**
- `public/index.html` - Single video element instead of two
- `public/client.js` - Simplified playback logic with reset functionality

**New behavior:**
1. Video loads paused at beginning
2. Beetle trigger → plays video from start
3. Video ends → automatically resets to beginning and pauses
4. Ready for next trigger

### Committed to Git (23:20 - 23:25)
- ✅ Initial commit created with git-lfs
- Commit hash: `493ee02`
- 42 files committed with complete project history
- All documentation and code preserved
- Git LFS tracking enabled:
  - `*.mp4` files tracked with LFS (5 videos)
  - `*.png` files tracked with LFS (3 images)
  - `.gitattributes` added for LFS configuration

### Context
This session focused on creating robust documentation to prevent future agent shutdowns from losing context. Previous sessions experienced two unexpected shutdowns, so comprehensive markdown-based status tracking has been implemented.

## 2025-10-14 (Evening) - Part 2: Integration Testing & Loading Screen Fix

### Fixed
- **Loading screen hang** when `idle_loop.mp4` missing
  - Issue: Client.js waits for BOTH videos before hiding loading screen
  - Solution: Integration test auto-creates idle_loop.mp4 symlink
  - Manual fix: `pixi run fix-videos`

### Added
- **Integration Testing** suite
  - New script: `scripts/integration_test.sh` - Full system test
  - Tests: videos, server startup, Arduino connection, web accessibility
  - Auto-fixes missing idle_loop.mp4
  - New task: `pixi run integration-test`
  - New task: `pixi run fix-videos` - Quick video fix
  - Fixed: `pixi run check-videos` - Now uses proper bash syntax

### Documentation
- New: `TROUBLESHOOTING.md` - Comprehensive troubleshooting guide
  - Loading screen issues
  - Arduino detection
  - Switch triggering
  - Compilation/upload problems
  - Diagnostic command reference

### Verified
- ✅ Integration test detects and fixes missing videos
- ✅ Server starts successfully
- ✅ Web interface loads without hanging
- ✅ All static files accessible
- ✅ System ready for deployment

## 2025-10-14 (Evening) - Part 1: Pixi Fixes & Beetle HITL Testing

### Fixed
- **Pixi task syntax error** in `status` command
  - Issue: `2>/dev/null | head -5` not supported by pixi shell parser
  - Solution: Wrapped in proper bash command with parentheses
  - Status command now works correctly

### Added
- **Hardware-in-the-Loop (HITL) Testing** for DFRobot Beetle
  - New test script: `scripts/beetle_test.sh` - Automated 5-step test
  - New test script: `scripts/beetle_monitor_test.sh` - Interactive switch test
  - New pixi task: `beetle-test` - Run automated hardware verification
  - New pixi task: `beetle-monitor-test` - Open serial monitor for manual testing
  - New documentation: `BEETLE_TEST.md` - Complete testing guide

### Verified
- ✅ DFRobot Beetle detected correctly as Arduino Leonardo
- ✅ Pin 9 configuration correct and working
- ✅ Code compiles successfully
- ✅ Upload to Beetle works
- ✅ All automated tests pass

### Documentation
- Updated `README.md` with HITL testing section
- Updated `QUICK_START.md` with new test commands
- Updated `SUMMARY.md` with beetle-test command
- Added comprehensive `BEETLE_TEST.md` guide

## 2025-10-14 (Afternoon) - Switch Trigger Update

### Changed
- **Replaced PIR motion sensor with momentary switch**
  - Changed from motion detection to physical switch trigger
  - Guest picking up object now triggers the scare
  - More reliable and intentional triggering

### Arduino Code Updates
- Updated `arduino/motion_trigger/motion_trigger.ino`:
  - Changed `SENSOR_PIN` to `SWITCH_PIN`
  - Added proper switch debouncing (50ms)
  - Uses `INPUT_PULLUP` for cleaner wiring (no external resistor)
  - Detects switch press (HIGH→LOW transition)
  - Maintains 3-second cooldown between triggers
  - Added helpful serial messages for debugging

### Documentation Updates
- **README.md**: Added ASCII wiring diagram for switch
- **QUICK_START.md**: Updated testing instructions
- **PIXI_GUIDE.md**: Added hardware testing section
- **SUMMARY.md**: Updated hardware description
- **NEW: SWITCH_SETUP.md**: Complete guide for creative switch installations

### Wiring Changes
**Before (PIR Sensor):**
```
PIR VCC → 5V
PIR GND → GND
PIR OUT → Pin 2
```

**After (Momentary Switch):**
```
Switch Terminal 1 → Pin 2
Switch Terminal 2 → GND
(Uses internal pull-up, no external resistor needed)
```

### Benefits
✅ More reliable triggering
✅ Simpler wiring (2 wires instead of 3)
✅ No sensor warm-up time
✅ No false triggers from ambient motion
✅ Better control over trigger timing
✅ Creative installation options (see SWITCH_SETUP.md)

### Video Setup
- Jump scare video: `spider_jump1.mp4` → linked as `spider_jumpscare.mp4`
- Optional idle loop can be added as `idle_loop.mp4`

### Testing
```bash
# Flash updated code
pixi run arduino-flash

# Monitor switch activity
pixi run arduino-monitor

# Press switch - should see "TRIGGER"
# Release switch - should see "SWITCH_RELEASED"
```

---

## Initial Release - 2025-10-14

### Features
- Arduino Leonardo support with auto-detection
- Node.js web server with Socket.IO
- Real-time serial communication
- Dual video system (idle + scare)
- Pixi-based multi-machine deployment
- Fullscreen web interface
- Manual test triggers
- Statistics tracking
- Comprehensive documentation
