#!/bin/bash

echo "╔════════════════════════════════════════════════════════════╗"
echo "║             SPIDER GEOMETRY - COMPLETE TEST SUITE         ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo

PASS=0
FAIL=0

run_test() {
    local test_name=$1
    local test_file=$2

    echo "Running: $test_name..."
    # Capture output and check exit code
    if node "$test_file" > /tmp/test_output.txt 2>&1; then
        echo "  ✓ PASS"
        ((PASS++))
    else
        echo "  ✗ FAIL (see details above)"
        cat /tmp/test_output.txt
        ((FAIL++))
    fi
    echo
}

# Core Tests
run_test "Kinematics (IK/FK + Elbow Bias)" "test-kinematics.js"
run_test "Body Model" "test-model.js"
run_test "Integration" "test-integration.js"
run_test "Top-Down Geometry" "test-topdown-shape.js"
run_test "IK Accuracy" "test-ik-accuracy.js"
run_test "Rendering Output" "test-rendering.js"
run_test "Leg Drawing" "test-leg-drawing.js"

# Configuration Tests
run_test "User Configuration (No Intersections)" "test-user-config.js"

# Animation Tests
run_test "Keyframe Animation System" "test-keyframe-animation.js"
run_test "Animation Mode Switching" "test-animation-modes.js"
run_test "Keyframe Body Movement" "test-keyframe-body-movement.js"
run_test "Keyframe Direction Analysis" "test-keyframe-direction.js"

TOTAL=$((PASS + FAIL))

echo "╔════════════════════════════════════════════════════════════╗"
echo "║                      SUMMARY                               ║"
echo "║  Passed: $PASS / $TOTAL                                            ║"
echo "║  Failed: $FAIL / $TOTAL                                            ║"
if [ $FAIL -eq 0 ]; then
    echo "║                                                            ║"
    echo "║              ✓✓✓ ALL TESTS PASSED! ✓✓✓                   ║"
fi
echo "╚════════════════════════════════════════════════════════════╝"
