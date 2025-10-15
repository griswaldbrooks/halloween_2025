# Spider Window Scare - Beetle Trigger System

Motion-activated spider jump scare for Halloween 2025 haunted house (Chamber 2: Spider Web Tunnel).

## Quick Start

```bash
# First time setup
pixi install
pixi run setup

# Flash Arduino Beetle
pixi run arduino-flash

# Start server
pixi run deploy

# Open http://localhost:3000
```

Press `T` to test trigger manually, or connect physical Beetle switch.

---

## Hardware

### Components
- **DFRobot Beetle** (DFR0282) - Leonardo-compatible Arduino
- **Momentary switch** (Normally Open) - Trigger when guest lifts object
- **USB cable** - Beetle to computer
- **Computer/monitor** - Video display

### Wiring

```
Beetle Pin 9 ──┬── Switch Terminal 1
               │
Beetle GND  ───┴── Switch Terminal 2

(Internal pull-up resistor used - no external resistor needed)
```

**Pin Reference:**
- Pin 9: Switch input (INPUT_PULLUP)
- Pin 13: Built-in LED (visual feedback)
- GND: Ground

See `BEETLE_PINOUT.md` for complete pin details.

---

## Software

### Video Behavior
1. **Load**: Video pauses at first frame
2. **Trigger**: Beetle switch press → video plays from start
3. **End**: Video resets to beginning and pauses
4. **Ready**: Waiting for next trigger

### Tech Stack
- **Arduino**: C++ sketch with switch debouncing and cooldown
- **Node.js**: Express server with Socket.IO
- **Web**: HTML5 video with JavaScript playback control
- **Pixi**: Reproducible environment management

---

## Installation

### Prerequisites
```bash
# Install Pixi (one-time)
curl -fsSL https://pixi.sh/install.sh | bash
```

### Setup
```bash
cd window_spider_trigger

# Install all dependencies (Node.js, arduino-cli, packages)
pixi install
pixi run setup

# Verify installation
pixi run status
```

### Video Files
Place video file in `public/videos/`:
- `spider_jump1.mp4` - The jump scare video

---

## Usage

### Daily Workflow

```bash
# Flash Arduino (when code changes)
pixi run arduino-flash

# Start server (development with auto-reload)
pixi run dev

# Or start production server
pixi run start

# Full deployment (flash + start)
pixi run deploy
```

### Testing

```bash
# System status check
pixi run status

# Integration test (full system verification)
pixi run integration-test

# Hardware test (Beetle detection and upload)
pixi run beetle-test

# Interactive switch test (manual testing)
pixi run beetle-monitor-test

# Arduino serial monitor
pixi run arduino-monitor
```

### Web Interface

Open `http://localhost:3000`

**Keyboard shortcuts:**
- `F` - Fullscreen
- `S` - Toggle status overlay
- `T` - Manual test trigger
- `ESC` - Exit fullscreen

---

## Configuration

### Environment Variables

Create `.env` (optional - auto-detection works well):
```bash
PORT=3000
SERIAL_PORT=auto          # Auto-detect by vendor ID
BAUD_RATE=9600
ARDUINO_VENDOR_ID=2341
```

### Arduino Settings

Edit `arduino/motion_trigger/motion_trigger.ino`:
```cpp
const int SWITCH_PIN = 9;         // Switch input pin
const long DEBOUNCE_DELAY = 50;   // Debounce time (ms)
const long COOLDOWN_DELAY = 3000; // Cooldown between triggers (ms)
```

### Board Configuration

Edit `arduino.config.json`:
```json
{
  "board": {
    "fqbn": "arduino:avr:leonardo",
    "port": "/dev/ttyACM0"
  }
}
```

---

## Troubleshooting

### Loading Screen Stuck

**Cause**: Missing video file
**Fix**:
```bash
pixi run integration-test  # Auto-creates symlinks
```

### Arduino Not Detected

**Check connection**:
```bash
pixi run arduino-detect
```

**Fix permissions** (Linux):
```bash
pixi run fix-permissions
# Then log out and back in
```

### Port Already in Use

