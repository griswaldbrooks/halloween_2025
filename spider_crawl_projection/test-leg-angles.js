// Test leg angle calculations in detail
const { SpiderBody } = require('./spider-model.js');

console.log("\n╔════════════════════════════════════════════════════════════╗");
console.log("║   LEG ANGLE CALCULATION TESTS                             ║");
console.log("╚════════════════════════════════════════════════════════════╝\n");

function radToDeg(rad) {
    return rad * 180 / Math.PI;
}

function testLegAngleQuadrants() {
    console.log("=== TEST 1: LEG ANGLES IN CORRECT QUADRANTS ===\n");

    const body = new SpiderBody(10);

    console.log("Coordinate system:");
    console.log("  0° = Right (+X)");
    console.log("  90° = Down (+Y)");
    console.log("  180° = Left (-X)");
    console.log("  270° = Up (-Y)");
    console.log();

    let allCorrect = true;

    // Right side legs (Y > 0) should point towards +Y quadrant (0° to 180°)
    console.log("RIGHT SIDE LEGS (should point in range 0° to 180°):");
    console.log("Leg | Pair | Angle(°) | Quadrant | Expected    | Status");
    console.log("----|------|----------|----------|-------------|--------");

    for (let i = 0; i < 8; i += 2) { // Even indices are right side
        const att = body.getAttachment(i);
        const angleDeg = radToDeg(att.baseAngle);
        const normalizedAngle = ((angleDeg % 360) + 360) % 360; // Normalize to 0-360

        let quadrant;
        if (normalizedAngle >= 0 && normalizedAngle < 90) quadrant = "I (→↓)";
        else if (normalizedAngle >= 90 && normalizedAngle < 180) quadrant = "II (←↓)";
        else if (normalizedAngle >= 180 && normalizedAngle < 270) quadrant = "III (←↑)";
        else quadrant = "IV (→↑)";

        // Right side should be in quadrants I or II (0° to 180°)
        const correct = normalizedAngle >= 0 && normalizedAngle <= 180;
        const status = correct ? "✓" : "✗ WRONG";

        console.log(`${i}   |  ${att.pair}   | ${angleDeg.toFixed(1).padStart(8)} | ${quadrant} | Q I or II   | ${status}`);

        if (!correct) {
            allCorrect = false;
            console.log(`    Problem: Right leg points to wrong side (Y < 0)`);
        }
    }

    console.log();
    console.log("LEFT SIDE LEGS (should point in range 180° to 360°):");
    console.log("Leg | Pair | Angle(°) | Quadrant | Expected    | Status");
    console.log("----|------|----------|----------|-------------|--------");

    for (let i = 1; i < 8; i += 2) { // Odd indices are left side
        const att = body.getAttachment(i);
        const angleDeg = radToDeg(att.baseAngle);
        const normalizedAngle = ((angleDeg % 360) + 360) % 360;

        let quadrant;
        if (normalizedAngle >= 0 && normalizedAngle < 90) quadrant = "I (→↓)";
        else if (normalizedAngle >= 90 && normalizedAngle < 180) quadrant = "II (←↓)";
        else if (normalizedAngle >= 180 && normalizedAngle < 270) quadrant = "III (←↑)";
        else quadrant = "IV (→↑)";

        // Left side should be in quadrants III or IV (180° to 360°)
        const correct = normalizedAngle >= 180 && normalizedAngle <= 360;
        const status = correct ? "✓" : "✗ WRONG";

        console.log(`${i}   |  ${att.pair}   | ${angleDeg.toFixed(1).padStart(8)} | ${quadrant} | Q III or IV | ${status}`);

        if (!correct) {
            allCorrect = false;
            console.log(`    Problem: Left leg points to wrong side (Y > 0)`);
        }
    }

    console.log(`\nResult: ${allCorrect ? "✓ PASS" : "✗ FAIL - Some legs point to wrong side!"}`);
    return allCorrect;
}

