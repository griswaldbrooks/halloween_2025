// Test spider body model
const { SpiderBody } = require('./spider-model.js');

console.log("=== SPIDER BODY MODEL TEST ===\n");

const spider = new SpiderBody(10);

console.log("Body dimensions:");
console.log(`  Size: ${spider.size}`);
console.log(`  Cephalothorax: ${spider.cephalothorax.length} x ${spider.cephalothorax.width}`);
console.log(`  Abdomen: ${spider.abdomen.length} x ${spider.abdomen.width}`);
console.log(`  Leg segments: ${spider.legUpperLength}, ${spider.legLowerLength}`);

console.log("\nLeg attachment points:");
console.log("Idx | Pair | Side  | X     | Y    | Angle(°)");
console.log("----|------|-------|-------|------|----------");

for (let i = 0; i < 8; i++) {
    const att = spider.getAttachment(i);
    const angleDeg = (att.baseAngle * 180 / Math.PI).toFixed(1);
    const sideStr = att.side > 0 ? "Right" : "Left ";
    console.log(`${i.toString().padStart(3)} |  ${att.pair}   | ${sideStr} | ${att.x.toFixed(2).padStart(5)} | ${att.y.toFixed(2).padStart(4)} | ${angleDeg.padStart(6)}`);
}

console.log("\nAttachment distribution check:");
const rightSide = spider.legAttachments.filter(a => a.side > 0);
const leftSide = spider.legAttachments.filter(a => a.side < 0);
console.log(`  Right side legs: ${rightSide.length}`);
console.log(`  Left side legs: ${leftSide.length}`);

// Check that legs spread front to back
const xPositions = spider.legAttachments.map(a => a.x).filter((v, i, a) => a.indexOf(v) === i).sort((a,b) => b - a);
console.log(`  X positions (front to back): ${xPositions.map(x => x.toFixed(1)).join(', ')}`);

console.log("\n✓ Model test complete\n");
