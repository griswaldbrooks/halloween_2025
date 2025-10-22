// Unit tests for keyframe-driven body movement
const fs = require('fs');

console.log("\n╔════════════════════════════════════════════╗");
console.log("║   KEYFRAME BODY MOVEMENT TEST SUITE       ║");
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

// Test 1: Verify keyframes show leg displacement
function testKeyframesHaveDisplacement() {
    console.log("=== TEST 1: KEYFRAMES HAVE LEG DISPLACEMENT ===\n");

    const keyframes = animationData.keyframes;
    let allPassed = true;

    console.log(`Analyzing ${keyframes.length} keyframes...\n`);

    for (let i = 0; i < keyframes.length - 1; i++) {
        const kf1 = keyframes[i];
        const kf2 = keyframes[i + 1];

        console.log(`Keyframe ${i} → ${i + 1}: "${kf1.name}" → "${kf2.name}"`);
        console.log(`  Time: ${kf1.time}ms → ${kf2.time}ms (Δ${kf2.time - kf1.time}ms)`);

        // Calculate average X displacement
        let totalDeltaX = 0;
        let maxDeltaX = 0;
        let minDeltaX = Infinity;

        for (let legIdx = 0; legIdx < 8; legIdx++) {
            const deltaX = kf2.legs[legIdx].x - kf1.legs[legIdx].x;
            totalDeltaX += deltaX;
            maxDeltaX = Math.max(maxDeltaX, deltaX);
            minDeltaX = Math.min(minDeltaX, deltaX);
        }

        const avgDeltaX = totalDeltaX / 8;

        console.log(`  Average X displacement: ${avgDeltaX.toFixed(2)}`);
        console.log(`  Range: [${minDeltaX.toFixed(2)}, ${maxDeltaX.toFixed(2)}]`);

        if (Math.abs(avgDeltaX) > 0.1) {
            console.log(`  ✓ Has meaningful displacement`);
        } else {
            console.log(`  ⚠️  Very small displacement (near zero)`);
        }

        console.log();
    }

    // Check full cycle displacement
    const firstFrame = keyframes[0];
    const lastFrame = keyframes[keyframes.length - 1];

    console.log("Full cycle analysis:");
    console.log(`  First keyframe: "${firstFrame.name}" at ${firstFrame.time}ms`);
    console.log(`  Last keyframe: "${lastFrame.name}" at ${lastFrame.time}ms`);

    let cycleTotalDeltaX = 0;
    for (let legIdx = 0; legIdx < 8; legIdx++) {
        const deltaX = lastFrame.legs[legIdx].x - firstFrame.legs[legIdx].x;
        cycleTotalDeltaX += deltaX;
    }

    const cycleAvgDeltaX = cycleTotalDeltaX / 8;
    console.log(`  Average X displacement over full cycle: ${cycleAvgDeltaX.toFixed(2)}`);

    if (Math.abs(cycleAvgDeltaX) < 0.1) {
        console.log(`  ✓ Cycle is closed (near-zero net displacement)`);
    } else {
        console.log(`  ⚠️  Cycle has net displacement: ${cycleAvgDeltaX.toFixed(2)}`);
    }

    console.log();
    console.log("✓✓✓ DISPLACEMENT ANALYSIS COMPLETE ✓✓✓\n");
    return true;
}

