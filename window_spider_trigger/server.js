/**
 * Spider Window Scare - Node.js Server
 *
 * Listens to Arduino serial port for motion triggers
 * and communicates with web client via Socket.IO
 */

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const path = require('path');

// Load environment variables from .env file
require('dotenv').config();

// Configuration
const PORT = process.env.PORT || 3000;
const SERIAL_PORT = process.env.SERIAL_PORT || 'auto'; // Set to 'auto' for auto-detection
const BAUD_RATE = parseInt(process.env.BAUD_RATE) || 9600;
const ARDUINO_VENDOR_ID = process.env.ARDUINO_VENDOR_ID || '2341'; // Arduino vendor ID

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files from 'public' directory
app.use(express.static('public'));

// Serve index.html at root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Statistics tracking
let stats = {
  triggers: 0,
  lastTriggerTime: null,
  startTime: new Date(),
  connected: false
};

// Initialize serial port
let port;
let parser;

async function findArduinoPort() {
  const ports = await SerialPort.list();
  console.log('Available serial ports:');
  ports.forEach(p => {
    console.log(`  ${p.path} - ${p.manufacturer || 'Unknown'}`);
  });

  // Look for Arduino
  const arduinoPort = ports.find(p =>
    p.vendorId === ARDUINO_VENDOR_ID ||
    (p.manufacturer && p.manufacturer.toLowerCase().includes('arduino'))
  );

  if (arduinoPort) {
    console.log(`✓ Found Arduino at: ${arduinoPort.path}`);
    return arduinoPort.path;
  }

  // Fallback: try common Arduino ports
  const fallbackPorts = ['/dev/ttyACM0', '/dev/ttyUSB0', 'COM3'];
  for (const fallback of fallbackPorts) {
    if (ports.find(p => p.path === fallback)) {
      console.log(`Using fallback port: ${fallback}`);
      return fallback;
    }
  }

  throw new Error('No Arduino found. Available ports: ' + ports.map(p => p.path).join(', '));
}

async function initSerial() {
  try {
    // Auto-detect port if set to 'auto'
    let portPath = SERIAL_PORT;
    if (SERIAL_PORT === 'auto') {
      portPath = await findArduinoPort();
    }

    port = new SerialPort({
      path: portPath,
      baudRate: BAUD_RATE
    });

    parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

    port.on('open', () => {
      console.log(`✓ Serial port ${port.path} opened`);
      console.log(`  Baud rate: ${BAUD_RATE}`);
      stats.connected = true;
      io.emit('serial-status', { connected: true });
    });

    port.on('error', (err) => {
      console.error('✗ Serial port error:', err.message);
      stats.connected = false;
      io.emit('serial-status', { connected: false, error: err.message });
    });

    port.on('close', () => {
      console.log('Serial port closed');
      stats.connected = false;
      io.emit('serial-status', { connected: false });
    });

    // Listen for data from Arduino
    parser.on('data', (line) => {
      const data = line.trim();
      console.log(`Arduino: ${data}`);

      if (data === 'TRIGGER') {
        console.log('🕷️  MOTION DETECTED - Triggering scare!');
        stats.triggers++;
        stats.lastTriggerTime = new Date();

        // Send trigger to all connected clients
        io.emit('trigger-video');
        io.emit('stats-update', stats);
      } else if (data === 'READY') {
        console.log('✓ Arduino ready');
        io.emit('arduino-status', { ready: true });
      } else if (data === 'STARTUP') {
        console.log('Arduino starting up...');
        io.emit('arduino-status', { startup: true });
      }
    });

  } catch (err) {
    console.error('✗ Failed to initialize serial port:', err.message);
    console.error('  Make sure:');
    console.error('  1. Arduino is connected');
    console.error('  2. Correct port is specified');
    console.error('  3. You have permission to access the port');
    console.error('     Run: sudo usermod -a -G dialout $USER');
    stats.connected = false;
  }
}

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('✓ Client connected:', socket.id);

  // Send current stats to new client
  socket.emit('stats-update', stats);
  socket.emit('serial-status', { connected: stats.connected });

  // Handle manual test trigger
  socket.on('manual-trigger', () => {
    console.log('🎮 Manual test trigger');
    stats.triggers++;
    stats.lastTriggerTime = new Date();
    io.emit('trigger-video');
    io.emit('stats-update', stats);
  });

  // Handle Arduino command requests
  socket.on('send-command', (command) => {
    if (port && port.isOpen) {
      console.log(`Sending command to Arduino: ${command}`);
      port.write(`${command}\n`);
    } else {
      socket.emit('error', { message: 'Serial port not connected' });
    }
  });

  // Request stats
  socket.on('request-stats', () => {
    socket.emit('stats-update', stats);
  });

  socket.on('disconnect', () => {
    console.log('✗ Client disconnected:', socket.id);
  });
});

// API endpoint for stats
app.get('/api/stats', (req, res) => {
  res.json(stats);
});

// API endpoint to trigger manually (for testing)
app.post('/api/trigger', (req, res) => {
  console.log('🎮 Manual trigger via API');
  stats.triggers++;
  stats.lastTriggerTime = new Date();
  io.emit('trigger-video');
  io.emit('stats-update', stats);
  res.json({ success: true });
});

// Start server
server.listen(PORT, async () => {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║     🕷️  SPIDER WINDOW SCARE - SERVER RUNNING 🕷️       ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log(`  Web interface: http://localhost:${PORT}`);
  console.log(`  Serial port: ${SERIAL_PORT} @ ${BAUD_RATE} baud`);
  console.log('');

  // Initialize serial connection
  await initSerial();
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down...');
  if (port && port.isOpen) {
    port.close();
  }
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
