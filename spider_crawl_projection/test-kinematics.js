// Unit tests for leg kinematics
const { Leg2D } = require('./leg-kinematics.js');

function testForwardKinematics() {
    console.log("\n=== FORWARD KINEMATICS TEST ===");

    const leg = new Leg2D({
        attachX: 0,
        attachY: 0,
        upperLength: 10,
        lowerLength: 10
    });

    // Test 1: Fully extended forward (0°, 0°)
    leg.coxaAngle = 0;
    leg.femurAngle = 0;
    const pos1 = leg.forwardKinematics();
    console.log("\nTest 1: Fully extended forward (0°, 0°)");
    console.log(`  Knee: (${pos1.knee.x.toFixed(2)}, ${pos1.knee.y.toFixed(2)})`);
    console.log(`  Foot: (${pos1.foot.x.toFixed(2)}, ${pos1.foot.y.toFixed(2)})`);
    console.log(`  Expected foot: (20, 0)`);
    console.log(`  ${Math.abs(pos1.foot.x - 20) < 0.01 && Math.abs(pos1.foot.y) < 0.01 ? '✓ PASS' : '✗ FAIL'}`);

    // Test 2: 90° up, bent 90°
    leg.coxaAngle = Math.PI / 2; // 90° up
    leg.femurAngle = -Math.PI / 2; // Bent 90° back
    const pos2 = leg.forwardKinematics();
    console.log("\nTest 2: Upper 90° up, lower bent 90° back");
    console.log(`  Knee: (${pos2.knee.x.toFixed(2)}, ${pos2.knee.y.toFixed(2)})`);
    console.log(`  Foot: (${pos2.foot.x.toFixed(2)}, ${pos2.foot.y.toFixed(2)})`);
    console.log(`  Expected foot: (10, 10)`);
    console.log(`  ${Math.abs(pos2.foot.x - 10) < 0.01 && Math.abs(pos2.foot.y - 10) < 0.01 ? '✓ PASS' : '✗ FAIL'}`);
}

function testInverseKinematics() {
    console.log("\n=== INVERSE KINEMATICS TEST ===");

    const leg = new Leg2D({
        attachX: 0,
        attachY: 0,
        upperLength: 10,
        lowerLength: 10
    });

    // Test 1: Reachable target at (15, 0)
    console.log("\nTest 1: Target at (15, 0) - Reachable");
    const success1 = leg.setFootPosition(15, 0);
    const reached1 = leg.getFootPosition();
    console.log(`  IK Solution found: ${success1 ? 'YES ✓' : 'NO ✗'}`);
    console.log(`  Coxa angle: ${(leg.coxaAngle * 180 / Math.PI).toFixed(2)}°`);
    console.log(`  Femur angle: ${(leg.femurAngle * 180 / Math.PI).toFixed(2)}°`);
    console.log(`  Reached: (${reached1.x.toFixed(2)}, ${reached1.y.toFixed(2)})`);
    console.log(`  Error: ${Math.sqrt(Math.pow(reached1.x - 15, 2) + Math.pow(reached1.y - 0, 2)).toFixed(4)}`);
    console.log(`  ${Math.abs(reached1.x - 15) < 0.01 && Math.abs(reached1.y - 0) < 0.01 ? '✓ PASS' : '✗ FAIL'}`);

    // Test 2: Target at (10, 10) - Diagonal
    console.log("\nTest 2: Target at (10, 10) - Diagonal");
    const success2 = leg.setFootPosition(10, 10);
    const reached2 = leg.getFootPosition();
    console.log(`  IK Solution found: ${success2 ? 'YES ✓' : 'NO ✗'}`);
    console.log(`  Coxa angle: ${(leg.coxaAngle * 180 / Math.PI).toFixed(2)}°`);
    console.log(`  Femur angle: ${(leg.femurAngle * 180 / Math.PI).toFixed(2)}°`);
    console.log(`  Reached: (${reached2.x.toFixed(2)}, ${reached2.y.toFixed(2)})`);
    console.log(`  Error: ${Math.sqrt(Math.pow(reached2.x - 10, 2) + Math.pow(reached2.y - 10, 2)).toFixed(4)}`);
    console.log(`  ${Math.abs(reached2.x - 10) < 0.01 && Math.abs(reached2.y - 10) < 0.01 ? '✓ PASS' : '✗ FAIL'}`);

    // Test 3: Unreachable target at (50, 0)
    console.log("\nTest 3: Target at (50, 0) - Too far");
    const success3 = leg.setFootPosition(50, 0);
    const reached3 = leg.getFootPosition();
    console.log(`  IK Solution found: ${success3 ? 'YES (should be NO)' : 'NO (extends toward target) ✓'}`);
    console.log(`  Reached: (${reached3.x.toFixed(2)}, ${reached3.y.toFixed(2)})`);
    console.log(`  Max reach: ${leg.upperLength + leg.lowerLength}`);
    console.log(`  ${!success3 ? '✓ PASS' : '✗ FAIL'}`);
}

function testIKFKRoundTrip() {
    console.log("\n=== IK → FK ROUND TRIP TEST ===");
    console.log("Set target with IK, verify position with FK");

    const leg = new Leg2D({
        attachX: 0,
        attachY: 0,
        upperLength: 10,
        lowerLength: 10
    });

    const targets = [
        { x: 15, y: 0, name: "Forward" },
        { x: 10, y: 10, name: "Up-right" },
        { x: 0, y: 15, name: "Straight up" },
        { x: -10, y: 5, name: "Back-up" },
        { x: 5, y: -10, name: "Forward-down" }
    ];

    let allPassed = true;

    for (const target of targets) {
        const success = leg.setFootPosition(target.x, target.y);
        const reached = leg.getFootPosition();
        const error = Math.sqrt(
            Math.pow(reached.x - target.x, 2) +
            Math.pow(reached.y - target.y, 2)
        );

        const passed = success && error < 0.01;
        allPassed = allPassed && passed;

        console.log(`\n${target.name}: (${target.x}, ${target.y})`);
        console.log(`  Reached: (${reached.x.toFixed(3)}, ${reached.y.toFixed(3)})`);
        console.log(`  Error: ${error.toFixed(6)} ${passed ? '✓' : '✗'}`);
    }

    console.log(`\n${allPassed ? '✓✓✓ ALL ROUND TRIPS PASSED ✓✓✓' : '✗✗✗ SOME ROUND TRIPS FAILED ✗✗✗'}`);
}

function runAllTests() {
    console.log("\n╔════════════════════════════════════════════╗");
    console.log("║   LEG KINEMATICS TEST SUITE               ║");
    console.log("╚════════════════════════════════════════════╝");

    testForwardKinematics();
    testInverseKinematics();
    testIKFKRoundTrip();

    console.log("\n=== KINEMATICS TESTS COMPLETE ===\n");
}

runAllTests();
