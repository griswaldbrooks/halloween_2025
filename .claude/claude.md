# Claude Code Agent Instructions - Halloween 2025 Project

## Project Context

This is a Halloween 2025 Spider Haunted House project with 6 themed chambers. The main active component is the **Window Spider Trigger** system in the `window_spider_trigger/` directory.

## Critical: Agent Failure Recovery Protocol

**IMPORTANT**: This project has experienced multiple unexpected agent shutdowns. To ensure continuity:

### 1. Document Progress in Markdown Files

**Always update relevant markdown files as you work**, not just at the end. This allows the next agent to pick up where you left off.

**Key files to update:**
- `window_spider_trigger/FIXES_SUMMARY.md` - Document any fixes or issues encountered
- `window_spider_trigger/INTEGRATION_TEST_SUMMARY.md` - Results of integration tests
- `window_spider_trigger/TROUBLESHOOTING.md` - New problems and solutions discovered
- `window_spider_trigger/CHANGELOG.md` - All changes made during session

**When to update:**
- After fixing any bug or issue
- After creating new tests or scripts
- After discovering new problems
- Before attempting risky operations
- When switching between major tasks

**Format for status updates:**
```markdown
## [Date/Time] - [Task Description]

### Status: [In Progress | Completed | Blocked]

### What was done:
- Bullet points of completed work

### Current issue:
- Description of problem being worked on

### Next steps:
- What needs to happen next

### Files modified:
- List of changed files
```

### 2. Use Pixi Environment Exclusively

**Everything that can be done in the Pixi environment MUST be done there.**

**Always use:**
- `pixi run <task>` for all operations
- `.pixi/bin/<tool>` when running tools directly
- `pixi shell` if you need an interactive shell with environment

**Never:**
- Install system packages (use Pixi dependencies)
- Run npm/node/arduino-cli directly from system PATH
- Modify global system configuration

### 3. Create Automated Tests for Troubleshooting

When encountering issues:

1. **Create test scripts** in `window_spider_trigger/scripts/`
2. **Add Pixi tasks** in `pixi.toml` to run tests
3. **Document test results** in markdown files
4. **Make tests idempotent** (can run multiple times safely)

Example test script pattern:
```bash
#!/bin/bash
# scripts/test_something.sh

echo "🧪 Testing [component]..."
echo ""

# Test 1
echo "1️⃣ [Test description]..."
if [command]; then
  echo "✓ [Test passed]"
else
  echo "❌ [Test failed]"
  exit 1
fi

# Continue for all tests
echo ""
echo "✅ All tests passed!"
```

### 4. Progressive Documentation Pattern

Follow this pattern when working on complex issues:

```markdown
## Session Start: [Timestamp]
**Task**: [What you're trying to accomplish]
**Context**: [Relevant background]

## Investigation: [Timestamp]
**Observation**: [What you found]
**Hypothesis**: [What you think is wrong]
**Test**: [How you'll verify]

## Testing: [Timestamp]
**Test command**: `pixi run ...`
**Result**: [What happened]
**Analysis**: [What this means]

## Solution: [Timestamp]
**Fix applied**: [What you changed]
**Files modified**: [List]
**Verification**: `pixi run ...`
**Status**: ✅ Working | ⚠️ Partial | ❌ Failed

## Next Agent Handoff: [Timestamp]
**Current status**: [Summary]
**Known issues**: [List]
**Next steps**: [What needs to happen]
```

## Project-Specific Guidelines

### Hardware Setup
- **Board**: DFRobot Beetle (DFR0282) - Leonardo-compatible
- **Pin Configuration**: Switch on Pin 9, LED on Pin 13
- **Serial**: Auto-detected at `/dev/ttyACM0` (may change to ACM1)

### Common Tasks

```bash
# System status check (always run first)
pixi run status

# Hardware verification
pixi run beetle-test
pixi run beetle-monitor-test

# Integration testing
pixi run integration-test

# Fix common issues
pixi run fix-videos
pixi run fix-permissions

# Deployment
pixi run deploy
```

### Known Issues & Solutions

1. **Loading screen stuck**
   - **Cause**: Missing `idle_loop.mp4` video file
   - **Fix**: `pixi run fix-videos` or `pixi run integration-test`
   - **Test**: Open http://localhost:3000 and verify page loads

2. **Arduino not detected**
   - **Cause**: Permission issues or disconnected board
   - **Fix**: `pixi run fix-permissions` then log out/in
   - **Test**: `pixi run arduino-detect`

