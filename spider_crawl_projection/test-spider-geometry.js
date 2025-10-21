// Comprehensive tests for spider body geometry and leg positioning
const { SpiderBody } = require('./spider-model.js');
const { Leg2D } = require('./leg-kinematics.js');

console.log("\n╔════════════════════════════════════════════════════════════╗");
console.log("║   SPIDER GEOMETRY & LEG POSITIONING TEST SUITE            ║");
console.log("╚════════════════════════════════════════════════════════════╝\n");

// Test 1: Body proportions are reasonable
function testBodyProportions() {
    console.log("=== TEST 1: BODY PROPORTIONS ===\n");

    const size = 10;
    const body = new SpiderBody(size);

    console.log(`Input size: ${size}`);
    console.log(`Cephalothorax: ${body.cephalothorax.length} × ${body.cephalothorax.width}`);
    console.log(`Abdomen: ${body.abdomen.length} × ${body.abdomen.width}`);
    console.log(`Total body length: ${body.cephalothorax.length + body.abdomen.length}`);

    // Check that body is visible (not too small relative to legs)
    const bodyLength = body.cephalothorax.length + body.abdomen.length;
    const legLength = body.legUpperLength + body.legLowerLength;
    const bodyToLegRatio = bodyLength / legLength;

    console.log(`\nLeg length: ${legLength}`);
    console.log(`Body/Leg ratio: ${bodyToLegRatio.toFixed(2)}`);

    const minRatio = 0.5; // Body should be at least 50% of leg length
    const passed = bodyToLegRatio >= minRatio;

    console.log(`\nExpected: Body should be visible (ratio >= ${minRatio})`);
    console.log(`Result: ${passed ? '✓ PASS' : '✗ FAIL - Body too small!'}`);

    if (!passed) {
        console.log(`  Problem: Body length (${bodyLength}) is too small compared to legs (${legLength})`);
    }

    return passed;
}

// Test 2: All leg attachments are INSIDE the body outline
function testLegAttachmentsInsideBody() {
    console.log("\n=== TEST 2: LEG ATTACHMENTS INSIDE BODY ===\n");

    const size = 10;
    const body = new SpiderBody(size);

    // Calculate body bounds
    const cephFront = body.cephalothorax.center + body.cephalothorax.length / 2;
    const cephBack = body.cephalothorax.center - body.cephalothorax.length / 2;
    const cephTop = body.cephalothorax.width / 2;
    const cephBottom = -body.cephalothorax.width / 2;

    console.log("Cephalothorax bounds:");
    console.log(`  X: ${cephBack.toFixed(2)} to ${cephFront.toFixed(2)}`);
    console.log(`  Y: ${cephBottom.toFixed(2)} to ${cephTop.toFixed(2)}`);

    let allInside = true;
    let problems = [];

    console.log("\nChecking each leg attachment:");
    console.log("Leg | X      | Y      | Inside?");
    console.log("----|--------|--------|----------");

    for (let i = 0; i < 8; i++) {
        const att = body.getAttachment(i);

        // Check if attachment is inside cephalothorax bounds
        const xInside = att.x >= cephBack && att.x <= cephFront;
        const yInside = Math.abs(att.y) <= cephTop;
        const inside = xInside && yInside;

        console.log(`${i}   | ${att.x.toFixed(2).padStart(6)} | ${att.y.toFixed(2).padStart(6)} | ${inside ? '✓' : '✗ OUTSIDE!'}`);

        if (!inside) {
            allInside = false;
            problems.push({
                leg: i,
                x: att.x,
                y: att.y,
                xOutside: !xInside,
                yOutside: !yInside
            });
        }
    }

    console.log(`\nResult: ${allInside ? '✓ PASS - All attachments inside body' : '✗ FAIL - Some attachments outside!'}`);

    if (problems.length > 0) {
        console.log("\nProblems found:");
        for (const p of problems) {
            console.log(`  Leg ${p.leg}: (${p.x.toFixed(2)}, ${p.y.toFixed(2)})`);
            if (p.xOutside) console.log(`    X is outside bounds [${cephBack.toFixed(2)}, ${cephFront.toFixed(2)}]`);
            if (p.yOutside) console.log(`    Y is outside bounds [${cephBottom.toFixed(2)}, ${cephTop.toFixed(2)}]`);
        }
    }

    return allInside;
}

