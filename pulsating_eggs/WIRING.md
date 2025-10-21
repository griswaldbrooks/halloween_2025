# Wiring Guide - Pulsating Egg Sacs

Complete wiring diagrams for the pulsating egg sacs effect.

---

## Hardware Components

| Component | Purpose | Specifications |
|-----------|---------|----------------|
| DFRobot Beetle | Microcontroller | DFR0282 (Leonardo-compatible) |
| PCA9685 | PWM LED Driver | 16-channel, I2C 0x40 |
| LEDs | Egg sac lighting | 8-16 LEDs (configurable) |
| Resistors | Current limiting | Value depends on LED specs |
| Power Supply | LED power | 5V, current = (N × LED_current) |
| Button (optional) | Pause/test | Momentary, normally open |

---

## Power Requirements

### Calculating Power Supply

Each LED draws current. Calculate total needed:

```
Total Current = (Number of LEDs) × (LED current at full brightness)

Example:
- 8 LEDs
- Each LED = 20mA maximum
- Total = 8 × 20mA = 160mA

Add 20% safety margin: 160mA × 1.2 = 192mA
Recommended power supply: 5V, 200mA+ (or 1A for safety)
```

**⚠️ CRITICAL:**
- Beetle provides only ~150mA total from USB
- **MUST use external 5V power supply for LEDs**
- Never power multiple LEDs directly from Beetle

---

## Connection Overview

```
┌──────────────┐
│   Beetle     │
│  (DFR0282)   │
└──────────────┘
      │ │
      │ │ I2C (SDA/SCL)
      │ │ Power (VCC/GND)
      ↓ ↓
┌──────────────────┐         ┌─────────────┐
│     PCA9685      │◄────────│ 5V External │
│  PWM LED Driver  │  V+/GND │ Power Supply│
└──────────────────┘         └─────────────┘
      │ │ │ │
      │ │ │ │ PWM outputs (CH0-CH15)
      ↓ ↓ ↓ ↓
    LED0 LED1 ... LED15
     │   │        │
   [R]  [R]     [R]   ← Resistors
     │   │        │
    GND GND      GND
```

---

## Detailed Wiring

### 1. Beetle to PCA9685 (I2C Communication)

| Beetle Pin | PCA9685 Pin | Wire Color (Suggested) | Purpose |
|------------|-------------|------------------------|---------|
| SDA | SDA | Green | I2C Data |
| SCL | SCL | Yellow | I2C Clock |
| VCC (3.3V or 5V) | VCC | Red | Logic power |
| GND | GND | Black | Ground |

**Notes:**
- Beetle I2C pins are fixed (SDA/SCL)
- PCA9685 can use 3.3V or 5V logic (Beetle provides 5V)
- This connection powers the PCA9685 chip only (not LEDs)

### 2. External Power to PCA9685 (LED Power)

| Power Supply | PCA9685 Pin | Wire Color (Suggested) | Purpose |
|--------------|-------------|------------------------|---------|
| +5V | V+ | Red (heavy gauge) | LED power |
| GND | GND | Black (heavy gauge) | Ground |

**⚠️ CRITICAL:**
- **ALL grounds must connect:** Beetle GND + PCA9685 GND + Power Supply GND
- Use thicker wire for power (18-22 AWG)
- V+ powers LEDs only (separate from VCC)

### 3. PCA9685 to LEDs

For each LED:

```
PCA9685 CH0 ──→ [RESISTOR] ──→ LED Anode (+)
                                   │
                                 LED Cathode (-)
                                   │
                                  GND
```

| PCA9685 Channel | LED Number | Purpose |
|-----------------|------------|---------|
| CH0 | LED 0 | Egg sac 1 |
| CH1 | LED 1 | Egg sac 2 |
| CH2 | LED 2 | Egg sac 3 |
| CH3 | LED 3 | Egg sac 4 |
| CH4 | LED 4 | Egg sac 5 |
| CH5 | LED 5 | Egg sac 6 |
| CH6 | LED 6 | Egg sac 7 |
| CH7 | LED 7 | Egg sac 8 |
| ... | ... | (up to CH15) |

**Resistor Calculation:**

```
R = (Vsupply - Vled) / Iled

Example for standard red LED:
- Vsupply = 5V
- Vled = 2V (typical for red LED)
- Iled = 20mA = 0.02A
- R = (5V - 2V) / 0.02A = 150Ω

Use nearest standard value: 150Ω or 220Ω
```

**LED Polarity:**
- Anode (+) = longer leg, connects to PCA9685 via resistor
- Cathode (-) = shorter leg, flat side, connects to GND

### 4. Optional Pause Button

| Beetle Pin | Button Terminal | Purpose |
|------------|-----------------|---------|
| Pin 9 | Terminal 1 | Input |
| GND | Terminal 2 | Ground |

**Notes:**
- Uses internal pull-up resistor (INPUT_PULLUP)
- No external resistor needed
- Button shorts Pin 9 to GND when pressed

---

## Complete Wiring Diagram (ASCII)

