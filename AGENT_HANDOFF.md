# Agent Handoff Notes

## Session: 2025-10-14 (Evening)

### Completed: Window Spider Trigger ✅

**Status:** Production-ready, fully tested, documented, and audited

**Location:** `window_spider_trigger/`

**What was accomplished:**
1. ✅ Single-video playback system (pause → trigger → play → reset → pause)
2. ✅ DFRobot Beetle integration (Pin 9 switch trigger)
3. ✅ Node.js server with Socket.IO real-time communication
4. ✅ Automated testing suite (integration + hardware tests)
5. ✅ Documentation consolidation (13 files → 4 files)
6. ✅ Code audit (removed unused symlinks, CSS, PIR references)
7. ✅ Pixi-based reproducible environment

**Key files:**
- `README.md` - Complete setup and usage
- `TROUBLESHOOTING.md` - Testing procedures and fixes
- `CHANGELOG.md` - Full history of changes
- `.claude/claude.md` - Agent instructions and hygiene standards

**Testing verified:**
```bash
cd window_spider_trigger
pixi run integration-test  # ✅ All 5 tests pass
```

---

## ✅ Completed: Hatching Egg Spider (PRODUCTION READY)

**Status:** ✅ COMPLETE - Smart sequencing with autonomous behavior

**Location:** `hatching_egg/`

**What it does:**
- **Idle Mode:** Cycles resting ↔ slow_struggle automatically (ambient movement)
- **Triggered Mode:** Button press → 3 cycles of grasping → breaking_through (~17.7s)
- **7 Animations:** zero, max, resting, slow_struggle, breaking_through, grasping, stabbing

**Key Features:**
- Autonomous behavior - works without serial commands
- Trigger-based hatching sequence (Pin 9 to GND)
- Interactive tester tool for development (animation_tester/)
- Web preview: http://localhost:8081/preview.html
- 241 tests passing
- Memory: 11,912 bytes (41%) program, 408 bytes (15%) RAM

**Commands:**
```bash
cd hatching_egg
pixi run upload           # Production code
pixi run test-animations  # Interactive tester
pixi run monitor          # Serial monitor
pixi run serve            # Web preview
pixi run test             # All 241 tests
```

---

## ✅ Completed: Twitching Body Animatronic (TUNED & READY)

**Status:** ✅ COMPLETE - Extensively tuned with dressed animatronic

**Location:** `twitching_body/`

**Final Tuned Behavior:**
1. **Slow Movements (50-70%, 8-18s)** - Dramatic struggling
   - Arms ALWAYS extreme positions (0-30° or 150-180°)
   - Effect: Pulling himself up, then dropping
   - No small movements (invisible when dressed)

2. **Brief Still (20-40%, 2-5s)** - Short pauses

3. **VIOLENT Thrashing (5%, 0.6-1s)** - Maximum drama
   - Targets change every 100ms (6-10 rapid changes)
   - Maximum speed (15°/step, 0ms delay)
   - Effect: Frustrated/panicked violent struggling

**Hardware:**
- DFRobot Beetle + PCA9685 + 3x HS-755MG servos + 5V 5A+ power

**Audio System:**
- Raspberry Pi auto-plays victim moaning (60min loop)
- See `raspberry_pi_audio/` for setup

**Deployment:**
```bash
cd twitching_body
pixi run deploy
```

**Key Achievement:** All movements tuned for maximum visibility and dramatic effect when animatronic is fully dressed. Tested through multiple iterations with physical prop.

---

## Next Task: [Choose Next Chamber Effect]

### Options from PROJECT_PLAN.md

**Chamber 2 Effects (Spider Web Tunnel):**
- ~~Window Animation Scare~~ ✅ COMPLETE (`window_spider_trigger/`)
- Projector Spider Crawl (video loop on ceiling/walls)
- Ankle Brusher (pool noodle sweep with servo)

**Chamber 3 (Trash Room):**
- Robot Arm Scares (2x arms with pool noodles)

**Chamber 4 (Victim Room):**
- ~~Twitching Body~~ ✅ COMPLETE (`twitching_body/`)
- Dripping Effect (LED or projected)

**Chamber 5 (Hatchery):**
- Pulsating Egg Sacs (LED breathing pattern)
- Scavenger Hunt Container

