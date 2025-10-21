// Tests for visual geometry issues reported by user:
// 1. Body appears too small
// 2. Legs originate outside body
// 3. Legs cross over each other

const { SpiderBody } = require('./spider-model.js');
const { Leg2D } = require('./leg-kinematics.js');

console.log("\n╔════════════════════════════════════════════════════════════╗");
console.log("║   VISUAL GEOMETRY REGRESSION TESTS                        ║");
console.log("║   Testing for reported issues                             ║");
console.log("╚════════════════════════════════════════════════════════════╝\n");

// Test with actual animation parameters
function testWithAnimationParameters() {
    console.log("=== TEST 1: BODY SIZE WITH ANIMATION PARAMETERS ===\n");

    // From spider-animation-v2.js line 51:
    // this.bodySize = (8 + Math.random() * 8) * config.spiderSize;
    // Let's test with mid-range values

    const configSpiderSize = 1.0; // Default size multiplier
    const bodySize = 12 * configSpiderSize; // Middle of 8-16 range

    console.log(`Animation bodySize: ${bodySize}`);

    const body = new SpiderBody(bodySize);

    console.log(`\nBody dimensions (as drawn):`);
    console.log(`  Cephalothorax: ${body.cephalothorax.length} × ${body.cephalothorax.width}`);
    console.log(`  Abdomen: ${body.abdomen.length} × ${body.abdomen.width}`);

    // These are ellipse radii (what gets passed to ctx.ellipse)
    const cephRadiusX = body.cephalothorax.length / 2;
    const cephRadiusY = body.cephalothorax.width / 2;
    const abdRadiusX = body.abdomen.length / 2;
    const abdRadiusY = body.abdomen.width / 2;

    console.log(`\nEllipse radii (what ctx.ellipse receives):`);
    console.log(`  Cephalothorax: radiusX=${cephRadiusX}, radiusY=${cephRadiusY}`);
    console.log(`  Abdomen: radiusX=${abdRadiusX}, radiusY=${abdRadiusY}`);

    console.log(`\nLeg dimensions:`);
    console.log(`  Upper segment: ${body.legUpperLength}`);
    console.log(`  Lower segment: ${body.legLowerLength}`);
    console.log(`  Total leg length: ${body.legUpperLength + body.legLowerLength}`);

    // Calculate visual proportions
    const maxBodyRadius = Math.max(cephRadiusX, cephRadiusY, abdRadiusX, abdRadiusY);
    const legLength = body.legUpperLength + body.legLowerLength;

    console.log(`\nVisual proportions:`);
    console.log(`  Max body radius: ${maxBodyRadius}`);
    console.log(`  Leg length: ${legLength}`);
    console.log(`  Body radius / Leg length: ${(maxBodyRadius / legLength).toFixed(2)}`);

    // Body should be visually significant compared to legs
    const minRatio = 0.25; // Body radius should be at least 25% of leg length
    const passed = (maxBodyRadius / legLength) >= minRatio;

    console.log(`\nTest: Body should be visible (max radius >= ${minRatio} × leg length)`);
    console.log(`Expected: >= ${(legLength * minRatio).toFixed(2)}`);
    console.log(`Actual: ${maxBodyRadius.toFixed(2)}`);
    console.log(`Result: ${passed ? '✓ PASS' : '✗ FAIL - Body too small relative to legs!'}`);

    return passed;
}

