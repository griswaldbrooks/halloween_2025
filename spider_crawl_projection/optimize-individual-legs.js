// Fine-tune individual leg positions to eliminate all intersections
const { Leg2D } = require('./leg-kinematics.js');
const { SpiderBody } = require('./spider-model.js');

// Line segment intersection detection
function segmentsIntersect(p1, p2, p3, p4) {
    const d1 = direction(p3, p4, p1);
    const d2 = direction(p3, p4, p2);
    const d3 = direction(p1, p2, p3);
    const d4 = direction(p1, p2, p4);

    if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) &&
        ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) {
        return true;
    }

    if (d1 === 0 && onSegment(p3, p4, p1)) return true;
    if (d2 === 0 && onSegment(p3, p4, p2)) return true;
    if (d3 === 0 && onSegment(p1, p2, p3)) return true;
    if (d4 === 0 && onSegment(p1, p2, p4)) return true;

    return false;
}

function direction(p1, p2, p3) {
    return (p3.x - p1.x) * (p2.y - p1.y) - (p2.x - p1.x) * (p3.y - p1.y);
}

function onSegment(p1, p2, p) {
    return Math.min(p1.x, p2.x) <= p.x && p.x <= Math.max(p1.x, p2.x) &&
           Math.min(p1.y, p2.y) <= p.y && p.y <= Math.max(p1.y, p2.y);
}

function legsIntersect(leg1, leg1Positions, leg2, leg2Positions, spiderX, spiderY) {
    const leg1Attach = { x: spiderX + leg1.attachX, y: spiderY + leg1.attachY };
    const leg1Knee = { x: spiderX + leg1Positions.knee.x, y: spiderY + leg1Positions.knee.y };
    const leg1Foot = { x: spiderX + leg1Positions.foot.x, y: spiderY + leg1Positions.foot.y };

    const leg2Attach = { x: spiderX + leg2.attachX, y: spiderY + leg2.attachY };
    const leg2Knee = { x: spiderX + leg2Positions.knee.x, y: spiderY + leg2Positions.knee.y };
    const leg2Foot = { x: spiderX + leg2Positions.foot.x, y: spiderY + leg2Positions.foot.y };

    if (segmentsIntersect(leg1Attach, leg1Knee, leg2Attach, leg2Knee)) {
        const distAttach = Math.sqrt(
            Math.pow(leg1Attach.x - leg2Attach.x, 2) +
            Math.pow(leg1Attach.y - leg2Attach.y, 2)
        );
        if (distAttach > 1) return true;
    }
    if (segmentsIntersect(leg1Attach, leg1Knee, leg2Knee, leg2Foot)) return true;
    if (segmentsIntersect(leg1Knee, leg1Foot, leg2Attach, leg2Knee)) return true;
    if (segmentsIntersect(leg1Knee, leg1Foot, leg2Knee, leg2Foot)) return true;

    return false;
}

function getIntersectionPairs(legs, spiderX, spiderY) {
    const pairs = [];
    for (let i = 0; i < legs.length; i++) {
        for (let j = i + 1; j < legs.length; j++) {
            const pos1 = legs[i].forwardKinematics();
            const pos2 = legs[j].forwardKinematics();
            if (legsIntersect(legs[i], pos1, legs[j], pos2, spiderX, spiderY)) {
                pairs.push({ leg1: i, leg2: j });
            }
        }
    }
    return pairs;
}