**Chamber 6 (Spider's Lair):**
- Baby Spider Projection (floor/walls)
- Giant Animatronic Spider (track slider or multi-servo)

### Recommended Next: Pulsating Egg Sacs (Chamber 5)

**Why:**
- Similar to completed projects (LED control, Arduino)
- Can use PCA9685 for 16+ LED channels
- Good practice before complex spider animatronic
- Independent effect (doesn't depend on other chambers)

**Approach:**
- Pixi-based environment
- Arduino + PCA9685 for LED control
- Breathing/pulsing algorithm (slow fade in/out)
- Random variations between egg sacs
- Test-first methodology

---

## Session Stats - Twitching Body (2025-10-19)

**Duration:** ~3 hours
**Commits:** 0 (all work ready for review and commit)
**Files Created:** 13 files
- 7 documentation files (~2000 lines)
- 2 Arduino sketches (~600 lines)
- 4 test/utility scripts

**Key Accomplishments:**
- Complete PCA9685 + HS-755MG specification
- Memory optimization (576 → 302 bytes RAM, 47% reduction)
- Port auto-detection implementation
- Process cleanup tools
- Comprehensive testing workflow

**Token usage:** ~134k / 200k (67%)

## Previous Session Stats - Window Spider (2025-10-14)

**Duration:** ~2.5 hours
**Commits:** 5 major commits
- Initial implementation
- Video cleanup
- Documentation consolidation
- PIR/CSS cleanup
- Code audit

**Lines changed:**
- Documentation: -82% (consolidated)
- Code: Streamlined (removed unused CSS, symlinks)
- Tests: Updated for actual usage

**Token usage:** ~122k / 200k (61%)

---

## Key Learnings from Twitching Body Session

1. **F() macro is essential** - Reduces RAM by 50% on memory-constrained boards
2. **Auto-detection over hardcoding** - Ports can vary, always auto-detect
3. **Test code first, production later** - Verify hardware works before complex behavior
4. **Pixi shell parsing is finicky** - Use `bash -c` wrapper for complex commands
5. **Comprehensive wiring diagrams save time** - ASCII art + tables prevent mistakes
6. **Interactive test commands are powerful** - Serial commands make debugging intuitive
7. **Process cleanup tools are critical** - Stuck uploads can consume CPU indefinitely
8. **Document hardware specs thoroughly** - High-current servos need explicit power warnings

## Key Learnings from Window Spider Session

1. **Read the code** - Don't assume files are needed, verify by tracing usage
2. **Test immediately** - Integration tests caught issues early
3. **Document progressively** - Prevented context loss during agent shutdowns
4. **Audit regularly** - Found unnecessary symlinks, obsolete commands, unused CSS
5. **Keep it lean** - Single-purpose, no "just in case" elements

---

## For Next Agent

**First commands:**
```bash
# Understand the project
cat PROJECT_PLAN.md
cat AGENT_HANDOFF.md

# Review completed work
cd window_spider_trigger
cat README.md
pixi run status

cd ../twitching_body
cat README.md
cat AGENT_HANDOFF.md
pixi run status

# Read agent instructions
cat ../.claude/claude.md

# If testing twitching body hardware:
cd twitching_body
cat WIRING.md        # Complete wiring guide
cat SERVO_TEST.md    # Testing procedures
pixi run servo-test  # Interactive hardware test

# If starting new effect:
cd ..
# Use window_spider_trigger/ and twitching_body/ as templates
```

**Remember:**
- Test first, always (especially hardware before production code)
- Document as you work (update CHANGELOG.md, AGENT_HANDOFF.md)
- Use Pixi for everything (no system packages)
- F() macro for strings on memory-constrained boards
- Auto-detect ports, never hardcode
- Comprehensive wiring diagrams prevent hours of debugging
- Audit code before completing (remove unused elements)
- Keep it lean and focused

**Standards Applied Successfully:**
✅ Pixi-managed dependencies
✅ Memory optimization (F() macro)
✅ Auto port detection
✅ Interactive test workflows
✅ Comprehensive documentation
✅ Process cleanup tools
✅ Test before production

Good luck! 🎃

---

**Last updated:** 2025-10-19 16:15
**Completed:** Window Spider Trigger, Twitching Body Animatronic (production-ready)
**Next agent:** Start new chamber effect (see options above) - Twitching Body is done!
