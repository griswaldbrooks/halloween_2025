// Unit tests to diagnose keyframe direction and body movement
const fs = require('fs');

console.log("\n╔════════════════════════════════════════════╗");
console.log("║   KEYFRAME DIRECTION DIAGNOSTIC           ║");
console.log("╚════════════════════════════════════════════╝\n");

// Load keyframe animation data
let animationData;
try {
    animationData = JSON.parse(fs.readFileSync('./keyframe-animation.json', 'utf8'));
} catch (err) {
    console.error("❌ ERROR: Could not load keyframe-animation.json");
    console.error(err.message);
    process.exit(1);
}

// Helper: Interpolate between two poses
function interpolatePose(keyframe1, keyframe2, t) {
    const result = [];
    for (let i = 0; i < 8; i++) {
        result.push({
            x: keyframe1.legs[i].x + (keyframe2.legs[i].x - keyframe1.legs[i].x) * t,
            y: keyframe1.legs[i].y + (keyframe2.legs[i].y - keyframe1.legs[i].y) * t
        });
    }
    return result;
}

// Helper: Get pose at specific time
function getPoseAtTime(time, keyframes) {
    if (keyframes.length === 1) return keyframes[0].legs;

    let beforeKf = keyframes[0];
    let afterKf = keyframes[keyframes.length - 1];

    for (let i = 0; i < keyframes.length - 1; i++) {
        if (keyframes[i].time <= time && keyframes[i + 1].time >= time) {
            beforeKf = keyframes[i];
            afterKf = keyframes[i + 1];
            break;
        }
    }

    const duration = afterKf.time - beforeKf.time;
    const elapsed = time - beforeKf.time;
    const t = duration > 0 ? elapsed / duration : 0;

    return interpolatePose(beforeKf, afterKf, t);
}

// Test 1: Analyze foot displacement directions
function testFootDisplacementDirections() {
    console.log("=== TEST 1: FOOT DISPLACEMENT DIRECTIONS ===\n");

    const keyframes = animationData.keyframes;

    console.log("Analyzing each transition between keyframes:\n");

    for (let i = 0; i < keyframes.length - 1; i++) {
        const kf1 = keyframes[i];
        const kf2 = keyframes[i + 1];

        console.log(`Transition ${i}: "${kf1.name}" → "${kf2.name}"`);
        console.log(`  Time: ${kf1.time}ms → ${kf2.time}ms\n`);

        let forwardLegs = [];
        let backwardLegs = [];
        let staticLegs = [];

        for (let legIdx = 0; legIdx < 8; legIdx++) {
            const deltaX = kf2.legs[legIdx].x - kf1.legs[legIdx].x;
            const deltaY = kf2.legs[legIdx].y - kf1.legs[legIdx].y;
            const velocity = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

            let direction = 'static';
            if (deltaX > 0.5) {
                direction = 'forward';
                forwardLegs.push(legIdx);
            } else if (deltaX < -0.5) {
                direction = 'backward';
                backwardLegs.push(legIdx);
            } else {
                staticLegs.push(legIdx);
            }

            console.log(`    Leg ${legIdx}: ΔX=${deltaX.toFixed(2).padStart(7)}, ΔY=${deltaY.toFixed(2).padStart(7)}, vel=${velocity.toFixed(2).padStart(6)} → ${direction}`);
        }

        console.log();
        console.log(`  Summary: ${forwardLegs.length} forward [${forwardLegs}], ${backwardLegs.length} backward [${backwardLegs}], ${staticLegs.length} static [${staticLegs}]`);
        console.log();
    }

    console.log("✓✓✓ DIRECTION ANALYSIS COMPLETE ✓✓✓\n");
    return true;
}

// Test 2: Simulate body movement with current algorithm
function testBodyMovementAlgorithm() {
    console.log("=== TEST 2: BODY MOVEMENT SIMULATION ===\n");

    const keyframes = animationData.keyframes;
    const duration = animationData.duration;
    const velocityThreshold = 5.0;

    let bodyX = 0;
    const sampleInterval = 16.67; // ~60fps
    let prevTime = 0;

    console.log("Simulating current algorithm (swinging feet, negated):\n");

    const samples = [];
    for (let time = sampleInterval; time <= duration; time += sampleInterval) {
        const pose1 = getPoseAtTime(prevTime, keyframes);
        const pose2 = getPoseAtTime(time, keyframes);

        let swingingFootDeltaX = 0;
        let swingingCount = 0;
        const swingingLegs = [];

        for (let i = 0; i < 8; i++) {
            const deltaX = pose2[i].x - pose1[i].x;
            const deltaY = pose2[i].y - pose1[i].y;
            const velocity = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

            if (velocity >= velocityThreshold) {
                swingingFootDeltaX += deltaX;
                swingingCount++;
                swingingLegs.push(i);
            }
        }

        if (swingingCount > 0) {
            const avgSwingingDeltaX = swingingFootDeltaX / swingingCount;
            const bodyMovement = -avgSwingingDeltaX; // Negated
            bodyX += bodyMovement;

            samples.push({
                time,
                swingingCount,
                swingingLegs,
                avgSwingingDeltaX,
                bodyMovement,
                bodyX
            });
        }

        prevTime = time;
    }

    // Show first few samples
    console.log("First 5 frames:");
    samples.slice(0, 5).forEach(s => {
        console.log(`  ${s.time.toFixed(0)}ms: ${s.swingingCount} swing [${s.swingingLegs.join(',')}] → avgΔX=${s.avgSwingingDeltaX.toFixed(2)} → body=${s.bodyMovement.toFixed(2)} → pos=${s.bodyX.toFixed(2)}`);
    });
    console.log("  ...");
    console.log("Last 5 frames:");
    samples.slice(-5).forEach(s => {
        console.log(`  ${s.time.toFixed(0)}ms: ${s.swingingCount} swing [${s.swingingLegs.join(',')}] → avgΔX=${s.avgSwingingDeltaX.toFixed(2)} → body=${s.bodyMovement.toFixed(2)} → pos=${s.bodyX.toFixed(2)}`);
    });

    console.log();
    console.log(`Final body X after full cycle: ${bodyX.toFixed(2)}`);

    if (bodyX > 1) {
        console.log(`  → Body moved FORWARD (RIGHT) ✓`);
    } else if (bodyX < -1) {
        console.log(`  → Body moved BACKWARD (LEFT) ✗`);
    } else {
        console.log(`  → Body barely moved`);
    }

    console.log();
    console.log("✓✓✓ ALGORITHM SIMULATION COMPLETE ✓✓✓\n");
    return bodyX;
}

