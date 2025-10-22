// Extract keyframes from procedural animation
const { Leg2D } = require('./leg-kinematics.js');
const { SpiderBody } = require('./spider-model.js');

console.log("\n╔════════════════════════════════════════════╗");
console.log("║   EXTRACT PROCEDURAL KEYFRAMES            ║");
console.log("╚════════════════════════════════════════════╝\n");

// Default foot positions (from procedural code)
const CUSTOM_FOOT_POSITIONS = [
    { x: 160.2, y: 100.2 },
    { x: 160.2, y: -100.2 },
    { x: 115.2, y: 130.4 },
    { x: 115.2, y: -130.4 },
    { x: -60.2, y: 130.4 },
    { x: -60.2, y: -130.4 },
    { x: -100.2, y: 100.2 },
    { x: -100.2, y: -100.2 }
];

// Simulate procedural gait
const bodySize = 100;
const body = new SpiderBody(bodySize);

// Create legs
const legs = [];
const groupA = [1, 2, 5, 6]; // L1, R2, L3, R4
const elbowBiasPattern = [-1, 1, -1, 1, 1, -1, 1, -1];

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
    leg.index = i;
    leg.group = groupA.includes(i) ? 'A' : 'B';
    legs.push(leg);
}

// Initialize leg positions
const scale = bodySize / 100;
let bodyX = 0; // Track body position in world space

for (let i = 0; i < legs.length; i++) {
    const relPos = CUSTOM_FOOT_POSITIONS[i];
    legs[i].worldFootX = bodyX + relPos.x * scale;
    legs[i].worldFootY = 0 + relPos.y * scale;
}

// Simulate gait through one full cycle
const phaseDurations = [200, 150, 100, 200, 150, 100]; // ms
const totalDuration = phaseDurations.reduce((a, b) => a + b, 0);

console.log("Simulating procedural gait...");
console.log(`Total cycle duration: ${totalDuration}ms`);
console.log(`6 phases: ${phaseDurations.join(', ')}ms\n`);

const keyframes = [];
let currentTime = 0;
let gaitPhase = 0;

// Extract keyframes - only capture when legs actually move
// Skip stance phases (phases 2 and 5) since they're just pauses with no position changes
const keyPhases = [
    { phase: 0, name: "Group A Swing Start" },
    { phase: 1, name: "Group A Lands" },
    { phase: 3, name: "Group B Swing Start" },
    { phase: 4, name: "Group B Lands" }
];

for (const { phase, name } of keyPhases) {
    // Calculate cumulative time up to this phase
    currentTime = phaseDurations.slice(0, phase).reduce((a, b) => a + b, 0);

    console.log(`Phase ${phase}: ${name} at ${currentTime}ms`);

    // Update legs for this phase
    const isGroupASwing = phase === 0;
    const isGroupBSwing = phase === 3;
    const isGroupALurch = phase === 1;
    const isGroupBLurch = phase === 4;

    for (const leg of legs) {
        const isSwinging = (isGroupASwing && leg.group === 'A') ||
                          (isGroupBSwing && leg.group === 'B');

        if (isSwinging) {
            // SWING: Foot swings to new position ahead of body
            const lurchDistance = bodySize * 0.4;
            const futureBodyX = bodyX + lurchDistance;
            const relPos = CUSTOM_FOOT_POSITIONS[leg.index];

            leg.worldFootX = futureBodyX + relPos.x * scale;
            leg.worldFootY = 0 + relPos.y * scale;

            console.log(`  Leg ${leg.index} (${leg.group}): SWING to X=${leg.worldFootX.toFixed(1)}`);
        } else {
            // STANCE: Foot stays fixed in world space
            console.log(`  Leg ${leg.index} (${leg.group}): STANCE at X=${leg.worldFootX.toFixed(1)}`);
        }
    }

    // Body lurches during specific phases
    if (isGroupALurch || isGroupBLurch) {
        const lurchDistance = bodySize * 0.4;
        bodyX += lurchDistance;
        console.log(`  BODY LURCH: ${lurchDistance.toFixed(1)} → bodyX=${bodyX.toFixed(1)}`);
    }

    // Capture keyframe (convert from world space to body-relative)
    const keyframe = {
        time: currentTime,
        name: name,
        legs: legs.map(leg => ({
            x: parseFloat((leg.worldFootX - bodyX).toFixed(1)),
            y: parseFloat((leg.worldFootY - 0).toFixed(1))
        }))
    };

    keyframes.push(keyframe);
    console.log();
}

// Create animation object
// Duration is up to the end of phase 4 (last meaningful keyframe)
// Phases: 0(200ms) + 1(150ms) + 2(100ms) + 3(200ms) + 4(150ms) = 800ms
const meaningfulDuration = phaseDurations.slice(0, 5).reduce((a, b) => a + b, 0);

const animation = {
    name: "Procedural Walk Cycle (Essential Keyframes)",
    description: "Only the 4 key poses - legs actually moving, no redundant stance holds",
    bodySize: 100,
    duration: meaningfulDuration,
    loop: true,
    elbowBiasPattern: elbowBiasPattern,
    keyframes: keyframes
};

// Output
console.log("╔════════════════════════════════════════════╗");
console.log("║         EXTRACTED KEYFRAMES                ║");
console.log("╚════════════════════════════════════════════╝\n");

console.log(JSON.stringify(animation, null, 2));

console.log("\n\n✓ Copy the JSON above to keyframe-animation.json");
console.log("✓ Then use the keyframe editor to fine-tune leg positions");
console.log("✓ The stance phases should now properly move the body forward!\n");

// Save to file
const fs = require('fs');
fs.writeFileSync('./keyframe-animation-procedural.json', JSON.stringify(animation, null, 2));
console.log("✓ Also saved to: keyframe-animation-procedural.json\n");

process.exit(0);
