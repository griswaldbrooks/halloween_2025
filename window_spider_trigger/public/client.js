/**
 * Spider Window Scare - Client JavaScript
 *
 * Handles video playback, Socket.IO communication,
 * and user interface controls
 */

// Get DOM elements
const mainVideo = document.getElementById('main-video');
const statusOverlay = document.getElementById('status-overlay');
const loading = document.getElementById('loading');

const arduinoStatus = document.getElementById('arduino-status');
const serialStatus = document.getElementById('serial-status');
const triggerCount = document.getElementById('trigger-count');
const lastTrigger = document.getElementById('last-trigger');

const testTriggerBtn = document.getElementById('test-trigger');
const fullscreenBtn = document.getElementById('fullscreen-btn');
const toggleStatusBtn = document.getElementById('toggle-status');

// State
let isPlaying = false;
let cursorTimeout;

// Initialize Socket.IO connection
const socket = io();

// Socket event handlers
socket.on('connect', () => {
  console.log('Connected to server');
  updateSerialStatus('Connected', 'connected');
});

socket.on('disconnect', () => {
  console.log('Disconnected from server');
  updateSerialStatus('Disconnected', 'disconnected');
});

socket.on('trigger-video', () => {
  console.log('🕷️ TRIGGER RECEIVED - Playing scare!');
  playScare();
});

socket.on('serial-status', (data) => {
  if (data.connected) {
    updateSerialStatus('Connected', 'connected');
  } else {
    updateSerialStatus('Disconnected', 'disconnected');
  }
});

socket.on('arduino-status', (data) => {
  if (data.ready) {
    updateArduinoStatus('Ready', 'ready');
  } else if (data.startup) {
    updateArduinoStatus('Starting...', 'ready');
  }
});

socket.on('stats-update', (stats) => {
  triggerCount.textContent = stats.triggers;
  if (stats.lastTriggerTime) {
    const date = new Date(stats.lastTriggerTime);
    lastTrigger.textContent = date.toLocaleTimeString();
  }
});

// Video event handlers
mainVideo.addEventListener('loadeddata', () => {
  console.log('✓ Video loaded');
  loading.classList.add('hidden');
  // Video starts paused at beginning, waiting for trigger
  mainVideo.pause();
  mainVideo.currentTime = 0;
  console.log('Video ready - paused at start, waiting for trigger');
});

mainVideo.addEventListener('ended', () => {
  console.log('Video ended, resetting to start');
  resetVideo();
});

// Reset video to beginning and pause
function resetVideo() {
  isPlaying = false;
  mainVideo.pause();
  mainVideo.currentTime = 0;
  console.log('Video reset - ready for next trigger');
}

// Play video on trigger
function playScare() {
  if (isPlaying) {
    console.log('Already playing, ignoring trigger');
    return;
  }

  isPlaying = true;
  console.log('🕷️ Playing video!');

  // Reset to beginning (in case it's not already)
  mainVideo.currentTime = 0;

  // Play the video
  mainVideo.play()
    .then(() => {
      console.log('Video playing');
      // Optional: flash effect
      mainVideo.classList.add('flash');
      setTimeout(() => mainVideo.classList.remove('flash'), 300);
    })
    .catch(err => {
      console.error('Failed to play video:', err);
      resetVideo();
    });
}

// Button event handlers
testTriggerBtn.addEventListener('click', () => {
  console.log('Manual test trigger');
  socket.emit('manual-trigger');
});

fullscreenBtn.addEventListener('click', () => {
  toggleFullscreen();
});

toggleStatusBtn.addEventListener('click', () => {
  statusOverlay.classList.toggle('hidden');
  toggleStatusBtn.textContent = statusOverlay.classList.contains('hidden')
    ? '👁️ Show Status'
    : '👁️ Hide Status';
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  switch(e.key.toLowerCase()) {
    case 'f':
      toggleFullscreen();
      break;
    case 's':
      statusOverlay.classList.toggle('hidden');
      break;
    case 't':
      socket.emit('manual-trigger');
      break;
    case 'escape':
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
      break;
  }
});

// Fullscreen functions
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
      .then(() => console.log('Entered fullscreen'))
      .catch(err => console.error('Fullscreen failed:', err));
  } else {
    document.exitFullscreen();
  }
}

// Update status displays
function updateSerialStatus(text, className) {
  serialStatus.textContent = text;
  serialStatus.className = 'status-value ' + className;
}

function updateArduinoStatus(text, className) {
  arduinoStatus.textContent = text;
  arduinoStatus.className = 'status-value ' + className;
}

// Hide cursor after inactivity
document.addEventListener('mousemove', () => {
  document.body.classList.remove('hide-cursor');
  clearTimeout(cursorTimeout);

  cursorTimeout = setTimeout(() => {
    document.body.classList.add('hide-cursor');
  }, 3000); // Hide after 3 seconds of inactivity
});

// Auto-hide status overlay after 10 seconds
setTimeout(() => {
  if (!statusOverlay.classList.contains('hidden')) {
    console.log('Auto-hiding status overlay');
    statusOverlay.classList.add('hidden');
  }
}, 10000);

// Request initial stats
socket.emit('request-stats');

// Log ready state
console.log('🕷️ Spider Window Scare client initialized');
console.log('Press F for fullscreen, S to toggle status, T to test trigger');
