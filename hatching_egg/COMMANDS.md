# Hatching Egg - Command Reference

**Last Updated:** 2025-10-29
**Status:** 100% Complete - Production Ready

All commands run from the `hatching_egg/` directory.

---

## ⚡ Quick Start Commands

### Upload Main Animation (PRODUCTION READY!)
```bash
pixi run upload            # Test, compile, and upload main sketch
pixi run monitor           # Monitor serial output
```

**Interactive Serial Commands:**
- `0-6`: Select animation (0=zero, 1=max, 2=resting, 3=slow_struggle, 4=breaking_through, 5=grasping, 6=emerged)
- `l`: List all animations
- `s`: Stop animation
- `r`: Restart animation
- `h`: Help

Ground Pin 9 to trigger default animation (slow_struggle)!

---

## 📋 Available Commands

### Testing
```bash
pixi run test              # Run all 232 tests (C++ + Python + JavaScript)
pixi run test-cpp          # Run 44 C++ servo mapping tests
pixi run test-python       # Run 20 Python config tests (includes buffer overflow check)
pixi run test-servo-tester # Run 34 servo tester tests
pixi run test-servo-sweep  # Run 93 servo sweep tests
pixi run test-kinematics   # Run 31 JavaScript kinematics tests
pixi run test-animation-behaviors # Run 10 JavaScript animation behaviors tests
```

### Servo Calibration
```bash
pixi run calibrate         # Upload calibration tool (all-in-one)
# Then open monitor manually if needed:
pixi run monitor           # Open serial monitor
```

### Servo Sweep Test
```bash
pixi run test-servo-sweep  # Run 93 unit tests for sweep logic
pixi run sweep-upload      # Upload sweep test to Beetle
pixi run sweep-monitor     # Open serial monitor
```

### Arduino Main Sketch
```bash
pixi run arduino-detect    # Find connected Beetle
pixi run generate-config   # Generate animation_config.h from JSON
pixi run upload            # Test + generate + compile + upload
pixi run monitor           # Open serial monitor
```

### Preview
```bash
pixi run serve             # Start HTTP server on port 8081
pixi run open              # Open preview in browser
```

### Setup
```bash
pixi install               # First time: Install pixi environment
pixi run setup             # Install arduino-cli and libraries
pixi run fix-permissions   # Add user to dialout group
```

### Troubleshooting
```bash
pixi run status            # Show environment status
pkill -9 -f "arduino-cli"  # Kill stuck serial monitors
```

---

## 🎯 Calibration Commands (When Monitor is Open)

Once you run `pixi run calibrate` or `pixi run servo-monitor`, use these commands:

```
0-3    Select servo (0=R.Elbow, 1=R.Shoulder, 2=L.Shoulder, 3=L.Elbow)
+      Increase PWM by 10
-      Decrease PWM by 10
.      Increase PWM by 1 (fine control)
,      Decrease PWM by 1 (fine control)
z      EMERGENCY: Return ALL servos to safe zero (PWM 150)
p      Show current positions
h      Help
```

---

## 📝 Deployment Workflow

**Status: Calibration Complete - Ready for Production**

### Quick Deploy
```bash
pixi run upload            # Upload main animation
pixi run monitor           # Monitor serial output
# Test: Type '0-6' to test each animation
# Test: Ground Pin 9 to trigger default animation
```

### Test Animations Interactively
Once uploaded and monitor is open:
- Type `l` to list all 7 animations
- Type `0` for zero position (reference)
- Type `1` for max position (reference)
- Type `2` for resting (curled breathing)
- Type `3` for slow_struggle (default - plays on trigger)
- Type `4` for breaking_through (violent pushing)
- Type `5` for grasping (reaching motions)
- Type `6` for emerged (fully extended menacing)

### First Time Setup (Already Complete)
```bash
pixi install
pixi run setup
pixi run test    # All 232 tests passing
```

---

## ⚠️ Important Notes

- **ALWAYS run tests before upload:** `pixi run test`
- **Tests block unsafe uploads:** If tests fail, upload is prevented
- **Use 'z' liberally:** Reset to safe zero (PWM 150) often during calibration
- **Document limits:** Write down safe PWM values in STATUS.md

---

## 🐛 Common Issues

### "Port busy" error
```bash
pkill -9 -f "arduino-cli"
# Wait a moment, then retry
```

### "Permission denied" error
```bash
pixi run fix-permissions
# Then log out and back in
```

### Tests fail
```bash
# DO NOT upload! Fix the issue first
# Check animation-config.json for out-of-range angles
```

---

## 📚 More Information

- **README.md** - Project overview and quick start
- **CALIBRATION_COMPLETE.md** - Calibration results and hardware specs
- **STATUS.md** - Current project status (100% complete)
- **AGENT_HANDOFF.md** - Complete technical documentation
- **SWEEP_TEST.md** - Hardware verification tool
- **CHANGELOG.md** - Version history and bug fixes