// Test that attachments are clearly inside body boundary
function testAttachmentsWellInsideBody() {
    console.log("\n=== TEST 2: ATTACHMENT POINTS WELL INSIDE BODY ===\n");

    const bodySize = 12;
    const body = new SpiderBody(bodySize);

    // For an ellipse, a point (x,y) is inside if:
    // (x-cx)²/a² + (y-cy)²/b² <= 1
    // where (cx, cy) is center, a is x-radius, b is y-radius

    const cephCenter = body.cephalothorax.center;
    const cephRadiusX = body.cephalothorax.length / 2;
    const cephRadiusY = body.cephalothorax.width / 2;

    console.log(`Cephalothorax ellipse:`);
    console.log(`  Center: (${cephCenter}, 0)`);
    console.log(`  Radii: ${cephRadiusX} × ${cephRadiusY}`);

    let allWellInside = true;
    let problems = [];

    console.log(`\nChecking attachment points:`);
    console.log(`Leg | X     | Y     | Distance to edge | Well inside?`);
    console.log(`----|-------|-------|------------------|-------------`);

    for (let i = 0; i < 8; i++) {
        const att = body.getAttachment(i);

        // Calculate normalized distance (0 = center, 1 = on edge, >1 = outside)
        const dx = (att.x - cephCenter) / cephRadiusX;
        const dy = att.y / cephRadiusY;
        const normalizedDist = Math.sqrt(dx * dx + dy * dy);

        // Actual distance from edge (negative = inside, positive = outside)
        const distToEdge = (1 - normalizedDist);

        // Attachments should be well inside (at least 10% away from edge)
        const minDistFromEdge = 0.1;
        const wellInside = distToEdge >= minDistFromEdge;

        const status = wellInside ? '✓' : '✗ TOO CLOSE';

        console.log(`${i}   | ${att.x.toFixed(2).padStart(5)} | ${att.y.toFixed(2).padStart(5)} | ${distToEdge.toFixed(3).padStart(16)} | ${status}`);

        if (!wellInside) {
            allWellInside = false;
            problems.push({
                leg: i,
                x: att.x,
                y: att.y,
                distToEdge: distToEdge,
                normalizedDist: normalizedDist
            });
        }
    }

    console.log(`\nResult: ${allWellInside ? '✓ PASS' : '✗ FAIL - Attachments at edge or outside!'}`);

    if (problems.length > 0) {
        console.log(`\nProblems:`);
        for (const p of problems) {
            console.log(`  Leg ${p.leg}: distance to edge = ${p.distToEdge.toFixed(3)}`);
            if (p.distToEdge < 0) {
                console.log(`    ERROR: Attachment is OUTSIDE body! (normalized dist = ${p.normalizedDist.toFixed(3)})`);
            } else if (p.distToEdge < 0.1) {
                console.log(`    WARNING: Attachment too close to edge`);
            }
        }
    }

    return allWellInside;
}

// Test that legs don't cross when animated
function testLegCrossingInMotion() {
    console.log("\n=== TEST 3: LEG CROSSING IN SIMULATED MOTION ===\n");

    const bodySize = 12;
    const body = new SpiderBody(bodySize);

    // Simulate legs at different positions
    const positions = [
        { name: "Rest", reach: 0.7 },
        { name: "Extended", reach: 0.9 },
        { name: "Retracted", reach: 0.5 }
    ];

    let foundCrossing = false;

    for (const pos of positions) {
        console.log(`\nTesting ${pos.name} position (reach=${pos.reach}):`);

        const reach = (body.legUpperLength + body.legLowerLength) * pos.reach;

        // Calculate foot positions
        const rightFeet = [];
        const leftFeet = [];

        for (let i = 0; i < 8; i++) {
            const att = body.getAttachment(i);

            const footX = att.x + Math.cos(att.baseAngle) * reach;
            const footY = att.y + Math.sin(att.baseAngle) * reach;

            const footInfo = {
                leg: i,
                pair: att.pair,
                footX: footX,
                footY: footY,
                attachX: att.x,
                attachY: att.y,
                baseAngle: att.baseAngle
            };

            if (att.side > 0) {
                rightFeet.push(footInfo);
            } else {
                leftFeet.push(footInfo);
            }
        }

        // Check for crossings by testing if line segments intersect
        // For simplicity, check if Y coordinates are out of order

        console.log(`  Right side Y values: ${rightFeet.map(f => f.footY.toFixed(1)).join(', ')}`);
        console.log(`  Left side Y values: ${leftFeet.map(f => f.footY.toFixed(1)).join(', ')}`);

        // Right side: Y should generally stay positive and increase or stay roughly same
        for (let i = 0; i < rightFeet.length - 1; i++) {
            const curr = rightFeet[i];
            const next = rightFeet[i + 1];

            // Check if lines from attach to foot cross
            // Simple check: if foot Y values reverse significantly
            if (Math.abs(next.footY - curr.footY) > body.cephalothorax.width * 0.3 && next.footY < curr.footY) {
                console.log(`    ⚠ Potential crossing: Leg ${curr.leg} → Leg ${next.leg} (Y: ${curr.footY.toFixed(1)} → ${next.footY.toFixed(1)})`);
                foundCrossing = true;
            }
        }

        // Left side: Y should stay negative and decrease or stay roughly same
        for (let i = 0; i < leftFeet.length - 1; i++) {
            const curr = leftFeet[i];
            const next = leftFeet[i + 1];

            if (Math.abs(next.footY - curr.footY) > body.cephalothorax.width * 0.3 && next.footY > curr.footY) {
                console.log(`    ⚠ Potential crossing: Leg ${curr.leg} → Leg ${next.leg} (Y: ${curr.footY.toFixed(1)} → ${next.footY.toFixed(1)})`);
                foundCrossing = true;
            }
        }
    }

    const passed = !foundCrossing;
    console.log(`\nResult: ${passed ? '✓ PASS - No obvious crossings' : '✗ FAIL - Potential leg crossings detected!'}`);

    return passed;
}

