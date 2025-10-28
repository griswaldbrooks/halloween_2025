#!/usr/bin/env node
/**
 * Unit Tests for Leg Kinematics
 *
 * Tests that forward kinematics produces correct end effector positions
 * for reference positions (zero and max).
 *
 * Run with: pixi run test-kinematics
 */

// Load the kinematics module
const { SpiderLeg2D } = require('./leg-kinematics.js');
const fs = require('fs');

// Test configuration
const EGG_CENTER_X = 300;
const EGG_CENTER_Y = 300;
const EGG_WIDTH = 120;
const UPPER_LENGTH = 80;
const LOWER_LENGTH = 100;
const TOLERANCE = 1.0; // pixels

let testsPassed = 0;
let testsFailed = 0;

function assertNear(name, expected, actual, tolerance = TOLERANCE) {
    const diff = Math.abs(expected - actual);
    if (diff <= tolerance) {
        console.log(`✓ ${name}: ${actual.toFixed(2)} ≈ ${expected.toFixed(2)} (diff: ${diff.toFixed(2)})`);
        testsPassed++;
        return true;
    } else {
        console.log(`✗ ${name}: expected ${expected.toFixed(2)}, got ${actual.toFixed(2)} (diff: ${diff.toFixed(2)})`);
        testsFailed++;
        return false;
    }
}

function assertTrue(name, condition, message = "") {
    if (condition) {
        console.log(`✓ ${name}`);
        testsPassed++;
    } else {
        console.log(`✗ ${name}: ${message}`);
        testsFailed++;
    }
}

console.log("========================================");
console.log("  Leg Kinematics Unit Tests");
console.log("========================================\n");

// Test 1: Zero Position - Both legs point straight up
console.log("Test 1: Zero Position (0° shoulder, 0° elbow)");
console.log("Expected: Both legs point straight up\n");

const leftLegZero = new SpiderLeg2D({
    mountX: EGG_CENTER_X - EGG_WIDTH / 2,
    mountY: EGG_CENTER_Y,
    upperLength: UPPER_LENGTH,
    lowerLength: LOWER_LENGTH,
    side: 'left'
});
leftLegZero.setAngles(0, 0);

const rightLegZero = new SpiderLeg2D({
    mountX: EGG_CENTER_X + EGG_WIDTH / 2,
    mountY: EGG_CENTER_Y,
    upperLength: UPPER_LENGTH,
    lowerLength: LOWER_LENGTH,
    side: 'right'
});
rightLegZero.setAngles(0, 0);

const leftPosZero = leftLegZero.getJointPositions();
const rightPosZero = rightLegZero.getJointPositions();

// When pointing straight up:
// - Elbow should be upperLength pixels above mount (y - upperLength)
// - Tip should be (upperLength + lowerLength) pixels above mount (y - total)
const expectedElbowY = EGG_CENTER_Y - UPPER_LENGTH;
const expectedTipY = EGG_CENTER_Y - UPPER_LENGTH - LOWER_LENGTH;

// Left leg at zero
assertNear("Left elbow Y (straight up)", expectedElbowY, leftPosZero.elbow.y);
assertNear("Left elbow X (no horizontal movement)", EGG_CENTER_X - EGG_WIDTH / 2, leftPosZero.elbow.x);
assertNear("Left tip Y (straight up)", expectedTipY, leftPosZero.tip.y);
assertNear("Left tip X (no horizontal movement)", EGG_CENTER_X - EGG_WIDTH / 2, leftPosZero.tip.x);

// Right leg at zero
assertNear("Right elbow Y (straight up)", expectedElbowY, rightPosZero.elbow.y);
assertNear("Right elbow X (no horizontal movement)", EGG_CENTER_X + EGG_WIDTH / 2, rightPosZero.elbow.x);
assertNear("Right tip Y (straight up)", expectedTipY, rightPosZero.tip.y);
assertNear("Right tip X (no horizontal movement)", EGG_CENTER_X + EGG_WIDTH / 2, rightPosZero.tip.x);

