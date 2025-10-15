# DFRobot Beetle (DFR0282) Pin Reference

## Board Overview
The Beetle is a minimalist Arduino Leonardo-compatible board with limited GPIO pins.

## Available Pins

### Digital I/O Pins (Available)
- **Pin 9** - Digital I/O (PWM)
- **Pin 10** - Digital I/O (PWM)
- **Pin 11** - Digital I/O (PWM)
- **Pin 13** - Built-in LED (also usable as digital I/O)

### Analog Pins (Can be used as Digital I/O)
- **A0** - Analog input / Digital I/O
- **A1** - Analog input / Digital I/O
- **A2** - Analog input / Digital I/O

### Special Pins
- **SCL** - I2C Clock
- **SDA** - I2C Data
- **RX (D0)** - Serial receive (avoid if using USB serial)
- **TX (D1)** - Serial transmit (avoid if using USB serial)

### Power Pins
- **VCC** - 5V output
- **GND** - Ground

## ⚠️ Pin 2 NOT Available!

Pin 2 does NOT exist on the Beetle. We need to change the switch pin.

## Recommended Pin for Switch

**Use Pin 9** - It's easily accessible and works perfectly with INPUT_PULLUP.

## Updated Wiring for Beetle

```
┌─────────────────────────────────────────────────────┐
│              DFRobot Beetle (DFR0282)                │
│                                                      │
│                         ┌────┐                      │
│                         │USB │  ← To Computer       │
│                         └────┘                      │
│                                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │  Pin 13 (Built-in LED) ●  (Visual Feedback) │  │
│  │                                               │  │
│  │  Pin 9  ●────────────────────┐               │  │
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

Connection:
  • Switch Terminal 1 → Pin 9
  • Switch Terminal 2 → GND
```

## Pin Mapping Table

| Function | Original (Leonardo) | Beetle | Status |
|----------|-------------------|---------|---------|
| Switch Input | Pin 2 | **Pin 9** | ✅ Changed |
| LED Indicator | Pin 13 | Pin 13 | ✅ Works |
| USB Serial | Yes | Yes | ✅ Works |
| Power (5V) | 5V | VCC | ✅ Works |
| Ground | GND | GND | ✅ Works |

## Alternative Pin Options

If Pin 9 doesn't work for your layout, you can also use:
- **Pin 10** - Another good digital I/O pin
- **Pin 11** - Also available
- **A0, A1, A2** - Analog pins work as digital too

## Physical Layout

```
     ┌─────────────┐
     │    USB-C    │
     └─────────────┘
           │
    ┌──────┴──────┐
    │ •9  •10 •11 │  ← Digital pins on one side
    │             │
    │ Beetle      │
    │  DFR0282    │
    │             │
    │ •A0 •A1 •A2 │  ← Analog pins on other side
    │ •VCC •GND   │
    └─────────────┘
```

## Code Change Required

Change in `arduino/motion_trigger/motion_trigger.ino`:

```cpp
// OLD:
const int SWITCH_PIN = 2;

// NEW:
const int SWITCH_PIN = 9;  // Changed for Beetle compatibility
```

## Benefits of Pin 9
✅ Digital I/O capable
✅ INPUT_PULLUP compatible
✅ Easy to access on Beetle
✅ No conflicts with USB serial
✅ PWM capable (not needed but nice)

## Size Comparison

The Beetle is much smaller than Leonardo:
- **Leonardo**: 68.6 x 53.3 mm
- **Beetle**: 20 x 22 mm (tiny!)

Perfect for hiding in your haunted house props! 🕷️
