# Troubleshooting & Testing Guide

Quick diagnostics and solutions for common issues.

## Quick Diagnostic Sequence

Run these commands in order to diagnose system issues:

```bash
# 1. System overview
pixi run status

# 2. Integration test (auto-fixes video issues)
pixi run integration-test

# 3. Hardware test (if Beetle connected)
pixi run beetle-test

# 4. Interactive switch test
pixi run beetle-monitor-test
```

---

## Common Issues

### 1. Loading Screen Stuck

**Symptoms:** Browser shows "Loading videos..." forever

**Cause:** Missing `spider_jump1.mp4` video file

**Solution:**
```bash
# Auto-fix (creates symlinks if needed)
pixi run integration-test

# Or manually check
ls -la public/videos/spider_jump1.mp4
```

---

### 2. Arduino/Beetle Not Detected

**Symptoms:**
- `pixi run arduino-detect` shows no boards
- Upload fails with "port not found"
- Server can't connect to serial

**Solutions:**

**Check connection:**
```bash
pixi run arduino-detect
# Should show: Arduino Leonardo at /dev/ttyACM0
```

**Fix permissions (Linux):**
```bash
pixi run fix-permissions
# Then log out and log back in
```

**Manual check:**
```bash
ls -la /dev/ttyACM*
# Should show: crw-rw---- 1 root dialout
```

**Try different USB port/cable:**
- Some cables are charge-only
- Some USB hubs cause issues
- Connect directly to computer

---

### 3. Server Won't Start

**Symptoms:** `pixi run start` fails with "Port already in use"

**Solution:**
```bash
# Find and kill existing process
lsof -i :3000
kill <PID>

# Or use different port
PORT=3001 pixi run start
```

---

### 4. Switch Not Triggering

**Symptoms:**
- Press switch, nothing happens
- No "TRIGGER" in serial monitor
- LED doesn't light up

**Diagnosis:**
```bash
pixi run beetle-monitor-test
# Press switch and watch output
```

**Expected output when working:**
```
Switch pressed at: X seconds
TRIGGER
SWITCH_RELEASED
```

**Possible causes:**

#### a) Wrong wiring
- Verify: Pin 9 → Switch → GND
- Check connections are secure
- Try different wires

#### b) Cooldown active
- System has 3-second cooldown
- Wait 3+ seconds between presses
- During cooldown, you'll see: `COOLDOWN`

#### c) Switch reversed
If triggers on release instead of press:
- Swap switch terminals
- OR use NC (Normally Closed) terminal

#### d) Faulty switch
Test with multimeter:
- Should show continuity when pressed
- Open circuit when released

---

### 5. Video Won't Play

**Symptoms:** Video displays but doesn't play on trigger

**Check browser console** (F12):
```javascript
// Should see:
"✓ Video loaded"
"Video ready - paused at start, waiting for trigger"
"🕷️ Playing video!"  // When triggered
```

**Common causes:**
- Wrong video codec (use H.264 MP4)
- File permissions issue
- Browser autoplay policy

**Test:**
- Press `T` key in browser (manual trigger)
- Check server logs for trigger events

---

### 6. Compilation Fails

**Symptoms:** `pixi run arduino-compile` fails

**Check board type:**
```bash
cat arduino.config.json
# Should show: "fqbn": "arduino:avr:leonardo"
```

**Reinstall Arduino core:**
```bash
.pixi/bin/arduino-cli core uninstall arduino:avr
pixi run setup-arduino
```

---

### 7. Upload Fails

**Symptoms:** Compilation succeeds but upload fails

**Close serial monitors:**
```bash
# Find processes using serial port
lsof /dev/ttyACM0

# Kill them
kill <PID>
```

**Reset Beetle:**
- Press reset button
- Immediately run: `pixi run arduino-upload`

---

## Hardware Testing

### Automated Test

```bash
pixi run beetle-test
```

**Expected output:**
```
🧪 Beetle Hardware Test

1️⃣ Checking board detection...
✓ Beetle detected

2️⃣ Compiling code...
✓ Compilation successful

3️⃣ Uploading to Beetle...
✓ Upload successful

4️⃣ Checking serial connection...
✓ Arduino ready

✅ Automated tests complete!
```

### Interactive Switch Test

```bash
pixi run beetle-monitor-test
```

**Test actions:**
1. **Press switch** → Should see `TRIGGER` and LED turns ON
2. **Release switch** → Should see `SWITCH_RELEASED` and LED turns OFF
3. **Press again quickly** → Should see `COOLDOWN` (wait 3 sec)
4. **Wait 3+ sec, press** → Should see `TRIGGER` again

