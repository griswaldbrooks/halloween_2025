# Claude Code Agent Instructions - Halloween 2025 Project

## Project Overview

Halloween 2025 Spider Haunted House - **Window Spider Trigger** system for Chamber 2.

**Current State:** ✅ Fully functional
- Single-video playback system (paused → trigger → play → reset → pause)
- DFRobot Beetle on Pin 9 with momentary switch
- Pixi-managed environment
- Automated testing suite

---

## Critical: Documentation Protocol

**This project experienced agent shutdowns. Always document progress immediately.**

### Update Files As You Work

**Primary documentation** (update these):
1. **TROUBLESHOOTING.md** - Problems encountered and solutions
2. **CHANGELOG.md** - All changes made
3. **README.md** - User-facing features/config changes only

**Do NOT create new docs** unless absolutely necessary. Everything should fit in the above files.

### Documentation Template

When encountering issues or making changes:

```markdown
## [Timestamp] - [Brief Description]

**Problem:** What went wrong
**Cause:** Root cause analysis
**Solution:** What fixed it
**Testing:** How you verified the fix
**Files changed:** List of modified files

Example command: `pixi run integration-test`
```

---

## Testing First, Always

Before doing ANYTHING, run diagnostics:

```bash
# 1. System check
pixi run status

# 2. Integration test (auto-fixes video issues)
pixi run integration-test

# 3. Hardware test (if Beetle connected)
pixi run beetle-test
```

**Document test results in TROUBLESHOOTING.md immediately.**

---

## Pixi Environment - Mandatory

**ALL operations MUST use Pixi:**
```bash
pixi run <command>    # Always use this
.pixi/bin/<tool>      # Direct tool access if needed
pixi shell            # Interactive shell with environment
```

**NEVER:**
- Install system packages
- Run npm/node/arduino-cli from system PATH
- Modify global configuration

---

## Common Tasks

### Testing
```bash
pixi run status              # System overview
pixi run integration-test    # Full system test + auto-fix
pixi run beetle-test         # Hardware verification
pixi run beetle-monitor-test # Interactive switch test
```

### Development
```bash
pixi run arduino-flash       # Upload to Beetle
pixi run deploy              # Flash + start server
pixi run dev                 # Development mode (auto-reload)
pixi run arduino-monitor     # Serial monitor
```

### Fixes
```bash
pixi run fix-videos          # Fix missing video symlinks
pixi run fix-permissions     # Fix Arduino permissions
pixi run clean-all           # Clean build artifacts
```

---

## File Structure

**Keep these files:**
- `README.md` - Main documentation (user-facing)
- `TROUBLESHOOTING.md` - Problems & solutions + testing guide
- `BEETLE_PINOUT.md` - Hardware pin reference
- `CHANGELOG.md` - Version history

**Session files** (git-ignored, for temporary notes):
- Use `/tmp/agent_notes.md` for scratch work
- Don't commit session notes

---

## Hardware Configuration

**DFRobot Beetle (DFR0282):**
- Pin 9: Switch input (INPUT_PULLUP)
- Pin 13: LED indicator
- GND: Ground
- Detected as: Arduino Leonardo at `/dev/ttyACM0`

**Wiring:**
```
Pin 9 → Switch Terminal 1
GND   → Switch Terminal 2
```

---

## Video System

**Current behavior:**
1. Load → video paused at first frame
2. Trigger → plays from start
3. End → resets to start and pauses
4. Ready for next trigger

**Video file:**
- `public/videos/spider_jump1.mp4`

**If loading screen hangs:**
```bash
pixi run integration-test  # Auto-creates symlinks
```

---

## Troubleshooting Workflow

1. **Identify problem**
2. **Run diagnostics:**
   ```bash
   pixi run status
   pixi run integration-test
   pixi run beetle-test      # If hardware related
   ```
3. **Check TROUBLESHOOTING.md** for known issues
4. **Apply fix**
5. **Test fix:**
   ```bash
   pixi run integration-test  # Verify system works
   ```
6. **Document in TROUBLESHOOTING.md:**
   - Problem description
   - Root cause
   - Solution applied
   - Verification steps

---

## Git Workflow

**Before committing:**
1. Test changes: `pixi run integration-test`
2. Update CHANGELOG.md with changes
3. Stage and commit:
   ```bash
   git add -A
   git commit -m "Brief description

   Details of what changed and why.

   🤖 Generated with [Claude Code](https://claude.com/claude-code)

   Co-Authored-By: Claude <noreply@anthropic.com>"
   ```

