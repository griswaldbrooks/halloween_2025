// Test if IK solver is giving us correct foot positions
const { SpiderBody } = require('./spider-model.js');
const { Leg2D } = require('./leg-kinematics.js');

console.log("\n╔════════════════════════════════════════════════════════════╗");
console.log("║   IK ACCURACY TEST                                         ║");
console.log("║   Does IK put the foot where we tell it to?                ║");
console.log("╚════════════════════════════════════════════════════════════╝\n");

function testIKAccuracy() {
    console.log("=== TESTING IK SOLVER ACCURACY ===\n");

    const body = new SpiderBody(100);

    console.log("Leg | Target Foot   | Actual Foot   | Error (X, Y)  | Error Dist");
    console.log("----|---------------|---------------|---------------|------------");

    for (let i = 0; i < 8; i++) {
        const attachment = body.getAttachment(i);

        // Create leg - all legs need bias = 1
        const elbowBias = 1;

        const leg = new Leg2D({
            attachX: attachment.x,
            attachY: attachment.y,
            upperLength: body.legUpperLength,
            lowerLength: body.legLowerLength,
            side: attachment.side,
            baseAngle: attachment.baseAngle,
            elbowBias: elbowBias
        });

        // Calculate target foot position
        const reach = (leg.upperLength + leg.lowerLength) * 0.7;
        const targetX = attachment.x + Math.cos(attachment.baseAngle) * reach;
        const targetY = attachment.y + Math.sin(attachment.baseAngle) * reach;

        // Tell IK to put foot there
        leg.setFootPosition(targetX, targetY);

        // Get actual position from FK
        const actual = leg.forwardKinematics();

        // Calculate error
        const errorX = actual.foot.x - targetX;
        const errorY = actual.foot.y - targetY;
        const errorDist = Math.sqrt(errorX * errorX + errorY * errorY);

        console.log(` ${i}  | (${targetX.toFixed(1).padStart(5)},${targetY.toFixed(1).padStart(6)}) | (${actual.foot.x.toFixed(1).padStart(5)},${actual.foot.y.toFixed(1).padStart(6)}) | (${errorX.toFixed(1).padStart(5)},${errorY.toFixed(1).padStart(6)}) | ${errorDist.toFixed(1).padStart(10)}`);
    }

    console.log("\n💡 IK should place foot EXACTLY where we tell it (error should be ~0)");
    console.log("   If error is large, IK solver has a bug or elbowBias is wrong");
}

testIKAccuracy();

console.log("\n╔════════════════════════════════════════════════════════════╗");
console.log("║  Large errors = IK is broken or elbowBias calculation wrong║");
console.log("╚════════════════════════════════════════════════════════════╝\n");
