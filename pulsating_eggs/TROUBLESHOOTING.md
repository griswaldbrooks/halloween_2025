# Troubleshooting Guide - Pulsating Egg Sacs

Complete problem-solving guide for common issues.

---

## Quick Diagnostic Sequence

Run these commands in order:

```bash
# 1. Check system status
pixi run status

# 2. Run integration test
pixi run integration-test

# 3. Test hardware (if Beetle connected)
pixi run beetle-test

# 4. Interactive LED testing
pixi run led-test
```

---

## Common Issues & Solutions

### 1. PCA9685 Not Detected

**Symptoms:**
- I2C scan shows no devices
- Code fails to initialize
- `pixi run led-test` → type `i` shows "None found"

**Causes & Fixes:**

| Cause | Fix |
|-------|-----|
| I2C wiring incorrect | Verify SDA/SCL connections (see WIRING.md) |
| VCC/GND not connected | Check power to PCA9685 logic (VCC pin) |
| Bad PCA9685 board | Test with multimeter, try another board |
| Wrong I2C address | Code assumes 0x40 (default), check jumpers |

**Verification Steps:**
```bash
pixi run led-test
# Type: i
# Should see: 0x40 <- PCA9685!
```

---

### 2. LEDs Not Lighting

**Symptoms:**
- Code runs but LEDs stay dark
- I2C communication works (PCA9685 detected)

**Causes & Fixes:**

| Cause | Fix |
|-------|-----|
| No external power | Connect 5V supply to V+ and GND on PCA9685 |
| Missing common ground | Connect Beetle GND + PCA9685 GND + Power GND |
| LED polarity reversed | Swap LED connections (anode to PCA9685, cathode to GND) |
| Resistor value too high | Recalculate resistor (see WIRING.md) |
| Bad LED | Test LED with multimeter or replace |
| Wrong channel | Verify LED connected to correct PCA9685 channel |

**Verification Steps:**
```bash
pixi run led-test
# Type: n    (all LEDs on max)
# If still dark, problem is hardware not software
```

---

### 3. LEDs Very Dim

**Symptoms:**
- LEDs barely visible
- Weak glow even at max brightness

**Causes & Fixes:**

| Cause | Fix |
|-------|-----|
| Resistor too large | Use smaller resistor (check calculation) |
| Insufficient power | Verify power supply voltage (should be 5V) |
| Weak power supply | Use power supply with higher current rating |
| PWM frequency too high | Code uses 1000Hz (should be fine for most LEDs) |

**Testing:**
```bash
pixi run led-test
# Type: 0    (test first LED)
# Type: n    (all LEDs max)
# Compare brightness levels
```

---

### 4. LEDs Always On or Always Off

**Symptoms:**
- LEDs don't respond to code
- Stuck at one brightness level
- Pulsating doesn't work

**Causes & Fixes:**

| Cause | Fix |
|-------|-----|
| LED backwards | Reverse LED polarity |
| PCA9685 not initializing | Check I2C connections, verify detection |
| Code not uploaded | Flash code: `pixi run arduino-flash` |
| Wrong code running | Upload correct sketch (pulsating_eggs not led_test) |

---

### 5. Some LEDs Work, Others Don't

**Symptoms:**
- Inconsistent behavior across channels
- Random LEDs not working

**Causes & Fixes:**

| Cause | Fix |
|-------|-----|
| Loose connections | Check all wiring, re-seat connections |
| Bad LEDs | Test each LED individually |
| Bad resistors | Check continuity with multimeter |
| Channel configuration | Verify NUM_LEDS matches physical setup |

**Testing:**
```bash
pixi run led-test
# Test each channel individually:
# Type: 0, 1, 2, 3, 4, 5, 6, 7
# Note which channels work
```

---

### 6. Flickering LEDs

**Symptoms:**
- LEDs flicker during breathing
- Visible PWM flicker

**Causes & Fixes:**

| Cause | Fix |
|-------|-----|
| Power supply noise | Add capacitor (100µF) across V+ and GND |
| Insufficient current | Use larger power supply |
| PWM frequency too low | Code uses 1000Hz (should be flicker-free) |
| Loose connections | Check all ground connections |

---

### 7. Arduino Upload Failures

**Symptoms:**
- Upload fails or hangs
- Port not found
- Permission denied

**Causes & Fixes:**

| Cause | Fix |
|-------|-----|
| Wrong port | Run: `pixi run arduino-detect` |
| Stuck processes | Run: `pixi run kill-arduino` |
| Permission denied | Run: `pixi run fix-permissions` then logout/login |
| Beetle not detected | Check USB cable, try different port |

**Verification:**
```bash
pixi run arduino-detect
# Should show Leonardo at /dev/ttyACM0 (or similar)
```

---

### 8. Code Compiles But Doesn't Run

**Symptoms:**
- Upload successful
- No serial output
- No LED activity

**Causes & Fixes:**

| Cause | Fix |
|-------|-----|
| Wrong board selected | Verify FQBN is arduino:avr:leonardo |
| Upload to wrong device | Check USB connection, verify port |
| Beetle crashed | Reset Beetle (press reset button) |
| Power issue | Check USB power, try different cable |

---

## Testing Procedures

### Hardware Test Checklist

Run through this checklist systematically:

```bash
# 1. System check
pixi run status
# ✓ Arduino CLI installed
# ✓ Pixi environment working

# 2. Integration test
pixi run integration-test
# ✓ All tests pass

# 3. Detect Beetle
pixi run arduino-detect
# ✓ Leonardo detected at /dev/ttyACMX

# 4. Compile sketch
pixi run arduino-compile
# ✓ Compilation successful

# 5. Upload to Beetle
pixi run arduino-flash
# ✓ Upload successful

# 6. Interactive LED test
pixi run led-test
```

### Interactive LED Test Commands

```
i   - I2C scan (verify PCA9685 at 0x40)
0-9 - Test individual LED channels
a   - Test all LEDs (fade up/down)
f   - Fade test (sequential)
p   - Pulse test (synchronized)
b   - Breathing test (smooth)
o   - All off
n   - All on (max brightness)
v   - Show current brightness values
+/- - Adjust selected LED brightness
<>  - Select LED channel
s   - Status
h   - Help
```

### Manual End-to-End Test

1. **Power On**
   - Connect Beetle to USB
   - Connect external 5V power to PCA9685 V+/GND

2. **Check Serial Output**
   ```bash
   pixi run arduino-monitor
   # Should see:
   # === Pulsating Egg Sacs ===
   # Initializing...
   # I2C initialized
   # PCA9685 initialized (1000Hz)
   # Initializing egg sacs...
   # [MODE] Independent breathing
   ```

3. **Observe LEDs**
   - Each LED should breathe independently
   - Different brightness levels (maturity simulation)
   - Smooth fading (no flickering)
   - After 30s: brief synchronized pulse
   - Then back to independent breathing

4. **Test Pause Button**
   - Ground Pin 9 to GND
   - All LEDs should go to 50% brightness
   - Built-in LED (Pin 13) should turn ON
   - Release: LEDs resume breathing

5. **Long-Term Test**
   - Let run for 5+ minutes
   - Verify no crashes
   - Check for overheating
   - Monitor power consumption

---

## Diagnostic Commands

### Check I2C Connection
```bash
pixi run led-test
# In serial monitor, type: i
# Expected output:
# > I2C scan...
#   0x40 <- PCA9685!
```

### Check Serial Port
```bash
pixi run arduino-detect
# Expected output:
# Port         Protocol Type     Board Name FQBN Core
# /dev/ttyACM0 serial   Serial   Leonardo   arduino:avr:leonardo arduino:avr
```

### Kill Stuck Processes
```bash
pixi run kill-arduino
# Kills avrdude, arduino-cli processes
# Use when upload hangs
```

### Clean Build Artifacts
```bash
pixi run clean-all
# Removes build directories
# Use if compilation acting strange
```

---

## Advanced Diagnostics

### Memory Issues

**Symptom:** Sketch works initially, then crashes or behaves erratically

**Check Memory Usage:**
```bash
pixi run arduino-compile
# Look for: "RAM: X bytes" in output
# Leonardo has 2560 bytes RAM
# If using >80%, memory may be issue
```

**Fixes:**
- Code already uses F() macro for strings
- Reduce NUM_EGGS if memory tight
- Simplify breathing calculations

### Power Consumption

**Calculate Total Draw:**
```
Beetle: ~50mA
PCA9685: ~10mA
LEDs: (N × 20mA) at full brightness

Example for 8 LEDs:
Total = 50 + 10 + (8 × 20) = 220mA

Recommend power supply: 500mA+ for safety
```

**Test Power Draw:**
- Use multimeter in series with V+ line
- Monitor during different modes
- Check for voltage sag (should stay 5V ± 0.25V)

---

## When to Ask for Help

If you've tried all the above and still having issues:

1. **Document your setup:**
   - Beetle model and connection
   - PCA9685 board details
   - LED specifications (voltage, current)
   - Resistor values used
   - Power supply specs

2. **Gather diagnostic info:**
   ```bash
   pixi run status > status.txt
   pixi run integration-test 2>&1 | tee integration.txt
   pixi run beetle-test 2>&1 | tee beetle.txt
   ```

3. **Check similar projects:**
   - See `../twitching_body/` for working PCA9685 example
   - See `../window_spider_trigger/` for Beetle reference

4. **Review documentation:**
   - WIRING.md for connection verification
   - README.md for configuration options
   - Arduino code comments for behavior details

---

## Emergency Recovery

### Beetle Won't Respond

1. **Try reset button on Beetle**
2. **Disconnect power, wait 10 seconds, reconnect**
3. **Try different USB cable**
4. **Try different USB port**
5. **Check USB cable has data lines (not charge-only)**

### Can't Upload Code

1. **Kill all processes:** `pixi run kill-arduino`
2. **Close all serial monitors**
3. **Unplug Beetle, wait 5 seconds, plug back in**
4. **Try upload immediately after plugging in**
5. **Check permissions:** `pixi run fix-permissions`

### Strange Behavior After Code Change

1. **Clean build:** `pixi run clean-all`
2. **Recompile:** `pixi run arduino-compile`
3. **Upload fresh:** `pixi run arduino-upload`
4. **Reset Beetle** (press reset button after upload)

---

## Reference

**Key Files:**
- `README.md` - Setup and configuration
- `WIRING.md` - Hardware connections
- `CHANGELOG.md` - Version history
- `arduino/pulsating_eggs/pulsating_eggs.ino` - Production code
- `arduino/led_test/led_test.ino` - Test code

**Common Pixi Commands:**
- `pixi run status` - System overview
- `pixi run integration-test` - Full system test
- `pixi run beetle-test` - Hardware test
- `pixi run led-test` - Interactive LED testing
- `pixi run arduino-monitor` - Serial output
- `pixi run kill-arduino` - Kill stuck processes