---

## Integration Testing

### Full System Test

```bash
pixi run integration-test
```

**What it tests:**
1. ✓ Video files exist (auto-creates symlinks if missing)
2. ✓ Server starts successfully
3. ✓ Arduino connection works
4. ✓ Web interface accessible
5. ✓ Static files served correctly

**Expected output:**
```
🧪 Spider Window Scare - Integration Test
==========================================

1️⃣ Checking video files...
  ✓ spider_jump1.mp4 exists

2️⃣ Testing server startup...
  ✓ Server started successfully

3️⃣ Checking Arduino connection...
  ✓ Arduino connected successfully

4️⃣ Testing web server accessibility...
  ✓ Web interface accessible at http://localhost:3000

5️⃣ Testing static file serving...
  ✓ client.js accessible
  ✓ style.css accessible
  ✓ videos/spider_jump1.mp4 accessible

✅ Integration tests complete!
```

---

## Manual End-to-End Test

### Step-by-Step Verification

1. **Flash Arduino:**
   ```bash
   pixi run arduino-flash
   ```
   Expected: "Upload successful"

2. **Start server:**
   ```bash
   pixi run deploy
   ```
   Expected: "Server running" and "Serial port opened"

3. **Open web browser:**
   Navigate to `http://localhost:3000`
   Expected: Video paused at first frame

4. **Test keyboard trigger:**
   Press `T` key
   Expected: Video plays from start to end, then resets and pauses

5. **Test physical switch:**
   Press Beetle switch
   Expected: Same as keyboard trigger

6. **Verify reset:**
   Video should be paused at first frame, ready for next trigger

---

## Diagnostic Commands

### System Status
```bash
pixi run status
```
Shows: Node.js version, packages, Arduino CLI, connected boards

### Arduino Detection
```bash
pixi run arduino-detect
```
Lists all connected Arduino boards

### Serial Monitor
```bash
pixi run arduino-monitor
```
Watch real-time messages from Beetle

### Video Check
```bash
pixi run check-videos
```
Lists video files and sizes

### Permissions Check
```bash
pixi run check-permissions
```
Verifies serial port access

---

## Logs

### Server Logs
Check terminal output from `pixi run start`

### Arduino Logs
```bash
cat /tmp/beetle_compile.log   # Compilation
cat /tmp/beetle_upload.log     # Upload
cat /tmp/server_test.log       # Server test
```

### Enable Debug Mode
```bash
DEBUG=* pixi run start
```

---

## Known Limitations

1. **Beetle LED**: Some Beetle variants don't have accessible Pin 13 LED. Visual feedback won't work, but triggering still functions.

2. **Serial Monitor Conflicts**: Can't upload while serial monitor is open. Close monitor before flashing.

3. **Autoplay Policies**: Some browsers block video autoplay. User may need to click page first.

4. **USB Power**: Beetle may not work on low-power USB hubs. Use direct computer connection.

5. **Long Wires**: Keep switch wires under 10 feet for reliability. Longer runs may cause false triggers.

---

## Getting More Help

1. Check system state: `pixi run status`
2. Run full diagnostic: `pixi run integration-test`
3. Check hardware: `pixi run beetle-test`
4. Review Arduino output: `pixi run arduino-monitor`
5. Check `BEETLE_PINOUT.md` for pin reference
6. Review `README.md` for configuration options

---

## Test Checklist for Future Agents

When testing this system, verify:

- [ ] `pixi run status` - Shows Node.js 20.x and packages installed
- [ ] `pixi run arduino-detect` - Beetle detected as Leonardo at /dev/ttyACM0
- [ ] `pixi run arduino-compile` - Compiles without errors
- [ ] `pixi run arduino-flash` - Uploads successfully
- [ ] `pixi run beetle-monitor-test` - Shows STARTUP, READY messages
- [ ] Press switch - Monitor shows TRIGGER and SWITCH_RELEASED
- [ ] `pixi run integration-test` - All 5 tests pass
- [ ] `pixi run deploy` - Server starts, serial connects
- [ ] Browser http://localhost:3000 - Video loads paused
- [ ] Press `T` - Video plays, resets, pauses
- [ ] Press switch - Same behavior as `T` key
- [ ] Wait 3 sec, press again - Works correctly

If all checkboxes pass: ✅ System fully operational
