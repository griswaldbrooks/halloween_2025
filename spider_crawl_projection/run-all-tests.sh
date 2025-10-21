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
    if node "$test_file" 2>&1 | grep -q "ALL.*PASSED"; then
        echo "  ✓ PASS"
        ((PASS++))
    else
        echo "  ✗ FAIL (see details above)"
        ((FAIL++))
    fi
    echo
}

# Run all tests
run_test "Kinematics (IK/FK)" "test-kinematics.js"
run_test "Body Model" "test-model.js"
run_test "Spider Geometry" "test-spider-geometry.js"
run_test "Visual Geometry" "test-visual-geometry.js"
run_test "Leg Angles" "test-leg-angles.js"
run_test "Integration" "test-integration.js"

echo "╔════════════════════════════════════════════════════════════╗"
echo "║                      SUMMARY                               ║"
echo "║  Passed: $PASS / 6                                            ║"
echo "║  Failed: $FAIL / 6                                            ║"
if [ $FAIL -eq 0 ]; then
    echo "║                                                            ║"
    echo "║              ✓✓✓ ALL TESTS PASSED! ✓✓✓                   ║"
fi
echo "╚════════════════════════════════════════════════════════════╝"
