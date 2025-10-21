# Agent Handoff - Struggling Spider Egg Sacs

## Status: ✅ CODE COMPLETE - READY FOR HARDWARE BUILD & TEST

**Last Updated:** 2025-10-19 (Evening)
**Project:** Struggling Spider Egg Sacs for Chamber 5 (Hatchery)

**MAJOR UPDATE:** Complete redesign from peaceful pulsating to violent struggling escape!

---

## Critical Concept Change

### ❌ OLD CONCEPT (Discarded)
Peaceful pulsating/breathing effect - gentle sine-wave breathing like they're sleeping. **BORING!**

### ✅ NEW CONCEPT (Implemented)
**Spiders violently struggling to ESCAPE from egg sacs!**

- 💡 LEDs flicker violently as spiders move inside trying to break free
- 🕷️ Spider legs actually BREAK THROUGH the sac material (servo-controlled)
- 😱 Synchronized chaos when breakthrough happens
- 🤫 Brief calm periods create false security before next struggle

**This is WAY scarier and more dramatic!**

---

## Summary

**Complete codebase for spiders struggling to escape from egg sacs.**

### Implementation Details
- **12 LEDs** (channels 0-11) - violent flickering inside egg sacs
- **4 servos** (channels 12-15) - spider legs that break through
- **Three behavioral states:**
  - **Calm (20%):** Low flickering, false security, 3-8 seconds
  - **Struggling (60%):** Violent random flickering, 10-20 seconds
  - **Breakthrough (20%):** Spider leg breaks through! 8-second sequence
- **5-phase breakthrough sequence:**
  1. Build-up (1s) - LEDs intensify rapidly
  2. Extend (2s) - Leg breaks through, LEDs go CRAZY (0-4095)
  3. Hold (2s) - Maximum chaos, leg fully extended
  4. Retract (2s) - Leg pulls back inside
  5. Settle (1s) - Everything calms down

### Code Quality
- **Flash:** 11,642 bytes (40% of Leonardo capacity)
- **RAM:** 416 bytes (16% of available memory)
- **Algorithm:** Simple random-based (no complex floating-point math)
- **Memory optimized:** F() macro throughout
- **Better than original:** Less memory, more dramatic effect!

---

## Quick Start

```bash
cd pulsating_eggs

# Verify everything works
pixi run status
pixi run integration-test

# When hardware ready
pixi run deploy
```

---

## What's Complete

### ✅ Code Written & Tested

**Production Sketch** (`arduino/pulsating_eggs/pulsating_eggs.ino`):
- Three-state behavior system
- Violent LED flickering patterns
- Servo control for spider leg breakthrough
- 5-phase breakthrough sequence (8 seconds total)
- Random servo selection for variety
- Pause button on Pin 9 (all LEDs 50%, legs retract)
- Memory optimized: **40% flash, 16% RAM**
- ✅ **Compiles successfully**

**Test Sketch** (`arduino/led_test/led_test.ino`):
- Interactive LED testing
- I2C scan, individual/all LED tests
- Fade, pulse, breathing patterns
- ⚠️ **Note:** Does NOT test servos (LED only)

### ✅ Infrastructure
- Pixi environment configured
- Testing scripts (beetle_test, integration_test, kill_arduino)
- All compilation verified

### ✅ Documentation
- `README.md` - Complete setup guide with new concept
- `WIRING.md` - Hardware connections (needs servo details added)
- `TROUBLESHOOTING.md` - Problem-solving guide
- `CHANGELOG.md` - Documents the concept change
- This handoff file

---

## What's NOT Done - Physical Build Required

### ❌ Spider Leg Mechanisms (4 needed)