```
                    ┌─────────────────┐
                    │  Beetle DFR0282 │
                    │                 │
                    │  SDA ───────────┼──────┐
                    │  SCL ───────────┼────┐ │
                    │  VCC ───────────┼──┐ │ │
                    │  GND ───────────┼┐ │ │ │
                    │                 ││ │ │ │
   [Button]         │  Pin 9 ─────────┘│ │ │ │
      │  │          │                  │ │ │ │
      │  └──────────┼─ GND ────────────┘ │ │ │
      │             └─────────────────────┘ │ │
      └─────────────────────────────────────┘ │
                                               │
        ┌──────────────────────────────────────┼──────┐
        │                                      │      │
        ↓                                      ↓      ↓
    ┌───────────────────────────────────────────────────┐
    │              PCA9685 PWM Driver                   │
    │                                                   │
    │  SDA SCL VCC GND               V+  GND           │
    │                                 │   │            │
    │  CH0 ─┬─[R]─→ LED0+ → LED0- ───┼───┤            │
    │  CH1 ─┼─[R]─→ LED1+ → LED1- ───┼───┤            │
    │  CH2 ─┼─[R]─→ LED2+ → LED2- ───┼───┤            │
    │  CH3 ─┼─[R]─→ LED3+ → LED3- ───┼───┤            │
    │  CH4 ─┼─[R]─→ LED4+ → LED4- ───┼───┤            │
    │  CH5 ─┼─[R]─→ LED5+ → LED5- ───┼───┤            │
    │  CH6 ─┼─[R]─→ LED6+ → LED6- ───┼───┤            │
    │  CH7 ─┴─[R]─→ LED7+ → LED7- ───┼───┘            │
    │  ...                            │                │
    └─────────────────────────────────┼────────────────┘
                                      │
                           ┌──────────┴──────────┐
                           │  5V Power Supply    │
                           │  (200mA+ or 1A)     │
                           │                     │
                           │  +5V          GND   │
                           └─────────────────────┘
```

---

## Wiring Checklist

Before powering on:

### Visual Inspection
- [ ] All connections secure (no loose wires)
- [ ] No exposed wire creating shorts
- [ ] LED polarity correct (anode to resistor, cathode to ground)
- [ ] Resistors present on all LEDs
- [ ] Common ground verified (Beetle + PCA9685 + Power)

### Connectivity Test
- [ ] SDA connected: Beetle → PCA9685
- [ ] SCL connected: Beetle → PCA9685
- [ ] VCC connected: Beetle → PCA9685
- [ ] GND connected: Beetle → PCA9685 → Power Supply
- [ ] V+ connected: Power Supply → PCA9685
- [ ] Each LED has resistor in series
- [ ] Each LED cathode goes to ground

### Electrical Test (Power OFF)
- [ ] Use multimeter to verify:
  - No shorts between V+ and GND
  - No shorts between channels
  - LED polarity correct (forward voltage ~2V when testing)

### First Power-Up
- [ ] Connect Beetle to USB first (logic power only)
- [ ] Run I2C scan: `pixi run led-test` → type `i`
- [ ] Verify PCA9685 detected at 0x40
- [ ] Connect external power supply
- [ ] Test single LED: type `0` in led-test
- [ ] If working, test remaining LEDs

---

## Common Wiring Mistakes

### Issue: PCA9685 not detected
**Cause:** I2C wiring incorrect
**Fix:**
- Verify SDA/SCL not swapped
- Check VCC/GND to PCA9685
- Ensure common ground

### Issue: LEDs don't light
**Cause:** Missing external power
**Fix:**
- Connect 5V power supply to V+ and GND
- Verify power supply is ON
- Check common ground connection

### Issue: LEDs very dim
**Cause:** Resistor value too high or wrong polarity
**Fix:**
- Recalculate resistor value
- Check LED polarity (anode to PCA9685, cathode to GND)

### Issue: LEDs stay on at full brightness
**Cause:** LED wired backwards
**Fix:**
- Swap LED connections (anode/cathode)

### Issue: Some LEDs work, others don't
**Cause:** Inconsistent wiring or bad LEDs
**Fix:**
- Test each LED individually with multimeter
- Check each resistor connection
- Verify channel connections to PCA9685

---

## Safety Notes

⚠️ **Never exceed maximum ratings:**
- Beetle USB current: 500mA max
- PCA9685 per-channel current: 25mA max
- LED current: Check datasheet (typically 20mA)
- Power supply voltage: 5V ± 0.25V

⚠️ **Always use current-limiting resistors:**
- Calculate for your specific LEDs
- Use standard values (150Ω, 220Ω, 330Ω common)
- Higher resistance = dimmer LED (safer)
- Lower resistance = brighter LED (may damage)

⚠️ **Check polarity before power-up:**
- LEDs only work in one direction
- Reversed LEDs won't light (won't be damaged at low current)
- Power supply polarity critical (can damage components)

---

## Reference

### Beetle Pinout
See `BEETLE_PINOUT.md` for complete Beetle pin reference (to be created from window_spider_trigger reference).

### PCA9685 Specifications
- I2C address: 0x40 (default)
- PWM resolution: 12-bit (0-4095)
- Channels: 16 (CH0-CH15)
- PWM frequency: Configurable (code uses 1000Hz)
- Max per-channel current: 25mA

### LED Specifications (Example)
Common LED forward voltages:
- Red: 1.8-2.2V
- Yellow/Green: 2.0-2.2V
- Blue/White: 3.0-3.4V

Typical LED current: 20mA
