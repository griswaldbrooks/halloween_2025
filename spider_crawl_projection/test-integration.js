// Integration tests - simulate actual usage in animation
const { SpiderBody } = require('./spider-model.js');
const { Leg2D } = require('./leg-kinematics.js');

console.log("\n╔════════════════════════════════════════════════════════════╗");
console.log("║   INTEGRATION TESTS - FULL SPIDER SIMULATION              ║");
console.log("╚════════════════════════════════════════════════════════════╝\n");

function testCompleteSpiderCreation() {
    console.log("=== TEST 1: COMPLETE SPIDER CREATION (AS IN ANIMATION) ===\n");

    // Simulate spider creation from spider-animation-v2.js
    const bodySize = 12; // Mid-range value
    const body = new SpiderBody(bodySize);

    console.log(`Creating spider with bodySize=${bodySize}...`);
    console.log();

    // Create legs exactly as done in Spider constructor
    const legs = [];
    const groupA = [1, 2, 5, 6]; // L1, R2, L3, R4

    for (let i = 0; i < 8; i++) {
        const attachment = body.getAttachment(i);

        const leg = new Leg2D({
            attachX: attachment.x,
            attachY: attachment.y,
            upperLength: body.legUpperLength,
            lowerLength: body.legLowerLength,
            side: attachment.side,
            baseAngle: attachment.baseAngle
        });

        leg.group = groupA.includes(i) ? 'A' : 'B';
        leg.pairIndex = attachment.pair;
        leg.baseAngle = attachment.baseAngle;

        legs.push(leg);
    }

    console.log("Leg creation:");
    console.log("Leg | Group | Pair | Attach X | Attach Y | Upper | Lower | Base Angle");
    console.log("----|-------|------|----------|----------|-------|-------|------------");

    let allCreated = true;
    for (let i = 0; i < 8; i++) {
        const leg = legs[i];
        const att = body.getAttachment(i);
        const angleDeg = (att.baseAngle * 180 / Math.PI).toFixed(1);

        console.log(`${i}   | ${leg.group.padEnd(5)} |  ${leg.pairIndex}   | ${leg.attachX.toFixed(2).padStart(8)} | ${leg.attachY.toFixed(2).padStart(8)} | ${leg.upperLength.toFixed(1).padStart(5)} | ${leg.lowerLength.toFixed(1).padStart(5)} | ${angleDeg.padStart(7)}°`);

        // Verify leg was created correctly
        if (leg.attachX !== att.x || leg.attachY !== att.y) {
            allCreated = false;
            console.log(`  ✗ Attachment mismatch!`);
        }
    }

    console.log(`\nResult: ${allCreated ? "✓ PASS - All legs created correctly" : "✗ FAIL"}`);
    return allCreated;
}

function testLegIKWithActualPositions() {
    console.log("\n=== TEST 2: LEG IK WITH REALISTIC FOOT POSITIONS ===\n");

    const bodySize = 12;
    const body = new SpiderBody(bodySize);

    console.log("Testing inverse kinematics with foot positions from animation...");
    console.log();

    // Simulate spider at position (100, 100)
    const spiderX = 100;
    const spiderY = 100;

    const reach = (body.legUpperLength + body.legLowerLength) * 0.7;

    let allReachable = true;

    console.log("Leg | World Foot X | World Foot Y | Rel X  | Rel Y  | IK Result");
    console.log("----|--------------|--------------|--------|--------|------------");

    for (let i = 0; i < 8; i++) {
        const att = body.getAttachment(i);

        // Calculate world foot position (as done in initializeLegPositions)
        const worldFootX = spiderX + att.x + Math.cos(att.baseAngle) * reach;
        const worldFootY = spiderY + att.y + Math.sin(att.baseAngle) * reach;

        // Convert to relative (as done in drawLeg)
        const relX = worldFootX - spiderX;
        const relY = worldFootY - spiderY;

        // Create leg and test IK
        const leg = new Leg2D({
            attachX: att.x,
            attachY: att.y,
            upperLength: body.legUpperLength,
            lowerLength: body.legLowerLength,
            side: att.side,
            baseAngle: att.baseAngle
        });

        const success = leg.setFootPosition(relX, relY);
        const result = success ? "✓ Reachable" : "✗ TOO FAR";

        console.log(`${i}   | ${worldFootX.toFixed(2).padStart(12)} | ${worldFootY.toFixed(2).padStart(12)} | ${relX.toFixed(2).padStart(6)} | ${relY.toFixed(2).padStart(6)} | ${result}`);

        if (!success) {
            allReachable = false;
            const distance = Math.sqrt(relX * relX + relY * relY);
            const maxReach = leg.upperLength + leg.lowerLength;
            console.log(`    Distance: ${distance.toFixed(2)}, Max reach: ${maxReach.toFixed(2)}`);
        }
    }

    console.log(`\nResult: ${allReachable ? "✓ PASS - All positions reachable" : "✗ FAIL - Some positions unreachable!"}`);
    return allReachable;
}

