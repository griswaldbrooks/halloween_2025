# Switch Setup Guide

## Momentary Switch Integration

This guide covers how to physically set up the momentary switch for triggering the spider scare.

## Switch Types

Any **Normally Open (NO)** momentary switch will work:
- Push button
- Microswitch
- Magnetic reed switch
- Tilt switch
- Limit switch
- DIY aluminum foil contacts

## Basic Wiring

```
Arduino Leonardo
┌─────────────┐
│             │
│  Pin 2  ●───┼──── Switch Terminal 1
│             │
│  GND    ●───┼──── Switch Terminal 2
│             │
└─────────────┘

When switch CLOSES → Pin 2 connects to GND → TRIGGER!
```

**No resistor needed** - Arduino uses internal pull-up resistor.

## Creative Trigger Ideas

### 1. Object on Pedestal (Recommended)
**Trigger**: Guest picks up object

```
     ┌─────────────┐
     │   OBJECT    │  ← Fake spider egg, potion bottle, etc.
     └──────┬──────┘
            │
         ───┴───
        │SWITCH│  ← Microswitch under object
         ───────
      ┌──────────────┐
      │   PEDESTAL   │
      └──────────────┘
```

**How to build:**
1. Mount microswitch on pedestal top
2. Position so object weight keeps it pressed
3. When object is lifted, switch releases → TRIGGER
4. Wire: One terminal to Pin 2, other to GND

**Alternative wiring for "lift to trigger":**
- Use Normally Closed (NC) switch
- OR invert logic in Arduino code

### 2. Hidden Push Button
**Trigger**: Guest touches fake spider/web

```
    ┌─────────────┐
    │ FAKE SPIDER │  ← Decorative cover
    └──────┬──────┘
           │
        ┌──▼──┐
        │ BTN │  ← Button underneath
        └─────┘
```

Mount button behind/under decoration. When pressed → TRIGGER.

### 3. Magnetic Reed Switch
**Trigger**: Guest opens container/book

```
┌────────────────┐
│   CONTAINER    │    ← Lid/door has magnet
│    ┌──────┐    │
│    │MAGNET│    │
└────┴───┬──┴────┘
         │ magnetic field
    ┌────▼────┐
    │  REED   │  ← Switch on base
    │ SWITCH  │
    └─────────┘
```

When lid closes → magnet near switch → closed
When lid opens → magnet moves away → open → TRIGGER!

### 4. Tripwire/Web Strand
**Trigger**: Guest pulls on web

```
       Spider Web Decoration
            │
        ┌───▼────┐
        │ String │  ← Pull string
        └───┬────┘
            │
         ───┴───
        │SWITCH│  ← Lever-action microswitch
         ───────
```

When string pulled, activates lever switch → TRIGGER.

### 5. Pressure Plate (Advanced)
**Trigger**: Guest steps on spot

```
    ┌──────────────────┐
    │  Decorative Mat  │  ← Covers plate
    └────────┬─────────┘
             │
    ┌────────▼─────────┐
    │  Thin Board      │  ← Hinged or flexible
    └────────┬─────────┘
             │
          ───┴───
         │SWITCH│  ← Multiple switches for reliability
          ───────
    ┌──────────────────┐
    │  Floor/Platform  │
    └──────────────────┘
```

### 6. Tilt Switch
**Trigger**: Guest picks up/tilts object

```
         Object
    ┌──────────────┐
    │  [TILT SW]   │  ← Switch inside object
    │      │       │
    │   ───┴───    │
    │      ○       │  ← Ball bearing
    └──────────────┘

Upright: Ball on contacts → closed
Tilted:  Ball rolls off → open → TRIGGER!
```

## Mounting Examples

### For Spider Egg Object

```
Materials:
- Microswitch
- Fake egg (foam ball)
- Small platform/pedestal
- Hot glue

Assembly:
1. Hot glue switch to platform
2. Position egg so it presses switch lever
3. Test: Egg on = pressed, Egg lifted = released
4. Wire switch to Arduino
```

