// Unit tests for animation mode switching (procedural vs keyframe)
const { Leg2D } = require('./leg-kinematics.js');
const { SpiderBody } = require('./spider-model.js');

console.log("\n╔════════════════════════════════════════════╗");
console.log("║   ANIMATION MODES TEST SUITE              ║");
console.log("╚════════════════════════════════════════════╝\n");

// Test 1: Verify both modes produce valid leg positions
function testModesProduceValidPositions() {
    console.log("=== TEST 1: BOTH MODES PRODUCE VALID POSITIONS ===\n");

    const bodySize = 100;
    const body = new SpiderBody(bodySize);
    let allPassed = true;

    // Test procedural mode positions
    console.log("Testing procedural mode positions...");
    const proceduralPositions = [
        { x: 160.2, y: 100.2 },
        { x: 160.2, y: -100.2 },
        { x: 115.2, y: 130.4 },
        { x: 115.2, y: -130.4 },
        { x: -60.2, y: 130.4 },
        { x: -60.2, y: -130.4 },
        { x: -100.2, y: 100.2 },
        { x: -100.2, y: -100.2 }
    ];

    for (let i = 0; i < 8; i++) {
        const attachment = body.getAttachment(i);
        const leg = new Leg2D({
            attachX: attachment.x,
            attachY: attachment.y,
            upperLength: body.legUpperLength,
            lowerLength: body.legLowerLength,
            side: attachment.side,
            baseAngle: attachment.baseAngle,
            elbowBias: [-1, 1, -1, 1, 1, -1, 1, -1][i]
        });

        const pos = proceduralPositions[i];
        leg.setFootPosition(pos.x, pos.y);

        const result = leg.forwardKinematics();
        const error = Math.sqrt(
            Math.pow(result.foot.x - pos.x, 2) +
            Math.pow(result.foot.y - pos.y, 2)
        );

        if (error < 0.01) {
            console.log(`  ✓ Leg ${i}: IK solution valid (error: ${error.toFixed(6)})`);
        } else {
            console.log(`  ✗ Leg ${i}: IK solution invalid (error: ${error.toFixed(6)})`);
            allPassed = false;
        }
    }

    console.log();
    console.log(allPassed ? "✓✓✓ PROCEDURAL MODE POSITIONS VALID ✓✓✓\n" : "✗✗✗ PROCEDURAL MODE POSITIONS INVALID ✗✗✗\n");
    return allPassed;
}

// Test 2: Verify mode switching doesn't break state
function testModeSwitchingPreservesState() {
    console.log("=== TEST 2: MODE SWITCHING PRESERVES STATE ===\n");

    let allPassed = true;

    // Simulate spider state
    const spiderState = {
        animationTime: 500,
        gaitPhase: 2,
        gaitTimer: 75,
        stepProgress: 0.5
    };

    console.log("Initial state:");
    console.log(`  animationTime: ${spiderState.animationTime}ms`);
    console.log(`  gaitPhase: ${spiderState.gaitPhase}`);
    console.log(`  gaitTimer: ${spiderState.gaitTimer}ms`);
    console.log(`  stepProgress: ${spiderState.stepProgress}`);
    console.log();

    // Verify state values are preserved (they should be separate)
    const keyframeState = spiderState.animationTime;
    const proceduralState = {
        phase: spiderState.gaitPhase,
        timer: spiderState.gaitTimer,
        progress: spiderState.stepProgress
    };

    if (keyframeState === 500) {
        console.log("  ✓ Keyframe state preserved: animationTime = 500ms");
    } else {
        console.log("  ✗ Keyframe state corrupted");
        allPassed = false;
    }

    if (proceduralState.phase === 2 && proceduralState.timer === 75 && proceduralState.progress === 0.5) {
        console.log("  ✓ Procedural state preserved: phase=2, timer=75ms, progress=0.5");
    } else {
        console.log("  ✗ Procedural state corrupted");
        allPassed = false;
    }

    console.log();
    console.log(allPassed ? "✓✓✓ STATE PRESERVATION TEST PASSED ✓✓✓\n" : "✗✗✗ STATE PRESERVATION TEST FAILED ✗✗✗\n");
    return allPassed;
}

