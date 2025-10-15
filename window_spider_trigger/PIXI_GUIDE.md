# Pixi Workflow Guide

This project uses [Pixi](https://pixi.sh/) for reproducible development environments across multiple machines.

## Why Pixi?

✅ **Reproducible**: Exact Node.js version on every machine
✅ **Self-contained**: Everything in `.pixi/` directory
✅ **Cross-platform**: Works on Linux, macOS, Windows
✅ **Fast**: Parallel dependency resolution
✅ **No conflicts**: Isolated from system packages
✅ **arduino-cli included**: Manages Arduino toolchain

## Installation

### First Time Setup (Any Machine)

```bash
# 1. Install pixi (if not already installed)
curl -fsSL https://pixi.sh/install.sh | bash

# 2. Clone project and enter directory
cd window_spider_trigger

# 3. Install everything (Node.js, arduino-cli, dependencies)
pixi install

# 4. Setup Arduino toolchain
pixi run setup

# Done! 🎉
```

### Verify Installation

```bash
pixi run status
```

You should see:
- Node.js version
- npm packages
- arduino-cli version
- Connected boards

## Common Workflows

### 🚀 Full Deployment (Flash + Start Server)

```bash
pixi run deploy
```

This will:
1. Compile Arduino code
2. Auto-detect Arduino and upload
3. Start the web server

Open browser to `http://localhost:3000`

### 🔧 Arduino Development

```bash
# Detect connected Arduino
pixi run arduino-detect

# Compile sketch
pixi run arduino-compile

# Upload to board (auto-detects port)
pixi run arduino-upload

# Compile + Upload in one step
pixi run arduino-flash

# Open serial monitor
pixi run arduino-monitor

# Clean build files
pixi run arduino-clean
```

### 💻 Server Development

```bash
# Start server (production mode)
pixi run start

# Start server with auto-reload (development)
pixi run dev

# Check if videos are present
pixi run check-videos
```

### 🧪 Testing

```bash
# Quick hardware test (flash + monitor)
pixi run quick-test

# Check system status
pixi run status

# Check serial permissions
pixi run check-permissions

# Fix permissions (adds user to dialout group)
pixi run fix-permissions
```

## Task Reference

### Setup & Installation
| Task | Description |
|------|-------------|
| `pixi install` | Install pixi dependencies |
| `pixi run setup` | Setup Arduino toolchain + npm packages |
| `pixi run status` | Show system status |

### Arduino Tasks
| Task | Description |
|------|-------------|
| `pixi run arduino-detect` | List connected boards |
| `pixi run arduino-compile` | Compile sketch |
| `pixi run arduino-upload` | Upload to board (auto-detect port) |
| `pixi run arduino-flash` | Compile + upload |
| `pixi run arduino-monitor` | Serial monitor (9600 baud) |
| `pixi run arduino-clean` | Clean build artifacts |

### Server Tasks
| Task | Description |
|------|-------------|
| `pixi run start` | Start production server |
| `pixi run dev` | Start dev server (auto-reload) |
| `pixi run check-videos` | Verify video files exist |

### Combined Workflows
| Task | Description |
|------|-------------|
| `pixi run deploy` | Flash Arduino + start server |
| `pixi run quick-test` | Flash + monitor (hardware test) |

### Troubleshooting
| Task | Description |
|------|-------------|
| `pixi run check-permissions` | Check serial port access |
| `pixi run fix-permissions` | Add user to dialout group |
| `pixi run clean-all` | Clean all build files and node_modules |

## Port Auto-Detection

All Arduino tasks automatically detect the port:
```bash
# Finds /dev/ttyACM0, /dev/ttyACM1, etc.
pixi run arduino-flash
```

No need to specify port manually! Works even if device changes.

## Environment Variables

Pixi automatically sets:
- `SERIAL_PORT=auto` - Auto-detect Arduino
- `PIXI_PROJECT_ROOT` - Project directory path

Override if needed:
```bash
SERIAL_PORT=/dev/ttyACM1 pixi run start
```

## Multi-Machine Setup

### On Machine A (Development)
```bash
# Initial setup
pixi install
pixi run setup
pixi run arduino-flash
pixi run start
```

### On Machine B (Production/Testing)
```bash
# Just clone and run!
git clone <repo>
cd window_spider_trigger
pixi install
pixi run setup
pixi run deploy
```

All dependencies are exactly the same! ✨

## Development Features

### Dev Environment

For extra dev tools (Python, etc.):
```bash
pixi shell -e dev
```

This activates the dev environment with additional tools.

### Watch Logs
```bash
pixi run watch-logs
```

### Test Serial Ports (Python)
```bash
pixi run test-serial
```

## Hardware Testing

### Test the Switch
```bash
# Open serial monitor
pixi run arduino-monitor

# Press switch - you should see:
# "Switch pressed at: X seconds"
# "TRIGGER"

# Release switch - you should see:
# "SWITCH_RELEASED"
```

### Test Cooldown
The Arduino has a 3-second cooldown between triggers. If you press the switch again within 3 seconds:
```
COOLDOWN
Wait X more seconds
```

## Updating Dependencies

### Update Node.js version
Edit `pixi.toml`:
```toml
[dependencies]
nodejs = "22.*"  # Update version
```

Then:
```bash
pixi install
```

### Update npm packages
```bash
pixi run install  # Runs npm install
```

## Troubleshooting

### "Arduino not found"
```bash
# Check connection
pixi run arduino-detect

# Check permissions
pixi run check-permissions

# Fix permissions
pixi run fix-permissions
# Then log out and back in
```

### "Command not found: arduino-cli"
```bash
# Reinstall arduino-cli
pixi run install-arduino-cli
pixi run setup-arduino
```

### "Port already in use"
Another server is running on port 3000. Either:
1. Stop the other server
2. Change port: `PORT=3001 pixi run start`

### Clean slate
```bash
# Remove everything and start fresh
pixi run clean-all
rm -rf .pixi
pixi install
pixi run setup
```

## Pixi Configuration

The `pixi.toml` file defines:
- **Dependencies**: Node.js, npm, Python (dev)
- **Tasks**: All commands available via `pixi run`
- **Environments**: `default` and `dev`

### Custom Configuration

Store local config in `.pixi/envs/default/.env`:
```bash
SERIAL_PORT=/dev/ttyACM1
PORT=3001
```

## Benefits for Your Project

1. **Multiple Machines**: Same environment on laptop, desktop, Raspberry Pi
2. **Multiple Developers**: Everyone has exact same setup
3. **Time Travel**: Can recreate environment months/years later
4. **No System Pollution**: Everything isolated in `.pixi/`
5. **Fast Setup**: New machine ready in minutes

## Performance

Pixi uses:
- **rattler**: Ultra-fast package resolver (written in Rust)
- **conda-forge**: Largest package repository
- **Parallel downloads**: Fast installation

Typical setup time: **1-2 minutes** (vs 5-10 minutes manual)

## Next Steps

1. ✅ Install pixi
2. ✅ Run `pixi run setup`
3. 🔧 Add your videos to `public/videos/`
4. 🚀 Run `pixi run deploy`
5. 🎃 Test your scare!

## Resources

- [Pixi Documentation](https://pixi.sh/)
- [pixi.toml Reference](https://pixi.sh/latest/reference/pixi_manifest/)
- [Task System](https://pixi.sh/latest/features/tasks/)
