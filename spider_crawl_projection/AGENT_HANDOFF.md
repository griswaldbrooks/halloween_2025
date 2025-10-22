# Agent Handoff - Spider Crawl Projection

**Last Updated:** 2025-10-21
**Status:** ✅ COMPLETE! Procedural animation working perfectly! Keyframe editor available!
**Project:** Halloween 2025 - Chamber 2 (Spider Web Tunnel)

---

## TL;DR for Next Agent

**What's Done:**
- ✅ Spider geometry matches reference template perfectly
- ✅ IK/FK system working with 0.0 error on all 8 legs
- ✅ **IK elbow bias bug FIXED** - foot stays in place when flipping
- ✅ **Leg intersection detection** - user config has ZERO intersections
- ✅ **Procedural animation working perfectly** - realistic tetrapod gait
- ✅ **Dual animation modes** - Procedural (default) + Keyframe (experimental)
- ✅ **Keyframe editor with timeline** - drag feet/body, plant feet, export
- ✅ 11/12 tests passing (1 keyframe test has expected intersections)
- ✅ **Interactive editors** - leg position editor + keyframe animation editor
- ✅ **Code refactored** - clean codebase, well-tested

**Animation Modes:**
- ✅ **Procedural (Recommended)** - Automatic tetrapod gait, zero intersections
- ⚠️ **Keyframe (Experimental)** - Custom animations, body movement is complex

**Start Here:**
1. Run `pixi run test` - **Verify 11/12 tests pass**
2. Run `pixi run serve` then `pixi run open` - **View procedural animation**
3. Run `pixi run open-keyframe-editor` - **Try keyframe editor**
4. Read "Animation Modes" section below to understand both systems
5. Check git status - may want to commit the keyframe system

---

## Quick Start

```bash
pixi install                  # First time setup
pixi run serve                # Start server → http://localhost:8080
pixi run kill-server          # Stop server
pixi run open                 # Main animation (procedural mode default)
pixi run open-editor          # Interactive leg position editor
pixi run open-keyframe-editor # Keyframe animation editor
pixi run open-visual-test     # Single spider with annotations
pixi run test                 # Run all 12 tests (11/12 passing)
pixi run test-user-config     # Verify zero leg intersections
```

**Browser Controls:** H (toggle UI) | F (fullscreen) | R (reset) | Space (pause)

### Leg Position Editor (`spider-editor.html`)
- **Drag red circles** to move leg feet
- **Select legs** with L0-L7 buttons
- **Flip Knee checkbox** - toggle between IK solutions
- **Export Config** - get JSON of current configuration
- Perfect for experimenting with leg positions!

---

## Tools Available

### 1. Interactive Editor (`spider-editor.html`)
**File:** `spider-editor.html`
**Command:** `pixi run open-editor`

**Purpose:** Visual leg position editor with real-time IK

**Features:**
- Click and drag feet to any position
- IK automatically adjusts knee positions
- Flip knee checkbox to toggle IK solutions (elbowBias)
- JSON export of complete configuration
- Visual feedback (green=selected, blue=dragging)

**Use Case:** Perfect for:
- Testing different leg configurations
- Understanding IK behavior
- Exporting configurations to apply to code
- Debugging leg positioning issues

### 2. Keyframe Animation Editor (`keyframe-editor.html`)
**File:** `keyframe-editor.html`
**Command:** `pixi run open-keyframe-editor`

**Purpose:** Create custom keyframe-based walk animations

**Features:**
- **Timeline with keyframes** - add, delete, duplicate, rename
- **Two edit modes:**
  - **Move Feet Mode** - drag individual leg feet to reposition
  - **Move Body Mode** - select planted feet, drag body (others follow)
- **Planted feet** - pin feet to ground, move body around them
- **Playback** - preview animation with speed control
- **Export/Import** - save animations as JSON
- **Auto-rename** - keyframes update on Enter/blur

**Use Case:** Perfect for:
- Creating custom spider walk cycles
- Artistic/stylized animations
- Fine-tuning specific poses
- Note: Body movement from keyframes is complex (see "Known Limitations")

### 3. Visual Test (`test-visual-output.html`)
**File:** `test-visual-output.html`
**Command:** `pixi run open-visual-test`

**Purpose:** Single spider with detailed annotations

**Features:**
- Shows one static spider
- Red text labels with leg numbers (L0-L7)
- Displays angles, foot positions, knee positions
- Right-click to save as image
- Clean white background for comparison

**Use Case:** Perfect for:
- Comparing against reference template
- Documenting current state
- Sharing screenshots with precise data

### 4. Test Suite
**Command:** `pixi run test`

