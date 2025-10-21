// Debug script to check what initializeLegPositions actually does
const { SpiderBody } = require('./spider-model.js');
const { Leg2D } = require('./leg-kinematics.js');

console.log("\n=== DEBUGGING LEG INITIALIZATION ===\n");

const bodySize = 100;
const body = new SpiderBody(bodySize);

// Simulate what spider-animation-v2.js does
const spiderX = 0;
const spiderY = 0;
const groundLevel = spiderY + bodySize * 1.0;

console.log(`Body size: ${bodySize}`);
console.log(`Spider position: (${spiderX}, ${spiderY})`);
console.log(`Ground level: Y = ${groundLevel}\n`);

console.log("Initializing legs as in spider-animation-v2.js:\n");
console.log("Leg | Pair | Base Angle | Foot X   | Foot Y    | Knee Y   | Knee Above Attach?");
console.log("----|------|------------|----------|-----------|----------|-------------------");

for (let i = 0; i < 8; i++) {
    const attachment = body.getAttachment(i);

    // Calculate elbow bias as in spider-animation-v2.js
    const angleDeg = Math.abs(attachment.baseAngle * 180 / Math.PI);
    const elbowBias = angleDeg < 90 ? -1 : 1;

    // Create leg
    const leg = new Leg2D({
        attachX: attachment.x,
        attachY: attachment.y,
        upperLength: body.legUpperLength,
        lowerLength: body.legLowerLength,
        side: attachment.side,
        baseAngle: attachment.baseAngle,
        elbowBias: elbowBias
    });

    // Initialize foot position as in initializeLegPositions
    const horizontalReach = (leg.upperLength + leg.lowerLength) * 0.6;
    const forwardComponent = Math.cos(leg.baseAngle);
    const footX = spiderX + leg.attachX + forwardComponent * horizontalReach;
    const footY = groundLevel;

    // Set foot position and get knee position
    leg.setFootPosition(footX - spiderX, footY - spiderY);
    const positions = leg.forwardKinematics();

    const kneeAbove = positions.knee.y < attachment.y;
    const status = kneeAbove ? "✓ YES" : "✗ NO!";

    console.log(`${i}   |  ${attachment.pair}   | ${(attachment.baseAngle * 180 / Math.PI).toFixed(1).padStart(10)}° | ${footX.toFixed(2).padStart(8)} | ${footY.toFixed(2).padStart(9)} | ${positions.knee.y.toFixed(2).padStart(8)} | ${status}`);
}

console.log("\n");
