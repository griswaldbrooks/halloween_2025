// Test spider rest pose against reference template
// Reference: spider_template1.png (side view)

const { SpiderBody } = require('./spider-model.js');
const { Leg2D } = require('./leg-kinematics.js');

console.log("\n╔════════════════════════════════════════════════════════════╗");
console.log("║   SPIDER REFERENCE SHAPE TEST                             ║");
console.log("║   Comparing against spider_template1.png                  ║");
console.log("╚════════════════════════════════════════════════════════════╝\n");

// Measurements extracted from reference image
// Using body size = 100 as reference scale
const REFERENCE = {
    bodySize: 100,

    // Body proportions
    abdomenDiameter: 100,  // Large round segment (right side)
    cephalothoraxDiameter: 60, // Smaller segment (left side)
    totalBodyLength: 160,  // End to end

    // Leg geometry (KEY INSIGHT: legs arc UPWARD first)
    legSpan: 300,  // Tip to tip width
    kneeHeightAboveBody: 40, // Knee joint is ABOVE body level!
    groundClearance: 100, // Distance from body center to ground

    // Leg rest pose characteristics
    // All legs should arc UP from body, then DOWN to ground
    expectedKneeAboveAttachment: true,
    expectedLegShape: "inverted-V", // UP then DOWN

    // Leg angles at rest (approximate from image)
    // Front legs: point forward-up
    // Middle legs: point sideways-up
    // Back legs: point backward-up
    legAngles: {
        front: { base: 30, kneeAbove: true },   // 30° forward from perpendicular
        frontMid: { base: 60, kneeAbove: true }, // More to the side
        backMid: { base: 120, kneeAbove: true }, // Starting to point back
        back: { base: 150, kneeAbove: true }     // Pointing backward
    }
};

function testSpiderBodyProportions() {
    console.log("=== TEST 1: BODY PROPORTIONS MATCH REFERENCE ===\n");

    const body = new SpiderBody(REFERENCE.bodySize);

    // Check if body segments match reference proportions
    const abdomenSize = Math.max(body.abdomen.length, body.abdomen.width);
    const cephSize = Math.max(body.cephalothorax.length, body.cephalothorax.width);
    const totalLength = body.cephalothorax.length + body.abdomen.length;

    console.log("Expected vs Actual proportions:");
    console.log(`  Abdomen diameter: ${REFERENCE.abdomenDiameter} vs ${abdomenSize.toFixed(1)}`);
    console.log(`  Cephalothorax diameter: ${REFERENCE.cephalothoraxDiameter} vs ${cephSize.toFixed(1)}`);
    console.log(`  Total body length: ${REFERENCE.totalBodyLength} vs ${totalLength.toFixed(1)}`);

    // Check proportions (within 20% tolerance)
    const abdomenMatch = Math.abs(abdomenSize - REFERENCE.abdomenDiameter) / REFERENCE.abdomenDiameter < 0.2;
    const cephMatch = Math.abs(cephSize - REFERENCE.cephalothoraxDiameter) / REFERENCE.cephalothoraxDiameter < 0.2;
    const lengthMatch = Math.abs(totalLength - REFERENCE.totalBodyLength) / REFERENCE.totalBodyLength < 0.2;

    const passed = abdomenMatch && cephMatch && lengthMatch;

    console.log(`\nResult: ${passed ? '✓ PASS' : '✗ FAIL - Body proportions do not match reference'}`);
    return passed;
}

function testLegRestPoseShape() {
    console.log("\n=== TEST 2: LEG REST POSE SHAPE ===\n");
    console.log("KEY: Reference shows legs arc UPWARD from body, then DOWN to ground");
    console.log("     (Inverted-V shape, NOT horizontal)\n");

    const body = new SpiderBody(REFERENCE.bodySize);

    // Create a leg at rest position
    const testLegPair = 1; // Middle leg
    const attachment = body.getAttachment(testLegPair * 2); // Right side

    const leg = new Leg2D({
        attachX: attachment.x,
        attachY: attachment.y,
        upperLength: body.legUpperLength,
        lowerLength: body.legLowerLength,
        side: attachment.side,
        baseAngle: attachment.baseAngle,
        elbowBias: testLegPair <= 1 ? 1 : -1
    });

    // Calculate rest position (leg extended along base angle at 70% reach)
    const reach = (leg.upperLength + leg.lowerLength) * 0.7;
    const targetX = attachment.x + Math.cos(attachment.baseAngle) * reach;
    const targetY = attachment.y + Math.sin(attachment.baseAngle) * reach;

    // Use IK to solve for this position
    leg.setFootPosition(targetX, targetY);
    const positions = leg.forwardKinematics();

    console.log("Leg geometry:");
    console.log(`  Attachment: (${attachment.x.toFixed(1)}, ${attachment.y.toFixed(1)})`);
    console.log(`  Knee: (${positions.knee.x.toFixed(1)}, ${positions.knee.y.toFixed(1)})`);
    console.log(`  Foot: (${positions.foot.x.toFixed(1)}, ${positions.foot.y.toFixed(1)})`);

    // CRITICAL TEST: Is knee ABOVE attachment point?
    // In reference image, knees are clearly above body level
    const kneeAboveAttachment = positions.knee.y < attachment.y; // Remember: Y is flipped (negative = up)

    console.log(`\nKnee relative to attachment:`);
    console.log(`  Knee Y - Attachment Y = ${(positions.knee.y - attachment.y).toFixed(1)}`);
    console.log(`  Knee is above attachment? ${kneeAboveAttachment ? '✓ YES' : '✗ NO (WRONG!)'}`);

    if (!kneeAboveAttachment) {
        console.log("\n  ⚠ PROBLEM: Knee should be ABOVE attachment (negative Y offset)");
        console.log("  Reference shows inverted-V shape with high knees!");
    }

    // Check if leg forms inverted-V shape
    const upperGoesUp = positions.knee.y < attachment.y;
    const lowerGoesDown = positions.foot.y > positions.knee.y;
    const invertedV = upperGoesUp && lowerGoesDown;

    console.log(`\nLeg shape analysis:`);
    console.log(`  Upper segment goes UP? ${upperGoesUp ? '✓ YES' : '✗ NO'}`);
    console.log(`  Lower segment goes DOWN? ${lowerGoesDown ? '✓ YES' : '✗ NO'}`);
    console.log(`  Forms inverted-V? ${invertedV ? '✓ YES' : '✗ NO (WRONG!)'}`);

    const passed = kneeAboveAttachment && invertedV;
    console.log(`\nResult: ${passed ? '✓ PASS' : '✗ FAIL - Leg shape does not match reference!'}`);

    return passed;
}

