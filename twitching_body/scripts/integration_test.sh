#!/bin/bash
# Integration Test for Twitching Body Animatronic
# Verifies complete system functionality

set -e

echo "╔════════════════════════════════════════════════════════╗"
echo "║    🎃 INTEGRATION TEST - Twitching Body 🎃            ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

TESTS_PASSED=0
TESTS_FAILED=0

# Test 1: Pixi environment
echo "▶ Test 1: Pixi environment"
if command -v pixi &> /dev/null; then
    echo "  ✅ Pixi installed"
    ((TESTS_PASSED++))
else
    echo "  ❌ Pixi not found. Install from https://pixi.sh"
    ((TESTS_FAILED++))
fi
echo ""

# Test 2: Arduino CLI installed
echo "▶ Test 2: Arduino CLI"
if [ -f ".pixi/bin/arduino-cli" ]; then
    VERSION=$(.pixi/bin/arduino-cli version)
    echo "  ✅ Arduino CLI installed ($VERSION)"
    ((TESTS_PASSED++))
else
    echo "  ❌ Arduino CLI not installed. Run: pixi run setup"
    ((TESTS_FAILED++))
fi
echo ""

# Test 3: Arduino AVR core installed
echo "▶ Test 3: Arduino AVR core"
if .pixi/bin/arduino-cli core list --config-file .arduino15/arduino-cli.yaml 2>&1 | grep -q "arduino:avr"; then
    echo "  ✅ Arduino AVR core installed"
    ((TESTS_PASSED++))
else
    echo "  ❌ Arduino AVR core not installed. Run: pixi run setup"
    ((TESTS_FAILED++))
fi
echo ""

# Test 4: Arduino sketch exists
echo "▶ Test 4: Arduino sketch"
if [ -f "arduino/twitching_servos/twitching_servos.ino" ]; then
    LINES=$(wc -l < arduino/twitching_servos/twitching_servos.ino)
    echo "  ✅ Sketch found (${LINES} lines)"
    ((TESTS_PASSED++))
else
    echo "  ❌ Sketch not found"
    ((TESTS_FAILED++))
fi
echo ""

# Test 5: Sketch compiles
echo "▶ Test 5: Sketch compilation"
if .pixi/bin/arduino-cli compile --fqbn arduino:avr:leonardo --config-file .arduino15/arduino-cli.yaml arduino/twitching_servos &> /dev/null; then
    echo "  ✅ Sketch compiles successfully"
    ((TESTS_PASSED++))
else
    echo "  ❌ Compilation failed. Run: pixi run arduino-compile"
    ((TESTS_FAILED++))
fi
echo ""

# Summary
echo "════════════════════════════════════════════════════════"
echo "Test Results: $TESTS_PASSED passed, $TESTS_FAILED failed"
echo "════════════════════════════════════════════════════════"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo "✅ ALL TESTS PASSED - System ready for deployment"
    echo ""
    echo "Next steps:"
    echo "  1. Connect Beetle to computer via USB"
    echo "  2. Connect servos to pins 9, 10, 11"
    echo "  3. Connect servo power supply (5V external)"
    echo "  4. Run: pixi run deploy"
    echo ""
    exit 0
else
    echo "❌ SOME TESTS FAILED - Fix errors above"
    echo ""
    echo "Common fixes:"
    echo "  - Run: pixi run setup    (install dependencies)"
    echo "  - Check Arduino sketch syntax"
    echo "  - Verify file structure"
    echo ""
    exit 1
fi