// Test 3: Test alternative algorithms
function testAlternativeAlgorithms() {
    console.log("=== TEST 3: ALTERNATIVE ALGORITHMS ===\n");

    const keyframes = animationData.keyframes;
    const duration = animationData.duration;
    const velocityThreshold = 5.0;
    const sampleInterval = 16.67;

    // Algorithm A: Current (negated swing)
    let bodyX_A = 0;
    // Algorithm B: Non-negated swing
    let bodyX_B = 0;
    // Algorithm C: Planted feet only
    let bodyX_C = 0;
    // Algorithm D: All feet average
    let bodyX_D = 0;

    let prevTime = 0;

    for (let time = sampleInterval; time <= duration; time += sampleInterval) {
        const pose1 = getPoseAtTime(prevTime, keyframes);
        const pose2 = getPoseAtTime(time, keyframes);

        let swingingDeltaX = 0;
        let swingingCount = 0;
        let plantedDeltaX = 0;
        let plantedCount = 0;
        let totalDeltaX = 0;

        for (let i = 0; i < 8; i++) {
            const deltaX = pose2[i].x - pose1[i].x;
            const deltaY = pose2[i].y - pose1[i].y;
            const velocity = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

            totalDeltaX += deltaX;

            if (velocity >= velocityThreshold) {
                swingingDeltaX += deltaX;
                swingingCount++;
            } else {
                plantedDeltaX += deltaX;
                plantedCount++;
            }
        }

        // Algorithm A: Negated swing
        if (swingingCount > 0) {
            bodyX_A += -(swingingDeltaX / swingingCount);
        }

        // Algorithm B: Non-negated swing
        if (swingingCount > 0) {
            bodyX_B += (swingingDeltaX / swingingCount);
        }

        // Algorithm C: Negated planted
        if (plantedCount > 0) {
            bodyX_C += -(plantedDeltaX / plantedCount);
        }

        // Algorithm D: Negated average all
        bodyX_D += -(totalDeltaX / 8);

        prevTime = time;
    }

    console.log("Testing 4 different algorithms:\n");
    console.log(`  A. Current (negated swing):      ${bodyX_A.toFixed(2)} ${bodyX_A > 0 ? '→ FORWARD ✓' : '← BACKWARD ✗'}`);
    console.log(`  B. Non-negated swing:            ${bodyX_B.toFixed(2)} ${bodyX_B > 0 ? '→ FORWARD ✓' : '← BACKWARD ✗'}`);
    console.log(`  C. Negated planted:              ${bodyX_C.toFixed(2)} ${bodyX_C > 0 ? '→ FORWARD ✓' : '← BACKWARD ✗'}`);
    console.log(`  D. Negated average all:          ${bodyX_D.toFixed(2)} ${bodyX_D > 0 ? '→ FORWARD ✓' : '← BACKWARD ✗'}`);

    console.log();

    // Find which one gives best forward movement
    const results = [
        { name: 'A (negated swing)', value: bodyX_A },
        { name: 'B (non-negated swing)', value: bodyX_B },
        { name: 'C (negated planted)', value: bodyX_C },
        { name: 'D (negated all)', value: bodyX_D }
    ];

    results.sort((a, b) => b.value - a.value);

    console.log("Ranked by forward movement (best first):");
    results.forEach((r, i) => {
        console.log(`  ${i + 1}. ${r.name}: ${r.value.toFixed(2)}`);
    });

    console.log();
    console.log("✓✓✓ ALTERNATIVE ALGORITHM TEST COMPLETE ✓✓✓\n");

    return results[0];
}

// Run all tests
const test1 = testFootDisplacementDirections();
const bodyXResult = testBodyMovementAlgorithm();
const bestAlgorithm = testAlternativeAlgorithms();

console.log("╔════════════════════════════════════════════╗");
console.log("║              DIAGNOSTIC SUMMARY            ║");
console.log("╚════════════════════════════════════════════╝");
console.log();
console.log(`Current algorithm result: ${bodyXResult.toFixed(2)}`);
console.log(`Best algorithm: ${bestAlgorithm.name} (${bestAlgorithm.value.toFixed(2)})`);
console.log();

if (bodyXResult < 0) {
    console.log("⚠️  CURRENT ALGORITHM MOVES BACKWARD!");
    console.log(`   Recommendation: Switch to ${bestAlgorithm.name}`);
} else if (bodyXResult > 0) {
    console.log("✓ Current algorithm moves forward");
} else {
    console.log("⚠️  Current algorithm produces no movement");
}

console.log();

process.exit(0);