// Test 3: Legs on same side don't cross at rest position
function testLegsDontCross() {
    console.log("\n=== TEST 3: LEGS DON'T CROSS (REST POSITION) ===\n");

    const size = 10;
    const body = new SpiderBody(size);

    // Simulate legs at rest position (extended along base angle)
    const restReach = (body.legUpperLength + body.legLowerLength) * 0.7;

    const rightLegs = [];
    const leftLegs = [];

    for (let i = 0; i < 8; i++) {
        const att = body.getAttachment(i);

        // Calculate foot position at rest
        const footX = att.x + Math.cos(att.baseAngle) * restReach;
        const footY = att.y + Math.sin(att.baseAngle) * restReach;

        const legInfo = {
            index: i,
            pair: att.pair,
            attachX: att.x,
            attachY: att.y,
            footX: footX,
            footY: footY,
            baseAngle: att.baseAngle
        };

        if (att.side > 0) {
            rightLegs.push(legInfo);
        } else {
            leftLegs.push(legInfo);
        }
    }

    // Check right side legs
    console.log("RIGHT SIDE LEGS:");
    console.log("Leg | Pair | Attach Y | Foot Y | Base Angle");
    console.log("----|------|----------|--------|------------");

    for (const leg of rightLegs) {
        const angleDeg = (leg.baseAngle * 180 / Math.PI).toFixed(1);
        console.log(`${leg.index}   |  ${leg.pair}   | ${leg.attachY.toFixed(2).padStart(8)} | ${leg.footY.toFixed(2).padStart(6)} | ${angleDeg.padStart(7)}°`);
    }

    console.log("\nLEFT SIDE LEGS:");
    console.log("Leg | Pair | Attach Y | Foot Y | Base Angle");
    console.log("----|------|----------|--------|------------");

    for (const leg of leftLegs) {
        const angleDeg = (leg.baseAngle * 180 / Math.PI).toFixed(1);
        console.log(`${leg.index}   |  ${leg.pair}   | ${leg.attachY.toFixed(2).padStart(8)} | ${leg.footY.toFixed(2).padStart(6)} | ${angleDeg.padStart(7)}°`);
    }

    // Check for crossings on right side (Y should increase from front to back for right legs)
    let crossings = [];

    // Right side: legs should spread out (positive Y should increase or stay similar)
    console.log("\nChecking for crossings on RIGHT side:");
    for (let i = 0; i < rightLegs.length - 1; i++) {
        const curr = rightLegs[i];
        const next = rightLegs[i + 1];

        // Check if foot Y coordinates cross (rear leg has smaller Y than front leg)
        if (next.footY < curr.footY - 0.1) { // Small tolerance
            crossings.push({
                side: 'RIGHT',
                leg1: curr.index,
                leg2: next.index,
                leg1Y: curr.footY,
                leg2Y: next.footY
            });
            console.log(`  ✗ Leg ${curr.index} (Y=${curr.footY.toFixed(2)}) crosses Leg ${next.index} (Y=${next.footY.toFixed(2)})`);
        }
    }

    console.log("\nChecking for crossings on LEFT side:");
    for (let i = 0; i < leftLegs.length - 1; i++) {
        const curr = leftLegs[i];
        const next = leftLegs[i + 1];

        // Check if foot Y coordinates cross (rear leg has larger Y than front leg)
        if (next.footY > curr.footY + 0.1) { // Small tolerance
            crossings.push({
                side: 'LEFT',
                leg1: curr.index,
                leg2: next.index,
                leg1Y: curr.footY,
                leg2Y: next.footY
            });
            console.log(`  ✗ Leg ${curr.index} (Y=${curr.footY.toFixed(2)}) crosses Leg ${next.index} (Y=${next.footY.toFixed(2)})`);
        }
    }

    const passed = crossings.length === 0;
    console.log(`\nResult: ${passed ? '✓ PASS - No leg crossings detected' : '✗ FAIL - Legs are crossing!'}`);

    if (crossings.length > 0) {
        console.log(`\nFound ${crossings.length} crossing(s):`);
        for (const c of crossings) {
            console.log(`  ${c.side}: Leg ${c.leg1} (foot Y=${c.leg1Y.toFixed(2)}) × Leg ${c.leg2} (foot Y=${c.leg2Y.toFixed(2)})`);
        }
    }

    return passed;
}

// Test 4: Body size matches what gets drawn
function testBodySizeConsistency() {
    console.log("\n=== TEST 4: BODY SIZE CONSISTENCY ===\n");

    const size = 10;
    const body = new SpiderBody(size);

    // In the animation, bodySize is used to create SpiderBody
    // Then the spider is drawn using body.cephalothorax and body.abdomen

    const drawnCephWidth = body.cephalothorax.width;
    const drawnCephLength = body.cephalothorax.length;
    const drawnAbdWidth = body.abdomen.width;
    const drawnAbdLength = body.abdomen.length;

    const totalDrawnLength = drawnCephLength + drawnAbdLength;
    const maxDrawnWidth = Math.max(drawnCephWidth, drawnAbdWidth);

    console.log(`Input size parameter: ${size}`);
    console.log(`Drawn cephalothorax: ${drawnCephLength} × ${drawnCephWidth}`);
    console.log(`Drawn abdomen: ${drawnAbdLength} × ${drawnAbdWidth}`);
    console.log(`Total drawn length: ${totalDrawnLength}`);
    console.log(`Max drawn width: ${maxDrawnWidth}`);

    // Body should be roughly the size parameter (or at least 60% of it)
    const minExpectedSize = size * 0.6;
    const passed = totalDrawnLength >= minExpectedSize;

    console.log(`\nExpected: Total body length >= ${minExpectedSize} (60% of input size)`);
    console.log(`Actual: ${totalDrawnLength}`);
    console.log(`Result: ${passed ? '✓ PASS' : '✗ FAIL - Body drawn smaller than expected!'}`);

    return passed;
}

// Run all tests
function runAllTests() {
    const results = [];

    results.push(testBodyProportions());
    results.push(testLegAttachmentsInsideBody());
    results.push(testLegsDontCross());
    results.push(testBodySizeConsistency());

    const allPassed = results.every(r => r);

    console.log("\n╔════════════════════════════════════════════════════════════╗");
    if (allPassed) {
        console.log("║                   ✓✓✓ ALL TESTS PASSED ✓✓✓                ║");
    } else {
        console.log("║                   ✗✗✗ SOME TESTS FAILED ✗✗✗               ║");
    }
    console.log("╚════════════════════════════════════════════════════════════╝\n");

    return allPassed;
}

runAllTests();
