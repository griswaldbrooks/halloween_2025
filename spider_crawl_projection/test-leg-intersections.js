// Test for leg segment intersections
const { Leg2D } = require('./leg-kinematics.js');
const { SpiderBody } = require('./spider-model.js');

// Line segment intersection detection
// Returns true if line segments (p1,p2) and (p3,p4) intersect
function segmentsIntersect(p1, p2, p3, p4) {
    const d1 = direction(p3, p4, p1);
    const d2 = direction(p3, p4, p2);
    const d3 = direction(p1, p2, p3);
    const d4 = direction(p1, p2, p4);

    if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) &&
        ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) {
        return true;
    }

    // Check for collinear cases
    if (d1 === 0 && onSegment(p3, p4, p1)) return true;
    if (d2 === 0 && onSegment(p3, p4, p2)) return true;
    if (d3 === 0 && onSegment(p1, p2, p3)) return true;
    if (d4 === 0 && onSegment(p1, p2, p4)) return true;

    return false;
}

// Cross product to determine orientation
function direction(p1, p2, p3) {
    return (p3.x - p1.x) * (p2.y - p1.y) - (p2.x - p1.x) * (p3.y - p1.y);
}

// Check if point p is on line segment (p1, p2)
function onSegment(p1, p2, p) {
    return Math.min(p1.x, p2.x) <= p.x && p.x <= Math.max(p1.x, p2.x) &&
           Math.min(p1.y, p2.y) <= p.y && p.y <= Math.max(p1.y, p2.y);
}

// Test if two legs intersect (excluding attachment point overlap)
function legsIntersect(leg1, leg1Positions, leg2, leg2Positions, spiderX, spiderY) {
    // Get world coordinates for leg 1
    const leg1Attach = { x: spiderX + leg1.attachX, y: spiderY + leg1.attachY };
    const leg1Knee = { x: spiderX + leg1Positions.knee.x, y: spiderY + leg1Positions.knee.y };
    const leg1Foot = { x: spiderX + leg1Positions.foot.x, y: spiderY + leg1Positions.foot.y };

    // Get world coordinates for leg 2
    const leg2Attach = { x: spiderX + leg2.attachX, y: spiderY + leg2.attachY };
    const leg2Knee = { x: spiderX + leg2Positions.knee.x, y: spiderY + leg2Positions.knee.y };
    const leg2Foot = { x: spiderX + leg2Positions.foot.x, y: spiderY + leg2Positions.foot.y };

    // Check upper segment of leg1 vs both segments of leg2
    if (segmentsIntersect(leg1Attach, leg1Knee, leg2Attach, leg2Knee)) {
        // Allow if they share attachment point (adjacent legs)
        const distAttach = Math.sqrt(
            Math.pow(leg1Attach.x - leg2Attach.x, 2) +
            Math.pow(leg1Attach.y - leg2Attach.y, 2)
        );
        if (distAttach > 1) return true;
    }
    if (segmentsIntersect(leg1Attach, leg1Knee, leg2Knee, leg2Foot)) return true;

    // Check lower segment of leg1 vs both segments of leg2
    if (segmentsIntersect(leg1Knee, leg1Foot, leg2Attach, leg2Knee)) return true;
    if (segmentsIntersect(leg1Knee, leg1Foot, leg2Knee, leg2Foot)) return true;

    return false;
}

// Test current spider configuration for intersections
function testSpiderIntersections() {
    console.log("\n╔════════════════════════════════════════════╗");
    console.log("║   LEG INTERSECTION TEST                   ║");
    console.log("╚════════════════════════════════════════════╝");

    const spiderX = 400;
    const spiderY = 400;
    const bodySize = 100;
    const body = new SpiderBody(bodySize);

    // Current elbow bias pattern from spider-animation.js
    const elbowBiasPattern = [-1, 1, -1, 1, 1, -1, 1, -1];

    // Create legs
    const legs = [];
    for (let i = 0; i < 8; i++) {
        const attachment = body.getAttachment(i);
        const leg = new Leg2D({
            attachX: attachment.x,
            attachY: attachment.y,
            upperLength: body.legUpperLength,
            lowerLength: body.legLowerLength,
            side: attachment.side,
            baseAngle: attachment.baseAngle,
            elbowBias: elbowBiasPattern[i]
        });

        // Initialize to default stance position
        const reach = (leg.upperLength + leg.lowerLength) * 0.7;
        const targetX = attachment.x + Math.cos(attachment.baseAngle) * reach;
        const targetY = attachment.y + Math.sin(attachment.baseAngle) * reach;
        leg.setFootPosition(targetX, targetY);

        legs.push(leg);
    }

    // Test all pairs of legs
    console.log("\nTesting all leg pairs for intersections...\n");

    let intersectionCount = 0;
    const intersections = [];

    for (let i = 0; i < legs.length; i++) {
        for (let j = i + 1; j < legs.length; j++) {
            const leg1 = legs[i];
            const leg2 = legs[j];

            const pos1 = leg1.forwardKinematics();
            const pos2 = leg2.forwardKinematics();

            if (legsIntersect(leg1, pos1, leg2, pos2, spiderX, spiderY)) {
                intersectionCount++;
                intersections.push({ leg1: i, leg2: j });
                console.log(`✗ INTERSECTION: Leg ${i} crosses Leg ${j}`);

                // Debug info
                const attachment1 = body.getAttachment(i);
                const attachment2 = body.getAttachment(j);
                console.log(`  Leg ${i}: angle=${(attachment1.baseAngle * 180 / Math.PI).toFixed(1)}°, bias=${elbowBiasPattern[i]}`);
                console.log(`  Leg ${j}: angle=${(attachment2.baseAngle * 180 / Math.PI).toFixed(1)}°, bias=${elbowBiasPattern[j]}`);
            }
        }
    }

    console.log(`\n${'='.repeat(50)}`);
    if (intersectionCount === 0) {
        console.log("✓✓✓ NO INTERSECTIONS - ALL LEGS CLEAR ✓✓✓");
        return true;
    } else {
        console.log(`✗✗✗ FOUND ${intersectionCount} INTERSECTIONS ✗✗✗`);
        console.log("\nIntersecting pairs:");
        intersections.forEach(({ leg1, leg2 }) => {
            console.log(`  - Leg ${leg1} ↔ Leg ${leg2}`);
        });
        return false;
    }
}

// Run test
const result = testSpiderIntersections();
process.exit(result ? 0 : 1);
