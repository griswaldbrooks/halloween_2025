# Troubleshooting Guide

Quick diagnostic and problem-solving guide for Twitching Body Animatronic.

---

## Quick Diagnostic Sequence

Run these commands in order to identify issues:

```bash
# 1. System check
pixi run status

# 2. Integration test
pixi run integration-test

# 3. Hardware test (if Beetle connected)
pixi run beetle-test

# 4. Monitor behavior output
pixi run arduino-monitor
```

---

## Common Issues

### 1. Servos Not Moving At All

**Symptoms:**
- Code uploads successfully
- No servo movement
- LED may be blinking normally

**Likely Causes:**

#### A. No External Power
**Check:**
```bash
# Is 5V power supply connected and ON?
# Are servo red wires connected to 5V+?
# Is power supply rated for 2-3A?
```

**Fix:**
- Connect external 5V power supply (NOT from Beetle)
- Verify power supply is turned ON
- Use power supply with 2-3A capacity minimum

#### B. Missing Common Ground
**Check:**
```bash
# Is ground shared between Beetle and servo power?
```

**Fix:**
```
Power Supply GND → All servo brown/black wires
                 → Beetle GND pin
                 (Must be connected together!)
```

#### C. Incorrect Wiring
**Check:**
```bash
pixi run arduino-monitor
# Do you see state changes printed?
```

**Fix:**
- Verify signal wires: Pin 9 (head), Pin 10 (left arm), Pin 11 (right arm)
- Check servo connectors are fully seated
- Verify servo color codes (orange/yellow = signal, red = power, brown/black = ground)

---

### 2. Arduino Not Detected

**Symptoms:**
```bash
pixi run arduino-detect
# Shows no boards or empty list
```

**Fixes:**

#### Try 1: Check USB Connection
```bash
lsusb
# Should see "Arduino" or device ID 2341
```

#### Try 2: Check Permissions
```bash
pixi run check-permissions
```

If you see "User NOT in dialout group":
```bash
pixi run fix-permissions
# Then log out and log back in
```

#### Try 3: Check Port
```bash
ls -la /dev/ttyACM*
# Should see /dev/ttyACM0 or similar
```

#### Try 4: Reconnect Beetle
1. Unplug Beetle from USB
2. Wait 5 seconds
3. Plug back in
4. Run `pixi run arduino-detect`

---

### 3. Upload Fails

**Symptoms:**
```
Error: opening serial port
Error: uploading sketch
avrdude: can't open device "/dev/ttyACM0": No such file or directory
```

**Fixes:**

#### Try 1: Kill Stuck Arduino Processes
If upload hangs or CPU usage is high:
```bash
pixi run kill-arduino
# Then retry upload
pixi run arduino-flash
```

#### Try 2: Close Serial Monitors
```bash
pkill -f "arduino-cli monitor"
pixi run arduino-flash
```

#### Try 2: Press Reset During Upload
1. Start upload: `pixi run arduino-flash`
2. Press Beetle's reset button when you see "Uploading..."
3. Release after 1 second

#### Try 3: Check Port Access
```bash
ls -la /dev/ttyACM0
# Should NOT show lock files
```

---

### 4. High CPU Usage / Stuck Processes

**Symptoms:**
- System slow or unresponsive
- High CPU usage (check with `top` or `htop`)
- `avrdude` or `arduino-cli` processes consuming CPU
- Failed upload left processes running

**Likely Cause:**
Upload attempted to wrong port (e.g., trying `/dev/ttyACM0` when Beetle is on `/dev/ttyACM1`)

**Quick Fix:**
```bash
pixi run kill-arduino
```

This kills:
- Stuck `avrdude` processes (the actual programmer)
- Hung `arduino-cli upload` processes
- Serial discovery processes
- Monitor processes

**Manual Fix:**
```bash
# Kill specific process by PID (from `ps aux | grep arduino`)
kill -9 <PID>

# Or kill all Arduino processes
pkill -9 avrdude
pkill -f "arduino-cli"
```

**Prevention:**
The auto-detection fix in pixi.toml should prevent this, but if you manually specify a port, ensure it matches the actual Beetle port.

---

### 5. Jerky or Erratic Movement

**Symptoms:**
- Servos move but jitter or shake
- Inconsistent movement
- Servos make buzzing noise

**Likely Causes:**

#### A. Insufficient Power
**Fix:**
- Use 5V power supply with **2-3A capacity**
- Check voltage at servos (should be ~5V)
- Don't power servos from Beetle's 5V pin

#### B. Shared Power/Ground Issues
**Fix:**
- Ensure thick ground wire (18-22 AWG)
- Use star ground topology (all grounds to one point)
- Add 100-1000µF capacitor across power supply

#### C. Movement Speed Too Fast
**Fix:**
Edit `arduino/twitching_servos/twitching_servos.ino`:
```cpp
const int SLOW_MOVEMENT_DELAY = 50;   // Increase for slower (was 30)
const int QUICK_MOVEMENT_DELAY = 10;  // Increase for less jerky (was 5)
```

Then:
```bash
pixi run arduino-flash
```

---

### 5. Servos Move Too Much/Too Little

**Symptoms:**
- Movement range is incorrect
- Servos hit mechanical limits
- Movements too subtle or too extreme

**Fixes:**

#### Adjust Movement Ranges
Edit `arduino/twitching_servos/twitching_servos.ino`:

```cpp
// For less movement:
const int SLOW_MOVEMENT_RANGE = 5;    // was 8
const int QUICK_JERK_RANGE = 15;      // was 25

// For more movement:
const int SLOW_MOVEMENT_RANGE = 12;   // was 8
const int QUICK_JERK_RANGE = 35;      // was 25
```

#### Adjust Rest Positions
If servo is hitting limits at rest:
```cpp
const int HEAD_REST = 100;        // Adjust as needed (0-180)
const int LEFT_ARM_REST = 85;
const int RIGHT_ARM_REST = 95;
```

Then:
```bash
pixi run arduino-flash
```

---

### 6. Behavior Cycles Wrong Timing

**Symptoms:**
- Too much still time
- Not enough scare jerks
- Cycles too predictable

**Fixes:**

Edit `arduino/twitching_servos/twitching_servos.ino`:

```cpp
const Cycle cycles[NUM_CYCLES] = {
  // {still_ms, slow_ms, jerk_ms}
  {8000, 3000, 200},   // Cycle 1
  {12000, 2500, 300},  // Cycle 2
  // ... modify timing as needed
};
```

**Examples:**

More frequent scares:
```cpp
{5000, 2000, 300},   // 5s still, 2s slow, 0.3s jerk
```

Longer still periods:
```cpp
{20000, 3000, 200},  // 20s still, 3s slow, 0.2s jerk
```

---

### 7. No Serial Output

**Symptoms:**
```bash
pixi run arduino-monitor
# Shows blank or no data
```

**Fixes:**

#### Try 1: Check Baud Rate
The sketch uses 9600 baud. Monitor should auto-detect, but verify:
```bash
pixi run arduino-monitor
# Should show serial data
```

#### Try 2: Re-flash Code
```bash
pixi run arduino-flash
pixi run arduino-monitor
# Should see "=== Twitching Body Animatronic ===" on startup
```

#### Try 3: Press Reset on Beetle
While monitor is running, press Beetle reset button. Should see startup messages.

---

### 8. Compilation Errors

**Symptoms:**
```
Error compiling sketch
```

**Fixes:**

#### Try 1: Re-run Setup
```bash
pixi run setup
# Re-installs Arduino core
```

#### Try 2: Clean and Rebuild
```bash
pixi run clean-all
pixi run setup
pixi run arduino-compile
```

#### Try 3: Check Sketch Syntax
```bash
# Look for missing semicolons, braces, etc.
cat arduino/twitching_servos/twitching_servos.ino
```

---

## Hardware Testing Checklist

Use this checklist when first setting up:

```markdown
Power:
- [ ] External 5V power supply connected
- [ ] Power supply rated 2-3A or higher
- [ ] Power supply turned ON
- [ ] Voltage measured ~5V at servo red wires

Ground:
- [ ] All servo brown/black wires connected together
- [ ] Servo ground connected to Beetle GND
- [ ] Common ground point secure (no loose wires)

Servos:
- [ ] Head servo signal → Beetle Pin 9
- [ ] Left arm servo signal → Beetle Pin 10
- [ ] Right arm servo signal → Beetle Pin 11
- [ ] All servo connectors fully seated

Arduino:
- [ ] Beetle connected to computer via USB
- [ ] `pixi run arduino-detect` shows Beetle
- [ ] `pixi run arduino-compile` succeeds
- [ ] `pixi run arduino-upload` succeeds

Behavior:
- [ ] `pixi run arduino-monitor` shows state changes
- [ ] Built-in LED blinks during states
- [ ] Servos move during slow movement state
- [ ] Servos jerk during quick jerk state
- [ ] Servos return to rest during still state
```

---

## Serial Output Reference

### Normal Output

```
=== Twitching Body Animatronic ===
Initializing servos...
Servos initialized at rest positions
Starting behavior cycle...

>>> Starting cycle 1 of 5

STATE: Still for 8.0 seconds
STATE: Slow movement for 3.0 seconds (targets: H:95 LA:83 RA:97)
STATE: QUICK JERK for 200 ms (targets: H:110 LA:75 RA:105)
>>> Starting cycle 2 of 5
...
```

### Expected Patterns
- Startup messages appear once
- Cycle announcements every 10-30 seconds
- State changes follow pattern: Still → Slow → Jerk → Still
- Targets show position goals (0-180 degrees)

---

## Emergency Recovery

### System Won't Respond

1. **Unplug everything**
   - Disconnect USB from Beetle
   - Disconnect servo power supply
   - Wait 10 seconds

2. **Verify wiring**
   - Check all connections
   - Look for shorts or loose wires
   - Verify ground connections

3. **Test incrementally**
   ```bash
   # Just Beetle, no servos
   pixi run beetle-test

   # Flash code
   pixi run arduino-flash

   # Monitor output
   pixi run arduino-monitor

   # Connect servos one at a time
   # (Power off between connections)
   ```

4. **Re-flash from scratch**
   ```bash
   pixi run clean-all
   pixi run setup
   pixi run arduino-flash
   ```

---

## Getting Help

If issues persist:

1. **Collect diagnostic info:**
   ```bash
   pixi run status > diagnosis.txt
   pixi run integration-test >> diagnosis.txt
   pixi run arduino-detect >> diagnosis.txt
   ```

2. **Check wiring photo** against README.md wiring diagram

3. **Test servos individually** with simple sketch:
   ```cpp
   #include <Servo.h>
   Servo test;
   void setup() { test.attach(9); }
   void loop() { test.write(90); delay(1000); }
   ```

4. **Review recent changes** to code/wiring