// Both legs should have same Y coordinates (symmetrical)
assertNear("Both elbows at same Y", leftPosZero.elbow.y, rightPosZero.elbow.y);
assertNear("Both tips at same Y", leftPosZero.tip.y, rightPosZero.tip.y);

console.log("\nTest 2: Max Position (90° shoulder, 90° elbow)");
console.log("Expected: Both legs perpendicular (horizontal from body)\n");

const leftLegMax = new SpiderLeg2D({
    mountX: EGG_CENTER_X - EGG_WIDTH / 2,
    mountY: EGG_CENTER_Y,
    upperLength: UPPER_LENGTH,
    lowerLength: LOWER_LENGTH,
    side: 'left'
});
leftLegMax.setAngles(Math.PI / 2, Math.PI / 2);

const rightLegMax = new SpiderLeg2D({
    mountX: EGG_CENTER_X + EGG_WIDTH / 2,
    mountY: EGG_CENTER_Y,
    upperLength: UPPER_LENGTH,
    lowerLength: LOWER_LENGTH,
    side: 'right'
});
rightLegMax.setAngles(Math.PI / 2, Math.PI / 2);

const leftPosMax = leftLegMax.getJointPositions();
const rightPosMax = rightLegMax.getJointPositions();

// At 90° shoulder:
// - Right leg elbow should be to the right of mount (x + upperLength)
// - Left leg elbow should be to the left of mount (x - upperLength)
// - Y should stay at mount level
assertNear("Right elbow Y (horizontal)", EGG_CENTER_Y, rightPosMax.elbow.y, 2.0);
assertNear("Right elbow X (perpendicular right)", EGG_CENTER_X + EGG_WIDTH / 2 + UPPER_LENGTH, rightPosMax.elbow.x);

assertNear("Left elbow Y (horizontal)", EGG_CENTER_Y, leftPosMax.elbow.y, 2.0);
assertNear("Left elbow X (perpendicular left)", EGG_CENTER_X - EGG_WIDTH / 2 - UPPER_LENGTH, leftPosMax.elbow.x);

// At 90° shoulder + 90° elbow:
// Upper leg is horizontal, lower leg is perpendicular to upper leg
// Both legs: lower leg points down (symmetrically mirrored)
assertNear("Right tip Y (90° elbow points down)",
    EGG_CENTER_Y + LOWER_LENGTH,
    rightPosMax.tip.y);
assertNear("Right tip X (no additional horizontal extension)",
    EGG_CENTER_X + EGG_WIDTH / 2 + UPPER_LENGTH,
    rightPosMax.tip.x);

assertNear("Left tip Y (90° elbow points down, mirrored)",
    EGG_CENTER_Y + LOWER_LENGTH,
    leftPosMax.tip.y);
assertNear("Left tip X (no additional horizontal extension)",
    EGG_CENTER_X - EGG_WIDTH / 2 - UPPER_LENGTH,
    leftPosMax.tip.x);

// Symmetry check: legs should be mirrored
const leftDistanceFromCenter = Math.abs(leftPosMax.tip.x - EGG_CENTER_X);
const rightDistanceFromCenter = Math.abs(rightPosMax.tip.x - EGG_CENTER_X);
assertNear("Legs symmetrically positioned", leftDistanceFromCenter, rightDistanceFromCenter);

console.log("\nTest 3: Servo Degree Conversion (0-90° range)");
console.log("Expected: 0° angle → 0° servo, 90° angle → 90° servo\n");

const testLeg = new SpiderLeg2D({
    mountX: 0,
    mountY: 0,
    upperLength: 80,
    lowerLength: 100,
    side: 'right'
});

// Test zero position → 0° servos
testLeg.setAngles(0, 0);
const zeroServos = testLeg.getServoDegrees();
assertTrue("Zero shoulder → 0° servo", zeroServos.shoulder === 0, `Got ${zeroServos.shoulder}°`);
assertTrue("Zero elbow → 0° servo", zeroServos.elbow === 0, `Got ${zeroServos.elbow}°`);

