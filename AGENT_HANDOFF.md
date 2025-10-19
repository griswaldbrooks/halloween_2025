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

## ✅ Completed: Twitching Body Animatronic (PRODUCTION READY)

**Status:** ✅ COMPLETE - Tested with hardware, ready for deployment

**Location:** `twitching_body/`

**What was accomplished:**
1. ✅ PCA9685 + HS-755MG servo integration (production code complete)
2. ✅ Complete wiring diagrams (`WIRING.md`)
3. ✅ Calibrated pulse widths (600-2400µs) - prevents servo stalling
4. ✅ Integer overflow fix applied
5. ✅ Interactive testing workflow (`pixi run servo-test`)
6. ✅ Center button feature (Pin 9 - ground to center servos)
7. ✅ Opposite arm motion implemented (dramatic effect)
8. ✅ Larger movement ranges (±15° slow, ±35° jerks)
9. ✅ Comprehensive documentation (README, TROUBLESHOOTING, SERVO_TEST)
10. ✅ Port auto-detection and process cleanup tools
11. ✅ Hardware tested and verified working

**Hardware:**
- DFRobot Beetle (DFR0282)
- PCA9685 16-channel PWM driver (I2C, address 0x40)
- 3x HS-755MG high-torque servos (head, left arm, right arm)
- 5V 5A+ power supply

**Behavior:**
- Autonomous (no sensors, always running)
- Mostly still (70-85% of time)
- Slow movements ±15° with opposite arm motion (10-20%)
- Quick jerks ±35° with opposite arm motion (5-10%)
- 5 varying cycles for unpredictability
- Center button for easy servo horn installation

**Key files:**
- `README.md` - Complete setup guide
- `WIRING.md` - Detailed wiring diagrams
- `SERVO_TEST.md` - Interactive testing guide
- `TROUBLESHOOTING.md` - Problem-solving
- `CHANGELOG.md` - Complete history
- `AGENT_HANDOFF.md` - Session notes

**Testing verified:**
```bash
cd twitching_body
pixi run deploy  # ✅ All tests pass, servos work perfectly
```

**Ready for deployment:**
- All servos move smoothly
- No servo stalling or high current draw
- Center button works
- Opposite arm motion creates dramatic effect
- Production code complete and tested

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
