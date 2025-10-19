# Twitching Body Animatronic

Servo-controlled twitching body effect for Halloween 2025 haunted house (Chamber 4: Victim Room).

---

**📋 Project Status:** ✅ COMPLETE AND WORKING

**⭐ Quick Start:** `pixi run deploy` → Upload code and watch it twitch!

**🔊 Audio Loop:** See `raspberry_pi_audio/` for Raspberry Pi auto-play setup (victim moaning sounds)

---

## Quick Start

```bash
# First time setup
pixi install
pixi run setup

# Deploy to Beetle
pixi run deploy  # Uploads code + opens monitor

# Or just flash without monitor
pixi run arduino-flash
```

**Center Button:** Hold a wire from Pin 9 to GND during operation to center all servos at 90° (useful for installing servo horns).

---

## Hardware

### Components
- **DFRobot Beetle** (DFR0282) - Leonardo-compatible Arduino
- **PCA9685 16-Channel PWM Driver** - I2C servo controller board
- **3x HS-755MG Servos** - High-torque servos
  - Head servo → PCA9685 Channel 0
  - Left arm servo → PCA9685 Channel 1
  - Right arm servo → PCA9685 Channel 2
- **5V Power Supply** - External power for servos (**5A+ required**)
- **Optional:** Momentary button on Pin 9 for centering

### Wiring Overview

```
Beetle (I2C) → PCA9685 → Servos
             ↑
      5V Power Supply (5A+)
```

**Quick Reference:**
- Beetle SDA/SCL → PCA9685 SDA/SCL (I2C communication)
- Beetle VCC/GND → PCA9685 VCC/GND (logic power)
- 5V Supply → PCA9685 V+/GND (servo power, 5A+)
- Servos → PCA9685 Channels 0, 1, 2

**⚠️ CRITICAL:** All grounds must be connected together (Beetle, PCA9685, Power Supply)

**📄 Complete Wiring Diagram:** See `WIRING.md` for detailed connections

---

## Behavior

### Movement Pattern

The animatronic cycles through three states:

1. **Slow Creepy Movement** (50-70% of time) - **DEFAULT BEHAVIOR**
   - **FULL RANGE:** ±90 degrees (complete 0-180° sweep!)
   - Arms move in **opposite directions** (one up, one down)
   - Slow, smooth, gradual motion (1°/step at 40ms)
   - Maximum range of motion - fully visible
   - Duration: **8-18 seconds** (long, drawn-out movements)

2. **Brief Still Periods** (20-40% of time)
   - Servos at rest positions (90 degrees)
   - Short pauses between movements
   - Duration: 2-5 seconds (much reduced)

3. **EXTREME Quick Jerks** (~5% of time)
   - **FULL RANGE:** ±90 degrees (complete 0-180° sweep!)
   - Arms move in **opposite directions** for dramatic effect
   - **Very fast, snappy** motion (5°/step at 3ms intervals)
   - Same range as slow, but MUCH faster
   - Duration: 150-400 milliseconds

### Opposite Arm Motion

Arms move in mirror directions for more unsettling effect:
- When **left arm moves up to 180°**, **right arm moves down to 0°**
- When **left arm sweeps left (+90°)**, **right arm sweeps right (-90°)**
- Head moves independently with full 0-180° range
- All movements use the **complete servo range** for maximum visibility

### Cycle Variety

5 different predefined cycles that repeat for natural unpredictability:
- **Cycle 1**: 3s still, **12s slow**, 0.25s jerk - slow dominant
- **Cycle 2**: 2s still, **15s slow**, 0.3s jerk - very slow dominant
- **Cycle 3**: 4s still, **10s slow**, 0.2s jerk - balanced
- **Cycle 4**: 2.5s still, **18s slow**, 0.35s jerk - longest slow (most dramatic)
- **Cycle 5**: 5s still, **8s slow**, 0.4s jerk - shortest slow

### Visual Feedback

Built-in LED (Pin 13) indicates state:
- **Off** - Still
- **On** - Slow movement or center button held
- **Blinking** - Quick jerk

---

## Installation

### Prerequisites
```bash
# Install Pixi (one-time)
curl -fsSL https://pixi.sh/install.sh | bash
```

### Setup
```bash
cd twitching_body

# Install all dependencies (arduino-cli + libraries)
pixi install
pixi run setup

# Verify installation
pixi run status
```

---

## Usage

### Production Deployment

```bash
# Flash production code
pixi run arduino-flash

# Or flash + monitor behavior
pixi run deploy
```

Once flashed, the Beetle runs autonomously. No computer needed - just power via USB or battery.

### Center Button Feature

**Pin 9** can be used as a center button:
- **During operation:** Ground Pin 9 → servos center at 90° → LED turns ON
- **Release:** Behavior resumes automatically
- **Use case:** Install servo horns at exact neutral position

To use:
1. Connect momentary button between Pin 9 and GND, OR
2. Touch a wire from Pin 9 to GND

### Testing Hardware

```bash
# Interactive servo testing (before production use)
pixi run servo-test

# Test commands in serial monitor:
#   i - I2C scan (should detect 0x40)
#   0 - Test head servo
#   1 - Test left arm servo
#   2 - Test right arm servo
#   a - Test all servos together
#   c - Center all servos
#   + - Increase selected servo angle
#   - - Decrease selected servo angle
```

**See `SERVO_TEST.md` for complete testing guide**

---

## Configuration

### Calibrated Pulse Width Settings

Production code uses calibrated values for HS-755MG servos:

```cpp
#define SERVOMIN  600   // Minimum pulse width (µs)
#define SERVOMAX  2400  // Maximum pulse width (µs)
#define SERVO_FREQ 50   // 50 Hz for analog servos
```

**Note:** These were calibrated through testing. Standard values (1000-2000µs) caused servo stalling and high current draw.