// Test max position → 90° servos
testLeg.setAngles(Math.PI / 2, Math.PI / 2);
const maxServos = testLeg.getServoDegrees();
assertTrue("90° shoulder → 90° servo", maxServos.shoulder === 90, `Got ${maxServos.shoulder}°`);
assertTrue("90° elbow → 90° servo", maxServos.elbow === 90, `Got ${maxServos.elbow}°`);

console.log("\nTest 4: Angle-to-PWM Mapping (Hardware calibration)");
console.log("Expected: Degrees map to calibrated PWM values from JSON\n");

// Load config to get PWM ranges
const config = JSON.parse(fs.readFileSync('animation-config.json', 'utf8'));

// Helper to calculate expected PWM from angle and servo config
function calculatePWM(angleDeg, minPWM, maxPWM, inverted = false) {
    if (inverted) {
        // Inverted servos: 0° = max PWM, 90° = min PWM
        return Math.round(maxPWM - (angleDeg / 90) * (maxPWM - minPWM));
    } else {
        // Normal servos: 0° = min PWM, 90° = max PWM
        return Math.round(minPWM + (angleDeg / 90) * (maxPWM - minPWM));
    }
}

// Right Elbow (CH0): Normal
const rightElbow0 = calculatePWM(0, config.hardware.right_leg.elbow_min_pulse, config.hardware.right_leg.elbow_max_pulse);
const rightElbow90 = calculatePWM(90, config.hardware.right_leg.elbow_min_pulse, config.hardware.right_leg.elbow_max_pulse);
assertNear("Right elbow 0° → PWM 150", 150, rightElbow0, 1);
assertNear("Right elbow 90° → PWM 330", 330, rightElbow90, 1);

// Right Shoulder (CH1): Normal
const rightShoulder0 = calculatePWM(0, config.hardware.right_leg.shoulder_min_pulse, config.hardware.right_leg.shoulder_max_pulse);
const rightShoulder90 = calculatePWM(90, config.hardware.right_leg.shoulder_min_pulse, config.hardware.right_leg.shoulder_max_pulse);
assertNear("Right shoulder 0° → PWM 150", 150, rightShoulder0, 1);
assertNear("Right shoulder 90° → PWM 280", 280, rightShoulder90, 1);

// Left Shoulder (CH14): Inverted
const leftShoulder0 = calculatePWM(0, config.hardware.left_leg.shoulder_max_pulse, config.hardware.left_leg.shoulder_min_pulse, true);
const leftShoulder90 = calculatePWM(90, config.hardware.left_leg.shoulder_max_pulse, config.hardware.left_leg.shoulder_min_pulse, true);
assertNear("Left shoulder 0° → PWM 440", 440, leftShoulder0, 1);
assertNear("Left shoulder 90° → PWM 300", 300, leftShoulder90, 1);

// Left Elbow (CH15): Inverted
const leftElbow0 = calculatePWM(0, config.hardware.left_leg.elbow_max_pulse, config.hardware.left_leg.elbow_min_pulse, true);
const leftElbow90 = calculatePWM(90, config.hardware.left_leg.elbow_max_pulse, config.hardware.left_leg.elbow_min_pulse, true);
assertNear("Left elbow 0° → PWM 530", 530, leftElbow0, 1);
assertNear("Left elbow 90° → PWM 360", 360, leftElbow90, 1);

console.log("\n========================================");
console.log(`Tests Passed: ${testsPassed}`);
console.log(`Tests Failed: ${testsFailed}`);
console.log("========================================");

if (testsFailed === 0) {
    console.log("\n✅ ALL TESTS PASSED - Kinematics and PWM mapping correct\n");
    process.exit(0);
} else {
    console.log("\n❌ TESTS FAILED - Check kinematics implementation\n");
    process.exit(1);
}
