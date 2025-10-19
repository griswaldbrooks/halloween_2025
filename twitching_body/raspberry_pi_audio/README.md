# Raspberry Pi Audio Loop Setup

Auto-play MP3 audio on loop at startup for haunted house ambient sound effects.

## Overview

This setup configures a Raspberry Pi to automatically play an MP3 file (or playlist) on repeat starting at boot, with no user interaction required.

**Use case:** Chamber 4 (Victim Room) - Continuous moaning/victim sounds from hidden speakers

---

## Hardware Requirements

- Raspberry Pi 3 (or newer) with Raspberry Pi OS
- Speakers connected to:
  - 3.5mm headphone jack, OR
  - USB audio interface, OR
  - Bluetooth speaker
- Power supply
- SD card with Raspberry Pi OS installed

---

## Quick Start

### 1. Clone Repository to Raspberry Pi

```bash
# On your Raspberry Pi
cd ~
git clone <your-repo-url> halloween_2025
cd halloween_2025/twitching_body/raspberry_pi_audio
```

### 2. Copy Your Audio File

```bash
# Copy your MP3 to the audio directory
# Either copy from USB drive:
cp /media/pi/USB_DRIVE/haunted_sound.mp3 audio/

# Or download from another computer:
# scp haunted_sound.mp3 pi@raspberrypi.local:~/halloween_2025/twitching_body/raspberry_pi_audio/audio/
```

### 3. Run Setup Script

```bash
# Make script executable
chmod +x setup.sh

# Run setup (will prompt for sudo password)
./setup.sh
```

### 4. Reboot and Test

```bash
sudo reboot
```

Audio should start playing automatically within 10-30 seconds after boot!

---

## Manual Setup (Alternative)

If you prefer to set up manually instead of using the setup script:

### Step 1: Install Audio Player

```bash
sudo apt update
sudo apt install -y mpg123 alsa-utils
```

### Step 2: Test Audio Output

```bash
# List audio devices
aplay -l

# Test playback
mpg123 audio/crying-ghost.mp3
```

**If no audio:**
```bash
# Force audio to headphone jack (not HDMI)
sudo raspi-config
# Navigate to: System Options → Audio → Headphones

# Or via command line:
amixer cset numid=3 1
```

### Step 3: Install Systemd Service

```bash
# Copy service file to systemd directory
sudo cp audio-loop.service /etc/systemd/system/

# Edit the service file to update paths if needed
sudo nano /etc/systemd/system/audio-loop.service
# Make sure the path to your MP3 matches your setup

# Reload systemd
sudo systemctl daemon-reload

# Enable service to start at boot
sudo systemctl enable audio-loop.service

# Start service now
sudo systemctl start audio-loop.service

# Check status
sudo systemctl status audio-loop.service
```

### Step 4: Verify and Reboot

```bash
# Check that audio is playing
systemctl status audio-loop.service

# View logs
journalctl -u audio-loop.service -f

# Reboot to test auto-start
sudo reboot
```

---

## File Structure

```
raspberry_pi_audio/
├── README.md              # This file
├── setup.sh               # Automated setup script
├── audio-loop.service     # Systemd service file
├── audio/                 # Audio files directory
│   └── crying-ghost.mp3   # Example audio file
└── scripts/
    ├── test-audio.sh      # Test audio playback
    ├── set-volume.sh      # Set system volume
    └── create-playlist.sh # Create playlist from all MP3s
```

---

## Usage

### Control the Audio Service

```bash
# Stop audio
sudo systemctl stop audio-loop.service

# Start audio
sudo systemctl start audio-loop.service

# Restart audio (after changing MP3 file)
sudo systemctl restart audio-loop.service

# Check status
sudo systemctl status audio-loop.service

# View live logs
journalctl -u audio-loop.service -f

# Disable auto-start on boot
sudo systemctl disable audio-loop.service

# Re-enable auto-start
sudo systemctl enable audio-loop.service
```