function testLegAngleProgression() {
    console.log("\n=== TEST 2: LEG ANGLE PROGRESSION (FRONT TO BACK) ===\n");

    const body = new SpiderBody(10);

    console.log("Right side legs should progress from forward to backward angles:");
    console.log("Pair | Angle(°) | Direction      | Expected Pattern");
    console.log("-----|----------|----------------|------------------");

    const rightAngles = [];
    for (let i = 0; i < 8; i += 2) {
        const att = body.getAttachment(i);
        const angleDeg = radToDeg(att.baseAngle);
        const normalizedAngle = ((angleDeg % 360) + 360) % 360;

        let direction;
        if (normalizedAngle < 45) direction = "Forward-Right";
        else if (normalizedAngle < 90) direction = "Right-Forward";
        else if (normalizedAngle < 135) direction = "Right-Back";
        else direction = "Backward-Right";

        rightAngles.push(normalizedAngle);

        let expected;
        if (att.pair === 0) expected = "Forward-Right";
        else if (att.pair === 1) expected = "Right-Forward";
        else if (att.pair === 2) expected = "Right-Back";
        else expected = "Backward-Right";

        console.log(`  ${att.pair}  | ${angleDeg.toFixed(1).padStart(8)} | ${direction.padEnd(14)} | ${expected}`);
    }

    console.log();
    console.log("Left side legs should progress from forward to backward angles:");
    console.log("Pair | Angle(°) | Direction      | Expected Pattern");
    console.log("-----|----------|----------------|------------------");

    const leftAngles = [];
    for (let i = 1; i < 8; i += 2) {
        const att = body.getAttachment(i);
        const angleDeg = radToDeg(att.baseAngle);
        const normalizedAngle = ((angleDeg % 360) + 360) % 360;

        let direction;
        if (normalizedAngle < 225) direction = "Backward-Left";
        else if (normalizedAngle < 270) direction = "Left-Back";
        else if (normalizedAngle < 315) direction = "Left-Forward";
        else direction = "Forward-Left";

        leftAngles.push(normalizedAngle);

        let expected;
        if (att.pair === 0) expected = "Forward-Left";
        else if (att.pair === 1) expected = "Left-Forward";
        else if (att.pair === 2) expected = "Left-Back";
        else expected = "Backward-Left";

        console.log(`  ${att.pair}  | ${angleDeg.toFixed(1).padStart(8)} | ${direction.padEnd(14)} | ${expected}`);
    }

    // Check that angles increase monotonically (with wrapping)
    console.log("\nAngle progression check:");
    console.log(`  Right: ${rightAngles.map(a => a.toFixed(0)).join('° → ')}°`);
    console.log(`  Left:  ${leftAngles.map(a => a.toFixed(0)).join('° → ')}°`);

    // For right side, angles should increase
    let rightProgression = true;
    for (let i = 0; i < rightAngles.length - 1; i++) {
        if (rightAngles[i + 1] < rightAngles[i]) {
            rightProgression = false;
            console.log(`  ✗ Right side: Angle decreased from pair ${i} to ${i+1}`);
        }
    }

    // For left side, angles should increase
    let leftProgression = true;
    for (let i = 0; i < leftAngles.length - 1; i++) {
        if (leftAngles[i + 1] < leftAngles[i]) {
            leftProgression = false;
            console.log(`  ✗ Left side: Angle decreased from pair ${i} to ${i+1}`);
        }
    }

    const passed = rightProgression && leftProgression;
    console.log(`\nResult: ${passed ? "✓ PASS - Smooth progression" : "✗ FAIL - Angles don't progress smoothly"}`);
    return passed;
}

function testLegSymmetry() {
    console.log("\n=== TEST 3: LEFT-RIGHT SYMMETRY ===\n");

    const body = new SpiderBody(10);

    console.log("Left and right legs should be symmetric about X axis:");
    console.log("Pair | Right Angle | Left Angle | Symmetric? | Expected Diff");
    console.log("-----|-------------|------------|------------|---------------");

    let allSymmetric = true;

    for (let pair = 0; pair < 4; pair++) {
        const rightIdx = pair * 2;
        const leftIdx = pair * 2 + 1;

        const rightAtt = body.getAttachment(rightIdx);
        const leftAtt = body.getAttachment(leftIdx);

        const rightAngle = radToDeg(rightAtt.baseAngle);
        const leftAngle = radToDeg(leftAtt.baseAngle);

        // Normalize angles to 0-360
        const normRight = ((rightAngle % 360) + 360) % 360;
        const normLeft = ((leftAngle % 360) + 360) % 360;

        // Check if angles are symmetric about X axis
        // Right angle α → Left angle should be (360 - α) or (180 - α) depending on quadrant
        // Actually for X-axis symmetry: if right is θ from +X, left should be -θ from +X
        // Which means: left = 360 - right (or equivalently -right)

        let expectedDiff = normRight + normLeft; // Should be 360° for X-axis symmetry
        const symmetric = Math.abs(expectedDiff - 360) < 1; // 1° tolerance

        console.log(`  ${pair}  | ${rightAngle.toFixed(1).padStart(11)} | ${leftAngle.toFixed(1).padStart(10)} | ${symmetric ? '✓' : '✗'}          | Sum = 360°`);

        if (!symmetric) {
            allSymmetric = false;
            console.log(`    Problem: Sum is ${expectedDiff.toFixed(1)}° (should be 360°)`);
        }
    }

    console.log(`\nResult: ${allSymmetric ? "✓ PASS" : "✗ FAIL - Legs not symmetric!"}`);
    return allSymmetric;
}

