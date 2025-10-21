# Struggling Spider Egg Sacs

Spiders violently struggling to escape from egg sacs for Halloween 2025 haunted house (Chamber 5: Hatchery).

---

**📋 Project Status:** 🚧 IN DEVELOPMENT

**⭐ Quick Start:** `pixi run deploy` → Upload code and watch them struggle!

---

## Quick Start

```bash
pixi run deploy  # Flash code + monitor
```

**Pause Button:** Ground Pin 9 to pause (all LEDs 50%, legs retracted).

**First Time Setup:** `pixi install && pixi run setup` (only needed once)

---

## Concept

**Spiders are struggling to ESCAPE from egg sacs** - creating a terrifying, violent effect:

- 💡 **LEDs flicker violently** - spiders moving inside, trying to break free
- 🕷️ **Spider legs BREAK THROUGH** - servos extend fake spider legs through the sac material
- 😱 **Synchronized chaos** - when a leg breaks through, all LEDs go crazy
- 🤫 **False security** - brief calm periods make breakthrough more shocking

## Hardware

### Components
- **DFRobot Beetle** (DFR0282) - Leonardo-compatible Arduino
- **PCA9685 16-Channel PWM Driver** - I2C LED and servo controller
- **12x LEDs** - For egg sacs (channels 0-11)
  - Appropriate current-limiting resistors for each LED
- **4x Servos** - For spider legs (channels 12-15)
  - Small servos for spider leg mechanisms
- **5V Power Supply** - External power for LEDs + servos (calculate based on total current)
- **Optional:** Momentary button on Pin 9 for pause/test

### Wiring Overview

```
Beetle (I2C) → PCA9685 → LEDs (CH0-11) + Servos (CH12-15)
             ↑
      5V Power Supply
```

**Quick Reference:**
- Beetle SDA/SCL → PCA9685 SDA/SCL (I2C communication)
- Beetle VCC/GND → PCA9685 VCC/GND (logic power)
- 5V Supply → PCA9685 V+/GND (LED + servo power)
- LEDs → PCA9685 Channels 0-11 (through resistors)
- Servos → PCA9685 Channels 12-15

**⚠️ CRITICAL:** All grounds must be connected together (Beetle, PCA9685, Power Supply)

**📄 Complete Wiring Diagram:** See `WIRING.md` for detailed connections

---

## Behavior

### Three States

1. **CALM** (20% of time, 3-8 seconds)
   - Low LED flickering (50-300 brightness)
   - All spider legs retracted (hidden)
   - Creates false sense of security
   - Spiders are "resting" inside

2. **STRUGGLING** (60% of time, 10-20 seconds) - **MAIN BEHAVIOR**
   - Violent LED flickering (0-2000 brightness)
   - Rapid random changes
   - All legs still retracted
   - Spiders desperately trying to escape

3. **BREAKTHROUGH** (20% of time, 8-second sequence)
   - **5-phase dramatic sequence:**
     - **Build-up** (1s): LEDs intensify rapidly
     - **Extend** (2s): Spider leg BREAKS THROUGH, LEDs go CRAZY (0-4095)
     - **Hold** (2s): Leg fully extended, maximum chaos
     - **Retract** (2s): Leg pulls back inside, LEDs settle
     - **Settle** (1s): Back to low activity
   - Random servo selected each time
   - Creates maximum scare effect

### Visual Feedback

Built-in LED (Pin 13) indicates state:
- **Off** - Calm or struggling
- **On** - BREAKTHROUGH happening!
- **Blinking** - Startup sequence

---

## Installation

### Prerequisites
```bash
# Install Pixi (one-time)
curl -fsSL https://pixi.sh/install.sh | bash
```

### Setup
```bash
cd pulsating_eggs

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

### Pause Button Feature

**Pin 9** can be used as a pause button:
- **During operation:** Ground Pin 9 → all LEDs 50%, all legs retracted
- **Release:** Behavior resumes automatically
- **Use case:** Testing wiring, inspecting egg sacs during setup

### Testing Hardware

```bash
# Interactive LED testing (before production use)
pixi run led-test

# Test commands in serial monitor:
#   i - I2C scan (should detect 0x40)
#   0-9 - Test individual LED channel
#   a - Test all LEDs together
#   f - Fade sequence test
#   p - Pulse test
#   b - Breathing test
#   o - All LEDs off
#   n - All LEDs on (max brightness)
```

**Note:** LED test does NOT test servos. You'll need to add servo testing to verify spider legs.

---

## Configuration

### Number of LEDs and Servos

Edit `arduino/pulsating_eggs/pulsating_eggs.ino`:

```cpp
// Hardware allocation
#define NUM_LEDS 12        // Channels 0-11 for LEDs (max 12 if using 4 servos)
#define NUM_SERVOS 4       // Channels 12-15 for spider legs (max 4)
#define SERVO_START_CH 12  // First servo channel
```

**Tradeoff:** More LEDs = fewer servos (16 channels total)

### Brightness Ranges

Adjust intensity in each state:

```cpp
// CALM state
int target = random(50, 300);  // Very dim flickering

// STRUGGLING state
int target = random(0, 2000);  // Violent changes