### Adjusting Behavior

Edit `arduino/twitching_servos/twitching_servos.ino`:

**Movement ranges:**
```cpp
const int SLOW_MOVEMENT_RANGE = 90;   // ±90 degrees (FULL 0-180° range)
const int QUICK_JERK_RANGE = 90;      // ±90 degrees (FULL 0-180° range)
// Both use full servo range - difference is speed!
```

**Rest positions:**
```cpp
const int HEAD_REST = 90;        // 0-180 degrees
const int LEFT_ARM_REST = 90;
const int RIGHT_ARM_REST = 90;
```

**Movement speeds:**
```cpp
const int SLOW_MOVEMENT_DELAY = 40;   // ms between updates (slower, smoother)
const int QUICK_MOVEMENT_DELAY = 3;   // ms between updates (faster, snappier)
```

**Step sizes:**
```cpp
// Slow movements: 1 degree per step (smooth)
// Quick jerks: 5 degrees per step (very fast and snappy)
```

After changes:
```bash
pixi run arduino-flash  # Re-upload code
```

---

## Troubleshooting

### Quick Fixes

**Servos twitching uncontrollably / drawing 2A+ when idle:**
- Issue: Incorrect pulse width calibration
- Fix: Pulse widths are already calibrated (600-2400µs). If you modified them, restore these values.

**Servos not moving:**
- Check V+ and GND to PCA9685 power terminals
- Verify 5V power supply is ON and delivering 5A+
- Ensure common ground (Beetle GND + PCA9685 GND + Power GND)

**PCA9685 not detected:**
```bash
pixi run servo-test
# In monitor, type: i
# Should show: 0x40 <- PCA9685!
```
Check: SDA/SCL/VCC/GND connections

**Upload fails:**
```bash
pixi run arduino-detect  # Find correct port
pixi run kill-arduino    # Kill stuck processes
pixi run arduino-flash   # Retry upload
```

### Complete Guide

**For detailed troubleshooting:**
- `TROUBLESHOOTING.md` - Complete problem-solving guide
- `SERVO_TEST.md` - Hardware testing procedures
- `WIRING.md` - Wiring verification diagrams

---

## Common Pixi Commands

### Production Commands
| Command | Description |
|---------|-------------|
| `pixi run deploy` | ⭐ Flash production code + monitor |
| `pixi run arduino-flash` | Upload production code only |
| `pixi run arduino-monitor` | Open serial monitor |

### Testing Commands
| Command | Description |
|---------|-------------|
| `pixi run servo-test` | Interactive servo testing |
| `pixi run status` | System overview |
| `pixi run integration-test` | Verify compilation |
| `pixi run test-audio` | Test audio file validity |
| `pixi run play-audio` | Play audio with ffplay (Ctrl+C to stop) |

### Troubleshooting
| Command | Description |
|---------|-------------|
| `pixi run kill-arduino` | Kill stuck processes |
| `pixi run fix-permissions` | Add user to dialout group |
| `pixi run clean-all` | Clean build artifacts |

---

## Standalone Operation

After flashing, the Beetle can run independently:

1. **USB Power**: Connect Beetle to USB power adapter
2. **Battery Power**: Connect to LiPo battery via Beetle's battery pins
3. **Wall Power**: Use 5V regulated wall adapter

Beetle will start behavior automatically on power-up. No computer needed.

---

## Audio Loop System (Raspberry Pi)

For continuous victim moaning/crying sounds, see the **Raspberry Pi Audio Loop** setup:

**Location:** `raspberry_pi_audio/`

**Features:**
- Auto-play MP3 on boot (no login required)
- Infinite loop playback
- Systemd service for reliability
- Volume control scripts
- Playlist support

**Quick Setup:**
```bash
cd raspberry_pi_audio
./setup.sh
sudo reboot
```

**Documentation:** See `raspberry_pi_audio/README.md` for complete instructions.

---

## Performance Notes

**Production Code (PCA9685):**
- Flash: 13,198 bytes (46%)
- RAM: 491 bytes (19%)
- I2C communication at 400kHz
- 50Hz PWM frequency for servos
- Supports up to 16 servos per PCA9685
- Integer overflow protection in pulse width calculations

**Memory optimized** with F() macro for all strings.

---

## Safety

- ⚠️ Ensure servos won't pinch or harm guests
- ⚠️ Secure all wiring to prevent entanglement
- ⚠️ Use adequate power supply to prevent overheating
- ⚠️ Test movement range before installing in prop

---

## Project Status

**Twitching Body: COMPLETE** ✅

### Working Features
- ✅ PCA9685 + HS-755MG integration
- ✅ Calibrated pulse width settings (600-2400µs)
- ✅ Opposite arm motion for creepy effect
- ✅ Adjustable movement ranges (±15°/±35°)
- ✅ Center button on Pin 9
- ✅ Memory optimized (491 bytes RAM)
- ✅ Integer overflow fix applied
- ✅ Pixi-managed environment
- ✅ Auto port detection
- ✅ Complete documentation

### Tested and Verified
- ✅ All three servos move correctly
- ✅ No servo stalling or high current draw
- ✅ Smooth movements at all speeds
- ✅ Center button works during operation
- ✅ Standalone operation confirmed

See main project files:
- `/PROJECT_PLAN.md` - Complete haunted house design
- `/SHOPPING_LIST.md` - Parts and materials

---

## Support

**Quick diagnostics:**
```bash
pixi run status           # System overview
pixi run integration-test # Verify compilation
pixi run arduino-monitor  # Watch behavior output
```

**For issues, check:**
1. `TROUBLESHOOTING.md` - Common problems and solutions
2. `WIRING.md` - Verify connections
3. `SERVO_TEST.md` - Hardware testing guide
