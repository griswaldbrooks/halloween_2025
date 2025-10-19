# Wiring Diagram - Twitching Body with PCA9685

## Components

- **DFRobot Beetle** (DFR0282) - Leonardo-compatible microcontroller
- **PCA9685 16-Channel PWM Driver** - I2C servo controller
- **3x HS-755MG Servos** - High-torque servos (head, left arm, right arm)
- **5V Power Supply** - 5A+ recommended for 3x HS-755MG servos
- **Jumper Wires**

---

## Power Requirements

**HS-755MG Servo Specifications:**
- Operating Voltage: 4.8V - 6.0V
- Stall Current: ~2.5A @ 6V
- Typical Current: 500-800mA per servo

**Total Power:**
- 3 servos × 800mA = ~2.4A typical
- Peak (all stalled): ~7.5A
- **Recommended: 5V 5A+ power supply**

---

## Wiring Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         TWITCHING BODY WIRING                                │
└─────────────────────────────────────────────────────────────────────────────┘

                        ┌──────────────────┐
                        │   DFRobot        │
                        │   Beetle         │
                        │   (DFR0282)      │
                        │                  │
                        │  SDA  ●──────────┼─────────┐
                        │  SCL  ●──────────┼─────┐   │
                        │                  │     │   │
                        │  VCC  ●──────────┼───┐ │   │
                        │  GND  ●──────────┼─┐ │ │   │
                        │                  │ │ │ │   │
                        └──────────────────┘ │ │ │   │
                                             │ │ │   │
                                             │ │ │   │
                        ┌────────────────────┼─┼─┼───┼────────────┐
                        │    PCA9685         │ │ │   │            │
                        │    PWM Driver      │ │ │   │            │
                        │                    │ │ │   │            │
                        │  GND    ●──────────┘ │ │   │            │
                        │  VCC    ●────────────┘ │   │            │
                        │  SDA    ●──────────────┘   │            │
                        │  SCL    ●──────────────────┘            │
                        │                                         │
                        │  V+     ●───────────────────┐           │
                        │  GND    ●─────────────────┐ │           │
                        │                           │ │           │
                        │  PWM 0  ●─────────────┐   │ │           │
                        │  PWM 1  ●─────────┐   │   │ │           │
                        │  PWM 2  ●─────┐   │   │   │ │           │
                        │               │   │   │   │ │           │
                        └───────────────┼───┼───┼───┼─┼───────────┘
                                        │   │   │   │ │
                                        │   │   │   │ │
                        ┌───────────────┘   │   │   │ │
                        │   ┌───────────────┘   │   │ │
                        │   │   ┌───────────────┘   │ │
                        │   │   │                   │ │
                    ┌───▼───▼───▼───────────────────▼─▼────────┐
                    │                                           │
                    │     5V POWER SUPPLY (5A+)                 │
                    │                                           │
                    │     +5V  ●────────────────────────────┐   │
                    │     GND  ●────────────────────────┐   │   │
                    │                                   │   │   │
                    └───────────────────────────────────┼───┼───┘
                                                        │   │
                    ┌───────────────────────────────────┘   │
                    │   ┌───────────────────────────────────┘
                    │   │
                    │   │       ┌──────────────┐
                    │   │       │ HEAD SERVO   │
                    │   │       │  (HS-755MG)  │
                    │   │       │              │
                    │   └───────┤ Red   (PWR)  │
                    │       ┌───┤ Brown (GND)  │
                    └───────┼───┤ Orange(SIG)  │──── To PCA9685 PWM 0
                            │   └──────────────┘
                            │
                            │   ┌──────────────┐
                            │   │ LEFT ARM     │
                            │   │  (HS-755MG)  │
                            │   │              │
                            └───┤ Red   (PWR)  │
                            ┌───┤ Brown (GND)  │
                    ┌───────┼───┤ Orange(SIG)  │──── To PCA9685 PWM 1
                    │       │   └──────────────┘
                    │       │
                    │       │   ┌──────────────┐
                    │       │   │ RIGHT ARM    │
                    │       │   │  (HS-755MG)  │
                    │       │   │              │
                    │       └───┤ Red   (PWR)  │
                    │       ┌───┤ Brown (GND)  │
                    └───────┼───┤ Orange(SIG)  │──── To PCA9685 PWM 2
                            │   └──────────────┘
                            │
                    To Power Supply GND
