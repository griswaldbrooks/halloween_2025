# Quick Start Guide

## Your Setup
- **Board**: Arduino Leonardo
- **Port**: `/dev/ttyACM0` (auto-detected)
- **FQBN**: `arduino:avr:leonardo`
- **Trigger**: Momentary switch on Pin 2 (when guest picks up object)

## Fastest Way to Get Running

```bash
# 1. Install dependencies
npm install

# 2. Flash Arduino (using Make)
make flash

# 3. Start server (in new terminal)
npm start

# 4. Open browser
# Navigate to: http://localhost:3000
```

## Make Commands

```bash
make help       # Show all commands
make detect     # Detect connected Arduinos
make compile    # Compile Arduino code
make upload     # Upload to Arduino
make flash      # Compile + upload
make monitor    # Serial monitor
make clean      # Clean build files
```

## Pixi Commands (if using pixi)

```bash
pixi run setup           # Install everything
pixi run arduino-detect  # Find Arduinos
pixi run arduino-flash   # Flash Arduino
pixi run start          # Start server
pixi run deploy         # Flash + start (combined)
pixi run beetle-test     # Automated Beetle hardware test
pixi run beetle-monitor-test  # Interactive switch test
```

## Testing

### Test Serial Connection
```bash
# Terminal 1: Monitor Arduino output
make monitor

# Terminal 2: Press the switch (or lift object)
# You should see "TRIGGER" messages
```

### Test Without Arduino
Edit `server.js` and uncomment the test trigger section to simulate motion events.

## Troubleshooting

### Can't find Arduino
```bash
# Check connection
make detect

# Check permissions
ls -la /dev/ttyACM0
# Should show: crw-rw---- 1 root dialout

# Add yourself to dialout group (one-time)
sudo usermod -a -G dialout $USER
# Then log out and back in
```

### Port Changed
No problem! The server auto-detects Arduino by vendor ID.
- `/dev/ttyACM0` → `/dev/ttyACM1` ✓ Still works
- Unplug/replug ✓ Still works

You can also manually override:
```bash
SERIAL_PORT=/dev/ttyACM1 npm start
```

### Videos won't play
1. Check files exist: `ls public/videos/`
2. Check format: Should be `.mp4` with H.264 codec
3. Check browser console (F12) for errors

## Keyboard Shortcuts (in browser)

- `F` - Toggle fullscreen
- `S` - Toggle status overlay
- `T` - Manual test trigger
- `ESC` - Exit fullscreen

## Quick Reference

| Task | Command |
|------|---------|
| Flash Arduino | `make flash` |
| Start Server | `npm start` |
| Monitor Serial | `make monitor` |
| Test Trigger | Press `T` in browser |
| Detect Board | `make detect` |
| Full Deploy | `pixi run deploy` |