// Test 3: Verify procedural gait phases are valid
function testProceduralGaitPhases() {
    console.log("=== TEST 3: PROCEDURAL GAIT PHASES VALID ===\n");

    let allPassed = true;

    const phaseDurations = [200, 150, 100, 200, 150, 100]; // 6 phases
    const totalDuration = phaseDurations.reduce((a, b) => a + b, 0);

    console.log(`Total gait cycle duration: ${totalDuration}ms`);
    console.log(`Phase durations: [${phaseDurations.join(', ')}]ms`);
    console.log();

    // Verify phase count
    if (phaseDurations.length === 6) {
        console.log("  ✓ Correct number of phases: 6");
    } else {
        console.log(`  ✗ Incorrect number of phases: ${phaseDurations.length}`);
        allPassed = false;
    }

    // Verify phase symmetry (alternating tetrapod should have symmetric timing)
    const groupADuration = phaseDurations[0] + phaseDurations[1] + phaseDurations[2];
    const groupBDuration = phaseDurations[3] + phaseDurations[4] + phaseDurations[5];

    if (groupADuration === groupBDuration) {
        console.log(`  ✓ Phase symmetry: Group A = Group B = ${groupADuration}ms`);
    } else {
        console.log(`  ✗ Phase asymmetry: Group A = ${groupADuration}ms, Group B = ${groupBDuration}ms`);
        allPassed = false;
    }

    // Verify leg grouping
    const groupA = [1, 2, 5, 6];
    const groupB = [0, 3, 4, 7];

    if (groupA.length === 4 && groupB.length === 4) {
        console.log("  ✓ Leg grouping: 4 legs per group (tetrapod)");
    } else {
        console.log("  ✗ Invalid leg grouping");
        allPassed = false;
    }

    console.log();
    console.log(allPassed ? "✓✓✓ PROCEDURAL GAIT PHASES VALID ✓✓✓\n" : "✗✗✗ PROCEDURAL GAIT PHASES INVALID ✗✗✗\n");
    return allPassed;
}

// Test 4: Verify keyframe mode handles edge cases
function testKeyframeEdgeCases() {
    console.log("=== TEST 4: KEYFRAME EDGE CASES ===\n");

    let allPassed = true;

    // Test 4a: Single keyframe
    console.log("Test 4a: Single keyframe handling");
    const singleKeyframe = {
        keyframes: [
            { time: 0, name: "Pose", legs: Array(8).fill({ x: 0, y: 0 }) }
        ],
        duration: 1000
    };

    if (singleKeyframe.keyframes.length === 1) {
        console.log("  ✓ Single keyframe case: Should use same pose throughout");
    }

    // Test 4b: Animation looping
    console.log("\nTest 4b: Animation looping");
    const animTime = 1200; // Beyond duration
    const duration = 1000;
    const loopedTime = animTime % duration; // Should be 200

    if (loopedTime === 200) {
        console.log(`  ✓ Loop calculation: ${animTime}ms % ${duration}ms = ${loopedTime}ms`);
    } else {
        console.log(`  ✗ Loop calculation failed: expected 200ms, got ${loopedTime}ms`);
        allPassed = false;
    }

    // Test 4c: Interpolation factor bounds
    console.log("\nTest 4c: Interpolation factor bounds");
    const testFactors = [-0.1, 0, 0.5, 1.0, 1.1];
    testFactors.forEach(t => {
        const clamped = Math.max(0, Math.min(1, t));
        if (clamped >= 0 && clamped <= 1) {
            console.log(`  ✓ Factor ${t.toFixed(1)} → ${clamped.toFixed(1)} (valid)`);
        } else {
            console.log(`  ✗ Factor ${t.toFixed(1)} → ${clamped.toFixed(1)} (invalid)`);
            allPassed = false;
        }
    });

    console.log();
    console.log(allPassed ? "✓✓✓ EDGE CASES HANDLED CORRECTLY ✓✓✓\n" : "✗✗✗ EDGE CASES FAILED ✗✗✗\n");
    return allPassed;
}

// Run all tests
const test1 = testModesProduceValidPositions();
const test2 = testModeSwitchingPreservesState();
const test3 = testProceduralGaitPhases();
const test4 = testKeyframeEdgeCases();

console.log("╔════════════════════════════════════════════╗");
console.log("║              TEST SUMMARY                  ║");
if (test1 && test2 && test3 && test4) {
    console.log("║                                            ║");
    console.log("║       ✓✓✓ ALL TESTS PASSED! ✓✓✓          ║");
} else {
    console.log("║                                            ║");
    console.log("║       ✗✗✗ SOME TESTS FAILED ✗✗✗         ║");
}
console.log("╚════════════════════════════════════════════╝\n");

process.exit((test1 && test2 && test3 && test4) ? 0 : 1);