```

---

## Connection Table

### Beetle to PCA9685 (I2C Communication)

| Beetle Pin | PCA9685 Pin | Wire Color (Suggested) |
|------------|-------------|------------------------|
| SDA        | SDA         | Blue                   |
| SCL        | SCL         | Yellow                 |
| VCC (5V)   | VCC         | Red                    |
| GND        | GND         | Black                  |

**Note:** The Beetle's SDA and SCL pins are available on the board. Refer to Beetle pinout.

### PCA9685 to Power Supply (Servo Power)

| PCA9685 Pin | Power Supply | Wire Gauge | Notes                    |
|-------------|--------------|------------|--------------------------|
| V+          | +5V          | 18-20 AWG  | High current - thick wire|
| GND (next to V+) | GND     | 18-20 AWG  | Common ground            |

### PCA9685 to Servos (PWM Signals)

| Servo      | PCA9685 Channel | Servo Wire Colors        |
|------------|-----------------|--------------------------|
| Head       | PWM 0           | Orange→PWM0, Red→V+, Brown→GND |
| Left Arm   | PWM 1           | Orange→PWM1, Red→V+, Brown→GND |
| Right Arm  | PWM 2           | Orange→PWM2, Red→V+, Brown→GND |

### Servos to Power Supply

| Servo Pin     | Connection              | Notes                    |
|---------------|-------------------------|--------------------------|
| Red (all)     | Power Supply +5V        | Can share V+ on PCA9685  |
| Brown (all)   | Power Supply GND        | Must share common ground |
| Orange (each) | PCA9685 PWM 0, 1, 2     | Signal wires             |

---

## Physical Setup Instructions

### Step 1: PCA9685 to Beetle (I2C)

1. **SDA Connection:**
   - Beetle SDA pin → PCA9685 SDA pin
   - Use blue wire

2. **SCL Connection:**
   - Beetle SCL pin → PCA9685 SCL pin
   - Use yellow wire

3. **Power (Logic):**
   - Beetle VCC (5V) → PCA9685 VCC
   - Beetle GND → PCA9685 GND
   - Use red and black wires

### Step 2: Power Supply to PCA9685

1. **V+ Connection (Servo Power):**
   - Power supply +5V → PCA9685 V+ terminal
   - **Use thick wire (18-20 AWG)** - carries high current
   - This terminal is separate from VCC (logic power)

2. **Ground Connection:**
   - Power supply GND → PCA9685 GND terminal (next to V+)
   - **Use thick wire (18-20 AWG)**
   - **CRITICAL:** This ground must be shared with Beetle GND

3. **Common Ground:**
   - Ensure Beetle GND and Power Supply GND are connected
   - Can connect through PCA9685 GND or use star ground topology

### Step 3: Servos to PCA9685

Each HS-755MG servo has 3 wires:
- **Brown/Black:** Ground
- **Red:** Power (+5V)
- **Orange/Yellow:** Signal (PWM)

**Head Servo (Channel 0):**
1. Plug servo connector into PCA9685 PWM 0
2. Ensure correct orientation:
   - Brown → GND (closest to edge)
   - Red → V+ (middle)
   - Orange → PWM signal (inner)

**Left Arm Servo (Channel 1):**
1. Plug into PCA9685 PWM 1
2. Same orientation as above

**Right Arm Servo (Channel 2):**
1. Plug into PCA9685 PWM 2
2. Same orientation as above

---

## Beetle Pinout Reference (DFR0282)

```
     ┌─────────────┐
     │    USB-C    │
     └─────────────┘
           │
    ┌──────┴──────┐
    │ •9  •10 •11 │  ← Digital pins
    │             │
    │ Beetle      │
    │  DFR0282    │
    │             │
    │ •SCL •SDA   │  ← I2C pins (use these!)
    │ •A0  •A1    │
    │ •VCC •GND   │
    └─────────────┘