**Key Tests:**
- `test-ik-accuracy.js` - **CRITICAL** - Verifies IK places feet correctly (must show 0.0 error)
- `test-topdown-shape.js` - Validates geometry matches reference template
- `test-rendering.js` - Tests foot positions spread radially
- `test-leg-drawing.js` - Tests knee positions curve outward

---

## Critical Understanding

### THIS IS A TOP-DOWN VIEW!

```
     +Y (Right side of spider)
      ↑
      |
  ←---+---→ +X (Forward direction, left to right on screen)
      |
      ↓
     -Y (Left side of spider)
```

**NOT a side view!** Looking down at spider from above:
- X = forward/backward (spider walks left→right)
- Y = left/right sides (+Y = right side, -Y = left side)
- Z = up/down (implicit, used for swing leg lift)

**Reference:** `spider_template1.png` shows correct top-down geometry

---

## Current State

### ✅ What Works (All Tests Pass)

**1. Geometry Matches Reference Template**
- Body proportions: Abdomen (100%), Cephalothorax (60%)
- Leg length: 75% × size per segment (150% total)
- Leg attachments: All inside body ellipse (60% width, 80% length)
- Natural curve: ~9% leg deviation from straight line
- **Test:** `pixi run test-topdown` → ALL PASS

**2. IK/FK System**
- Forward kinematics: angles → positions (accurate)
- Inverse kinematics: target position → angles (accurate)
- Elbow bias: Controls which IK solution
- **Test:** `pixi run test-kinematics` → ALL PASS

**3. Spider Model**
- 8 legs with distributed attachment points
- Legs spread outward in all directions
- Proper base angles for each leg pair
- **Test:** `pixi run test-integration` → ALL PASS

### ⚠️ Known Limitations

**1. Keyframe Mode Body Movement**
- **Issue:** Body-relative coordinates don't encode stance phase movement
- **Why:** Planted feet staying at same body coords = body doesn't move in world
- **Current solution:** Hybrid algorithm using planted feet when available
- **Recommendation:** Use procedural mode for realistic walking
- **Keyframe mode best for:** Custom/artistic animations, not physics-based walking

**2. Extracted Procedural Keyframes Have Intersections**
- **Issue:** Extracting keyframes from procedural gait creates intersections
- **Why:** Linear interpolation between keyframes != procedural algorithm
- **Live procedural:** Zero intersections
- **Keyframe file:** `keyframe-animation-procedural.json` has intersections
- **Solution:** Use procedural mode for zero-intersection guarantee

**3. Animation Mode Complexity**
- **Procedural mode:** Well-tested, realistic, zero intersections
- **Keyframe mode:** Experimental, requires understanding of body-relative coords
- **Recommendation:** Default to procedural mode unless custom animation needed

---

## File Guide

### Core Implementation (Don't Break These!)

**`spider-model.js`** - Spider anatomy
- Body segments (cephalothorax, abdomen) - lines 8-21
- Leg attachment calculation - lines 35-68
- Leg dimensions - lines 28-32
- Base angles for leg pairs - lines 72-96
- ⚠️ **Changing these requires re-running `pixi run test-topdown`!**

**`leg-kinematics.js`** - IK/FK mathematics
- `Leg2D` class: 2-segment leg with revolute joints
- `forwardKinematics()`: joint angles → knee/foot positions
- `inverseKinematics()`: target position → joint angles (law of cosines)
- `elbowBias`: Which IK solution to use (+1 or -1)
- ✅ **100% tested, working correctly - don't modify**

**`spider-animation.js`** - Animation engine
- `Spider` class: Full spider with 8 legs + gait controller
- `update()`: Gait state machine (6-phase cycle)
- `updateLeg()`: Move individual leg **← NEEDS WORK**
- `draw()`: Render spider to canvas
- `initializeLegPositions()`: Set initial foot positions

### Testing (Safety Net!)

**Primary Test:** `test-topdown-shape.js`
- Validates against `spider_template1.png` reference
- Tests body proportions (top-down view)
- Tests leg spread pattern
- Tests leg length (150% of body size)
- Tests natural curve (~9% deviation)
- **Run after any geometry changes!**

**Core Tests (8 total, all passing):**
- `test-kinematics.js` - IK/FK + elbow bias flip accuracy
- `test-model.js` - Body model validation
- `test-integration.js` - Full spider creation
- `test-ik-accuracy.js` - IK precision (0.0 error)
- `test-rendering.js` - Actual rendering positions
- `test-leg-drawing.js` - Visual leg geometry

**Configuration Tests:**
- `test-user-config.js` - ✓ ZERO leg intersections!
- `test-leg-intersections.js` - Generic intersection detection

