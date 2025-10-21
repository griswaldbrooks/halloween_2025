# Spider Geometry Issues - Analysis

**Date:** 2025-10-20
**Status:** ✅ ALL ISSUES RESOLVED (2025-10-20 Final)

**This document preserved for historical reference - all geometry problems are now fixed!**

**For Next Agent:**
- All geometry tests pass: `pixi run test` → ALL PASS ✅
- IK accuracy: `pixi run test-ik-accuracy` → 0.0 error ✅
- Use interactive editor: `pixi run open-editor` to experiment
- See `CHANGELOG.md` for complete fix history
- See `ISSUES.md` for remaining work (locomotion only)

---

## Summary of Issues

All three reported visual problems have been confirmed by unit tests:

1. ✗ Body appears too small
2. ✗ Legs originate outside the body
3. ✗ Legs cross over each other

## Detailed Analysis

### Issue 1: Body Too Small

**Test Result:** `test-visual-geometry.js` TEST 1 FAIL

**Problem:**
- Body radius / leg length ratio: **0.17** (should be ≥ 0.25)
- Max body radius: **3.6 pixels**
- Total leg length: **21.6 pixels**
- Body is visually insignificant compared to legs

**Root Cause:**
```javascript
// In spider-model.js
this.cephalothorax = {
    length: size * 0.6,  // Too small!
    width: size * 0.4,   // Too small!
};

this.legUpperLength = size * 0.9;  // Too large!
this.legLowerLength = size * 0.9;  // Too large!
```

**Proposed Fix:**
- Increase body proportions to size * 0.8 or size * 1.0
- Reduce leg length to size * 0.7 or size * 0.8
- Target ratio: body radius ≥ 0.3 × leg length

---

### Issue 2: Legs Attach OUTSIDE Body

**Test Result:** `test-visual-geometry.js` TEST 2 FAIL

**Problem:**
ALL 8 leg attachment points are OUTSIDE the cephalothorax ellipse!

| Leg | X    | Y     | Normalized Distance | Status        |
|-----|------|-------|---------------------|---------------|
| 0   | 7.20 | 2.40  | 1.414               | ✗ OUTSIDE     |
| 1   | 7.20 | -2.40 | 1.414               | ✗ OUTSIDE     |
| 2   | 4.80 | 2.40  | 1.054               | ✗ OUTSIDE     |
| 3   | 4.80 | -2.40 | 1.054               | ✗ OUTSIDE     |
| 4   | 2.40 | 2.40  | 1.054               | ✗ OUTSIDE     |
| 5   | 2.40 | -2.40 | 1.054               | ✗ OUTSIDE     |
| 6   | 0.00 | 2.40  | 1.414               | ✗ OUTSIDE     |
| 7   | 0.00 | -2.40 | 1.414               | ✗ OUTSIDE     |

**Root Cause:**

The cephalothorax is an ellipse with:
- Center: (3.6, 0)
- Radii: (3.6, 2.4)

But legs attach at:
- Y = ±cephWidth/2 = ±2.4 (on the edge in Y dimension)
- X = distributed from 0 to 7.2 (beyond the ellipse in X dimension)

For an ellipse, a point is inside if: `(x-cx)²/a² + (y-cy)²/b² ≤ 1`

For leg 0 at (7.20, 2.40):
```
(7.20 - 3.6)² / 3.6² + (2.40 - 0)² / 2.4²
= 12.96/12.96 + 5.76/5.76
= 1 + 1
= 2.0 (should be ≤ 1.0!)
```

**Proposed Fix:**
```javascript
// Attachments should be INSIDE the ellipse
// Use 60-70% of the radius, not 100%
attachments.push({
    x: x,
    y: cephWidth / 2 * 0.6,  // 60% of radius (was 100%)
    // ...
});
```

---

### Issue 3: Legs Cross Over Each Other

**Test Result:** `test-spider-geometry.js` TEST 3 FAIL

**Problem:**
Left side legs cross at all positions. Foot Y coordinates go from negative to positive:

| Leg | Attach Y | Foot Y  | Base Angle | Expected |
|-----|----------|---------|------------|----------|
| 1   | -2.00    | -12.91  | 240°       | ✓ OK     |
| 3   | -2.00    | -8.30   | 210°       | ✓ OK     |
| 5   | -2.00    | **4.30**| 150°       | ✗ WRONG  |
| 7   | -2.00    | **8.91**| 120°       | ✗ WRONG  |

Right side legs ALSO have issues:

| Leg | Attach Y | Foot Y   | Base Angle | Expected |
|-----|----------|----------|------------|----------|
| 0   | 2.00     | **-8.91**| -60°       | ✗ WRONG  |
| 2   | 2.00     | **-4.30**| -30°       | ✗ WRONG  |
| 4   | 2.00     | 8.30     | 30°        | ✓ OK     |
| 6   | 2.00     | 12.91    | 60°        | ✓ OK     |

**Root Cause:**

In `spider-model.js` `getLegBaseAngle()`:

```javascript
if (pairIndex === 0) {
    // Front legs: 60° forward from perpendicular
    angle = side > 0 ? -Math.PI/3 : Math.PI + Math.PI/3;
    //              ^^^ WRONG! Should be +Math.PI/3 for right side
}
```

For right side (side > 0), front legs use `-Math.PI/3` = -60°
- This points UPWARD (toward negative Y)
- But right side should point DOWNWARD (toward positive Y)

**Proposed Fix:**

Right side legs should have positive Y components:
- Front: 60° (not -60°)
- Front-middle: 30° (not -30°)
- Back-middle: 30° (correct)
- Back: 60° (correct)

Left side legs should have negative Y components:
- Front: 180° - 60° = 120° (not 240°!)
- Front-middle: 180° - 30° = 150° (not 210°!)
- Back-middle: 180° + 30° = 210° (correct)
- Back: 180° + 60° = 240° (correct)

Wait, let me recalculate...

Actually, looking at the coordinate system:
- 0° points right (+X, 0)
- 90° points down (+Y)
- 180° points left (-X, 0)
- 270° points up (-Y)

For RIGHT side (Y > 0), legs should point generally towards +Y side (angles near 90°):
- Front right: Should point forward-right-down → ~45-60°
- Back right: Should point backward-right-down → ~120-135°

For LEFT side (Y < 0), legs should point generally towards -Y side (angles near 270°):
- Front left: Should point forward-left-up → ~300-315° or equivalently -45 to -60°
- Back left: Should point backward-left-up → ~225-240°

The current implementation has the angles backwards for front legs!

---

## Testing

Run tests to verify issues:
```bash
node test-spider-geometry.js
node test-visual-geometry.js
```

## Fixes Required

1. **spider-model.js** - Increase body size proportions
2. **spider-model.js** - Move leg attachments inside body (use 60-70% of radius)
3. **spider-model.js** - Fix leg base angles (front legs pointing wrong direction)

See proposed fixes in separate commit.