### For Cocoon/Web Touch

```
Materials:
- Push button
- Fake spider/cocoon
- Cardboard backing
- Wire

Assembly:
1. Cut hole in cocoon for button
2. Mount button from inside
3. Button flush with or slightly recessed
4. Cover with thin webbing material
5. Guest presses through webbing → TRIGGER
```

## Wiring Tips

### Using Long Wires
If Arduino is far from switch:
- Use 22-24 AWG wire (not too thin)
- Keep runs under 10 feet for best reliability
- Twist wires together to reduce interference
- Test thoroughly before final installation

### Multiple Switches (OR Logic)
Want multiple trigger points?

```
Arduino Pin 2 ─┬─── Switch 1 ─── GND
               │
               └─── Switch 2 ─── GND

Any switch closing triggers!
```

### Multiple Switches (AND Logic - Advanced)
Require multiple actions?

```
Arduino Pin 2 ─── Switch 1 ─── Switch 2 ─── GND

Both switches must be closed to trigger
(Modify Arduino code for this behavior)
```

## Testing

### Step 1: Wire Check
```bash
pixi run arduino-monitor
```

Watch serial output:
- **Switch open**: "Switch: RELEASED"
- **Switch closed**: "Switch: PRESSED"

### Step 2: Trigger Test
Close switch → should see:
```
Switch pressed at: X seconds
TRIGGER
```

Open switch → should see:
```
SWITCH_RELEASED
```

### Step 3: Cooldown Test
Close switch twice quickly → second time should see:
```
COOLDOWN
Wait X more seconds
```

## Troubleshooting

### Switch seems reversed (triggers when released)
**Solutions:**
1. Use normally closed (NC) terminal instead of NO
2. OR swap wiring (try other switch terminals)
3. OR invert logic in Arduino code:
   ```cpp
   if (switchState == HIGH && !switchPressed) { // Change LOW to HIGH
   ```

### Trigger happens randomly/constantly
**Problem:** Poor connection or floating pin
**Solutions:**
- Check wiring is secure
- Verify using INPUT_PULLUP in code
- Try shorter wires
- Add 10kΩ pull-up resistor (external)

### Switch doesn't trigger reliably
**Problem:** Mechanical bounce or worn contacts
**Solutions:**
- Increase DEBOUNCE_DELAY in code
- Clean switch contacts
- Replace switch
- Use better quality switch

### No response from switch
**Check:**
1. Arduino powered and connected
2. Serial monitor shows "READY"
3. Switch wiring correct (Pin 2 and GND)
4. Switch actually closes (test with multimeter)
5. Code uploaded to Arduino

## Advanced: DIY Switches

### Aluminum Foil Switch
```
Two pieces of foil with paper between
When compressed → foil touches → trigger!

Perfect for hidden pressure triggers
```

### Conductive Thread
```
Sew conductive thread into spider web decoration
When threads touch → trigger!
```

### Laser Tripwire (Requires Photoresistor)
```
Would need code modification
Laser points at photoresistor
When beam broken → trigger!
```

## Safety Notes

- Use low voltage only (5V from Arduino)
- Ensure all connections secure (no shorts)
- Don't use near water without waterproofing
- Test thoroughly before event
- Have backup switch ready

## Integration with Haunted House

Position the switch/object where:
1. Guests naturally want to interact
2. Fits the spider web tunnel theme
3. You can hide the wiring
4. Arduino/computer can be nearby
5. Monitor is visible from trigger point

**Example placement:**
```
[Monitor on Wall]
     ↑
     | USB cable
     |
[Arduino on shelf]
     ↑
     | Switch wires (hidden in webbing)
     |
[Pedestal with Egg Object] ← Guest trigger point
```

## Video Demonstrations

When testing, verify:
1. ✅ Switch triggers reliably
2. ✅ Video starts immediately
3. ✅ Cooldown prevents repeat triggers
4. ✅ Switch returns to ready state
5. ✅ LED provides visual feedback

Now you're ready to scare some guests! 🕷️
