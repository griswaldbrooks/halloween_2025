# Spider Crawl Projection

Black spiders walking left-to-right with proper inverse kinematics and alternating tetrapod gait.

**Status:** ✅ Geometry PERFECT! Zero leg intersections! IK system verified! | ⚠️ Locomotion needs refinement

## Quick Start

```bash
pixi install              # First time setup
pixi run serve            # Start server → http://localhost:8080
pixi run kill-server      # Stop server
pixi run open             # Main animation
pixi run open-editor      # Interactive leg editor (drag feet, export config)
pixi run open-visual-test # Single spider with annotations
```

**Animation Controls:** H (toggle UI) | F (fullscreen) | R (reset) | Space (pause)

## Architecture

### Core Files

- `leg-kinematics.js` - IK/FK for 2-segment legs with elbow bias
- `spider-model.js` - Body anatomy model (top-down view)
- `spider-animation.js` - Animation + gait controller (uses verified config)
- `spider-config.json` - **User's verified configuration (zero intersections)**
- `index.html` - Main animation page with controls
- `spider-editor.html` - **Interactive leg editor** (loads user config, drag feet, flip knees, export JSON)
- `test-visual-output.html` - Single spider with position annotations

### Reference

- `spider_template1.png` - **Reference template (TOP-DOWN view)**
  - Used to validate spider geometry
  - Shows body proportions, leg angles, natural curve

### Documentation

- `AGENT_HANDOFF.md` - **Complete handoff for next agent** (CRITICAL)
- `CHANGELOG.md` - Detailed version history
- `ISSUES.md` - Current known issues
- `spider-config.json` - Verified non-intersecting leg configuration

## Testing

### Run All Tests
```bash
pixi run test              # Run complete test suite (8 tests, all passing)
```

### Core Tests
```bash
pixi run test-kinematics   # IK/FK + elbow bias flip (✓ ALL PASS)
pixi run test-model        # Body model validation (✓ PASS)
pixi run test-integration  # Full spider simulation (✓ ALL PASS)
pixi run test-topdown      # Match reference template (✓ ALL PASS)
pixi run test-ik-accuracy  # IK solver precision (✓ 0.0 error!)
pixi run test-rendering    # Actual rendering positions (✓ ALL PASS)
pixi run test-leg-drawing  # Visual leg geometry (✓ ALL PASS)
```

### Configuration Tests
```bash
pixi run test-user-config  # Verify zero leg intersections (✓ PASS!)
pixi run test-intersections # Generic intersection detection
```

### Optimization Tools
```bash
pixi run optimize-legs      # Find non-intersecting reach values
pixi run optimize-individual # Fine-tune individual leg positions
```

**IMPORTANT:** Always use `pixi run <command>` - never run commands directly!

## Current Status

### ✅ Completed (All Tests Pass)

1. **IK Elbow Bias Fix (2025-10-21)** - Critical bug fix
   - Fixed elbow bias flip: both coxa AND femur angles now change
   - Foot stays in place when flipping IK solution (0.000000 error)
   - Added comprehensive tests to prevent regression

2. **Leg Intersection Detection (2025-10-21)** - Verification system
   - Line segment intersection algorithm
   - Tests all 28 pairs of leg segments
   - User configuration verified: ✅ ZERO INTERSECTIONS

3. **Custom Configuration (2025-10-21)** - User-verified setup
   - Elbow bias pattern: [-1, 1, -1, 1, 1, -1, 1, -1]
   - Custom foot positions verified to have zero intersections
   - Animation uses custom config throughout gait cycle

4. **Interactive Editor Enhancement (2025-10-21)**
   - Loads user's custom configuration
   - Graphical joint labels with coordinates
   - Shows actual rendered vs target positions
   - Clarified "Flip IK Solution" explanation

5. **Code Refactoring (2025-10-21)** - Clean codebase
   - Removed all versioned files (no more "v2")
   - Deleted 10 obsolete test/debug files
   - All references updated
   - Net reduction: 577 lines

6. **Body Proportions** - Matches reference template exactly
   - Abdomen: 100% of body size (large round segment)
   - Cephalothorax: 60% of body size (smaller segment)

7. **Leg Geometry** - Correct proportions and spread
   - Leg length: 75% × size per segment (150% total)
   - Legs spread outward in 8 directions
   - Natural curve from joint articulation

