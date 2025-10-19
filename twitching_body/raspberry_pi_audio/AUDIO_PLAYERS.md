# Audio Player Options for Raspberry Pi

## Overview

The Raspberry Pi audio loop system supports multiple audio players. Choose based on your system configuration.

## Recommended: mpg123 (Default)

**Pros:**
- Lightweight and fast
- Low CPU usage
- Designed specifically for MP3 playback
- Works great on Raspberry Pi

**Installation on Raspberry Pi:**
```bash
sudo apt install -y mpg123
```

**Usage:**
```bash
mpg123 --loop -1 audio/crying-ghost.mp3
```

**Note:** The conda-forge mpg123 package lacks PulseAudio/ALSA support. On Raspberry Pi, use the system package installed via apt.

## Alternative: ffplay (From FFmpeg)

**Pros:**
- Usually pre-installed
- Supports many audio/video formats
- Works with PulseAudio/ALSA automatically

**Cons:**
- Higher CPU usage than mpg123
- Designed for video, overkill for audio-only

**Installation on Raspberry Pi:**
```bash
sudo apt install -y ffmpeg
```

**Usage:**
```bash
# Loop forever
ffplay -nodisp -loop 0 audio/crying-ghost.mp3

# Or with autoexit after one play
ffplay -nodisp -autoexit audio/crying-ghost.mp3
```

## Alternative: VLC (cvlc)

**Pros:**
- Very reliable
- Good format support
- Can handle playlists easily

**Cons:**
- Higher memory footprint
- More dependencies

**Installation on Raspberry Pi:**
```bash
sudo apt install -y vlc
```

**Usage:**
```bash
cvlc --loop audio/crying-ghost.mp3
```

## Testing Audio Output

### Check Available Audio Devices

```bash
# List ALSA devices
aplay -l

# Test audio with a beep
speaker-test -t wav -c 2
```

### Force Audio Output

On Raspberry Pi, you can force audio to specific outputs:

```bash
# Force 3.5mm headphone jack (not HDMI)
amixer cset numid=3 1

# Force HDMI
amixer cset numid=3 2

# Auto
amixer cset numid=3 0
```

Or use raspi-config:
```bash
sudo raspi-config
# System Options → Audio → Select output
```

## Troubleshooting

### "Can't open default sound device"

**mpg123 with OSS error:**
```bash
# Install mpg123 from apt (has PulseAudio/ALSA support)
sudo apt install -y mpg123

# Don't use pixi mpg123 - it only has OSS support
```

**General audio issues:**
```bash
# Check if sound is muted
alsamixer
# Use arrow keys to navigate, M to unmute

# Set volume
amixer set PCM 75%

# Test with system speaker-test
speaker-test -t wav -c 2
```

### No Audio on Raspberry Pi

1. **Check audio output:**
   ```bash
   sudo raspi-config
   # System Options → Audio
   ```

2. **Update firmware:**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

3. **Test with simple file:**
   ```bash
   # Generate test tone
   speaker-test -t wav -c 2

   # If that works, test MP3
   mpg123 audio/crying-ghost.mp3
   ```

## Performance Comparison

| Player | CPU Usage | RAM Usage | Boot Delay |
|--------|-----------|-----------|------------|
| mpg123 | ~1-3% | ~10 MB | Fastest |
| ffplay | ~5-10% | ~30 MB | Fast |
| cvlc | ~5-8% | ~50 MB | Slow |

**Recommendation:** Use mpg123 for best performance on Raspberry Pi.

## Updating the Service

To change the audio player, edit `/etc/systemd/system/audio-loop.service`:

**mpg123 (default):**
```ini
ExecStart=/usr/bin/mpg123 --loop -1 /path/to/audio.mp3
```

**ffplay:**
```ini
ExecStart=/usr/bin/ffplay -nodisp -loop 0 /path/to/audio.mp3
```

**cvlc:**
```ini
ExecStart=/usr/bin/cvlc --loop /path/to/audio.mp3
```

Then reload and restart:
```bash
sudo systemctl daemon-reload
sudo systemctl restart audio-loop.service
```

## See Also

- Main documentation: `README.md`
- Troubleshooting: `TROUBLESHOOTING.md` (in main README)
- Setup script: `setup.sh`
