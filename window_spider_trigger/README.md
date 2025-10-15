# Window Spider Trigger

Motion-activated spider jump scare for the Spider Web Tunnel (Chamber 2).

> **🚀 Using Pixi**: This project uses [Pixi](https://pixi.sh/) for reproducible development environments. See [PIXI_GUIDE.md](PIXI_GUIDE.md) for detailed workflow.

## Overview

This project uses an Arduino with a momentary switch to trigger a jump scare video on a computer display. When a guest picks up an object (activating the switch), the Arduino sends a signal via serial to a JavaScript/Node.js application that plays a fullscreen spider attack video.

**Multi-machine ready**: Pixi ensures identical setup on any machine!

## Hardware Requirements

- Arduino board (Leonardo, Uno, Nano, Mega, etc.)
- Momentary switch (Normally Open) - triggered when guest picks up object
- USB cable (Arduino to computer)
- Computer/monitor for video display
- Optional: Jumper wires (if switch has flying leads)

## Wiring Diagram

```
┌─────────────────────────────────────────────────────┐
│                  Arduino Leonardo                    │
│                                                      │
│                         ┌────┐                      │
│                         │USB │  ← To Computer       │
│                         └────┘                      │
│                                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │  Pin 13 (Built-in LED) ●  (Visual Feedback) │  │
│  │                                               │  │
│  │  Pin 2  ●────────────────────┐               │  │
│  │                               │               │  │
│  │  GND    ●─────────┐           │               │  │
│  └───────────────────┼───────────┼───────────────┘  │
└────────────────────────┼───────────┼──────────────────┘
                         │           │
                         │           │
                    ┌────┴───────────┴────┐
                    │  Momentary Switch   │
                    │   (Normally Open)   │
                    │                     │
                    │  ┌─────────────┐   │
                    │  │   _____     │   │
                    │  │  (     )    │   │  ← Attach to object
                    │  │   ¯¯¯¯¯     │   │    guest picks up
                    │  └─────────────┘   │
                    └─────────────────────┘

Connection Details:
  • Switch Terminal 1 → Arduino Pin 2
  • Switch Terminal 2 → Arduino GND

  (No external resistor needed - uses internal pull-up)
```

**How it works:**
1. When switch is **open** (not pressed): Pin 2 reads HIGH (pulled up internally)
2. When switch is **closed** (pressed/object lifted): Pin 2 reads LOW (connected to GND)
3. Arduino detects LOW→HIGH transition and sends TRIGGER
4. Built-in LED (Pin 13) lights up when triggered

**Switch Trigger Ideas:**
- Attach to object on pedestal (lifts = trigger)
- Hidden under fake spider (presses when touched)
- Attached to web strand (pulls when disturbed)
- Pressure plate under fake cocoon

## Software Requirements

### Arduino Side
- `arduino-cli` (official Arduino command-line tool)
- No IDE or PlatformIO needed!

### Computer Side (Node.js)
- Node.js v16+
- npm packages:
  - `serialport` - Serial communication
  - `express` - Web server
  - `socket.io` - Real-time communication

## Quick Start (Pixi - Recommended)

```bash
# 1. Install pixi (one-time, if not already installed)
curl -fsSL https://pixi.sh/install.sh | bash

# 2. Setup project (installs Node.js, arduino-cli, dependencies)
pixi install
pixi run setup

# 3. Flash Arduino
pixi run arduino-flash

# 4. Start server
pixi run start

# 5. Open http://localhost:3000
```

**Done!** 🎉 See [PIXI_GUIDE.md](PIXI_GUIDE.md) for all commands.

## Alternative Installation (Manual)

<details>
<summary>Click to expand manual installation steps</summary>

### 1. Install arduino-cli

**Linux:**
```bash
curl -fsSL https://raw.githubusercontent.com/arduino/arduino-cli/master/install.sh | sh
export PATH=$PATH:$HOME/bin
```

**Initialize:**
```bash
arduino-cli config init
arduino-cli core update-index
arduino-cli core install arduino:avr
```

### 2. Install Node.js dependencies

```bash
cd window_spider_trigger
npm install
```

</details>

## Arduino Development Workflow

### Compile the sketch
```bash
arduino-cli compile --fqbn arduino:avr:uno arduino/motion_trigger.ino
```

### Find your Arduino port
```bash
arduino-cli board list
```

### Upload to Arduino
```bash
arduino-cli upload -p /dev/ttyUSB0 --fqbn arduino:avr:uno arduino/motion_trigger.ino
```

### Monitor serial output (debugging)
```bash
arduino-cli monitor -p /dev/ttyUSB0 -c baudrate=9600
```

## Usage

### Pixi Workflow (Recommended)

```bash
# Flash Arduino and start server in one command
pixi run deploy

# Or separately:
pixi run arduino-flash    # Upload code to Arduino
pixi run start           # Start web server

# Development mode (auto-reload)
pixi run dev

# Monitor Arduino serial output
pixi run arduino-monitor

# Check system status
pixi run status
```

See [PIXI_GUIDE.md](PIXI_GUIDE.md) for complete command reference.

### Alternative Methods

<details>
<summary>Using Make</summary>

```bash
make flash      # Flash Arduino
npm start       # Start server
make monitor    # Serial monitor
```
</details>

<details>
<summary>Manual arduino-cli</summary>

```bash
arduino-cli compile --fqbn arduino:avr:leonardo arduino/motion_trigger/motion_trigger.ino
arduino-cli upload -p /dev/ttyACM0 --fqbn arduino:avr:leonardo arduino/motion_trigger/motion_trigger.ino
npm start
```
</details>

Open browser to `http://localhost:3000`. Press `F` for fullscreen.

## Configuration

### Arduino Settings
Edit `arduino/motion_trigger/motion_trigger.ino`:
- `SWITCH_PIN`: Switch input pin (default: 2)
- `DEBOUNCE_DELAY`: Switch debounce time (default: 50ms)
- `COOLDOWN_DELAY`: Cooldown between triggers (default: 3000ms)

### Server Settings
Create `.env` file (or use environment variables):
```bash
PORT=3000
SERIAL_PORT=auto          # Auto-detect Arduino (recommended)
# SERIAL_PORT=/dev/ttyACM0  # Or specify exact port
BAUD_RATE=9600
```

**Auto-detection**: The server automatically finds your Arduino by vendor ID. If the device changes from `/dev/ttyACM0` to `/dev/ttyACM1`, it will still be detected!

### Arduino Board Configuration
Edit `arduino.config.json` for your board:
```json
{
  "board": {
    "fqbn": "arduino:avr:leonardo",  // Change for different boards
    "port": "/dev/ttyACM0"
  }
}
```

Common FQBNs:
- Arduino Leonardo: `arduino:avr:leonardo`
- Arduino Uno: `arduino:avr:uno`
- Arduino Mega: `arduino:avr:mega`
- Arduino Nano: `arduino:avr:nano`

Place your video files in `public/videos/`:
- `idle_loop.mp4` - Background loop
- `spider_jumpscare.mp4` - Jump scare

## File Structure

```
window_spider_trigger/
├── README.md              # This file
├── package.json           # Node.js dependencies
├── server.js              # Node.js server with serial communication
├── arduino/
│   └── motion_trigger.ino # Arduino sketch
└── public/
    ├── index.html         # Web interface
    ├── style.css          # Styling
    ├── client.js          # Client-side JavaScript
    └── videos/
        ├── idle_loop.mp4          # Background loop video
        └── spider_jumpscare.mp4   # Jump scare video
```

## Troubleshooting

### Arduino not found
```bash
# Check USB connection
arduino-cli board list

# Check permissions (Linux)
sudo usermod -a -G dialout $USER
# Log out and back in
```

### Serial port permission denied
```bash
sudo chmod 666 /dev/ttyUSB0
# Or add user to dialout group (permanent fix)
sudo usermod -a -G dialout $USER
```

### Video won't play
- Check video codec (H.264 MP4 works best in browsers)
- Verify file path in `public/videos/`
- Check browser console for errors (F12)

### Motion sensor too sensitive
- Adjust potentiometers on PIR sensor
- Increase `DEBOUNCE_DELAY` in Arduino code
- Reduce sensor range/sensitivity

## Testing Without Hardware

### Test Arduino serial output
```bash
# In one terminal, monitor serial
arduino-cli monitor -p /dev/ttyUSB0 -c baudrate=9600

# Wave hand in front of PIR sensor
# Should see: "TRIGGER" messages
```

### Test Node.js without Arduino
Edit `server.js` to simulate triggers:
```javascript
// Comment out serial port code
// Add test trigger
setInterval(() => {
  io.emit('trigger-video');
}, 10000); // Trigger every 10 seconds
```

## arduino-cli Quick Reference

```bash
# List connected boards
arduino-cli board list

# Search for libraries
arduino-cli lib search <name>

# Install library
arduino-cli lib install <name>

# List installed cores
arduino-cli core list

# Compile + Upload in one command
arduino-cli compile --upload -p /dev/ttyUSB0 --fqbn arduino:avr:uno sketch.ino

# Get board details
arduino-cli board details -b arduino:avr:uno

# Clean build files
rm -rf build/
```

## Performance Notes

- PIR sensors typically have a ~3 second warmup time on power-up
- Cooldown period prevents multiple triggers for same person
- Video should be pre-loaded for instant playback
- Use H.264 codec for best browser compatibility

## Future Enhancements

- [ ] Add manual trigger button (for testing)
- [ ] Log trigger events with timestamps
- [ ] Multiple video variations (random selection)
- [ ] Sound effects synchronized with video
- [ ] Remote control via web interface
- [ ] Battery backup for Arduino during power issues

## License

Created for Halloween 2025 Spider Haunted House project.

## Hardware-in-the-Loop Testing

For DFRobot Beetle users, automated hardware tests are available:

```bash
# Run automated test suite
pixi run beetle-test

# Run interactive switch test
pixi run beetle-monitor-test
```

See `BEETLE_TEST.md` and `BEETLE_PINOUT.md` for complete Beetle-specific documentation.

## Related Files

See main project documentation:
- `/PROJECT_PLAN.md` - Full haunted house design
- `/LAYOUT_MAP.txt` - Chamber layouts and wiring
- `/SHOPPING_LIST.md` - Parts and materials
- `BEETLE_TEST.md` - Hardware testing guide
- `BEETLE_PINOUT.md` - Beetle pin reference