8. **IK/FK System** - All calculations accurate
   - Elbow bias controls joint bending direction
   - Forward/inverse kinematics working correctly
   - Zero error throughout system

### ⚠️ Still Needs Work

1. **Swing Phase Movement** - Legs during swing
   - In top-down view, swing is 2D motion (X-Y plane)
   - May need more visible movement during swing
   - Speed/distance of swing phase

2. **Stance vs Swing Distinction** - Visual clarity
   - Swing legs should move noticeably faster
   - Stance legs should stay planted
   - Transition timing may need adjustment

3. **Gait Feel** - Overall walking motion
   - Timing of phases may need tweaking
   - Lurch distance during stance
   - Pause durations between phases
   - Overall "spidery" appearance

## How Animation Works

### Procedural Gait System (Not Pose Lists!)

The animation uses a **6-phase alternating tetrapod gait**:

```
Phase 0 (200ms): Group A legs swing forward
Phase 1 (150ms): Group A plants, body lurches forward
Phase 2 (100ms): Pause
Phase 3 (200ms): Group B legs swing forward
Phase 4 (150ms): Group B plants, body lurches forward
Phase 5 (100ms): Pause
→ Repeat cycle
```

**Group A:** Legs 1, 2, 5, 6
**Group B:** Legs 0, 3, 4, 7

### Leg States

**SWING (leg in air):**
- Foot moves from current position → target position
- Target = custom foot position + future body position
- Interpolates smoothly over 200ms
- Uses verified non-intersecting positions

**STANCE (leg on ground):**
- Foot stays fixed in world coordinates
- Body moves forward past the foot
- IK automatically adjusts joint angles

## For Next Agent

### Start Here
1. **Read `AGENT_HANDOFF.md`** - Complete system documentation (CRITICAL!)
2. **Run `pixi run open-editor`** - Try the interactive editor
3. **Run `pixi run test`** - Verify all 8 tests pass
4. **Run `pixi run test-user-config`** - Confirm zero intersections
5. **Read `ISSUES.md`** - Current problems to fix (locomotion)

### Key Insights

- **Top-down view** (not side view!) - X=forward/back, Y=left/right
- **Reference template** at `spider_template1.png` shows correct geometry
- **All geometry tests pass** - focus on locomotion refinement now
- **Zero leg intersections** - configuration verified
- Use `pixi run` for everything (reproducible environment)

### Common Commands

```bash
pixi run status           # Show all available commands
pixi run serve            # Start development server
pixi run kill-server      # Stop server on port 8080
pixi run open             # Main animation
pixi run open-editor      # Interactive leg editor
pixi run test             # Run all 8 tests
pixi run test-user-config # Verify zero intersections
pixi run test-ik-accuracy # Verify IK is perfect (0.0 error)
```

### Debugging

- Check console in browser for any errors
- Use H key to show/hide controls while running
- Adjust speed/size sliders to see motion details
- Space bar to pause and examine leg positions
- Use interactive editor to experiment with leg positions

## File Summary

**Core Implementation (3 files):**
- `leg-kinematics.js` - IK/FK math
- `spider-model.js` - Body geometry
- `spider-animation.js` - Gait engine

**Configuration (1 file):**
- `spider-config.json` - Verified setup

**UI (3 files):**
- `index.html` - Main animation
- `spider-editor.html` - Interactive editor
- `test-visual-output.html` - Debug view

**Tests (8 files, all passing):**
- Core: kinematics, model, integration, topdown, ik-accuracy, rendering, leg-drawing
- Config: test-user-config (✓ zero intersections!)

**Documentation (4 files):**
- `README.md` - This file
- `AGENT_HANDOFF.md` - Complete handoff
- `CHANGELOG.md` - History
- `ISSUES.md` - Known issues

## Development Environment

Using **Pixi** for reproducible environment:
- Python 3.11+ (for http server)
- Node.js 20+ (for tests)

All dependencies managed by `pixi.toml` - no system installs needed!

**⚠️ CRITICAL: Always use `pixi run <command>`**
- Never run `node`, `python`, or `bash` directly
- Pixi ensures correct environment and dependencies
- Direct commands may use wrong versions or miss dependencies

## Research References

Spider locomotion based on:
1. "Biomechanics of octopedal locomotion" - Diagonal pairing
2. "Crawling at High Speeds" - Stance/swing mechanics
3. "Analysis of Spiders' Joint Kinematics" - Tetrapod gait

Current implementation uses alternating tetrapod gait with 6 phases.