**Git LFS** is configured for `*.mp4` and `*.png` files.

---

## Common Issues & Quick Fixes

| Problem | Quick Fix |
|---------|-----------|
| Loading screen stuck | `pixi run integration-test` |
| Arduino not detected | `pixi run fix-permissions` then logout/login |
| Port 3000 in use | `pkill -f "node server.js"` |
| Switch not triggering | `pixi run beetle-monitor-test` to diagnose |
| Video won't play | Check browser console (F12) |
| Upload fails | Close serial monitors, retry |

See `TROUBLESHOOTING.md` for complete guide.

---

## Testing Checklist

When verifying system (copy to TROUBLESHOOTING.md and check off):

```markdown
- [ ] `pixi run status` - Node.js 20.x, packages OK
- [ ] `pixi run arduino-detect` - Beetle at /dev/ttyACM0
- [ ] `pixi run arduino-compile` - No errors
- [ ] `pixi run arduino-flash` - Upload successful
- [ ] `pixi run beetle-monitor-test` - STARTUP, READY
- [ ] Press switch → TRIGGER, SWITCH_RELEASED
- [ ] `pixi run integration-test` - All 5 tests pass
- [ ] `pixi run deploy` - Server starts, serial connects
- [ ] Browser localhost:3000 - Video loads paused
- [ ] Press `T` - Video plays, resets, pauses
- [ ] Press switch - Same as `T`
- [ ] Multiple triggers - Works correctly

✅ All pass = System operational
```

---

## Emergency Recovery

If agent shuts down unexpectedly:

1. **Check recent changes:**
   ```bash
   git log --oneline -5
   git diff HEAD~1
   ```

2. **Run diagnostics:**
   ```bash
   pixi run status
   pixi run integration-test
   ```

3. **Check documentation:**
   - Read last entry in CHANGELOG.md
   - Check TROUBLESHOOTING.md for recent issues

4. **Resume work** based on test results and documentation

---

## Project Hygiene

**Code audit approach** - Periodically review the entire codebase:

1. **Find unused code** by reading all files and understanding dependencies
   - Check HTML/JS for referenced files
   - Check scripts for what they actually use
   - Remove unused CSS, functions, imports

2. **Find unnecessary files**:
   - Symlinks not referenced in code
   - Old documentation
   - Deprecated scripts

3. **Audit Pixi commands**:
   - Remove commands for removed features
   - Update command descriptions to match current behavior
   - Remove obsolete workflows

4. **Test thoroughly** after cleanup:
   - Run `pixi run integration-test`
   - Verify nothing broke
   - Update documentation

**When in doubt, read the code** - Don't assume files are needed, verify by tracing usage.

## Best Practices

✅ **DO:**
- Test immediately after ANY change
- Document problems and solutions as they occur
- Use `pixi run` for all operations
- Update CHANGELOG.md with each commit
- Keep documentation concise and actionable
- Run `pixi run integration-test` before committing
- Periodically audit entire codebase for unused elements

❌ **DON'T:**
- Skip testing
- Create new documentation files
- Batch changes before testing
- Use system tools (always use Pixi)
- Write verbose documentation
- Commit without updating CHANGELOG.md
- Leave unused code/files "just in case"

---

## Quick Reference

**Start here:**
1. `pixi run status`
2. `pixi run integration-test`
3. Check TROUBLESHOOTING.md if issues
4. Make changes
5. Test: `pixi run integration-test`
6. Document in CHANGELOG.md
7. Commit

**Key files:**
- `README.md` - Setup and usage
- `TROUBLESHOOTING.md` - Testing and fixes
- `BEETLE_PINOUT.md` - Hardware reference
- `CHANGELOG.md` - Change history

**Key commands:**
- `pixi run deploy` - Full deployment
- `pixi run integration-test` - System verification
- `pixi run beetle-test` - Hardware test
- `pixi run status` - System overview

---

**Last verified:** 2025-10-14 23:45
**Status:** ✅ All systems operational - Window Spider Trigger COMPLETE

**Next task:** Twitching Body Animatronic (Chamber 4 or 5)
- Create servo-controlled body twitching system
- Integrate with trigger mechanism
- Test and deploy

**Next agent:**
1. Read `/PROJECT_PLAN.md` for animatronic details
2. Review this session's work in `window_spider_trigger/` as reference
3. Apply same hygiene standards: test-first, document-as-you-go, audit for unused code
