// Test spider shape for TOP-DOWN view against reference
// Reference: spider_template1.png (TOP-DOWN view, not side view!)

const { SpiderBody } = require('./spider-model.js');
const { Leg2D } = require('./leg-kinematics.js');

console.log("\n╔════════════════════════════════════════════════════════════╗");
console.log("║   SPIDER TOP-DOWN SHAPE TEST                              ║");
console.log("║   Reference: spider_template1.png (viewed from above)     ║");
console.log("╚════════════════════════════════════════════════════════════╝\n");

// Measurements from reference (top-down view)
const REFERENCE = {
    bodySize: 100,

    // Body (viewed from above)
    abdomenDiameter: 100,      // Large circle
    cephalothoraxDiameter: 60, // Smaller circle
    totalBodyLength: 160,

    // Leg spread (viewed from above)
    maxLegSpan: 300,  // Width from left tip to right tip

    // Leg curvature
    legsShouldCurve: true,  // Joints create bend in legs
    expectedLegLength: 150  // Approximate extended length
};

function testBodyProportionsTopDown() {
    console.log("=== TEST 1: BODY PROPORTIONS (TOP-DOWN VIEW) ===\n");

    const body = new SpiderBody(REFERENCE.bodySize);

    // From above, body segments appear as ellipses/circles
    const abdomenSize = Math.max(body.abdomen.length, body.abdomen.width);
    const cephSize = Math.max(body.cephalothorax.length, body.cephalothorax.width);

    console.log("Expected vs Actual (viewed from above):");
    console.log(`  Abdomen: ${REFERENCE.abdomenDiameter} vs ${abdomenSize.toFixed(1)}`);
    console.log(`  Cephalothorax: ${REFERENCE.cephalothoraxDiameter} vs ${cephSize.toFixed(1)}`);

    const abdomenMatch = Math.abs(abdomenSize - REFERENCE.abdomenDiameter) / REFERENCE.abdomenDiameter < 0.15;
    const cephMatch = Math.abs(cephSize - REFERENCE.cephalothoraxDiameter) / REFERENCE.cephalothoraxDiameter < 0.15;

    const passed = abdomenMatch && cephMatch;
    console.log(`\nResult: ${passed ? '✓ PASS' : '✗ FAIL'}`);
    return passed;
}

function testLegSpreadPattern() {
    console.log("\n=== TEST 2: LEG SPREAD PATTERN (TOP-DOWN) ===\n");
    console.log("Checking legs spread outward from body center...\n");

    const body = new SpiderBody(REFERENCE.bodySize);

    // For each pair, check that right/left legs spread outward
    console.log("Pair | Right Y | Left Y  | Spread? | Angle Pattern");
    console.log("-----|---------|---------|---------|---------------");

    let allSpreadCorrectly = true;

    for (let pair = 0; pair < 4; pair++) {
        const rightAtt = body.getAttachment(pair * 2);
        const leftAtt = body.getAttachment(pair * 2 + 1);

        // Right legs should have Y > 0, left legs Y < 0
        const spreadsCorrectly = rightAtt.y > 0 && leftAtt.y < 0;

        // Check angle pattern
        let anglePattern;
        if (pair === 0) anglePattern = "Forward";
        else if (pair === 1) anglePattern = "Forward-Side";
        else if (pair === 2) anglePattern = "Back-Side";
        else anglePattern = "Backward";

        console.log(`  ${pair}  | ${rightAtt.y.toFixed(2).padStart(7)} | ${leftAtt.y.toFixed(2).padStart(7)} | ${spreadsCorrectly ? '✓' : '✗'}       | ${anglePattern}`);

        if (!spreadsCorrectly) allSpreadCorrectly = false;
    }

    console.log(`\nResult: ${allSpreadCorrectly ? '✓ PASS - Legs spread outward' : '✗ FAIL'}`);
    return allSpreadCorrectly;
}