function testFootPositionsNonCrossing() {
    console.log("\n=== TEST 4: FOOT POSITIONS DON'T CROSS (DETAILED) ===\n");

    const body = new SpiderBody(10);
    const reach = (body.legUpperLength + body.legLowerLength) * 0.7;

    console.log("Calculating foot positions at rest...");
    console.log();

    const rightFeet = [];
    const leftFeet = [];

    for (let i = 0; i < 8; i++) {
        const att = body.getAttachment(i);
        const footX = att.x + Math.cos(att.baseAngle) * reach;
        const footY = att.y + Math.sin(att.baseAngle) * reach;

        if (att.side > 0) {
            rightFeet.push({ pair: att.pair, x: footX, y: footY, angle: att.baseAngle });
        } else {
            leftFeet.push({ pair: att.pair, x: footX, y: footY, angle: att.baseAngle });
        }
    }

    console.log("RIGHT SIDE:");
    console.log("Pair | Foot X  | Foot Y  | Y Sign");
    console.log("-----|---------|---------|--------");
    for (const foot of rightFeet) {
        const ySign = foot.y > 0 ? "+" : foot.y < 0 ? "-" : "0";
        console.log(` ${foot.pair}   | ${foot.x.toFixed(2).padStart(7)} | ${foot.y.toFixed(2).padStart(7)} | ${ySign}`);
    }

    console.log();
    console.log("LEFT SIDE:");
    console.log("Pair | Foot X  | Foot Y  | Y Sign");
    console.log("-----|---------|---------|--------");
    for (const foot of leftFeet) {
        const ySign = foot.y > 0 ? "+" : foot.y < 0 ? "-" : "0";
        console.log(` ${foot.pair}   | ${foot.x.toFixed(2).padStart(7)} | ${foot.y.toFixed(2).padStart(7)} | ${ySign}`);
    }

    // Check: All right feet should have Y > 0
    let rightCorrect = rightFeet.every(f => f.y > 0);
    console.log(`\nRight side Y values all positive? ${rightCorrect ? "✓ YES" : "✗ NO - Some negative!"}`);

    // Check: All left feet should have Y < 0
    let leftCorrect = leftFeet.every(f => f.y < 0);
    console.log(`Left side Y values all negative? ${leftCorrect ? "✓ YES" : "✗ NO - Some positive!"}`);

    // Check: Within each side, Y values should progress monotonically (no crossings)
    let rightMonotonic = true;
    for (let i = 0; i < rightFeet.length - 1; i++) {
        // Y should increase or stay similar (within tolerance)
        if (rightFeet[i + 1].y < rightFeet[i].y - 0.5) {
            rightMonotonic = false;
            console.log(`  ✗ Right crossing: Pair ${rightFeet[i].pair} (Y=${rightFeet[i].y.toFixed(1)}) → Pair ${rightFeet[i+1].pair} (Y=${rightFeet[i+1].y.toFixed(1)})`);
        }
    }

    let leftMonotonic = true;
    for (let i = 0; i < leftFeet.length - 1; i++) {
        // Y should decrease (become more negative) or stay similar
        if (leftFeet[i + 1].y > leftFeet[i].y + 0.5) {
            leftMonotonic = false;
            console.log(`  ✗ Left crossing: Pair ${leftFeet[i].pair} (Y=${leftFeet[i].y.toFixed(1)}) → Pair ${leftFeet[i+1].pair} (Y=${leftFeet[i+1].y.toFixed(1)})`);
        }
    }

    const passed = rightCorrect && leftCorrect && rightMonotonic && leftMonotonic;
    console.log(`\nResult: ${passed ? "✓ PASS" : "✗ FAIL - Legs crossing or on wrong side!"}`);
    return passed;
}

function runAllTests() {
    const results = [];

    results.push(testLegAngleQuadrants());
    results.push(testLegAngleProgression());
    results.push(testLegSymmetry());
    results.push(testFootPositionsNonCrossing());

    const allPassed = results.every(r => r);

    console.log("\n╔════════════════════════════════════════════════════════════╗");
    if (allPassed) {
        console.log("║              ✓✓✓ ALL ANGLE TESTS PASSED ✓✓✓               ║");
    } else {
        console.log("║              ✗✗✗ SOME ANGLE TESTS FAILED ✗✗✗              ║");
    }
    console.log("╚════════════════════════════════════════════════════════════╝\n");

    return allPassed;
}

runAllTests();