```bash
# Kill existing server
pkill -f "node server.js"

# Or use different port
PORT=3001 pixi run start
```

### Switch Not Triggering

1. **Check wiring**: Pin 9 and GND connected
2. **Test Arduino**:
   ```bash
   pixi run beetle-monitor-test
   # Press switch - should see "TRIGGER"
   ```
3. **Check cooldown**: Wait 3+ seconds between presses

See `TROUBLESHOOTING.md` for complete guide.

---

## Common Pixi Commands

| Command | Description |
|---------|-------------|
| `pixi run status` | System status check |
| `pixi run deploy` | Flash Arduino + start server |
| `pixi run arduino-flash` | Upload code to Beetle |
| `pixi run arduino-monitor` | Serial monitor |
| `pixi run start` | Start server |
| `pixi run dev` | Development mode (auto-reload) |
| `pixi run integration-test` | Full system test |
| `pixi run beetle-test` | Hardware verification |
| `pixi run fix-videos` | Fix missing video symlinks |
| `pixi run fix-permissions` | Fix Arduino permissions |
| `pixi run clean-all` | Clean build artifacts |

---

## Development

### File Structure

```
window_spider_trigger/
├── README.md              # This file
├── TROUBLESHOOTING.md     # Problem-solving guide
├── BEETLE_PINOUT.md       # Beetle pin reference
├── CHANGELOG.md           # Version history
│
├── arduino/
│   └── motion_trigger/
│       └── motion_trigger.ino  # Arduino code
│
├── public/
│   ├── index.html         # Web interface
│   ├── client.js          # Client JavaScript
│   ├── style.css          # Styling
│   └── videos/
│       └── spider_jump1.mp4
│
├── scripts/
│   ├── integration_test.sh      # System integration test
│   ├── beetle_test.sh           # Hardware test
│   └── beetle_monitor_test.sh   # Interactive test
│
├── server.js              # Node.js server
├── pixi.toml              # Pixi configuration
├── package.json           # Node dependencies
├── arduino.config.json    # Arduino board config
└── .env                   # Environment variables (optional)
```

### Arduino Serial Protocol

**Arduino → Computer:**
- `STARTUP` - Arduino starting up
- `READY` - Ready for triggers
- `TRIGGER` - Switch pressed (cooldown OK)
- `SWITCH_RELEASED` - Switch released
- `COOLDOWN` - Switch pressed during cooldown

**Computer → Arduino (optional):**
- `STATUS` - Request current state
- `RESET` - Reset cooldown timer
- `TEST` - Manual trigger

### Adding New Features

1. **Modify Arduino code**: Edit `arduino/motion_trigger/motion_trigger.ino`
2. **Compile**: `pixi run arduino-compile`
3. **Upload**: `pixi run arduino-flash`
4. **Test**: `pixi run beetle-monitor-test`
5. **Document**: Update this README and CHANGELOG.md

---

## Multi-Machine Deployment

Pixi ensures identical environments across machines:

```bash
# Machine 1 (development)
git push

# Machine 2 (production)
git clone <repo>
cd window_spider_trigger
pixi install
pixi run setup
pixi run deploy
```

Environment differences handled via `.env.local` (git-ignored).

---

## Performance Notes

- Switch has 50ms software debounce
- 3-second cooldown prevents multiple triggers per person
- Videos should use H.264 codec for browser compatibility
- Video preloads on page load for instant playback

---

## License & Credits

Created for Halloween 2025 Spider Haunted House
Chamber 2: Spider Web Tunnel - Window Scare

See main project files:
- `/PROJECT_PLAN.md` - Complete haunted house design
- `/LAYOUT_MAP.txt` - Chamber layouts
- `/SHOPPING_LIST.md` - Parts and materials

---

## Support

**For issues:**
1. Run `pixi run status` - Check system state
2. Run `pixi run integration-test` - Auto-diagnose and fix
3. Check `TROUBLESHOOTING.md` - Common problems
4. Review Arduino serial: `pixi run arduino-monitor`

**Quick diagnostics:**
```bash
pixi run status           # System overview
pixi run beetle-test      # Hardware check
pixi run integration-test # Full system test
```