// Test that the coordinate system makes sense
function testCoordinateSystem() {
    console.log("\n=== TEST 4: COORDINATE SYSTEM CONSISTENCY ===\n");

    const bodySize = 12;
    const body = new SpiderBody(bodySize);

    console.log(`Body coordinate system:`);
    console.log(`  Origin: body center (0, 0)`);
    console.log(`  +X: forward (right on screen)`);
    console.log(`  +Y: downward (right side of spider)`);
    console.log(`  -Y: upward (left side of spider)`);

    console.log(`\nCephalothorax position:`);
    console.log(`  Center: X=${body.cephalothorax.center} (should be positive = forward of origin)`);

    console.log(`\nAbdomen position:`);
    console.log(`  Center: X=${body.abdomen.center} (should be negative = behind origin)`);

    const cephForward = body.cephalothorax.center > 0;
    const abdBackward = body.abdomen.center < 0;

    console.log(`\nChecks:`);
    console.log(`  Cephalothorax forward? ${cephForward ? '✓ YES' : '✗ NO'}`);
    console.log(`  Abdomen backward? ${abdBackward ? '✓ YES' : '✗ NO'}`);

    console.log(`\nLeg attachments:`);
    console.log(`  Right legs Y > 0? ${body.getAttachment(0).y > 0 ? '✓ YES' : '✗ NO'}`);
    console.log(`  Left legs Y < 0? ${body.getAttachment(1).y < 0 ? '✓ YES' : '✗ NO'}`);

    const passed = cephForward && abdBackward &&
                   body.getAttachment(0).y > 0 &&
                   body.getAttachment(1).y < 0;

    console.log(`\nResult: ${passed ? '✓ PASS' : '✗ FAIL - Coordinate system inconsistent!'}`);

    return passed;
}

// Run all tests
function runAllTests() {
    const results = [];

    results.push(testWithAnimationParameters());
    results.push(testAttachmentsWellInsideBody());
    results.push(testLegCrossingInMotion());
    results.push(testCoordinateSystem());

    const allPassed = results.every(r => r);

    console.log("\n╔════════════════════════════════════════════════════════════╗");
    if (allPassed) {
        console.log("║              ✓✓✓ ALL VISUAL TESTS PASSED ✓✓✓              ║");
    } else {
        console.log("║              ✗✗✗ SOME VISUAL TESTS FAILED ✗✗✗             ║");
        console.log("║                                                            ║");
        console.log("║  These failures match the reported visual issues!         ║");
    }
    console.log("╚════════════════════════════════════════════════════════════╝\n");

    return allPassed;
}

runAllTests();