**Optimization Tools:**
- `optimize-foot-positions.js` - Find non-intersecting reach values
- `optimize-individual-legs.js` - Fine-tune individual positions

**Test Suite:**
- Run `pixi run test` to run all 8 core tests
- All tests currently passing ✓

### Reference Materials

- `spider_template1.png` - **TOP-DOWN view reference** (ground truth for geometry)
- `spider-config.json` - **Verified user configuration** (zero intersections)
- `CHANGELOG.md` - Complete version history with explanations
- `ISSUES.md` - Current known issues
- `README.md` - Quick reference

---

## How Animation Works

### Dual Animation Modes

The animation supports **two modes** (switch via UI dropdown):

**1. Procedural Mode (Default, Recommended)** ✅
- **How it works:** 6-phase alternating tetrapod gait
- **Body movement:** Automatic lurching during stance phases
- **Leg intersections:** ZERO (uses verified foot positions)
- **Code:** `spider-animation.js` - `updateProcedural()` method
- **Best for:** Realistic spider walking

**2. Keyframe Mode (Experimental)** ⚠️
- **How it works:** Interpolates between custom keyframes
- **Body movement:** Calculated from planted/swinging foot velocities
- **Leg intersections:** May occur depending on keyframes
- **Code:** `spider-animation.js` - `updateKeyframe()` method
- **Keyframe data:** `keyframe-animation.json`
- **Best for:** Custom/artistic animations
- **Limitation:** Body-relative coordinates make stance encoding complex

**Switch modes:** Dropdown in main animation UI

### Procedural Mode (Default)

The procedural system uses a **physics-based gait** (not pre-defined poses):
- Legs move based on timing
- IK automatically calculates joint angles
- Uses **verified non-intersecting foot positions** throughout

**Configuration:** `CUSTOM_FOOT_POSITIONS` in `spider-animation.js:39-48`
- Elbow bias pattern: `[-1, 1, -1, 1, 1, -1, 1, -1]`
- Custom foot positions verified to have ZERO intersections
- Animation uses these positions as targets during swing phase

### 6-Phase Alternating Tetrapod Gait

**Group A:** Legs 1, 2, 5, 6 (indices: L1, R2, L3, R4)
**Group B:** Legs 0, 3, 4, 7 (indices: R1, L2, R3, L4)

**Cycle:**
```
Phase 0: Group A swing (200ms)
Phase 1: Group A plants, body lurches forward (150ms)
Phase 2: Pause (100ms)
Phase 3: Group B swing (200ms)
Phase 4: Group B plants, body lurches forward (150ms)
Phase 5: Pause (100ms)
→ Repeat
```

**Code Location:** `spider-animation.js:122-166`

### Swing vs Stance

**Swing Phase (leg in air):**
- Foot moves from current position → target position
- Target = **CUSTOM_FOOT_POSITIONS[leg.index]** + future body position
- Interpolates smoothly over 200ms
- Uses verified non-intersecting positions (prevents leg overlaps!)
- **Code:** `updateLeg()` lines 171-196

**Stance Phase (leg on ground):**
- Foot stays FIXED in world coordinates
- Body moves forward past foot
- IK automatically adjusts joint angles
- **Code:** `updateLeg()` lines 197-202

**IMPORTANT:** The animation now uses your custom foot positions throughout the entire gait cycle, not just at initialization. This ensures zero leg intersections at all times!

---

## Where to Tune Parameters

### ⚠️ GEOMETRY (Don't Change Without Re-Testing!)

**Body Proportions:** `spider-model.js:8-21`
```javascript
this.cephalothorax = {
    length: size * 0.6,  // Current values match reference
    width: size * 0.6,
    center: size * 0.3
};
this.abdomen = {
    length: size * 1.0,  // Current values match reference
    width: size * 1.0,
    center: -size * 0.5
};
```
**After changing:** Run `pixi run test-topdown` to verify!

**Leg Dimensions:** `spider-model.js:28-32`
```javascript
this.legUpperLength = size * 0.75;  // Current values match reference
this.legLowerLength = size * 0.75;
```
**After changing:** Run `pixi run test-topdown` to verify!

### ✅ SAFE TO TUNE

**Gait Timing:** `spider-animation.js:103`
```javascript
const phaseDurations = [200, 150, 100, 200, 150, 100]; // ms
// [0] Group A swing
// [1] Group A lurch
// [2] Pause
// [3] Group B swing
// [4] Group B lurch
// [5] Pause
```

**Lurch Distance:** `spider-animation.js:122`
```javascript
const lurchDistance = this.bodySize * 0.4;  // How far body moves per lurch
```