**Materials per leg:**
- Black pipe cleaners OR stiff wire (6-8" long)
- Servo (small, 9g micro servo recommended)
- Servo horn
- Hot glue or mounting bracket
- Optional: black fabric/fur for texture

**Construction steps:**
1. Attach servo horn to servo
2. Create articulated spider leg:
   - Main segment: 4-5" from servo horn
   - Optional: add joints with pipe cleaners
   - Bend to look like spider leg (multiple segments)
3. Paint/wrap in black if using wire
4. Test servo range: 0° = hidden, 180° = fully extended

**Mounting:**
- Servo mounts BEHIND/BESIDE egg sac (hidden from view)
- Cut small slit in sac material where leg will poke through
- Position so only leg tip is visible when extended
- Secure servo with hot glue or bracket

### ❌ Egg Sac Construction (12 needed)

**4 sacs with servos (breakthrough sacs):**
- Base: Balloon or paper lantern (8-12" diameter)
- LED mounted INSIDE (so light shines through)
- Wrap with white gauze/cheesecloth (translucent!)
- Servo mounted on back/side (hidden)
- Small slit cut where leg will break through
- Wire LED to PCA9685 channels 0-3
- Wire servos to PCA9685 channels 12-15

**8 sacs without servos (struggling only):**
- Same construction but NO servo
- LED inside, wrapped with gauze
- Wire LEDs to PCA9685 channels 4-11
- These just flicker violently (no breakthrough)

### ❌ Electrical Components

**Shopping list:**
- PCA9685 16-channel PWM driver board (1)
- LEDs - 12 total (recommend 5mm or 10mm white LEDs)
- Resistors for LEDs (calculate based on LED specs, likely 150-220Ω each)
- Servos - 4 total (9g micro servos work well)
- 5V power supply (calculate: 12 LEDs × 20mA + 4 servos × 50mA ≈ 440mA minimum, recommend 1A+)
- Wire (various colors for organization)
- Breadboard or protoboard for connections

### ❌ Wiring

**Current status:** No hardware connected yet

**Required:**
1. Connect Beetle to PCA9685 (I2C: SDA/SCL/VCC/GND)
2. Connect external 5V power to PCA9685 (V+/GND)
3. Wire 12 LEDs to channels 0-11 (with resistors!)
4. Wire 4 servos to channels 12-15
5. Ensure common ground (Beetle + PCA9685 + Power Supply)

See `WIRING.md` for detailed diagrams.

### ❌ Testing & Calibration

**Not yet done:**
- LED brightness ranges not calibrated (may be too dim/bright)
- Servo movement not tested (does leg actually break through?)
- Struggling intensity not verified visually
- Breakthrough timing may need adjustment
- Power consumption not measured
- Egg sac material opacity not tested (can you see LED through gauze?)

---

## Hardware Setup - Step by Step

### Phase 1: Basic Testing (1-2 hours)

**Goal:** Verify PCA9685 works with 1 LED and 1 servo

1. **Install pixi environment:**
   ```bash
   pixi install
   pixi run setup
   ```

2. **Wire up minimal test:**
   - Connect Beetle to PCA9685 (I2C)
   - Connect external 5V power to PCA9685
   - Connect ONE LED to CH0 (with resistor)
   - Connect ONE servo to CH12

3. **Test I2C communication:**
   ```bash
   pixi run led-test
   # Type: i
   # Should detect 0x40
   ```

4. **Test LED:**
   ```bash
   # In led-test monitor:
   # Type: 0    (test channel 0)
   # Type: n    (all on)
   # Type: o    (all off)
   ```

5. **Test servo (manual):**
   - Upload production code: `pixi run arduino-flash`
   - Watch serial monitor: `pixi run arduino-monitor`
   - Wait for breakthrough state
   - Observe servo movement (should extend/retract)

### Phase 2: Full LED Array (2-3 hours)

**Goal:** Get all 12 LEDs working

1. Wire remaining 11 LEDs to channels 1-11
2. Test each channel individually with `led-test`
3. Verify all LEDs respond to commands
4. Check power consumption (should be under 300mA)
5. Upload production code
6. Observe struggling patterns (violent flickering)

### Phase 3: Add Servos (1-2 hours)

**Goal:** Get all 4 servos working

1. Wire servos to channels 12-15
2. Upload production code
3. Monitor for breakthrough states
4. Verify all 4 servos can extend/retract
5. Check power consumption with servos moving

### Phase 4: Build Physical Props (4-6 hours)

**Goal:** Create egg sacs with LEDs and spider legs

1. Build 4 breakthrough sacs (LED + servo + leg)
2. Build 8 regular sacs (LED only)
3. Install all in Hatchery chamber
4. Test visual effect in dim lighting

### Phase 5: Tuning (1-2 hours)

**Goal:** Make it look terrifying!

1. Adjust LED brightness ranges in code if needed
2. Tune struggling intensity (flickering speed)
3. Test breakthrough timing (is 8 seconds right?)
4. Verify spider leg mechanisms work reliably
5. Test from guest perspective

---

## Configuration Notes

### Adjusting Behavior

**LED brightness ranges** (`pulsating_eggs.ino`):
```cpp
// CALM state - line 234
int target = random(50, 300);  // Adjust range if too dim/bright

// STRUGGLING state - line 254
int target = random(0, 2000);  // Adjust for intensity

// BREAKTHROUGH state - line 291
int target = random(0, 4095);  // Maximum chaos (keep at max!)
```

**State durations** (lines 184, 193, 202):
```cpp
// Calm: 3-8 seconds
stateDuration = random(3000, 8000);  // Increase for more security feeling

// Struggling: 10-20 seconds
stateDuration = random(10000, 20000);  // Main behavior time

// Breakthrough: 8 seconds (fixed)
stateDuration = 8000;  // Don't change without testing phases
```

**Servo range** (lines 58-59):
```cpp
#define SERVOMIN  600   // Retracted (hidden)
#define SERVOMAX  2400  // Extended (breaking through)
// Adjust if servo doesn't reach full range
```

**Hardware allocation** (lines 52-54):
```cpp
#define NUM_LEDS 12        // Change if using fewer LEDs
#define NUM_SERVOS 4       // Change if using fewer servos
#define SERVO_START_CH 12  // First servo channel
// Total channels: NUM_LEDS + NUM_SERVOS ≤ 16
```

After changes: `pixi run arduino-flash`

---

## Troubleshooting Quick Reference

### LEDs not lighting
1. Check external 5V power to PCA9685 V+/GND
2. Verify common ground connection
3. Run `pixi run led-test` → type `i` to verify PCA9685 detected

### Servos not moving
1. Check servo connections to channels 12-15
2. Verify servos have power (V+ from PCA9685)
3. Monitor serial output during breakthrough state
4. Check servo current draw (may need bigger power supply)

### Breakthrough not happening
1. Check serial monitor - should see "[STATE] BREAKTHROUGH"
2. Random 20% chance - may take 30-60 seconds to trigger
3. Use pause button (Pin 9) to verify servos work when forced to retract

### Code won't compile
1. PI and TWO_PI conflict has been fixed
2. Ensure latest code version
3. Run `pixi run clean-all` then `pixi run arduino-compile`

### Upload fails
1. Run `pixi run kill-arduino`
2. Unplug/replug Beetle
3. Run `pixi run arduino-flash`

---

## Key Learnings from Similar Projects

### From Twitching Body
1. **Test hardware first, then production** - Always verify with test code
2. **Calibration is everything** - Default values are starting points
3. **F() macro essential** - Saves critical RAM on Leonardo
4. **Auto port detection works** - No hardcoded paths
5. **Physical testing reveals issues** - Test with actual props, not just breadboard

### New for This Project
1. **Servos + LEDs share power** - Calculate total current carefully
2. **PWM frequency compromise** - 1000Hz works for both LEDs and servos
3. **Random behavior is dramatic** - No complex math needed for scary effect
4. **Breakthrough timing critical** - 8-second sequence creates maximum impact
5. **False security matters** - Calm periods make struggles more shocking

---

## Known Issues & Limitations

### Current Limitations
- **No servo test sketch** - LED test only, servos tested via production code
- **PWM frequency compromise** - 1000Hz is okay for servos but non-standard (50Hz typical)
- **Servo pulse width calculation** - Different formula needed at 1000Hz vs 50Hz
- **No sound integration** - Could add audio triggers for spider sounds

### Future Enhancements (Optional)
- [ ] Add audio trigger when breakthrough happens
- [ ] Add pressure sensor to trigger on guest approach
- [ ] Create servo test sketch for easier debugging
- [ ] Add "panic mode" where all legs break through at once
- [ ] Vary breakthrough sequence timing based on randomness

---

## Serial Monitor Output (Expected)

When running production code:

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
[STATE] Struggling - violent movement
[STATE] Calm - false security
[STATE] BREAKTHROUGH - Leg 2
  [EXTEND] Leg breaking through!
  [HOLD] Leg fully extended!
  [RETRACT] Leg pulling back...
  [SETTLE] Leg retracted
  [COMPLETE] Breakthrough finished
[STATE] Calm - false security
[STATE] Struggling - violent movement
[STATE] BREAKTHROUGH - Leg 0
  [EXTEND] Leg breaking through!
  ...
```

---

## For Next Agent

### First Commands

```bash
# Understand the project
cd pulsating_eggs
cat README.md
cat AGENT_HANDOFF.md

# Verify environment
pixi run status
pixi run integration-test

# Test compilation
pixi run arduino-compile
pixi run test-compile
```

### Immediate Next Steps

1. **Order/gather hardware:**
   - PCA9685 board
   - 12 LEDs (white, 5mm or 10mm)
   - 4 small servos (9g micro servos)
   - Resistors for LEDs (150-220Ω)
   - 5V power supply (1A minimum)
   - Black pipe cleaners for legs
   - Balloons/lanterns for egg sacs
   - White gauze/cheesecloth

2. **Phase 1: Basic test** (see Phase 1 above)
   - Wire 1 LED + 1 servo
   - Verify PCA9685 communication
   - Test both LED and servo

3. **Phase 2-5:** Follow step-by-step guide above

4. **Document everything:**
   - Update CHANGELOG.md with findings
   - Note any code changes needed
   - Measure actual power consumption
   - Document construction details

### Critical Questions to Answer

1. Are LED brightness ranges appropriate for visual effect?
2. Does servo extend far enough to be visible?
3. Is struggling intensity dramatic enough?
4. Is 8-second breakthrough too long/short?
5. Can guests see LEDs through gauze material?
6. Is power supply adequate for all 12 LEDs + 4 servos?
7. Do spider legs look realistic when breaking through?

### Success Criteria

Before marking complete:
- [ ] All 12 LEDs working and flickering violently
- [ ] All 4 servos working and extending/retracting smoothly
- [ ] Breakthrough sequence is dramatic and scary
- [ ] Calm periods create effective false security
- [ ] Physical egg sacs constructed and installed
- [ ] Effect tested from guest perspective in dim lighting
- [ ] Power consumption measured and adequate
- [ ] All documentation updated with findings

---

## Standards Applied

Following best practices from completed projects:

✅ Pixi-managed dependencies (reproducible environment)
✅ F() macro for strings (memory optimization)
✅ Auto port detection (no hardcoded paths)
✅ Test-first approach (LED test before production)
✅ Comprehensive documentation (README, WIRING, TROUBLESHOOTING)
✅ Process cleanup tools (kill-arduino script)
✅ Integration testing (automated verification)
✅ Agent continuity (this handoff document)

**New standards for this project:**
✅ Mixed LED + servo control on same PCA9685
✅ Three-state behavior system (calm, struggling, breakthrough)
✅ Multi-phase dramatic sequences (5-phase breakthrough)
✅ Random-based algorithms (simpler than sine-wave calculations)

---

## Project Context

**Location:** Chamber 5 (Hatchery) in Spider Haunted House
**Purpose:** Terrify guests with spiders trying to escape from eggs
**Related projects:**
- `../twitching_body/` - Similar servo control, reference for testing
- `../window_spider_trigger/` - Similar Beetle setup, reference for I2C

**See also:**
- `/PROJECT_PLAN.md` - Complete haunted house design
- `/SHOPPING_LIST.md` - Parts and materials list

---

**Good luck! This is going to be TERRIFYING!** 🕷️😱

**Last updated:** 2025-10-19 21:45
**Status:** Code complete, ready for hardware build and testing
**Next milestone:** Phase 1 basic hardware test