```

**I2C Pins:**
- **SDA:** I2C Data (connect to PCA9685 SDA)
- **SCL:** I2C Clock (connect to PCA9685 SCL)

---

## PCA9685 Terminal Layout

```
┌─────────────────────────────────────────┐
│           PCA9685 PWM Driver             │
├─────────────────────────────────────────┤
│                                          │
│  [VCC] [GND] [SDA] [SCL]  ← Logic side  │
│                                          │
│  [V+]  [GND]              ← Power side  │
│                                          │
│  PWM Channels (3-pin headers):           │
│  [0] [1] [2] [3] [4] ... [15]           │
│   │   │   │                              │
│   │   │   └── Right Arm (HS-755MG)      │
│   │   └────── Left Arm (HS-755MG)       │
│   └────────── Head (HS-755MG)           │
│                                          │
└─────────────────────────────────────────┘

Each PWM channel has 3 pins:
  [GND] [V+] [PWM]
   │     │     └── Signal (Orange)
   │     └──────── Power (Red)
   └────────────── Ground (Brown)
```

---

## Grounding - CRITICAL

**All grounds must be connected:**
1. Beetle GND
2. PCA9685 GND (logic side)
3. PCA9685 GND (power side, next to V+)
4. Power supply GND
5. All servo brown wires (through PCA9685)

**Star Ground Topology (Recommended):**
```
         Power Supply GND (center point)
                  │
        ┌─────────┼─────────┐
        │         │         │
    Beetle    PCA9685   Servos
     GND       GND      (via PCA9685)
```

---

## Power Supply Recommendations

### Option 1: AC to DC Adapter (Recommended)
- **Rating:** 5V 5A (25W) minimum
- **Connector:** 2.1mm barrel jack or screw terminals
- **Brands:** Mean Well, TDK-Lambda, ALITOVE
- **Cost:** $10-20

### Option 2: USB Power Bank (Testing)
- **Rating:** 5V 3A output
- **Use:** Good for testing, may brownout under load
- **Note:** Not recommended for production use

### Option 3: Bench Power Supply
- **Settings:** 5.0V, current limit 5A
- **Use:** Ideal for development and testing

---

## Safety Notes

⚠️ **IMPORTANT:**
1. **Current Capacity:** HS-755MG servos draw high current. Ensure power supply can deliver 5A+
2. **Wire Gauge:** Use 18-20 AWG wire for power connections (V+ and GND from supply to PCA9685)
3. **Common Ground:** ALL grounds must be connected together
4. **Polarity:** Double-check servo connections - reversed polarity can damage servos
5. **Power Sequence:**
   - Connect servos and wiring FIRST
   - Apply power LAST
   - Disconnect power FIRST when changing wiring
6. **Voltage:** HS-755MG rated for 4.8-6V. Use 5V for safety margin
7. **Heat:** High-torque servos generate heat. Ensure ventilation

---

## Troubleshooting Wire Connections

### PCA9685 Not Detected
- Check SDA and SCL connections
- Verify VCC (3.3V/5V) to PCA9685 VCC
- Check I2C address (default 0x40)

### Servos Not Moving
- Check V+ and GND to PCA9685 power terminals
- Verify servo connectors fully seated
- Ensure common ground between all components
- Check power supply is ON and delivering 5V

### Servos Jitter/Twitch
- Insufficient power supply current
- Poor ground connection
- Wire too thin for current draw
- Add capacitor (1000µF) across V+ and GND at PCA9685

---

## Testing Checklist

Before running test code:

- [ ] Beetle connected to computer via USB
- [ ] PCA9685 I2C connections: SDA, SCL, VCC, GND to Beetle
- [ ] PCA9685 V+ and GND connected to 5V power supply
- [ ] All grounds connected (common ground)
- [ ] Head servo connected to PWM 0
- [ ] Left arm servo connected to PWM 1
- [ ] Right arm servo connected to PWM 2
- [ ] Servo connectors correct orientation (Brown-Red-Orange)
- [ ] Power supply turned OFF (turn on AFTER code upload)
- [ ] No loose wires or shorts

---

## I2C Address

**Default PCA9685 Address:** `0x40`

If you need to change the address, solder jumpers on the PCA9685 board:
- A0, A1, A2, A3, A4, A5 jumpers
- Each jumper adds to base address 0x40

For this project, use default **0x40** (no jumpers).

---

## Next Steps

After wiring is complete:
1. **Run test script:** See `arduino/servo_test/servo_test.ino`
2. **Verify I2C detection**
3. **Test individual servo movement**
4. **Calibrate rest positions**
5. **Deploy production code**
