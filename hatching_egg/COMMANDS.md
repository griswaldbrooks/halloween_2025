# Hatching Egg - Command Reference

**Last Updated:** 2025-10-28

All commands run from the `hatching_egg/` directory.

---

## ⚡ Quick Start Commands

### Upload Main Animation (READY!)
```bash
pixi run upload            # Upload main hatching animation
pixi run monitor           # Monitor serial output
```
Ground Pin 9 to trigger the animation!

### Main Animation Upload
```bash
pixi run upload            # Test, compile, and upload main sketch
pixi run monitor           # View serial output
```

---

## 📋 Available Commands

### Testing
```bash
pixi run test              # Run all 275 tests (C++ + Python)
pixi run test-cpp          # Run 44 C++ servo mapping tests
pixi run test-python       # Run 13 Python config tests
pixi run test-servo-tester # Run 37 servo tester tests
pixi run test-servo-sweep  # Run 181 servo sweep tests
```

### Servo Calibration
```bash
pixi run calibrate         # Upload calibration tool and open monitor (recommended)
pixi run servo-compile     # Just compile calibration tool
pixi run servo-upload      # Just upload calibration tool
pixi run servo-flash       # Compile + upload calibration tool
pixi run servo-monitor     # Just open serial monitor at 9600 baud
```

### Servo Sweep Test
```bash
pixi run test-servo-sweep  # Run 181 unit tests for sweep logic
pixi run sweep-upload      # Upload sweep test to Beetle
pixi run sweep-monitor     # Open serial monitor
pixi run sweep-flash       # Compile + upload sweep test
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

## 📝 Typical Workflow

### 1. First Time Setup
```bash
pixi install
pixi run setup
```

### 2. Servo Calibration
```bash
pixi run calibrate
# Use commands above to find safe limits
# Document results in STATUS.md
```

### 3. Update Configuration
Edit `animation-config.json` with safe PWM limits from calibration.

### 4. Test Configuration
```bash
pixi run test    # All tests must pass!
```

### 5. Upload Main Animation
```bash
pixi run upload
pixi run monitor
```

### 6. Test with Trigger
Ground Pin 9 to trigger animation.

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

- **README.md** - Project overview and setup
- **CALIBRATION_STATUS.md** - Calibration procedure details
- **STATUS.md** - Current project status
- **AGENT_HANDOFF.md** - Complete technical documentation