function testAllLegsHaveHighKnees() {
    console.log("\n=== TEST 3: ALL LEGS HAVE HIGH KNEES ===\n");
    console.log("Checking that ALL 8 legs have knees above body...\n");

    const body = new SpiderBody(REFERENCE.bodySize);

    let allKneesHigh = true;
    let problems = [];

    console.log("Leg | Side  | Pair | Knee Y | Attach Y | Knee Above?");
    console.log("----|-------|------|--------|----------|------------");

    for (let i = 0; i < 8; i++) {
        const attachment = body.getAttachment(i);

        const leg = new Leg2D({
            attachX: attachment.x,
            attachY: attachment.y,
            upperLength: body.legUpperLength,
            lowerLength: body.legLowerLength,
            side: attachment.side,
            baseAngle: attachment.baseAngle,
            elbowBias: attachment.pair <= 1 ? 1 : -1
        });

        // Rest position
        const reach = (leg.upperLength + leg.lowerLength) * 0.7;
        const targetX = attachment.x + Math.cos(attachment.baseAngle) * reach;
        const targetY = attachment.y + Math.sin(attachment.baseAngle) * reach;

        leg.setFootPosition(targetX, targetY);
        const positions = leg.forwardKinematics();

        const kneeAbove = positions.knee.y < attachment.y;
        const sideStr = attachment.side > 0 ? "Right" : "Left ";
        const status = kneeAbove ? "✓" : "✗ LOW!";

        console.log(`${i}   | ${sideStr} |  ${attachment.pair}   | ${positions.knee.y.toFixed(2).padStart(6)} | ${attachment.y.toFixed(2).padStart(8)} | ${status}`);

        if (!kneeAbove) {
            allKneesHigh = false;
            problems.push({leg: i, kneeY: positions.knee.y, attachY: attachment.y});
        }
    }

    console.log(`\nResult: ${allKneesHigh ? '✓ PASS - All legs have high knees!' : '✗ FAIL - Some legs have low knees'}`);

    if (problems.length > 0) {
        console.log(`\nProblems found on ${problems.length} legs:`);
        for (const p of problems) {
            console.log(`  Leg ${p.leg}: Knee at Y=${p.kneeY.toFixed(1)} (should be < ${p.attachY.toFixed(1)})`);
        }
        console.log("\n⚠ FIX NEEDED: Legs should arc UPWARD from body, not straight out!");
    }

    return allKneesHigh;
}

function testLegSpanMatchesReference() {
    console.log("\n=== TEST 4: LEG SPAN MATCHES REFERENCE ===\n");

    const body = new SpiderBody(REFERENCE.bodySize);
    const reach = (body.legUpperLength + body.legLowerLength) * 0.7;

    // Find widest leg span (typically middle legs)
    let maxSpan = 0;

    for (let pair = 0; pair < 4; pair++) {
        const rightIdx = pair * 2;
        const leftIdx = pair * 2 + 1;

        const rightAtt = body.getAttachment(rightIdx);
        const leftAtt = body.getAttachment(leftIdx);

        // Foot positions at rest
        const rightFootX = rightAtt.x + Math.cos(rightAtt.baseAngle) * reach;
        const leftFootX = leftAtt.x + Math.cos(leftAtt.baseAngle) * reach;

        const span = Math.abs(rightFootX - leftFootX);
        maxSpan = Math.max(maxSpan, span);
    }

    console.log(`Expected leg span: ${REFERENCE.legSpan}`);
    console.log(`Actual max span: ${maxSpan.toFixed(1)}`);

    const spanRatio = maxSpan / REFERENCE.legSpan;
    console.log(`Ratio: ${spanRatio.toFixed(2)}`);

    // Should be within 30% (rough match)
    const passed = spanRatio >= 0.7 && spanRatio <= 1.3;

    console.log(`\nResult: ${passed ? '✓ PASS' : '✗ FAIL - Leg span does not match reference'}`);
    return passed;
}

function runAllTests() {
    const results = [];

    results.push(testSpiderBodyProportions());
    results.push(testLegRestPoseShape());
    results.push(testAllLegsHaveHighKnees());
    results.push(testLegSpanMatchesReference());

    const allPassed = results.every(r => r);

    console.log("\n╔════════════════════════════════════════════════════════════╗");
    if (allPassed) {
        console.log("║         ✓✓✓ SPIDER MATCHES REFERENCE SHAPE! ✓✓✓           ║");
    } else {
        console.log("║         ✗✗✗ SPIDER DOES NOT MATCH REFERENCE ✗✗✗           ║");
        console.log("║                                                            ║");
        console.log("║  Most likely issue: Legs go straight out instead of       ║");
        console.log("║  arcing UPWARD first (inverted-V shape)                   ║");
    }
    console.log("╚════════════════════════════════════════════════════════════╝\n");

    return allPassed;
}

runAllTests();
