# Known Issues

**Last Updated:** 2025-10-20 (Late Night)

## Current Issues

### 1. Swing Leg Movement (HIGH PRIORITY)

**Problem:** Legs during swing phase don't lift or move convincingly enough

**Symptoms:**
- Legs may appear to drag instead of lifting cleanly off ground
- Ground clearance may not be visible
- Swing motion may look robotic/linear

**Location:** `spider-animation-v2.js:147-182` (updateLeg function)

**Potential Fixes:**
- Increase lift height from 0.5× to 0.8× or 1.0× body size
- Add easing to swing motion (not linear interpolation)
- Make swing legs move faster than body
- Add visual distinction (different line weight/color during swing)

**Test:** Run `pixi run serve`, press Space to pause, verify legs lift visibly

---

### 2. Gait Timing (MEDIUM PRIORITY)

**Problem:** Walking motion may not feel natural

**Symptoms:**
- Timing feels off/jerky
- Pauses between steps feel too long
- Speed doesn't match what user expects for spider

**Location:** `spider-animation-v2.js:103`

**Current Values:**
```javascript
const phaseDurations = [200, 150, 100, 200, 150, 100]; // ms
```

**Potential Fixes:**
- Experiment with different durations
- Try shorter swings, longer lurches
- Reduce or remove pause phases
- Make timing proportional to spider body size

**Test:** Watch animation, adjust speed slider to see details

---

### 3. Elbow Bias Logic (LOW PRIORITY)

**Problem:** Some joints may bend in unnatural directions

**Symptoms:**
- Legs appear to cross body centerline
- Joints bend "wrong" way
- Left/right asymmetry

**Location:** `spider-animation-v2.js:66-71`

**Current Logic:**
```javascript
const angleDeg = Math.abs(attachment.baseAngle * 180 / Math.PI);
const elbowBias = angleDeg < 90 ? -1 : 1;
```

**Potential Fixes:**
- Try pair-based bias: `elbowBias = attachment.pair <= 1 ? -1 : 1`
- Try side-based bias: `elbowBias = attachment.side`
- Custom logic per leg pair

**Test:** Pause animation, check if all knees bend naturally

---

## Non-Issues (Working Correctly)

### ✓ Body Proportions
Spider body matches reference template exactly
- Test: `pixi run test-topdown` → PASS

### ✓ Leg Length
Legs are correct length (150% of body size)
- Test: `pixi run test-topdown` → PASS

### ✓ Leg Attachments
All 8 legs attach inside body ellipse
- Test: `pixi run test-topdown` → PASS

### ✓ IK/FK System
Inverse/forward kinematics calculations accurate
- Test: `pixi run test-kinematics` → ALL PASS

### ✓ Leg Spread
Legs spread outward in correct directions (not crossing)
- Test: `pixi run test-topdown` → PASS

### ✓ Coordinate System
Top-down view with correct X/Y mapping
- X = forward/backward
- Y = left/right
- No issues with coordinate confusion

---

## Resolved Issues

### ~~Body Too Small~~ ✅ FIXED (2025-10-20 Evening)
Body was tiny compared to legs - fixed by adjusting proportions
- Abdomen: 100% of size
- Cephalothorax: 60% of size
- Leg segments: 75% of size each

### ~~Legs Originate Outside Body~~ ✅ FIXED (2025-10-20 Evening)
All leg attachments were outside body ellipse - fixed by:
- Using 60% of width radius (not 100%)
- Using 80% of length (with 10% margins)

### ~~Legs Cross Over Each Other~~ ✅ FIXED (2025-10-20 Evening)
Legs were crossing to wrong side - fixed by:
- Correcting leg base angles
- Right legs: 45°, 75°, 105°, 135°
- Left legs: -45°, -75°, -105°, -135°

### ~~Incorrect View Assumption~~ ✅ FIXED (2025-10-20 Late Night)
Was testing for side view instead of top-down - fixed by:
- Creating `test-topdown-shape.js` for correct top-down validation
- Understanding coordinate system properly

---

## Enhancement Ideas (Not Issues)

These aren't problems, just potential improvements:

1. **Body Movement During Walk**
   - Add subtle bob/rotation
   - Make body sway slightly

2. **Visual Details**
   - Taper legs (thick→thin toward tips)
   - Add eyes/fangs to body
   - Shadow effects

3. **Leg Rendering**
   - Show joint circles
   - Vary line thickness
   - Different colors for swing vs stance

4. **Performance Optimization**
   - Cache IK solutions when foot hasn't moved
   - Optimize canvas rendering
   - Reduce redraw frequency

5. **Variety**
   - Different spider sizes
   - Variable speeds
   - Occasional direction changes

---

## How to Report Issues

If you find a new issue:

1. **Verify it's actually broken:**
   - Run `pixi run test-topdown` - do geometry tests pass?
   - Run `pixi run test-kinematics` - do IK tests pass?
   - Run `pixi run test-integration` - does full system work?

2. **Document the issue:**
   - What's the symptom? (what do you see that's wrong?)
   - Where is it? (which file/function/line?)
   - How to reproduce? (steps to see the problem)

3. **Add to this file** in "Current Issues" section with:
   - Problem description
   - Location in code
   - Potential fixes
   - Test to verify fix

---

## Testing Checklist

Before considering issues "fixed":

- [ ] `pixi run test-topdown` → ALL PASS (geometry correct)
- [ ] `pixi run test-kinematics` → ALL PASS (IK/FK accurate)
- [ ] `pixi run test-integration` → ALL PASS (full system works)
- [ ] View `pixi run serve` → Swing legs clearly lift off ground
- [ ] View `pixi run serve` → Walking motion feels natural
- [ ] View `pixi run serve` → No legs cross body or drag
- [ ] User approval → "That looks good!"

---

**Note:** This file tracks actual problems. For feature requests or enhancements, add to "Enhancement Ideas" section instead.