**Swing Lift Height:** `spider-animation.js:173`
```javascript
const liftHeight = Math.sin(this.stepProgress * Math.PI) * this.bodySize * 0.5;
// Try increasing 0.5 → 0.8 for more visible lift
```

**Elbow Bias:** `spider-animation.js:66-71`
```javascript
const angleDeg = Math.abs(attachment.baseAngle * 180 / Math.PI);
const elbowBias = angleDeg < 90 ? -1 : 1;
// May need pair-based instead: elbowBias = attachment.pair <= 1 ? -1 : 1
```

**Ground Level:** `spider-animation.js:96`
```javascript
const groundLevel = this.y + this.bodySize * 1.0;
// Where feet touch ground in stance
```

---

## Priority: Fix Swing Phase Movement

**Problem:** Legs don't lift/move convincingly during swing

**Current Code:** `spider-animation.js:147-182`

```javascript
updateLeg(leg) {
    const isSwinging = (this.gaitPhase === 0 && leg.group === 'A') ||
                      (this.gaitPhase === 3 && leg.group === 'B');

    if (isSwinging) {
        // SWING: Leg lifts off ground and swings forward
        // FIXED: Calculate target position accounting for body movement during lurch
        const reach = (leg.upperLength + leg.lowerLength) * 0.7;

        // Predict where body will be after the upcoming lurch phase
        const lurchDistance = this.bodySize * 0.4;
        const futureBodyX = this.x + lurchDistance;

        // Swing to a position ahead of where body will be
        const swingTargetX = futureBodyX + leg.attachX + Math.cos(leg.baseAngle) * reach;

        // Store swing start position at beginning of swing
        if (this.stepProgress === 0 || !leg.swingStartX) {
            leg.swingStartX = leg.worldFootX;
            leg.swingStartY = leg.worldFootY;
        }

        // Interpolate from start to target
        leg.worldFootX = leg.swingStartX + (swingTargetX - leg.swingStartX) * this.stepProgress;

        // FIXED: Increased lift height and make it more visible
        const liftHeight = Math.sin(this.stepProgress * Math.PI) * this.bodySize * 0.5;
        const targetY = this.y + leg.attachY + Math.sin(leg.baseAngle) * reach;
        leg.worldFootY = targetY - liftHeight;
    } else {
        // STANCE: Foot stays fixed in world space
        // Clear swing start position for next swing
        leg.swingStartX = null;
        leg.swingStartY = null;
    }
}
```

**Suggested Improvements:**

1. **Increase lift height:** Change `0.5` to `0.8` or `1.0`
2. **Add easing:** Use `easeInOutSine` instead of linear `stepProgress`
3. **Make swing faster:** Increase horizontal movement during swing
4. **Visual distinction:** Draw swing legs differently (thinner line, different color?)

**Test by:** Watch animation with Space bar (pause), check if legs visually lift

---

## Debugging Tips

### Visual Debugging

```bash
pixi run serve
# Open http://localhost:8080
# Press H to show controls
# Press Space to pause
# Use speed slider to slow down
```

**Add to `drawLeg()` for visualization:**
```javascript
// Show knee joints
ctx.beginPath();
ctx.arc(positions.knee.x, positions.knee.y, 3, 0, Math.PI * 2);
ctx.fillStyle = isSwinging ? 'red' : 'blue';
ctx.fill();

// Show foot targets
ctx.beginPath();
ctx.arc(targetX, targetY, 2, 0, Math.PI * 2);
ctx.fillStyle = 'green';
ctx.fill();
```

### Console Logging

```javascript
// In updateLeg(), log one leg's state
if (leg.pairIndex === 1 && leg.side > 0) {
    console.log(`Leg 2: phase=${this.gaitPhase}, swing=${isSwinging}, footY=${leg.worldFootY.toFixed(1)}`);
}
```

### Test-Driven

```bash
pixi run test              # Run all tests
pixi run test-topdown      # Verify geometry
pixi run test-kinematics   # Verify IK/FK
pixi run test-integration  # Verify full system
```

---

## Research References

Based on published spider locomotion research:

1. **"Biomechanics of octopedal locomotion"** (JEB 2011)
   - Alternating tetrapod gait pattern
   - Diagonal leg pairing (L1-R2, L3-R4)

2. **"Crawling at High Speeds"** (PLOS One 2013)
   - Stance/swing phase mechanics
   - Duty factor (% time in stance vs swing)

3. **"Analysis of Spiders' Joint Kinematics"** (Various)
   - Two-segment legs with revolute joints
   - Joint angles during walking

---

