// Optimize foot positions to eliminate leg intersections
const { Leg2D } = require('./leg-kinematics.js');
const { SpiderBody } = require('./spider-model.js');

// Line segment intersection detection (same as test file)
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

function countIntersections(legs, spiderX, spiderY) {
    let count = 0;
    for (let i = 0; i < legs.length; i++) {
        for (let j = i + 1; j < legs.length; j++) {
            const pos1 = legs[i].forwardKinematics();
            const pos2 = legs[j].forwardKinematics();
            if (legsIntersect(legs[i], pos1, legs[j], pos2, spiderX, spiderY)) {
                count++;
            }
        }
    }
    return count;
}

function optimizeFootPositions() {
    console.log("\n╔════════════════════════════════════════════╗");
    console.log("║   FOOT POSITION OPTIMIZER                 ║");
    console.log("╚════════════════════════════════════════════╝");

    const spiderX = 400;
    const spiderY = 400;
    const bodySize = 100;
    const body = new SpiderBody(bodySize);

    // User's elbow bias pattern - DO NOT CHANGE
    const elbowBiasPattern = [-1, 1, -1, 1, 1, -1, 1, -1];

    console.log("\nElbow bias pattern (preserved):", elbowBiasPattern);

    // Create legs with user's elbow bias
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
        legs.push(leg);
    }

    // Try different reach values to find non-intersecting configuration
    console.log("\nSearching for non-intersecting foot positions...");

    const maxReach = (body.legUpperLength + body.legLowerLength);
    const reachSteps = [0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9];

    let bestConfig = null;
    let minIntersections = Infinity;

    for (const reachFactor of reachSteps) {
        // Set foot positions
        for (let i = 0; i < 8; i++) {
            const attachment = body.getAttachment(i);
            const reach = maxReach * reachFactor;
            const targetX = attachment.x + Math.cos(attachment.baseAngle) * reach;
            const targetY = attachment.y + Math.sin(attachment.baseAngle) * reach;
            legs[i].setFootPosition(targetX, targetY);
        }

        const intersections = countIntersections(legs, spiderX, spiderY);

        console.log(`  Reach factor ${(reachFactor * 100).toFixed(0)}%: ${intersections} intersections`);

        if (intersections < minIntersections) {
            minIntersections = intersections;
            bestConfig = {
                reachFactor,
                footPositions: legs.map((leg, i) => {
                    const pos = leg.forwardKinematics();
                    const attachment = body.getAttachment(i);
                    return {
                        index: i,
                        baseAngleDeg: attachment.baseAngle * 180 / Math.PI,
                        elbowBias: elbowBiasPattern[i],
                        foot: {
                            x: spiderX + pos.foot.x,
                            y: spiderY + pos.foot.y
                        },
                        knee: {
                            x: spiderX + pos.knee.x,
                            y: spiderY + pos.knee.y
                        }
                    };
                })
            };
        }

        if (intersections === 0) {
            console.log(`\n✓ FOUND ZERO INTERSECTIONS at reach factor ${(reachFactor * 100).toFixed(0)}%!`);
            break;
        }
    }

    if (minIntersections > 0) {
        console.log(`\n⚠️  Could not find zero intersections with simple reach adjustment.`);
        console.log(`    Best result: ${minIntersections} intersections at ${(bestConfig.reachFactor * 100).toFixed(0)}% reach`);
        console.log(`\n    Try adjusting individual leg angles or using the interactive editor.`);
    }

    // Output the best configuration
    console.log("\n" + "=".repeat(50));
    console.log("OPTIMIZED CONFIGURATION:");
    console.log("=".repeat(50));
    console.log(JSON.stringify({
        spider: { center: { x: spiderX, y: spiderY }, bodySize },
        reachFactor: bestConfig.reachFactor,
        legs: bestConfig.footPositions,
        elbowBiasPattern: {
            pattern: elbowBiasPattern,
            description: "User-configured pattern (preserved)"
        }
    }, null, 2));

    return minIntersections === 0;
}

const success = optimizeFootPositions();
process.exit(success ? 0 : 1);