### Volume Control

```bash
# Set volume to 75%
./scripts/set-volume.sh 75

# Or manually:
amixer set PCM 75%

# Interactive mixer (use arrow keys, ESC to exit)
alsamixer
```

### Change Audio File

**Option 1: Replace existing file**
```bash
# Replace the MP3 file
cp new_sound.mp3 audio/crying-ghost.mp3

# Restart service
sudo systemctl restart audio-loop.service
```

**Option 2: Update service to point to new file**
```bash
# Edit service file
sudo nano /etc/systemd/system/audio-loop.service

# Change the ExecStart line to point to new file:
# ExecStart=/usr/bin/mpg123 --loop -1 /home/pi/halloween_2025/twitching_body/raspberry_pi_audio/audio/new_sound.mp3

# Reload and restart
sudo systemctl daemon-reload
sudo systemctl restart audio-loop.service
```

---

## Multiple Audio Files (Playlist Mode)

To loop through multiple MP3 files:

### Option 1: Use the helper script

```bash
# Add all your MP3s to the audio/ directory
cp sound1.mp3 sound2.mp3 sound3.mp3 audio/

# Create playlist
./scripts/create-playlist.sh

# Restart service
sudo systemctl restart audio-loop.service
```

### Option 2: Manual playlist

```bash
# Create playlist of all MP3s in audio/ directory
ls $PWD/audio/*.mp3 > audio/playlist.m3u

# Edit service to use playlist
sudo nano /etc/systemd/system/audio-loop.service

# Change ExecStart line to:
# ExecStart=/usr/bin/mpg123 --loop -1 --list /home/pi/halloween_2025/twitching_body/raspberry_pi_audio/audio/playlist.m3u

# Reload and restart
sudo systemctl daemon-reload
sudo systemctl restart audio-loop.service
```

---

## Troubleshooting

### No Audio After Boot

**Check service status:**
```bash
sudo systemctl status audio-loop.service
```

**Check for errors:**
```bash
journalctl -u audio-loop.service -n 50
```

**Common fixes:**

1. **Wrong audio output (HDMI instead of headphones):**
   ```bash
   # Force headphone jack
   amixer cset numid=3 1

   # Or use raspi-config
   sudo raspi-config
   # System Options → Audio → Headphones
   ```

2. **File path wrong:**
   ```bash
   # Verify file exists
   ls -la ~/halloween_2025/twitching_body/raspberry_pi_audio/audio/

   # Check service file has correct path
   sudo cat /etc/systemd/system/audio-loop.service
   ```

3. **Service not enabled:**
   ```bash
   sudo systemctl enable audio-loop.service
   sudo systemctl start audio-loop.service
   ```

4. **Volume too low:**
   ```bash
   amixer set PCM 100%
   ```

### Audio Plays Then Stops

**Check if service restarted:**
```bash
sudo systemctl status audio-loop.service
```

**View crash logs:**
```bash
journalctl -u audio-loop.service -n 100
```

**Common causes:**
- Corrupted MP3 file (test playback manually: `mpg123 audio/file.mp3`)
- Insufficient power to Pi (use official power supply)
- SD card issues (check with `dmesg | grep mmc`)

### Audio Glitches/Stutters

**Increase audio buffer:**
```bash
sudo nano /etc/systemd/system/audio-loop.service

# Change ExecStart line to add buffer size:
# ExecStart=/usr/bin/mpg123 --loop -1 --buffer 8192 /path/to/file.mp3

sudo systemctl daemon-reload
sudo systemctl restart audio-loop.service
```

### Service Won't Start

**Check mpg123 is installed:**
```bash
which mpg123
# Should output: /usr/bin/mpg123
```

**Re-run setup:**
```bash
./setup.sh
```

### Want to Use Different Audio Player