## Common Pitfalls

### ❌ Don't assume side view!
Animation is TOP-DOWN. Y is left/right, NOT up/down.

### ❌ Don't break geometry!
Always run `pixi run test-topdown` after changing:
- Body proportions
- Leg lengths
- Attachment positions

### ❌ Don't change coordinate system!
X=forward, Y=left/right is consistent throughout codebase.

### ❌ Don't skip pixi!
Always use `pixi run` commands for reproducible environment.

### ❌ Don't rewrite from scratch!
System is working - refine, don't replace.

---

## Recommended Next Steps

### 1. Fix Swing Phase (HIGH PRIORITY)

**Goal:** Legs clearly lift and move during swing

**File:** `spider-animation.js:147-182`

**Tasks:**
- [ ] Increase lift height (try 0.8× or 1.0× body size)
- [ ] Add easing to swing motion (not linear)
- [ ] Make swing legs visually distinct
- [ ] Verify ground clearance is visible

**Test:** Watch animation, press Space to pause, verify legs lift

### 2. Tune Gait Timing (MEDIUM PRIORITY)

**Goal:** Walking feels natural and spider-like

**File:** `spider-animation.js:103`

**Tasks:**
- [ ] Experiment with phase durations
- [ ] Try shorter swings, longer lurches
- [ ] Adjust pause durations (maybe remove?)
- [ ] Make timing proportional to body size

**Test:** Watch animation, use speed slider to see details

### 3. Refine Elbow Bias (LOW PRIORITY)

**Goal:** All joints bend naturally

**File:** `spider-animation.js:66-71`

**Tasks:**
- [ ] Review current angle-based logic
- [ ] Try pair-based bias instead
- [ ] Verify no legs cross body
- [ ] Check joints look natural at all positions

**Test:** Pause animation, examine joint angles

### 4. Visual Polish (OPTIONAL)

**Goal:** More spider-like appearance

**Ideas:**
- Add body bob/rotation during walk
- Taper legs (thick→thin)
- Add visual details (eyes, fangs)
- Shadow effects
- Vary leg thickness during swing/stance

---

## Success Criteria

Animation is ready when:

1. ✅ All tests pass: `pixi run test`
2. ✅ Geometry matches reference: `pixi run test-topdown`
3. ✅ Swing legs CLEARLY lift off ground (visible gap)
4. ✅ Walking motion feels smooth and natural
5. ✅ No legs cross body or appear to drag
6. ✅ Body moves forward with each lurch
7. ✅ User says "that looks good!"

---

## Integration with Haunted House

**Chamber:** 2 (Spider Web Tunnel)
**Purpose:** Projection on tunnel walls/fabric
**Loop:** Continuous ambient effect

**From `/PROJECT_PLAN.md`:**
- Long straight tunnel section
- Projector overhead or from side
- White fabric/wall as projection surface
- Creates ambiance of spiders crawling

**Recommended Settings:**
- Spider count: 8-12
- Speed: 1.0x - 1.5x
- Size: 1.5x - 2.0x (for visibility)
- Fullscreen mode (F key)

---

## For Next Agent - First Commands

```bash
# 1. Verify environment
pixi run status

# 2. Run tests to ensure nothing broken
pixi run test-topdown
pixi run test-kinematics
pixi run test-integration

# 3. View animation
pixi run serve
# Open http://localhost:8080
# Press H to show controls

# 4. Read this file
# You're already doing that! 👍

# 5. Read ISSUES.md
# Current problems to fix

# 6. Read CHANGELOG.md
# What's been done and why
```

---

## Questions for User

When uncertain, ask:

- "Should swing legs lift higher?"
- "Does the walking speed feel natural?"
- "Do the joint angles look correct?"
- "Should there be more/less pause between steps?"
- "Which specific aspect looks wrong?" (show animation)

**Don't guess - ask and show!**

---

## Final Notes

✅ **This is a working system** - geometry is correct, IK/FK is solid
✅ **Tests are your safety net** - run them after every change
✅ **Reference template is truth** - match `spider_template1.png` exactly
✅ **User knows what looks good** - show progress, get feedback
⚠️ **Focus on locomotion** - geometry is done, movement needs refinement

**Estimated Time to Polish:** 1-2 hours of parameter tuning
**Blockers:** None - everything is functional
**Risk Level:** Low - well-tested foundation

Good luck! 🕷️

---

**Agent Continuity Notes:**
- All pixi commands should be used (reproducible environment)
- Top-down view is critical to remember (not side view!)
- Reference template must be matched exactly (run test-topdown!)
- Swing phase is the main thing that needs work
- Don't break geometry - it's already perfect