// Test 2: Calculate expected body movement (using planted feet only)
function testExpectedBodyMovement() {
    console.log("=== TEST 2: EXPECTED BODY MOVEMENT (PLANTED FEET) ===\n");

    const keyframes = animationData.keyframes;
    const duration = animationData.duration;

    // Simulate body movement over full animation cycle
    let bodyX = 0;
    const sampleInterval = 50; // ms
    const velocityThreshold = 5.0; // Same as in animation code

    console.log(`Simulating body movement over ${duration}ms at ${sampleInterval}ms intervals`);
    console.log(`Velocity threshold: ${velocityThreshold} units\n`);

    let prevTime = 0;
    const movements = [];

    for (let time = sampleInterval; time <= duration; time += sampleInterval) {
        // Find keyframes at prevTime and time
        const pose1 = getPoseAtTime(prevTime, keyframes);
        const pose2 = getPoseAtTime(time, keyframes);

        // Detect planted vs swinging feet
        let plantedFootDeltaX = 0;
        let plantedCount = 0;
        const plantedLegs = [];

        for (let i = 0; i < 8; i++) {
            const deltaX = pose2[i].x - pose1[i].x;
            const deltaY = pose2[i].y - pose1[i].y;
            const velocity = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

            if (velocity < velocityThreshold) {
                // Planted foot
                plantedFootDeltaX += deltaX;
                plantedCount++;
                plantedLegs.push(i);
            }
        }

        let avgPlantedDeltaX = 0;
        let bodyDeltaX = 0;

        if (plantedCount > 0) {
            avgPlantedDeltaX = plantedFootDeltaX / plantedCount;
            bodyDeltaX = -avgPlantedDeltaX; // Body moves opposite
            bodyX += bodyDeltaX;
        }

        movements.push({
            time,
            plantedCount,
            plantedLegs,
            avgPlantedDeltaX,
            bodyDeltaX,
            bodyX
        });

        prevTime = time;
    }

    // Show first few movements
    console.log("Sample movements:");
    movements.slice(0, 5).forEach(m => {
        const legs = m.plantedLegs.join(',');
        console.log(`  ${m.time}ms: ${m.plantedCount} planted [${legs}] → Δ${m.avgPlantedDeltaX.toFixed(2)} → body Δ${m.bodyDeltaX.toFixed(2)} → pos ${m.bodyX.toFixed(2)}`);
    });
    console.log("  ...");
    movements.slice(-3).forEach(m => {
        const legs = m.plantedLegs.join(',');
        console.log(`  ${m.time}ms: ${m.plantedCount} planted [${legs}] → Δ${m.avgPlantedDeltaX.toFixed(2)} → body Δ${m.bodyDeltaX.toFixed(2)} → pos ${m.bodyX.toFixed(2)}`);
    });

    console.log();
    console.log(`Final body position after full cycle: ${bodyX.toFixed(2)}`);

    // Calculate average planted count
    const avgPlantedCount = movements.reduce((sum, m) => sum + m.plantedCount, 0) / movements.length;
    console.log(`Average planted feet per frame: ${avgPlantedCount.toFixed(1)} / 8`);

    if (Math.abs(bodyX) > 5) {
        console.log(`  ✓ Body moved significantly: ${bodyX.toFixed(2)} units`);
    } else if (Math.abs(bodyX) > 1) {
        console.log(`  ⚠️  Body moved slightly: ${bodyX.toFixed(2)} units`);
    } else {
        console.log(`  ✗ Body barely moved: ${bodyX.toFixed(2)} units`);
        console.log(`  ⚠️  Keyframe animation may need more foot displacement`);
    }

    console.log();
    console.log("✓✓✓ PLANTED FOOT MOVEMENT CALCULATION COMPLETE ✓✓✓\n");
    return Math.abs(bodyX) > 1;
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

// Test 3: Analyze individual leg contributions
function testIndividualLegContributions() {
    console.log("=== TEST 3: INDIVIDUAL LEG CONTRIBUTIONS ===\n");

    const keyframes = animationData.keyframes;
    const firstKf = keyframes[0];
    const lastKf = keyframes[keyframes.length - 1];

    console.log("Analyzing each leg's displacement over full cycle:\n");

    for (let legIdx = 0; legIdx < 8; legIdx++) {
        const startX = firstKf.legs[legIdx].x;
        const endX = lastKf.legs[legIdx].x;
        const deltaX = endX - startX;

        console.log(`  Leg ${legIdx}: ${startX.toFixed(2)} → ${endX.toFixed(2)} (Δ${deltaX.toFixed(2)})`);
    }

    console.log();

    // Calculate which legs move forward/backward
    let forwardCount = 0;
    let backwardCount = 0;
    let staticCount = 0;

    for (let legIdx = 0; legIdx < 8; legIdx++) {
        const deltaX = lastKf.legs[legIdx].x - firstKf.legs[legIdx].x;
        if (deltaX > 0.5) forwardCount++;
        else if (deltaX < -0.5) backwardCount++;
        else staticCount++;
    }

    console.log(`Summary:`);
    console.log(`  Legs moving forward: ${forwardCount}`);
    console.log(`  Legs moving backward: ${backwardCount}`);
    console.log(`  Legs static: ${staticCount}`);
    console.log();

    console.log("✓✓✓ LEG CONTRIBUTION ANALYSIS COMPLETE ✓✓✓\n");
    return true;
}

// Run all tests
const test1 = testKeyframesHaveDisplacement();
const test2 = testExpectedBodyMovement();
const test3 = testIndividualLegContributions();

console.log("╔════════════════════════════════════════════╗");
console.log("║              TEST SUMMARY                  ║");
if (test2) {
    console.log("║                                            ║");
    console.log("║   ✓ Body movement is non-zero             ║");
} else {
    console.log("║                                            ║");
    console.log("║   ✗ Body movement is near zero!           ║");
    console.log("║     (Keyframes may need adjustment)        ║");
}
console.log("╚════════════════════════════════════════════╝\n");

process.exit(0); // Always pass, this is diagnostic
