// Visual check - print out what we're actually drawing
const { SpiderBody } = require('./spider-model.js');
const { Leg2D } = require('./leg-kinematics.js');

console.log("\n╔════════════════════════════════════════════════════════════╗");
console.log("║   VISUAL OUTPUT CHECK                                      ║");
console.log("║   What is actually being drawn on screen                   ║");
console.log("╚════════════════════════════════════════════════════════════╝\n");

function checkWhatWeActuallyDraw() {
    console.log("=== SIMULATING ACTUAL SPIDER DRAWING ===\n");

    const body = new SpiderBody(100);
    const spiderX = 100;
    const spiderY = 100;

    console.log("Spider position:", spiderX, spiderY);
    console.log("Body proportions:");
    console.log("  Abdomen center:", body.abdomen.center, "(should be BEHIND, negative X)");
    console.log("  Cephalothorax center:", body.cephalothorax.center, "(should be FORWARD, positive X)");
    console.log();

    console.log("What we draw after ctx.translate(spiderX, spiderY):\n");
    console.log("Leg | Attach(local) | Foot(local)   | Direction  | Should point");
    console.log("----|---------------|---------------|------------|-------------");

    for (let i = 0; i < 8; i++) {
        const attachment = body.getAttachment(i);

        // Same logic as animation
        const isForwardPointing = Math.abs(attachment.baseAngle) < Math.PI / 2;
        const elbowBias = isForwardPointing ? -attachment.side : attachment.side;

        const leg = new Leg2D({
            attachX: attachment.x,
            attachY: attachment.y,
            upperLength: body.legUpperLength,
            lowerLength: body.legLowerLength,
            side: attachment.side,
            baseAngle: attachment.baseAngle,
            elbowBias: elbowBias
        });

        // Calculate foot position
        const reach = (leg.upperLength + leg.lowerLength) * 0.7;
        const worldFootX = spiderX + attachment.x + Math.cos(attachment.baseAngle) * reach;
        const worldFootY = spiderY + attachment.y + Math.sin(attachment.baseAngle) * reach;

        // Convert to local (what's drawn after translate)
        const localFootX = worldFootX - spiderX;
        const localFootY = worldFootY - spiderY;

        // Set IK
        leg.setFootPosition(localFootX, localFootY);
        const positions = leg.forwardKinematics();

        // Determine direction
        const dx = positions.foot.x - attachment.x;
        const dy = positions.foot.y - attachment.y;
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;

        let directionName;
        if (angle > -45 && angle <= 45) directionName = "Right →";
        else if (angle > 45 && angle <= 135) directionName = "Down ↓";
        else if (angle > 135 || angle <= -135) directionName = "Left ←";
        else directionName = "Up ↑";

        // What SHOULD it point for top-down?
        let shouldPoint;
        const side = attachment.side > 0 ? "R" : "L";
        const pair = attachment.pair;
        if (pair === 0) shouldPoint = "Forward-" + (side === "R" ? "Right" : "Left");
        else if (pair === 1) shouldPoint = "Side-" + (side === "R" ? "Right" : "Left");
        else if (pair === 2) shouldPoint = "Back-" + (side === "R" ? "Right" : "Left");
        else shouldPoint = "Backward-" + (side === "R" ? "Right" : "Left");

        console.log(` ${i}  | (${attachment.x.toFixed(0).padStart(3)},${attachment.y.toFixed(0).padStart(4)}) | (${positions.foot.x.toFixed(0).padStart(4)},${positions.foot.y.toFixed(0).padStart(4)}) | ${directionName.padEnd(10)} | ${shouldPoint}`);
    }

    console.log("\n💡 KEY INSIGHT:");
    console.log("   In top-down view, coordinate system is:");
    console.log("   - +X = Forward (spider walks right)");
    console.log("   - +Y = Right side (down on screen)");
    console.log("   - -Y = Left side (up on screen)");
    console.log();
    console.log("   So for natural spider spread:");
    console.log("   - Right legs should point toward +Y (down)");
    console.log("   - Left legs should point toward -Y (up)");
    console.log("   - Front legs should point toward +X (right)");
    console.log("   - Back legs should point toward -X (left)");
}

function checkBaseAngles() {
    console.log("\n=== BASE ANGLES FROM MODEL ===\n");

    const body = new SpiderBody(100);

    console.log("Leg | Pair | Side  | BaseAngle(rad) | BaseAngle(°) | Points toward");
    console.log("----|------|-------|----------------|--------------|---------------");

    for (let i = 0; i < 8; i++) {
        const attachment = body.getAttachment(i);
        const angleDeg = (attachment.baseAngle * 180 / Math.PI).toFixed(1);
        const side = attachment.side > 0 ? "Right" : "Left";

        // What direction does this angle point?
        let points;
        const absAngle = Math.abs(attachment.baseAngle * 180 / Math.PI);
        const sign = attachment.baseAngle > 0 ? "+" : "-";

        if (absAngle < 45) points = "Forward";
        else if (absAngle < 90) points = "Forward-" + (sign === "+" ? "Down" : "Up");
        else if (absAngle < 135) points = "Backward-" + (sign === "+" ? "Down" : "Up");
        else points = "Backward";

        console.log(` ${i}  |  ${attachment.pair}   | ${side.padEnd(5)} | ${attachment.baseAngle.toFixed(3).padStart(14)} | ${angleDeg.padStart(12)}° | ${points}`);
    }

    console.log("\n💡 Angles in standard math convention:");
    console.log("   0° = right (+X), 90° = down (+Y), 180° = left (-X), -90° = up (-Y)");
}

checkWhatWeActuallyDraw();
checkBaseAngles();

console.log("\n╔════════════════════════════════════════════════════════════╗");
console.log("║  Run `pixi run serve` and compare to spider_template1.png ║");
console.log("╚════════════════════════════════════════════════════════════╝\n");
