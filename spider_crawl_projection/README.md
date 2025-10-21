# Spider Crawl Projection

Black spiders walking left-to-right with proper inverse kinematics and alternating tetrapod gait.

**Status:** ✅ Geometry FIXED - legs curve correctly! | ⚠️ Locomotion needs refinement

## Quick Start

```bash
pixi install        # First time setup
pixi run serve      # Start server → http://localhost:8080
pixi run open       # Auto-open browser
```

**Controls:** H (toggle UI) | F (fullscreen) | R (reset) | Space (pause)

## Architecture

### Core Files

- `leg-kinematics.js` - IK/FK for 2-segment legs with elbow bias
- `spider-model.js` - Body anatomy model (top-down view)
- `spider-animation-v2.js` - Animation + gait controller
- `index.html` - Main page with controls

### Reference

- `spider_template1.png` - **Reference template (TOP-DOWN view)**
  - Used to validate spider geometry
  - Shows body proportions, leg angles, natural curve

### Documentation

- `AGENT_HANDOFF.md` - **Complete handoff for next agent**
- `CHANGELOG.md` - Detailed version history
- `ISSUES.md` - Current known issues
- `GEOMETRY_ISSUES.md` - Past geometry problems (RESOLVED)

## Testing

### Run All Tests
```bash
pixi run test              # Run complete test suite
```

### Individual Tests
```bash
pixi run test-kinematics   # IK/FK calculations (✓ ALL PASS)
pixi run test-model        # Body model validation (✓ PASS)
pixi run test-topdown      # Match reference template (✓ ALL PASS)
pixi run test-rendering    # Actual rendering positions (✓ ALL PASS)
pixi run test-leg-drawing  # Visual leg geometry (✓ ALL PASS)
pixi run test-ik-accuracy  # IK solver precision (✓ 0.0 error!)
pixi run test-integration  # Full spider simulation (✓ ALL PASS)
pixi run test-geometry     # Legacy geometry tests
pixi run test-visual       # Legacy visual tests
pixi run test-angles       # Legacy angle tests
```

**IMPORTANT:** Always use `pixi run <command>` - never run commands directly!

### Test Files

- `test-kinematics.js` - IK/FK accuracy tests
- `test-model.js` - Body proportions and attachments
- `test-topdown-shape.js` - **Match reference template (PRIMARY)**
- `test-rendering.js` - **Tests actual rendered leg positions (CRITICAL)**
- `test-leg-drawing.js` - **Tests visual leg geometry - knees curve outward (CRITICAL)**
- `test-integration.js` - Full spider creation
- `test-spider-geometry.js` - Basic geometry validation
- `test-visual-geometry.js` - Visual regression tests
- `test-leg-angles.js` - Angle calculation tests
- `test-reference-shape.js` - Old side-view test (ignore)

## Development Environment

Using **Pixi** for reproducible environment:
- Python 3.11+ (for http server)
- Node.js 20+ (for tests)

All dependencies managed by `pixi.toml` - no system installs needed!

**⚠️ CRITICAL: Always use `pixi run <command>`**
- Never run `node`, `python`, or `bash` directly
- Pixi ensures correct environment and dependencies
- Direct commands may use wrong versions or miss dependencies

## Current Status

### ✅ Fixed (All Tests Pass)

1. **Body Proportions** - Matches reference template exactly
   - Abdomen: 100% of body size (large round segment)
   - Cephalothorax: 60% of body size (smaller segment)

2. **Leg Geometry** - Correct proportions and spread
   - Leg length: 75% × size per segment (150% total)
   - Legs spread outward in 8 directions
   - Natural curve from joint articulation (~9% deviation)

3. **Leg Attachment** - All attachments inside body
   - Distributed along cephalothorax (not abdomen)
   - 60% of width radius, 80% of length
   - No attachments outside body ellipse

4. **IK/FK System** - All calculations accurate
   - Elbow bias controls joint bending direction
   - Forward/inverse kinematics working correctly

5. **🎉 RENDERING (2025-10-20 Part 1)** - Fixed foot positions!
   - Legs now spread radially (different Y values)
   - No more "ground line" collapse
   - All feet positions correct (0.0 unit difference)

6. **🎉 ELBOW BIAS (2025-10-20 Part 3 - FINAL)** - IK now perfect!
   - Simple solution: `elbowBias = 1` for all legs
   - IK places feet with 0.0 error (all 8 legs!)
   - Legs point in correct directions
   - All geometry tests pass perfectly

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

## For Next Agent

### Start Here
1. **Read `AGENT_HANDOFF.md`** - Complete system documentation
2. **Run `pixi run test-topdown`** - Verify geometry still matches reference
3. **Run `pixi run serve`** - View animation in browser
4. **Read `ISSUES.md`** - Current problems to fix

### Key Insights

- **Top-down view** (not side view!) - X=forward/back, Y=left/right
- **Reference template** at `spider_template1.png` shows correct geometry
- All geometry tests pass - **focus on locomotion now**
- Use `pixi run` for everything (reproducible environment)

### Common Commands

```bash
pixi run status          # Show all available commands
pixi run serve           # Start development server
pixi run test            # Run all tests
pixi run test-topdown    # Verify geometry matches reference
```

### Debugging

- Check console in browser for any errors
- Use H key to show/hide controls while running
- Adjust speed/size sliders to see motion details
- Space bar to pause and examine leg positions

## Research References

Spider locomotion based on:
1. "Biomechanics of octopedal locomotion" - Diagonal pairing
2. "Crawling at High Speeds" - Stance/swing mechanics
3. "Analysis of Spiders' Joint Kinematics" - Tetrapod gait

Current implementation uses alternating tetrapod gait with 6 phases.
