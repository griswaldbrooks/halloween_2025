# Troubleshooting Guide

## Common Issues & Solutions

### Issue: Loading Screen Stuck / Videos Won't Load

**Symptoms:**
- Browser shows "Loading videos..." forever
- Page never displays
- Console shows video loading errors

**Cause:**
The web interface waits for BOTH videos to load:
- `idle_loop.mp4` (background loop)
- `spider_jumpscare.mp4` (jump scare)

If either is missing, the loading screen will hang.

**Solution 1: Automatic Fix**
```bash
pixi run integration-test
```
This will detect missing videos and create symlinks automatically.

**Solution 2: Manual Fix**
```bash
pixi run fix-videos
```
Creates `idle_loop.mp4` as a symlink to the jump scare video.

**Solution 3: Add Your Own Videos**
Place proper video files in `public/videos/`:
- `idle_loop.mp4` - Calm spider web loop or static scene
- `spider_jumpscare.mp4` - Jump scare video

**Verify Videos:**
```bash
pixi run check-videos
```

---

### Issue: Arduino Not Detected

**Symptoms:**
- `pixi run arduino-detect` shows no boards
- Upload fails with "port not found"
- Server can't connect to serial port

**Solution 1: Check Connection**
```bash
# Unplug and replug Arduino
# Wait 2 seconds
pixi run arduino-detect
```

**Solution 2: Check Permissions**
```bash
pixi run check-permissions
pixi run fix-permissions
# Then log out and back in
```

**Solution 3: Check Port**
```bash
ls -la /dev/ttyACM*
# Should show: crw-rw---- 1 root dialout
```

---

### Issue: Server Won't Start

**Symptoms:**
- `pixi run start` fails
- Error: "Port 3000 already in use"

**Solution 1: Check Port Usage**
```bash
lsof -i :3000
# Kill any existing process
kill <PID>
```

**Solution 2: Use Different Port**
```bash
PORT=3001 pixi run start
```

**Solution 3: Check Node Modules**
```bash
pixi run clean-all
pixi run setup
```

---

### Issue: Switch Not Triggering

**Symptoms:**
- Press switch, nothing happens
- No "TRIGGER" message in serial monitor
- LED doesn't light up

**Diagnosis:**
```bash
pixi run beetle-monitor-test
# Press switch while watching serial output
```

**Possible Causes:**

#### 1. Wrong Pin Configuration
Check Arduino code uses Pin 9:
```bash
grep SWITCH_PIN arduino/motion_trigger/motion_trigger.ino
# Should show: const int SWITCH_PIN = 9;
```

**Fix:** Update pin in code and re-flash

#### 2. Loose Wiring
- Check switch is connected to Pin 9 and GND
- Verify connections are secure
- Try different wires

#### 3. Switch Direction Reversed
If switch triggers on release instead of press:

**Fix 1:** Swap switch wire terminals
**Fix 2:** Use NC (Normally Closed) terminal
**Fix 3:** Edit code - change `LOW` to `HIGH` in line 75

#### 4. Switch is Faulty
Test switch with multimeter:
- Should show continuity when pressed
- Open circuit when released

#### 5. Cooldown Active
The system has a 3-second cooldown. Wait 3+ seconds between presses.

---

### Issue: Compilation Fails

**Symptoms:**
- `pixi run arduino-compile` fails
- Errors about missing pins or libraries

**Solution 1: Verify Board Type**
```bash
# Check arduino.config.json
cat arduino.config.json
# Should show: "fqbn": "arduino:avr:leonardo"
```

**Solution 2: Reinstall Arduino Core**
```bash
.pixi/bin/arduino-cli core uninstall arduino:avr
pixi run setup-arduino
```

**Solution 3: Clean and Rebuild**
```bash
pixi run arduino-clean
pixi run arduino-compile
```

---

### Issue: Upload Fails