// BREAKTHROUGH state
int target = random(0, 4095);  // MAXIMUM chaos
```

### Timing

Change state durations:

```cpp
// Calm: 3-8 seconds
stateDuration = random(3000, 8000);

// Struggling: 10-20 seconds
stateDuration = random(10000, 20000);

// Breakthrough: 8 seconds fixed (5 phases)
stateDuration = 8000;
```

### Servo Range

Adjust spider leg extension:

```cpp
#define SERVOMIN  600   // Retracted position
#define SERVOMAX  2400  // Fully extended position
```

After changes:
```bash
pixi run arduino-flash  # Re-upload code
```

---

## Physical Build

### Spider Leg Mechanism

Each servo needs a spider leg attached:

**Materials:**
- Black pipe cleaners or wire (for leg segments)
- Hot glue or tape
- Servo horn
- Optional: black fabric or fur for texture

**Construction:**
1. Attach servo horn to servo
2. Create articulated spider leg (6-8" long)
3. Mount servo behind/inside egg sac material
4. Cut small slit in sac for leg to poke through
5. When servo at 0°: leg hidden
6. When servo at 180°: leg extends through slit

**Mounting:**
- Servo should be hidden behind sac
- Only the leg tip should be visible when extended
- Use hot glue or mounting bracket

### Egg Sac Construction

**Materials:**
- Balloons or paper lanterns (6"-18" diameter)
- White gauze/cheesecloth (wrapped around)
- LED mounted inside
- Servo mounted on back/side

**Assembly:**
1. Install LED inside balloon/lantern
2. Wrap with gauze (translucent - light shines through)
3. Mount servo on exterior
4. Attach spider leg to servo
5. Cut small slit where leg will break through
6. Wire LED and servo to PCA9685

---

## Troubleshooting

### Quick Fixes

**LEDs not lighting:**
- Check external 5V power to PCA9685 V+/GND
- Verify common ground connection
- Test with `pixi run led-test`

**Servos not moving:**
- Check servo connections to channels 12-15
- Verify servo power from PCA9685 V+
- Servos need adequate current (50mA+ each)

**Violent behavior too fast/slow:**
- Adjust random brightness ranges in code
- Change update delay (currently 10ms)

**PCA9685 not detected:**
```bash
pixi run led-test
# Type: i
# Should show: 0x40 <- PCA9685!
```

**Upload fails:**
```bash
pixi run kill-arduino    # Kill stuck processes
pixi run arduino-flash   # Retry upload
```

### Complete Guide

**For detailed troubleshooting:**
- `TROUBLESHOOTING.md` - Complete problem-solving guide
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
| `pixi run led-test` | Interactive LED testing |
| `pixi run status` | System overview |
| `pixi run integration-test` | Verify compilation |

### Troubleshooting
| Command | Description |
|---------|-------------|
| `pixi run kill-arduino` | Kill stuck processes |
| `pixi run fix-permissions` | Add user to dialout group |
| `pixi run clean-all` | Clean build artifacts |

---

## Performance Notes

**Production Code:**
- **Flash:** 11,642 bytes (40% of Leonardo capacity)
- **RAM:** 416 bytes (16% of available memory)
- PWM frequency: 1000Hz (flicker-free LEDs, compatible with servos)
- I2C communication at 400kHz
- 12 LEDs + 4 servos supported
- Random-based struggling (no complex math)

**Memory optimized** with F() macro for all strings.

---

## Safety

- ⚠️ Use appropriate current-limiting resistors for all LEDs
- ⚠️ Calculate total current: (12 LEDs × 20mA) + (4 servos × 50mA) ≈ 440mA minimum
- ⚠️ Servos can draw more when moving - use 1A+ power supply for safety
- ⚠️ Test servo movements don't pinch or harm guests
- ⚠️ Secure all wiring and mechanisms

---

## Serial Monitor Output

Watch the behavior in real-time:

```
=== Struggling Spider Egg Sacs ===
Initializing...
I2C initialized
PCA9685 initialized (1000Hz)
Initializing egg sacs...
Retracting spider legs...
Egg sacs ready
Starting behavior cycle...

[STATE] Calm - false security
[STATE] Struggling - violent movement
[STATE] BREAKTHROUGH - Leg 2
  [EXTEND] Leg breaking through!
  [HOLD] Leg fully extended!
  [RETRACT] Leg pulling back...
  [SETTLE] Leg retracted
  [COMPLETE] Breakthrough finished
[STATE] Calm - false security
...
```

---

## Project Status

**Struggling Eggs: READY FOR TESTING** 🚧

### Completed
- ✅ Complete code rewrite for struggling behavior
- ✅ Three-state system (calm, struggling, breakthrough)
- ✅ LED flickering patterns (violent random)
- ✅ Servo control for spider leg breakthrough
- ✅ 5-phase breakthrough sequence
- ✅ Compiles successfully (40% flash, 16% RAM)

### To Do
- [ ] Hardware testing with actual LEDs and servos
- [ ] Build spider leg mechanisms
- [ ] Test with physical egg sac props
- [ ] Calibrate brightness ranges
- [ ] Tune struggling intensity
- [ ] Test breakthrough timing
- [ ] Power consumption measurement

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
3. Servo power and LED resistor calculations
