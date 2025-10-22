// Unit test to analyze body movement in each gait phase
const fs = require('fs');

console.log("\n╔════════════════════════════════════════════╗");
console.log("║   KEYFRAME PHASE-BY-PHASE ANALYSIS        ║");
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

function testPhaseByPhase() {
    console.log("=== PHASE-BY-PHASE BODY MOVEMENT ===\n");

    const keyframes = animationData.keyframes;
    const velocityThreshold = 5.0;

    console.log("Analyzing body movement during each keyframe transition:\n");

    for (let i = 0; i < keyframes.length - 1; i++) {
        const kf1 = keyframes[i];
        const kf2 = keyframes[i + 1];
        const duration = kf2.time - kf1.time;

        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        console.log(`Phase ${i}: "${kf1.name}" → "${kf2.name}"`);
        console.log(`Time: ${kf1.time}ms → ${kf2.time}ms (Δ${duration}ms)`);
        console.log();

        // Analyze each leg
        let swingingLegs = [];
        let plantedLegs = [];
        let swingingDeltaX = 0;
        let plantedDeltaX = 0;

        for (let legIdx = 0; legIdx < 8; legIdx++) {
            const deltaX = kf2.legs[legIdx].x - kf1.legs[legIdx].x;
            const deltaY = kf2.legs[legIdx].y - kf1.legs[legIdx].y;
            const velocity = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

            if (velocity >= velocityThreshold) {
                swingingLegs.push(legIdx);
                swingingDeltaX += deltaX;
                console.log(`  Leg ${legIdx}: SWINGING  → ΔX=${deltaX.toFixed(2).padStart(7)}, vel=${velocity.toFixed(2).padStart(6)}`);
            } else {
                plantedLegs.push(legIdx);
                plantedDeltaX += deltaX;
                console.log(`  Leg ${legIdx}: PLANTED   → ΔX=${deltaX.toFixed(2).padStart(7)}, vel=${velocity.toFixed(2).padStart(6)}`);
            }
        }

        console.log();
        console.log(`Summary:`);
        console.log(`  ${swingingLegs.length} swinging [${swingingLegs.join(',')}]`);
        console.log(`  ${plantedLegs.length} planted  [${plantedLegs.join(',')}]`);
        console.log();

        // Calculate body movement with CURRENT algorithm (non-negated swing)
        let bodyMovementCurrent = 0;
        if (swingingLegs.length > 0) {
            const avgSwingDeltaX = swingingDeltaX / swingingLegs.length;
            bodyMovementCurrent = avgSwingDeltaX; // Current: same direction as swing
            console.log(`Current Algorithm (use swing feet):`);
            console.log(`  Avg swing ΔX: ${avgSwingDeltaX.toFixed(2)}`);
            console.log(`  Body movement: ${bodyMovementCurrent.toFixed(2)} ${bodyMovementCurrent > 0 ? '→' : '←'}`);
        } else {
            console.log(`Current Algorithm: No swinging feet → no movement`);
        }

        console.log();

        // Calculate body movement with ALTERNATIVE algorithm (planted feet push)
        let bodyMovementAlt = 0;
        if (plantedLegs.length > 0 && plantedDeltaX !== 0) {
            const avgPlantedDeltaX = plantedDeltaX / plantedLegs.length;
            bodyMovementAlt = -avgPlantedDeltaX; // Opposite to planted foot movement
            console.log(`Alternative Algorithm (planted feet push):`);
            console.log(`  Avg planted ΔX: ${avgPlantedDeltaX.toFixed(2)}`);
            console.log(`  Body movement: ${bodyMovementAlt.toFixed(2)} ${bodyMovementAlt > 0 ? '→' : '←'}`);
        } else {
            console.log(`Alternative Algorithm: Planted feet don't move → no movement`);
        }

        console.log();

        // What SHOULD happen in a real spider walk?
        console.log(`Expected Real Spider Behavior:`);
        if (swingingLegs.length > 0 && plantedLegs.length > 0) {
            // Legs swinging forward, planted legs staying still
            if (swingingDeltaX > 0 && plantedDeltaX === 0) {
                console.log(`  ✓ Swing phase: Legs reaching forward, body stays still`);
                console.log(`    Expected body: 0.00 (no movement during swing)`);
            }
            // Legs swinging backward, planted legs staying still
            else if (swingingDeltaX < 0 && plantedDeltaX === 0) {
                console.log(`  ✓ Recovery: Legs retracting, body stays still`);
                console.log(`    Expected body: 0.00 (no movement during recovery)`);
            }
            // Planted legs moving backward
            else if (plantedDeltaX < 0) {
                console.log(`  ✓ Stance phase: Planted legs push backward → body forward`);
                console.log(`    Expected body: ${(-plantedDeltaX / plantedLegs.length).toFixed(2)} → (forward)`);
            }
        } else if (swingingLegs.length === 8) {
            console.log(`  ⚠️  All legs swinging - unusual`);
        }

        console.log();
    }

    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
}

// Test what the actual problem is
function testActualProblem() {
    console.log("=== ACTUAL PROBLEM DIAGNOSIS ===\n");

    const keyframes = animationData.keyframes;

    console.log("Looking for phases where planted feet should push body forward:\n");

    let foundStancePhase = false;

    for (let i = 0; i < keyframes.length - 1; i++) {
        const kf1 = keyframes[i];
        const kf2 = keyframes[i + 1];

        let plantedDeltaX = 0;
        let plantedCount = 0;

        for (let legIdx = 0; legIdx < 8; legIdx++) {
            const deltaX = kf2.legs[legIdx].x - kf1.legs[legIdx].x;
            const deltaY = kf2.legs[legIdx].y - kf1.legs[legIdx].y;
            const velocity = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

            if (velocity < 5.0) { // Planted
                plantedDeltaX += deltaX;
                plantedCount++;
            }
        }

        if (plantedCount > 0 && plantedDeltaX < -1.0) {
            console.log(`Phase ${i} ("${kf1.name}" → "${kf2.name}"):`);
            console.log(`  ${plantedCount} planted legs moving BACKWARD (ΔX: ${plantedDeltaX.toFixed(2)})`);
            console.log(`  → This SHOULD push body FORWARD`);
            console.log(`  → But current algorithm ignores planted feet!`);
            console.log();
            foundStancePhase = true;
        }
    }

    if (!foundStancePhase) {
        console.log("❌ NO STANCE PHASES FOUND!");
        console.log("   Planted feet never move backward to push the body.");
        console.log("   Your keyframes might not have proper stance phases.\n");
    } else {
        console.log("✓ Found stance phases where body should move forward\n");
    }

    console.log("CONCLUSION:");
    console.log("  The current algorithm only uses SWINGING feet.");
    console.log("  It ignores when PLANTED feet push backward (stance phase).");
    console.log("  This means the body only moves during swing, not during stance!\n");
}

// Run tests
testPhaseByPhase();
testActualProblem();

console.log("╔════════════════════════════════════════════╗");
console.log("║         RECOMMENDATION                     ║");
console.log("╚════════════════════════════════════════════╝");
console.log();
console.log("The algorithm needs to use BOTH:");
console.log("  1. Planted feet (stance phase) → push body forward");
console.log("  2. Swinging feet (swing phase) → no body movement");
console.log();
console.log("Current algorithm only uses swinging feet, which is backwards!");
console.log();

process.exit(0);