**Symptoms:**
- Compilation succeeds but upload fails
- Error: "ser_open(): can't open device"

**Solution 1: Close Serial Monitors**
Any program using the serial port will block uploads:
```bash
# Find processes using /dev/ttyACM0
lsof /dev/ttyACM0
# Kill them
kill <PID>
```

**Solution 2: Reset Arduino**
- Press reset button on Beetle
- Immediately run: `pixi run arduino-upload`

**Solution 3: Try Different USB Port/Cable**
- Some cables are charge-only
- Some USB hubs cause issues
- Connect directly to computer

---

### Issue: Pixi Command Not Found

**Symptoms:**
- `pixi: command not found`
- Can't run pixi commands

**Solution: Install Pixi**
```bash
curl -fsSL https://pixi.sh/install.sh | bash
# Then restart terminal or run:
source ~/.bashrc
```

---

### Issue: Status Command Fails

**Symptoms:**
- `pixi run status` gives parsing error
- Old pixi.toml version

**Solution: Already Fixed!**
This was fixed in the 2025-10-14 evening update. Update your code:
```bash
git pull origin main
```

---

### Issue: Video Plays But No Sound

**Symptoms:**
- Video displays correctly
- No audio on jump scare

**This is Normal:**
Videos are set to `muted` in the HTML to allow autoplay. Browsers block autoplay with audio.

**To Enable Sound:**
Edit `public/index.html`, remove `muted` from video tags:
```html
<!-- Before -->
<video id="scare-video" muted playsinline>

<!-- After -->
<video id="scare-video" playsinline>
```

**Note:** User will need to interact with page first (click anywhere) before video with sound will play.

---

## Diagnostic Commands

### Quick System Check
```bash
pixi run status
```
Shows: Node.js, packages, Arduino CLI, connected boards

### Full Hardware Test
```bash
pixi run beetle-test
```
Automated 5-step hardware verification

### Full Integration Test
```bash
pixi run integration-test
```
Tests videos, server, web interface, and file serving

### Video Check
```bash
pixi run check-videos
```
Lists all video files and their sizes

### Arduino Serial Output
```bash
pixi run arduino-monitor
```
Watch real-time messages from Arduino

---

## Test Sequence

If nothing works, run this complete diagnostic sequence:

```bash
# 1. System status
pixi run status

# 2. Check videos
pixi run integration-test

# 3. Hardware test
pixi run beetle-test

# 4. Interactive switch test
pixi run beetle-monitor-test
# (Press switch, verify TRIGGER message)

# 5. Full deployment
pixi run deploy
# (Open http://localhost:3000, press 'T' to test)
```

---

## Getting Help

### Check Logs

**Server logs:**
Check terminal output from `pixi run start`

**Arduino compilation logs:**
```bash
cat /tmp/beetle_compile.log
```

**Arduino upload logs:**
```bash
cat /tmp/beetle_upload.log
```

**Server test logs:**
```bash
cat /tmp/server_test.log
```

### Documentation

- **README.md** - Main documentation
- **BEETLE_TEST.md** - Hardware testing
- **BEETLE_PINOUT.md** - Pin reference
- **QUICK_REFERENCE.md** - Command cheat sheet
- **FIXES_SUMMARY.md** - Recent fixes

### Debug Mode

Enable detailed logging:
```bash
DEBUG=* pixi run start
```

---

## Known Limitations

1. **Beetle LED (Pin 13):** Some Beetle variants may not have accessible LED. Visual feedback won't work, but triggering still functions.

2. **Serial Monitor Conflicts:** Can't upload while serial monitor is open. Close monitor before flashing.

3. **Autoplay Policies:** Some browsers block video autoplay. User may need to click page first.

4. **USB Power:** Beetle may not work on low-power USB hubs. Use direct computer connection.

5. **Long Wires:** Keep switch wires under 10 feet for reliability. Longer runs may cause false triggers.

---

**Last Updated:** 2025-10-14
