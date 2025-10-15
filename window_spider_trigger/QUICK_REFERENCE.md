# Quick Reference Card

## Essential Commands

### First Time Setup
```bash
pixi install              # Install all dependencies
pixi run setup           # Setup Arduino toolchain
```

### Hardware Testing (Beetle)
```bash
pixi run beetle-test           # Automated 5-step test
pixi run beetle-monitor-test   # Interactive switch test
```

### Development Workflow
```bash
pixi run arduino-flash   # Compile + upload to Beetle
pixi run start          # Start web server
pixi run deploy         # Flash + start (combined)
```

### Testing
```bash
pixi run integration-test  # Full system test (videos, server, web)
pixi run beetle-test       # Hardware test
pixi run beetle-monitor-test # Interactive switch test
```

### Debugging
```bash
pixi run status         # System status
pixi run arduino-detect # Find connected boards
pixi run arduino-monitor # Serial monitor
pixi run check-videos   # List video files
```

### Troubleshooting
```bash
pixi run fix-videos         # Fix missing idle_loop.mp4
pixi run check-permissions  # Check serial access
pixi run fix-permissions    # Add to dialout group
```

## Hardware Specs

| Component | Details |
|-----------|---------|
| **Board** | DFRobot Beetle (DFR0282) |
| **FQBN** | arduino:avr:leonardo |
| **Port** | /dev/ttyACM0 (auto-detected) |
| **Switch Pin** | Pin 9 |
| **LED Pin** | Pin 13 (visual feedback) |
| **Switch Type** | Normally Open (NO) momentary switch |

## Wiring

```
Beetle Pin 9  → Switch Terminal 1
Beetle GND    → Switch Terminal 2
```

No external resistor needed (uses INPUT_PULLUP).

## Expected Serial Messages

### On Startup
```
STARTUP
Switch trigger ready
Press switch to trigger scare
READY
```

### When Switch Pressed
```
Switch pressed at: X seconds
TRIGGER
```
LED turns ON

### When Switch Released
```
SWITCH_RELEASED
```
LED turns OFF

### During Cooldown
```
COOLDOWN
Wait X more seconds
```

## Web Interface

**URL:** http://localhost:3000

**Keyboard Shortcuts:**
- `F` - Toggle fullscreen
- `S` - Toggle status overlay
- `T` - Manual test trigger
- `ESC` - Exit fullscreen

## Video Files Required

Place in `public/videos/`:
- `spider_jumpscare.mp4` (required) - currently symlinked to spider_jump1.mp4
- `idle_loop.mp4` (optional) - background loop

## Common Issues

### Issue: Arduino not found
**Fix:** `pixi run check-permissions` then `pixi run fix-permissions`

### Issue: Status command fails
**Fix:** Already fixed! Update pixi.toml if using old version

### Issue: Switch seems reversed
**Fix:** Swap switch terminals or see BEETLE_TEST.md troubleshooting

### Issue: Compilation fails
**Fix:** Verify Pin 9 in code: `grep SWITCH_PIN arduino/motion_trigger/motion_trigger.ino`

## Documentation Map

| File | Purpose |
|------|---------|
| **README.md** | Main documentation |
| **QUICK_START.md** | Fast reference |
| **BEETLE_PINOUT.md** | Beetle pin reference |
| **BEETLE_TEST.md** | Hardware testing guide |
| **SWITCH_SETUP.md** | Physical switch installation ideas |
| **DEPLOYMENT.md** | Multi-machine deployment |
| **PIXI_GUIDE.md** | Complete Pixi workflow |
| **FIXES_SUMMARY.md** | Recent fixes and HITL testing |
| **This file** | Quick reference card |

## Test Checklist

### Automated Tests (5 steps)
- [ ] Board detection
- [ ] Pin configuration
- [ ] Compilation
- [ ] Upload
- [ ] Startup

**Run:** `pixi run beetle-test`

### Manual Tests
- [ ] Switch press triggers "TRIGGER"
- [ ] Switch release triggers "SWITCH_RELEASED"
- [ ] LED responds to switch
- [ ] 3-second cooldown works
- [ ] Web server connects to Arduino
- [ ] Video plays on trigger

**Run:** `pixi run beetle-monitor-test` then `pixi run deploy`

## Project Context

This is **Chamber 2: Spider Web Tunnel** trigger system for the Halloween 2025 Spider Haunted House project.

**Full project:** See `/PROJECT_PLAN.md` in parent directory

**Total chambers:** 6 (Candy Room → Spider Tunnel → Trash Room → Victim Room → Hatchery → Spider's Lair)

---

**Last Updated:** 2025-10-14
**Status:** ✅ All automated tests passing, ready for switch installation
