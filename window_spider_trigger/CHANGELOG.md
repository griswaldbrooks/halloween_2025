# Changelog

## 2025-10-14 (Late Evening) - Documentation Consolidation

### Changed
- **Consolidated documentation** from 13 files to 4 essential files
  - Removed: SUMMARY, QUICK_START, QUICK_REFERENCE, PIXI_GUIDE, DEPLOYMENT, FIXES_SUMMARY, INTEGRATION_TEST_SUMMARY, BEETLE_TEST, SWITCH_SETUP
  - Kept: README (comprehensive), TROUBLESHOOTING (testing guide), BEETLE_PINOUT (hardware), CHANGELOG (this file)
  - All essential information preserved and reorganized

### Documentation Structure (New)
**README.md** - Complete setup and usage guide
- Quick start
- Hardware and software overview
- Installation and configuration
- Common commands
- Development workflow

**TROUBLESHOOTING.md** - Testing and problem-solving
- Quick diagnostic sequence
- Common issues and solutions
- Hardware testing procedures
- Integration testing guide
- Manual end-to-end test checklist
- Test checklist for future agents

**BEETLE_PINOUT.md** - Hardware reference (unchanged)
- Pin diagrams and specifications

**CHANGELOG.md** - This file
- Version history and changes

**.claude/claude.md** - Agent instructions (streamlined)
- Testing-first approach
- Documentation protocol
- Common tasks and troubleshooting
- Emergency recovery procedures

### Video Playback Behavior
- **Modified video system** from dual-video to single-video
  - Now uses: Single `spider_jump1.mp4` video
  - Behavior: Paused at start, plays on trigger, resets when done

**Files modified:**
- `public/index.html` - Single video element
- `public/client.js` - Simplified playback logic

**New behavior:**
1. Video loads paused at beginning
2. Beetle trigger → plays video from start
3. Video ends → automatically resets to beginning and pauses
4. Ready for next trigger

### Committed to Git
- ✅ Initial commit: `493ee02`
  - All code, documentation, tests
  - Git LFS configured for `*.mp4` and `*.png`

- ✅ Cleanup commit: `b64def9`
  - Removed 5 extraneous spider web videos
  - Removed duplicate invitation2.png

### Context
This session focused on:
1. Creating robust agent continuity guidelines
2. Implementing single-video playback system
3. Consolidating documentation aggressively
4. Establishing testing-first workflow

---

## 2025-10-14 (Afternoon) - Initial Development

### Features
- DFRobot Beetle (Leonardo) hardware support with Pin 9 switch
- Node.js server with Socket.IO for real-time triggers
- Pixi-based reproducible development environment
- Automated integration testing with video auto-fix
- Hardware-in-the-loop testing for Beetle

### Arduino Code
- Switch trigger on Pin 9 (Normally Open with INPUT_PULLUP)
- 50ms debounce delay
- 3-second cooldown between triggers
- LED feedback on Pin 13
- Serial communication protocol

### Web Interface
- HTML5 video playback
- Socket.IO real-time communication
- Keyboard shortcuts (F, S, T, ESC)
- Status overlay with statistics
- Fullscreen support

### Testing Suite
- `pixi run status` - System overview
- `pixi run integration-test` - Full system test + auto-fix
- `pixi run beetle-test` - Hardware verification
- `pixi run beetle-monitor-test` - Interactive switch test

### Known Issues Fixed
- Loading screen hang when video files missing → Auto-creates symlinks
- Arduino not detected → Permission fix command added
- Pixi shell parsing errors → Wrapped in bash -c
- Pin 2 not available on Beetle → Changed to Pin 9

---

## Version Info

**Current Version:** 1.0.0
**Platform:** Linux (Pixi-managed)
**Node.js:** 20.x (via Pixi)
**Arduino:** Leonardo-compatible (Beetle DFR0282)
**Status:** ✅ Production ready