function testBodyVisibility() {
    console.log("\n=== TEST 3: BODY VISIBILITY WITH DIFFERENT SIZES ===\n");

    const sizes = [8, 10, 12, 16, 20];

    console.log("Testing body visibility across size range...");
    console.log();
    console.log("Size | Body Radius | Leg Length | Ratio  | Visible?");
    console.log("-----|-------------|------------|--------|----------");

    let allVisible = true;

    for (const size of sizes) {
        const body = new SpiderBody(size);

        const maxBodyRadius = Math.max(
            body.cephalothorax.length / 2,
            body.cephalothorax.width / 2,
            body.abdomen.length / 2,
            body.abdomen.width / 2
        );

        const legLength = body.legUpperLength + body.legLowerLength;
        const ratio = maxBodyRadius / legLength;

        // Body should be visible (ratio >= 0.3 is good)
        const visible = ratio >= 0.3;
        const status = visible ? "✓ YES" : "✗ TOO SMALL";

        console.log(`${size.toString().padStart(4)} | ${maxBodyRadius.toFixed(2).padStart(11)} | ${legLength.toFixed(2).padStart(10)} | ${ratio.toFixed(3).padStart(6)} | ${status}`);

        if (!visible) {
            allVisible = false;
        }
    }

    console.log();
    console.log("Target ratio: >= 0.3 (body radius is at least 30% of leg length)");
    console.log(`Result: ${allVisible ? "✓ PASS" : "✗ FAIL - Body too small at some sizes"}`);

    return allVisible;
}

function testAttachmentInsideBody() {
    console.log("\n=== TEST 4: ALL ATTACHMENTS INSIDE BODY (ALL SIZES) ===\n");

    const sizes = [8, 10, 12, 16, 20];

    let allInside = true;

    for (const size of sizes) {
        const body = new SpiderBody(size);

        const cephCenterX = body.cephalothorax.center;
        const cephRadiusX = body.cephalothorax.length / 2;
        const cephRadiusY = body.cephalothorax.width / 2;

        let sizeAllInside = true;
        let outsideCount = 0;

        for (let i = 0; i < 8; i++) {
            const att = body.getAttachment(i);

            // Check if inside ellipse
            const dx = (att.x - cephCenterX) / cephRadiusX;
            const dy = att.y / cephRadiusY;
            const normalizedDist = Math.sqrt(dx * dx + dy * dy);

            if (normalizedDist > 1.0) {
                sizeAllInside = false;
                allInside = false;
                outsideCount++;
            }
        }

        const status = sizeAllInside ? "✓ All inside" : `✗ ${outsideCount} outside`;
        console.log(`Size ${size.toString().padStart(2)}: ${status}`);
    }

    console.log(`\nResult: ${allInside ? "✓ PASS" : "✗ FAIL - Attachments outside body!"}`);
    return allInside;
}

function testNoLegCrossing() {
    console.log("\n=== TEST 5: NO LEG CROSSING (ALL SIZES) ===\n");

    const sizes = [8, 10, 12, 16, 20];

    let noCrossings = true;

    for (const size of sizes) {
        const body = new SpiderBody(size);
        const reach = (body.legUpperLength + body.legLowerLength) * 0.7;

        let sizeCrossings = 0;

        // Check right side
        for (let pair = 0; pair < 3; pair++) {
            const curr = body.getAttachment(pair * 2);
            const next = body.getAttachment((pair + 1) * 2);

            const currFootY = curr.y + Math.sin(curr.baseAngle) * reach;
            const nextFootY = next.y + Math.sin(next.baseAngle) * reach;

            // Both should be positive, and shouldn't reverse significantly
            if (currFootY > 0 && nextFootY < 0) sizeCrossings++;
            if (currFootY < 0 && nextFootY > 0) sizeCrossings++;
        }

        // Check left side
        for (let pair = 0; pair < 3; pair++) {
            const curr = body.getAttachment(pair * 2 + 1);
            const next = body.getAttachment((pair + 1) * 2 + 1);

            const currFootY = curr.y + Math.sin(curr.baseAngle) * reach;
            const nextFootY = next.y + Math.sin(next.baseAngle) * reach;

            // Both should be negative, and shouldn't reverse significantly
            if (currFootY > 0 && nextFootY < 0) sizeCrossings++;
            if (currFootY < 0 && nextFootY > 0) sizeCrossings++;
        }

        const status = sizeCrossings === 0 ? "✓ No crossings" : `✗ ${sizeCrossings} crossings`;
        console.log(`Size ${size.toString().padStart(2)}: ${status}`);

        if (sizeCrossings > 0) {
            noCrossings = false;
        }
    }

    console.log(`\nResult: ${noCrossings ? "✓ PASS" : "✗ FAIL - Legs crossing at some sizes!"}`);
    return noCrossings;
}

function runAllTests() {
    const results = [];

    results.push(testCompleteSpiderCreation());
    results.push(testLegIKWithActualPositions());
    results.push(testBodyVisibility());
    results.push(testAttachmentInsideBody());
    results.push(testNoLegCrossing());

    const allPassed = results.every(r => r);

    console.log("\n╔════════════════════════════════════════════════════════════╗");
    if (allPassed) {
        console.log("║           ✓✓✓ ALL INTEGRATION TESTS PASSED ✓✓✓           ║");
    } else {
        console.log("║           ✗✗✗ SOME INTEGRATION TESTS FAILED ✗✗✗          ║");
    }
    console.log("╚════════════════════════════════════════════════════════════╝\n");

    return allPassed;
}

runAllTests();