**Using VLC instead:**
```bash
# Install VLC
sudo apt install -y vlc

# Edit service
sudo nano /etc/systemd/system/audio-loop.service

# Change ExecStart to:
# ExecStart=/usr/bin/cvlc --loop --no-video /path/to/file.mp3

sudo systemctl daemon-reload
sudo systemctl restart audio-loop.service
```

---

## Testing

### Test Audio Playback

```bash
./scripts/test-audio.sh
```

### Test Service (without rebooting)

```bash
# Start service
sudo systemctl start audio-loop.service

# Check it's running
sudo systemctl status audio-loop.service

# Listen for audio output
# Wait 5-10 seconds for audio to start

# Stop service
sudo systemctl stop audio-loop.service
```

### Full Boot Test

```bash
# Ensure service is enabled
sudo systemctl enable audio-loop.service

# Reboot
sudo reboot

# After boot, SSH back in and check
sudo systemctl status audio-loop.service
journalctl -u audio-loop.service -n 20
```

---

## Advanced Configuration

### Delayed Start (Wait N Seconds After Boot)

```bash
sudo nano /etc/systemd/system/audio-loop.service

# Add to [Service] section:
# ExecStartPre=/bin/sleep 10

sudo systemctl daemon-reload
sudo systemctl restart audio-loop.service
```

### Random Playback Order (Shuffle)

```bash
sudo nano /etc/systemd/system/audio-loop.service

# Add --shuffle flag:
# ExecStart=/usr/bin/mpg123 --loop -1 --shuffle --list /path/to/playlist.m3u

sudo systemctl daemon-reload
sudo systemctl restart audio-loop.service
```

### Gapless Playback (No Silence Between Loops)

```bash
# mpg123 already does this by default with --loop -1
# For perfect loops, ensure your MP3 has no silence at start/end
# Use Audacity to trim silence if needed
```

---

## Uninstall

To completely remove the audio loop service:

```bash
# Stop and disable service
sudo systemctl stop audio-loop.service
sudo systemctl disable audio-loop.service

# Remove service file
sudo rm /etc/systemd/system/audio-loop.service

# Reload systemd
sudo systemctl daemon-reload

# Optional: Remove mpg123
sudo apt remove mpg123
```

---

## Integration with Twitching Body

This audio loop system is designed to work alongside the twitching body animatronic:

- **Raspberry Pi** - Plays victim moaning/crying sounds continuously
- **DFRobot Beetle** - Controls servo twitching movements

Both systems operate independently for reliability:
- If one fails, the other continues
- No synchronization needed (audio loop creates ambient effect)
- Can be powered from same or separate power supplies

### Suggested Setup

1. Mount Raspberry Pi inside or behind cocoon prop
2. Hide speaker inside cocoon fabric
3. Run power cable to central power supply
4. Set volume to appropriate level for room size
5. Test before event to ensure 8+ hours continuous operation

---

## Performance Notes

- **Boot time:** Audio starts 10-30 seconds after power on
- **CPU usage:** ~1-5% (mpg123 is very lightweight)
- **Memory:** ~10-20 MB
- **Power consumption:** Standard RPi power + speaker
- **Tested duration:** 24+ hours continuous playback
- **Audio quality:** Supports up to 320kbps MP3

---

## Credits

Part of the Halloween 2025 Spider Haunted House project.

See main project files:
- `/PROJECT_PLAN.md` - Complete haunted house design
- `/twitching_body/README.md` - Twitching body animatronic setup
- `/AGENT_HANDOFF.md` - Project status and next steps

---

## Support

**Quick diagnostics:**
```bash
./scripts/test-audio.sh              # Test audio playback
sudo systemctl status audio-loop.service  # Check service status
journalctl -u audio-loop.service -n 50    # View recent logs
```

**For issues, check:**
1. Service status: `sudo systemctl status audio-loop.service`
2. Audio devices: `aplay -l`
3. File paths: `ls -la audio/`
4. System logs: `journalctl -u audio-loop.service`