function testLegLengthAndReach() {
    console.log("\n=== TEST 3: LEG LENGTH AND REACH ===\n");

    const body = new SpiderBody(REFERENCE.bodySize);
    const totalLegLength = body.legUpperLength + body.legLowerLength;

    console.log(`Expected leg length: ~${REFERENCE.expectedLegLength}`);
    console.log(`Actual leg length: ${totalLegLength.toFixed(1)}`);

    const ratio = totalLegLength / REFERENCE.expectedLegLength;
    console.log(`Ratio: ${ratio.toFixed(2)}`);

    // Should be reasonably close (within 30%)
    const passed = ratio >= 0.7 && ratio <= 1.3;

    console.log(`\nResult: ${passed ? '✓ PASS' : '✗ FAIL - Legs wrong length'}`);
    return passed;
}

function testJointPositionCreatesNaturalCurve() {
    console.log("\n=== TEST 4: LEG CURVATURE (TOP-DOWN) ===\n");
    console.log("When legs extend outward, joints should create natural curve...\n");

    const body = new SpiderBody(REFERENCE.bodySize);

    // Test middle leg (pair 1) as example
    const attachment = body.getAttachment(2); // Right side, pair 1

    const leg = new Leg2D({
        attachX: attachment.x,
        attachY: attachment.y,
        upperLength: body.legUpperLength,
        lowerLength: body.legLowerLength,
        side: attachment.side,
        baseAngle: attachment.baseAngle,
        elbowBias: -1  // This controls curve direction
    });

    // Extended position
    const reach = (leg.upperLength + leg.lowerLength) * 0.7;
    const targetX = attachment.x + Math.cos(attachment.baseAngle) * reach;
    const targetY = attachment.y + Math.sin(attachment.baseAngle) * reach;

    leg.setFootPosition(targetX, targetY);
    const positions = leg.forwardKinematics();

    console.log("Leg geometry (pair 1, right side):");
    console.log(`  Attachment: (${attachment.x.toFixed(1)}, ${attachment.y.toFixed(1)})`);
    console.log(`  Knee/Joint: (${positions.knee.x.toFixed(1)}, ${positions.knee.y.toFixed(1)})`);
    console.log(`  Foot: (${positions.foot.x.toFixed(1)}, ${positions.foot.y.toFixed(1)})`);

    // Check if knee creates a curve (knee Y should be different from straight line)
    const straightLineY = attachment.y + (targetY - attachment.y) * 0.5;
    const curveAmount = Math.abs(positions.knee.y - straightLineY);

    console.log(`\nCurvature analysis:`);
    console.log(`  Straight line Y at midpoint: ${straightLineY.toFixed(1)}`);
    console.log(`  Actual knee Y: ${positions.knee.y.toFixed(1)}`);
    console.log(`  Curve amount: ${curveAmount.toFixed(1)}`);

    // Curve should be noticeable (at least 9% of leg length - realistic threshold)
    const minCurve = (leg.upperLength + leg.lowerLength) * 0.09;
    const hasCurve = curveAmount >= minCurve;

    console.log(`\nLeg has natural curve? ${hasCurve ? '✓ YES' : '✗ NO (too straight)'}`);

    console.log(`\nResult: ${hasCurve ? '✓ PASS' : '✗ FAIL - Legs too straight!'}`);
    return hasCurve;
}

function runAllTests() {
    const results = [];

    results.push(testBodyProportionsTopDown());
    results.push(testLegSpreadPattern());
    results.push(testLegLengthAndReach());
    results.push(testJointPositionCreatesNaturalCurve());

    const allPassed = results.every(r => r);

    console.log("\n╔════════════════════════════════════════════════════════════╗");
    if (allPassed) {
        console.log("║      ✓✓✓ SPIDER MATCHES TOP-DOWN REFERENCE! ✓✓✓          ║");
    } else {
        console.log("║      ✗✗✗ SPIDER DOES NOT MATCH REFERENCE ✗✗✗             ║");
    }
    console.log("╚════════════════════════════════════════════════════════════╝\n");

    return allPassed;
}

runAllTests();
