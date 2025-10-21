# Changelog

## 2025-10-19 (Evening) - Complete Concept Redesign

### MAJOR CHANGE: From Pulsating to Struggling Escape

**Old concept:** Gentle breathing/pulsating effect (peaceful)
**New concept:** Spiders violently struggling to escape (terrifying!)

### Redesigned Behavior
- **Three states:** Calm (20%), Struggling (60%), Breakthrough (20%)
- **LED patterns:** Violent random flickering instead of smooth sine waves
- **Servo control:** Spider legs break through egg sacs (4 servos on CH12-15)
- **Synchronized chaos:** When leg breaks through, all LEDs go maximum
- **5-phase breakthrough sequence:**
  1. Build-up (1s) - LEDs intensify
  2. Extend (2s) - Leg breaks through, LEDs CRAZY
  3. Hold (2s) - Maximum chaos
  4. Retract (2s) - Leg pulls back
  5. Settle (1s) - LEDs settle down

### Code Improvements
- **Better memory usage:** 11,642 bytes flash (40%), 416 bytes RAM (16%)
- **Simpler algorithm:** Random-based instead of complex sine calculations
- **More dramatic:** Violent struggling vs peaceful breathing

### Hardware Changes
- Channels 0-11: LEDs (12 egg sacs)
- Channels 12-15: Servos (4 spider legs)
- Same PCA9685 controller, different allocation

## 2025-10-19 (Afternoon) - Initial Development

### Created
- **Project Structure**
  - Pixi-based environment following twitching_body patterns
  - Arduino sketches (led_test + pulsating_eggs)
  - Testing scripts (beetle_test, integration_test, kill_arduino)
  - Documentation framework

- **LED Test Sketch** (`arduino/led_test/led_test.ino`)
  - I2C scan functionality
  - Individual LED testing (channels 0-9)
  - All LED testing
  - Fade, pulse, and breathing test patterns
  - Interactive brightness control
  - F() macro for memory optimization

- **Production Sketch** (`arduino/pulsating_eggs/pulsating_eggs.ino`)
  - Three behavior modes:
    - Independent breathing (80% of time)
    - Synchronized pulse (10% of time)
    - Wave pattern (10% of time)
  - Sine-wave based breathing for smooth effect
  - Random egg parameters (phase, frequency, brightness)
  - Three maturity levels (young, medium, mature)
  - Pause button on Pin 9
  - F() macro for memory optimization

- **Testing Infrastructure**
  - `scripts/beetle_test.sh` - Hardware verification
  - `scripts/integration_test.sh` - System testing
  - `scripts/kill_arduino.sh` - Process management

- **Pixi Configuration** (`pixi.toml`)
  - Arduino CLI installation
  - AVR core setup
  - Adafruit PWM Servo Driver Library
  - All common development tasks
  - Testing and deployment workflows

- **Documentation**
  - `README.md` - Complete setup and usage guide
  - `CHANGELOG.md` - This file
  - `WIRING.md` - Hardware connection guide
  - `TROUBLESHOOTING.md` - Problem-solving reference

### Configuration (NEW)
- **Hardware:**
  - DFRobot Beetle (Leonardo)
  - PCA9685 16-channel PWM driver
  - 12 LEDs (channels 0-11) for egg sacs
  - 4 servos (channels 12-15) for spider legs
  - 1000Hz PWM frequency (works for both LEDs and servos)

- **Behavior Parameters:**
  - Calm: 50-300 brightness, 3-8 seconds
  - Struggling: 0-2000 brightness (violent random), 10-20 seconds
  - Breakthrough: 0-4095 brightness (maximum chaos), 8-second sequence
  - State probabilities: 20% calm, 60% struggling, 20% breakthrough
  - Servo range: 0° (hidden) to 180° (extended)

### Next Steps (Updated for NEW concept)
- [ ] Build 4 spider leg mechanisms (pipe cleaners + servos)
- [ ] Build 12 egg sacs (4 with servos, 8 LED-only)
- [ ] Hardware testing with physical LEDs and servos
- [ ] Test spider leg breakthrough effect
- [ ] Calibrate brightness ranges for visual impact
- [ ] Test struggling intensity (is it scary enough?)
- [ ] Power consumption measurements (12 LEDs + 4 servos)
- [ ] Testing with actual egg sac props in dim lighting
- [ ] Final behavioral tuning
- [ ] Production deployment in Hatchery chamber

---

## Version Info

**Current Version:** 1.0.0 (Code Complete, Hardware Build Required)
**Platform:** Linux (Pixi-managed)
**Arduino:** Leonardo-compatible (Beetle DFR0282)
**Status:** ✅ Code complete, ready for hardware testing

---

## Development Notes

**Following best practices from twitching_body:**
- Pixi-managed dependencies (reproducible environment)
- F() macro for string constants (memory optimization)
- Auto port detection (no hardcoded paths)
- Test-first development approach
- Comprehensive documentation
- Progressive implementation

**Key Similarities to twitching_body:**
- Same PCA9685 PWM driver
- Servo control for dramatic movements
- Multi-state behavior system
- Random variations for unpredictability
- F() macro memory optimization

**Key Differences from twitching_body:**
- **Mixed control:** LEDs (0-11) + Servos (12-15) on same PCA9685
- **PWM frequency:** 1000Hz (compromise for LEDs + servos)
- **Simpler algorithm:** Random-based flickering vs smooth servo movements
- **More dramatic:** Violent struggling vs slow twitching
- **Breakthrough effect:** Spider legs break through sacs!

**Why the redesign was worth it:**
- More terrifying effect (struggling escape vs peaceful breathing)
- Better memory usage (416 bytes RAM vs 552 bytes)
- Simpler algorithm (random vs sine-wave calculations)
- More interactive (physical spider legs vs just lights)
- Greater scare factor (breakthrough sequence is shocking!)

---

## Lessons Learned

1. **User feedback is critical** - Original concept was too peaceful, new concept is terrifying
2. **Simpler can be better** - Random flickering more dramatic than smooth sine waves
3. **Physical elements matter** - Adding servo-controlled legs took it to the next level
4. **Memory optimization pays off** - Better algorithm used less RAM
5. **State-based behavior works** - Three states create natural tension and release