function optimizeIndividualLegs() {
    console.log("\n╔════════════════════════════════════════════╗");
    console.log("║   INDIVIDUAL LEG OPTIMIZER                ║");
    console.log("╚════════════════════════════════════════════╝");

    const spiderX = 400;
    const spiderY = 400;
    const bodySize = 100;
    const body = new SpiderBody(bodySize);

    // User's elbow bias pattern - DO NOT CHANGE
    const elbowBiasPattern = [-1, 1, -1, 1, 1, -1, 1, -1];

    console.log("\nElbow bias pattern (preserved):", elbowBiasPattern);

    // Create legs
    const legs = [];
    const maxReach = (body.legUpperLength + body.legLowerLength);

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

        // Start with 90% reach to spread legs out more
        const reach = maxReach * 0.90;
        const targetX = attachment.x + Math.cos(attachment.baseAngle) * reach;
        const targetY = attachment.y + Math.sin(attachment.baseAngle) * reach;
        leg.setFootPosition(targetX, targetY);

        legs.push(leg);
    }

    console.log("\nStarting configuration has", getIntersectionPairs(legs, spiderX, spiderY).length, "intersections");

    // Iteratively adjust legs to remove intersections
    const maxIterations = 1000;
    let iteration = 0;

    while (iteration < maxIterations) {
        const intersections = getIntersectionPairs(legs, spiderX, spiderY);

        if (intersections.length === 0) {
            console.log(`\n✓ SUCCESS! Found zero intersections after ${iteration} iterations`);
            break;
        }

        // For each intersection, try moving one of the legs
        for (const {leg1, leg2} of intersections) {
            const attachment1 = body.getAttachment(leg1);
            const attachment2 = body.getAttachment(leg2);

            // Try multiple adjustment strategies
            const pos1 = legs[leg1].forwardKinematics();
            const pos2 = legs[leg2].forwardKinematics();

            const angle1 = Math.atan2(pos1.foot.y, pos1.foot.x);
            const angle2 = Math.atan2(pos2.foot.y, pos2.foot.x);
            const radius1 = Math.sqrt(pos1.foot.x * pos1.foot.x + pos1.foot.y * pos1.foot.y);
            const radius2 = Math.sqrt(pos2.foot.x * pos2.foot.x + pos2.foot.y * pos2.foot.y);

            let bestCount = intersections.length;
            let bestPos1 = { x: pos1.foot.x, y: pos1.foot.y };
            let bestPos2 = { x: pos2.foot.x, y: pos2.foot.y };

            // Try different adjustments
            const adjustments = [
                // Move leg1 radially out
                { leg: leg1, angle: angle1, radius: radius1 * 1.05 },
                // Move leg1 tangentially clockwise
                { leg: leg1, angle: angle1 + 0.05, radius: radius1 },
                // Move leg1 tangentially counter-clockwise
                { leg: leg1, angle: angle1 - 0.05, radius: radius1 },
                // Move leg2 radially out
                { leg: leg2, angle: angle2, radius: radius2 * 1.05 },
                // Move leg2 tangentially clockwise
                { leg: leg2, angle: angle2 + 0.05, radius: radius2 },
                // Move leg2 tangentially counter-clockwise
                { leg: leg2, angle: angle2 - 0.05, radius: radius2 },
            ];

            for (const adj of adjustments) {
                const newX = Math.cos(adj.angle) * adj.radius;
                const newY = Math.sin(adj.angle) * adj.radius;

                // Apply adjustment
                legs[adj.leg].setFootPosition(newX, newY);

                // Check if it helped
                const newIntersections = getIntersectionPairs(legs, spiderX, spiderY);

                if (newIntersections.length < bestCount) {
                    bestCount = newIntersections.length;
                    if (adj.leg === leg1) {
                        bestPos1 = { x: newX, y: newY };
                    } else {
                        bestPos2 = { x: newX, y: newY };
                    }
                }

                // Revert for next try
                legs[leg1].setFootPosition(pos1.foot.x, pos1.foot.y);
                legs[leg2].setFootPosition(pos2.foot.x, pos2.foot.y);
            }

            // Apply best adjustment
            legs[leg1].setFootPosition(bestPos1.x, bestPos1.y);
            legs[leg2].setFootPosition(bestPos2.x, bestPos2.y);
        }

        iteration++;

        if (iteration % 100 === 0) {
            const remaining = getIntersectionPairs(legs, spiderX, spiderY).length;
            console.log(`  Iteration ${iteration}: ${remaining} intersections remaining`);
        }
    }

    const finalIntersections = getIntersectionPairs(legs, spiderX, spiderY);

    if (finalIntersections.length > 0) {
        console.log(`\n⚠️  Could not eliminate all intersections.`);
        console.log(`    ${finalIntersections.length} intersections remaining after ${iteration} iterations`);
        finalIntersections.forEach(({leg1, leg2}) => {
            console.log(`      Leg ${leg1} ↔ Leg ${leg2}`);
        });
    }

    // Output final configuration
    console.log("\n" + "=".repeat(50));
    console.log("OPTIMIZED CONFIGURATION:");
    console.log("=".repeat(50));

    const config = {
        spider: { center: { x: spiderX, y: spiderY }, bodySize },
        legs: legs.map((leg, i) => {
            const pos = leg.forwardKinematics();
            const attachment = body.getAttachment(i);
            return {
                index: i,
                baseAngle: attachment.baseAngle,
                baseAngleDeg: parseFloat((attachment.baseAngle * 180 / Math.PI).toFixed(1)),
                elbowBias: elbowBiasPattern[i],
                foot: {
                    x: parseFloat((spiderX + pos.foot.x).toFixed(1)),
                    y: parseFloat((spiderY + pos.foot.y).toFixed(1))
                },
                knee: {
                    x: parseFloat((spiderX + pos.knee.x).toFixed(1)),
                    y: parseFloat((spiderY + pos.knee.y).toFixed(1))
                }
            };
        }),
        elbowBiasPattern: {
            pattern: elbowBiasPattern,
            description: "User-configured pattern (preserved)"
        }
    };

    console.log(JSON.stringify(config, null, 2));

    return finalIntersections.length === 0;
}

const success = optimizeIndividualLegs();
process.exit(success ? 0 : 1);