3. **Pixi task syntax errors**
   - **Cause**: Complex shell commands not properly wrapped
   - **Fix**: Use `bash -c '...'` or extract to separate script
   - **Test**: `pixi run <task>`

### Video Files

The web interface requires TWO videos:
- `public/videos/idle_loop.mp4` - Background loop
- `public/videos/spider_jumpscare.mp4` - Jump scare video

**Auto-fix**: `pixi run fix-videos` creates symlinks if missing

### Testing Workflow

Always follow this sequence when troubleshooting:

```bash
# 1. Check system status
pixi run status

# 2. Check videos
pixi run check-videos

# 3. Run integration test (auto-fixes video issues)
pixi run integration-test

# 4. Test hardware (if Beetle connected)
pixi run beetle-test

# 5. Manual switch test
pixi run beetle-monitor-test

# 6. Full deployment test
pixi run deploy
# Open http://localhost:3000 in browser
# Press 'T' to test trigger
```

## Code Modification Guidelines

### When changing Arduino code:
1. Update `arduino/motion_trigger/motion_trigger.ino`
2. Test compilation: `pixi run arduino-compile`
3. Flash to board: `pixi run arduino-flash`
4. Monitor output: `pixi run arduino-monitor`
5. Document changes in `CHANGELOG.md`

### When changing Node.js code:
1. Update `server.js` or files in `public/`
2. Test locally: `pixi run dev` (auto-reload)
3. Test production: `pixi run start`
4. Document changes in `CHANGELOG.md`

### When adding Pixi tasks:
1. Edit `pixi.toml`
2. Test the task: `pixi run <task-name>`
3. Document in `QUICK_REFERENCE.md`
4. Update `README.md` if user-facing

## Documentation Structure

```
window_spider_trigger/
├── README.md              # Main documentation (user-facing)
├── QUICK_START.md         # Fast reference for common tasks
├── QUICK_REFERENCE.md     # Command cheat sheet
├── SUMMARY.md             # Project overview
├── PIXI_GUIDE.md          # Pixi workflow details
├── DEPLOYMENT.md          # Multi-machine deployment
├── TROUBLESHOOTING.md     # Problem-solving guide
├── BEETLE_TEST.md         # Hardware testing procedures
├── BEETLE_PINOUT.md       # Pin reference for Beetle
├── FIXES_SUMMARY.md       # Session fixes and issues ⚠️ UPDATE THIS
├── INTEGRATION_TEST_SUMMARY.md  # Integration test details ⚠️ UPDATE THIS
├── CHANGELOG.md           # All changes log ⚠️ UPDATE THIS
└── SWITCH_SETUP.md        # Physical switch setup
```

## Emergency Recovery

If an agent shuts down unexpectedly:

1. **Check these files first** (most recent changes):
   - `FIXES_SUMMARY.md`
   - `INTEGRATION_TEST_SUMMARY.md`
   - `CHANGELOG.md`

2. **Verify system state**:
   ```bash
   pixi run status
   pixi run integration-test
   ```

3. **Check for partial changes**:
   ```bash
   git status
   git diff
   ```

4. **Resume from last known good state** documented in markdown files

## Best Practices Summary

✅ **DO:**
- Update markdown files progressively as you work
- Use `pixi run` for all operations
- Create automated tests for troubleshooting
- Document issues and solutions immediately
- Test incrementally (don't batch changes)
- Use version control (git) frequently

❌ **DON'T:**
- Wait until the end to document
- Run commands outside Pixi environment
- Make multiple changes before testing
- Assume the next agent will remember your context
- Skip integration tests
- Modify system-level configurations

## Last Known Status

**Date**: 2025-10-14 evening session

**Status**: ✅ System operational
- Beetle hardware tests passing
- Integration tests passing
- Video loading issue fixed (auto-creates symlinks)
- All Pixi tasks functional

**Completed**:
- ✅ Fixed Pixi shell parsing errors
- ✅ Created HITL test suite for Beetle
- ✅ Fixed loading screen hang (missing idle_loop.mp4)
- ✅ Created integration test with auto-fix
- ✅ Comprehensive troubleshooting documentation

**Pending**:
- Physical switch installation and testing
- Real idle loop video (currently using symlink)
- Extended soak testing (30+ minutes)
- Production deployment in haunted house

**Known Issues**: None currently

---

**Remember**: Document as you go! The next agent depends on your markdown files to understand what happened.
