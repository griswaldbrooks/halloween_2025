# Deployment Guide - Multi-Machine Setup

This guide shows how to deploy the Window Spider Trigger across multiple machines using Pixi.

## Scenarios

### Scenario 1: Development Machine → Production Machine

**Development Machine (your laptop):**
```bash
# Setup and test
pixi install
pixi run setup
pixi run arduino-flash
pixi run start
# Test everything works
```

**Push to Git:**
```bash
git add .
git commit -m "Spider trigger ready for deployment"
git push origin main
```

**Production Machine (display computer at haunted house):**
```bash
# Clone and setup
git clone <your-repo>
cd window_spider_trigger
pixi install
pixi run setup

# Add videos
# Copy idle_loop.mp4 and spider_jumpscare.mp4 to public/videos/

# Deploy
pixi run arduino-flash
pixi run start
```

### Scenario 2: Multiple Testing Stations

Same codebase, different machines:

**Station A** (Testing):
```bash
cd window_spider_trigger
pixi run deploy
```

**Station B** (Integration):
```bash
cd window_spider_trigger
pixi run deploy
```

Exact same Node.js version, exact same dependencies! 🎯

### Scenario 3: Raspberry Pi Deployment

Perfect for low-power display computers:

```bash
# On Raspberry Pi (arm64)
cd window_spider_trigger
pixi install  # Gets ARM-compatible packages
pixi run setup
pixi run deploy

# Optional: Auto-start on boot
echo "@reboot cd /home/pi/window_spider_trigger && /home/pi/.pixi/bin/pixi run start" | crontab -
```

## Environment Differences

### Machine-Specific Configuration

Each machine can have its own `.env.local`:

**Display Computer:**
```bash
# .env.local
PORT=3000
SERIAL_PORT=auto
```

**Testing Laptop:**
```bash
# .env.local
PORT=3001  # Different port
SERIAL_PORT=/dev/ttyACM1
```

Git ignores `.env.local` so each machine keeps its own config!

### Different Arduino Boards

**Machine A** (Leonardo):
```bash
# arduino.config.json
{
  "board": {
    "fqbn": "arduino:avr:leonardo"
  }
}
```

**Machine B** (Uno):
```bash
# arduino.config.json
{
  "board": {
    "fqbn": "arduino:avr:uno"
  }
}
```

Update `pixi.toml` tasks if needed, or override:
```bash
ARDUINO_FQBN=arduino:avr:uno pixi run arduino-flash
```

## Production Deployment Checklist

Before deploying to the haunted house:

### 1. Verify on Development Machine
- [ ] Arduino code compiles
- [ ] Motion sensor triggers correctly
- [ ] Videos play smoothly
- [ ] Serial auto-detection works
- [ ] Web interface loads

```bash
pixi run status           # Check environment
pixi run arduino-flash    # Upload code
pixi run check-videos     # Verify videos
pixi run start           # Test server
```

### 2. Prepare Files
- [ ] Videos optimized (H.264, reasonable size)
- [ ] `.env` configured
- [ ] Code committed to git
- [ ] Arduino wired correctly

### 3. Deploy to Production
```bash
# On production machine
git clone <repo>
cd window_spider_trigger
pixi install
pixi run setup

# Copy videos (if not in repo)
scp *.mp4 production:/path/to/window_spider_trigger/public/videos/

# Deploy
pixi run deploy
```

### 4. Test in Production
- [ ] Arduino detected: `pixi run arduino-detect`
- [ ] Serial working: `pixi run arduino-monitor`
- [ ] Web server running: `curl http://localhost:3000`
- [ ] Videos load: Check browser
- [ ] Motion triggers scare: Wave hand

### 5. Autostart (Optional)

**Systemd service** (Linux):
```ini
# /etc/systemd/system/spider-trigger.service
[Unit]
Description=Spider Window Trigger
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/home/your-user/window_spider_trigger
ExecStart=/home/your-user/.pixi/bin/pixi run start
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable:
```bash
sudo systemctl enable spider-trigger
sudo systemctl start spider-trigger
```

**PM2** (Node.js process manager):
```bash
npm install -g pm2
pm2 start server.js --name spider-trigger
pm2 startup
pm2 save
```

**Pixi task** (add to pixi.toml):
```toml
autostart = "pm2 start server.js --name spider-trigger"
```

## Troubleshooting Multi-Machine Issues

### Different Node.js Versions
✅ **Solved by Pixi!** All machines use Node.js 20.* from pixi.toml

### Different arduino-cli Versions
✅ **Solved by Pixi!** Installed locally in `.pixi/bin/`

### Port Conflicts
Check what's using port 3000:
```bash
lsof -i :3000
# Or change port
PORT=3001 pixi run start
```

### Serial Port Names Differ
✅ **Auto-detection handles this!** `/dev/ttyACM0` vs `/dev/ttyUSB0` both work

### Permission Issues
```bash
pixi run check-permissions
pixi run fix-permissions
# Then log out/in
```

## Network Deployment (Optional)

Run server on one machine, access from multiple displays:

**Server Machine:**
```bash
# Listen on all interfaces
# Edit server.js or use reverse proxy
PORT=3000 pixi run start
```

**Display Machines:**
Open browser to: `http://server-ip:3000`

All displays show the same feed, triggered by one Arduino!

## Backup & Restore

### Backup Configuration
```bash
# Save important files
tar -czf spider-backup.tar.gz \
  pixi.toml \
  .env \
  arduino.config.json \
  arduino/motion_trigger/ \
  server.js \
  public/
```

### Restore on New Machine
```bash
# Extract backup
tar -xzf spider-backup.tar.gz

# Setup environment
pixi install
pixi run setup

# Deploy
pixi run deploy
```

## Updates & Maintenance

### Update Code
```bash
git pull origin main
pixi install  # Update dependencies if changed
pixi run arduino-flash  # Re-flash if Arduino code changed
pixi run start
```

### Update Dependencies
Edit `pixi.toml`:
```toml
nodejs = "22.*"  # New version
```

Then:
```bash
pixi install
```

All machines stay in sync! 🎉

## Performance Tips

### Video Optimization
```bash
# Convert videos to web-optimized H.264
ffmpeg -i input.mp4 -c:v libx264 -preset fast -crf 23 output.mp4
```

### Reduce Resolution (for Raspberry Pi)
```bash
ffmpeg -i input.mp4 -vf scale=1280:720 -c:v libx264 -crf 23 output_720p.mp4
```

### Preload Videos
Videos are automatically preloaded by the client for instant playback.

## Multi-Machine Best Practices

1. **Use Git** - Keep all machines in sync
2. **Use `.env.local`** - Machine-specific config
3. **Use Pixi** - Reproducible environments
4. **Test locally first** - Verify before deployment
5. **Document changes** - Update this guide!
6. **Keep videos separate** - Don't commit large files to git
7. **Monitor logs** - Check for issues
8. **Have rollback plan** - Keep previous version

## Questions?

See:
- [README.md](README.md) - General documentation
- [PIXI_GUIDE.md](PIXI_GUIDE.md) - Pixi workflow reference
- [QUICK_START.md](QUICK_START.md) - Fast reference
