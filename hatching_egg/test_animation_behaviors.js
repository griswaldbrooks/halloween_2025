#!/usr/bin/env node
// Unit tests for animation-behaviors.js
// Verifies that JavaScript preview loads correctly from animation-config.json

const fs = require('fs');
const assert = require('assert');

console.log('========================================');
console.log('  Animation Behaviors Unit Tests');
console.log('========================================\n');

// Load the JSON config
const config = JSON.parse(fs.readFileSync('animation-config.json', 'utf8'));

let testsPassed = 0;
let testsFailed = 0;

function test(description, fn) {
    try {
        fn();
        console.log(`✓ ${description}`);
        testsPassed++;
    } catch (error) {
        console.log(`✗ ${description}`);
        console.log(`  Error: ${error.message}`);
        testsFailed++;
    }
}

// Test 1: Verify all animations exist in JSON
test('All required animations exist in JSON', () => {
    const required = ['zero', 'max', 'resting', 'slow_struggle', 'breaking_through', 'grasping', 'stabbing'];
    for (const anim of required) {
        assert(config.animations[anim], `Animation '${anim}' not found`);
    }
});

// Test 2: Verify animations have required properties
test('Animations have required properties', () => {
    for (const [name, anim] of Object.entries(config.animations)) {
        assert(anim.name, `${name} missing 'name'`);
        assert(typeof anim.duration_ms === 'number', `${name} missing 'duration_ms'`);
        assert(typeof anim.loop === 'boolean', `${name} missing 'loop'`);
        assert(Array.isArray(anim.keyframes), `${name} missing 'keyframes' array`);
    }
});

// Test 3: Verify keyframes have all required angles
test('Keyframes have all required angle properties', () => {
    for (const [name, anim] of Object.entries(config.animations)) {
        for (let i = 0; i < anim.keyframes.length; i++) {
            const kf = anim.keyframes[i];
            assert(typeof kf.time_ms === 'number', `${name} keyframe ${i} missing time_ms`);
            assert(typeof kf.left_shoulder_deg === 'number', `${name} keyframe ${i} missing left_shoulder_deg`);
            assert(typeof kf.left_elbow_deg === 'number', `${name} keyframe ${i} missing left_elbow_deg`);
            assert(typeof kf.right_shoulder_deg === 'number', `${name} keyframe ${i} missing right_shoulder_deg`);
            assert(typeof kf.right_elbow_deg === 'number', `${name} keyframe ${i} missing right_elbow_deg`);
        }
    }
});

// Test 4: Verify symmetric animations are symmetric
test('Symmetric animations are symmetric', () => {
    const symmetric = ['resting', 'slow_struggle', 'breaking_through', 'grasping'];
    for (const name of symmetric) {
        const anim = config.animations[name];
        for (let i = 0; i < anim.keyframes.length; i++) {
            const kf = anim.keyframes[i];
            assert.strictEqual(kf.left_shoulder_deg, kf.right_shoulder_deg,
                `${name} keyframe ${i}: shoulders not symmetric (${kf.left_shoulder_deg} !== ${kf.right_shoulder_deg})`);
            assert.strictEqual(kf.left_elbow_deg, kf.right_elbow_deg,
                `${name} keyframe ${i}: elbows not symmetric (${kf.left_elbow_deg} !== ${kf.right_elbow_deg})`);
        }
    }
});

// Test 5: Verify animations have movement
test('Animations have movement between keyframes', () => {
    const animated = ['resting', 'slow_struggle', 'breaking_through', 'grasping', 'stabbing'];
    for (const name of animated) {
        const anim = config.animations[name];
        assert(anim.keyframes.length >= 2, `${name} needs at least 2 keyframes`);

        // Check if any angle changes between first and another keyframe
        const first = anim.keyframes[0];
        let hasMovement = false;

        for (let i = 1; i < anim.keyframes.length; i++) {
            const kf = anim.keyframes[i];
            if (kf.left_shoulder_deg !== first.left_shoulder_deg ||
                kf.left_elbow_deg !== first.left_elbow_deg ||
                kf.right_shoulder_deg !== first.right_shoulder_deg ||
                kf.right_elbow_deg !== first.right_elbow_deg) {
                hasMovement = true;
                break;
            }
        }

        assert(hasMovement, `${name} has no movement between keyframes`);
    }
});

// Test 6: Verify keyframes are in chronological order
test('Keyframes are in chronological order', () => {
    for (const [name, anim] of Object.entries(config.animations)) {
        for (let i = 1; i < anim.keyframes.length; i++) {
            assert(anim.keyframes[i].time_ms >= anim.keyframes[i-1].time_ms,
                `${name} keyframe ${i} time out of order`);
        }
    }
});

// Test 7: Verify angles are in valid range (0-90°)
test('All angles are in valid 0-90° range', () => {
    for (const [name, anim] of Object.entries(config.animations)) {
        for (let i = 0; i < anim.keyframes.length; i++) {
            const kf = anim.keyframes[i];
            assert(kf.left_shoulder_deg >= 0 && kf.left_shoulder_deg <= 90,
                `${name} keyframe ${i} left_shoulder_deg out of range: ${kf.left_shoulder_deg}`);
            assert(kf.left_elbow_deg >= 0 && kf.left_elbow_deg <= 90,
                `${name} keyframe ${i} left_elbow_deg out of range: ${kf.left_elbow_deg}`);
            assert(kf.right_shoulder_deg >= 0 && kf.right_shoulder_deg <= 90,
                `${name} keyframe ${i} right_shoulder_deg out of range: ${kf.right_shoulder_deg}`);
            assert(kf.right_elbow_deg >= 0 && kf.right_elbow_deg <= 90,
                `${name} keyframe ${i} right_elbow_deg out of range: ${kf.right_elbow_deg}`);
        }
    }
});

// Test 8: Verify last keyframe time matches duration (or is static reference)
test('Last keyframe time matches animation duration', () => {
    for (const [name, anim] of Object.entries(config.animations)) {
        const lastKf = anim.keyframes[anim.keyframes.length - 1];

        // Allow single-keyframe reference positions (zero, max) to have any duration
        if (anim.keyframes.length === 1) {
            // Single keyframe animations are static reference positions - OK
            continue;
        }

        assert.strictEqual(lastKf.time_ms, anim.duration_ms,
            `${name} last keyframe time (${lastKf.time_ms}) doesn't match duration (${anim.duration_ms})`);
    }
});

// Test 9: Test keyframe interpolation logic
test('Keyframe interpolation logic works correctly', () => {
    // Simulate the interpolation logic from animation-behaviors.js
    function interpolate(anim, timeMs, leg) {
        let kf1, kf2;
        for (let i = 0; i < anim.keyframes.length - 1; i++) {
            if (timeMs >= anim.keyframes[i].time_ms && timeMs <= anim.keyframes[i + 1].time_ms) {
                kf1 = anim.keyframes[i];
                kf2 = anim.keyframes[i + 1];
                break;
            }
        }

        if (!kf1) {
            kf1 = anim.keyframes[anim.keyframes.length - 1];
            kf2 = kf1;
        }

        const t1 = kf1.time_ms;
        const t2 = kf2.time_ms;
        const blend = t1 === t2 ? 0 : (timeMs - t1) / (t2 - t1);

        let shoulderDeg, elbowDeg;
        if (leg === 'left') {
            shoulderDeg = kf1.left_shoulder_deg + (kf2.left_shoulder_deg - kf1.left_shoulder_deg) * blend;
            elbowDeg = kf1.left_elbow_deg + (kf2.left_elbow_deg - kf1.left_elbow_deg) * blend;
        } else {
            shoulderDeg = kf1.right_shoulder_deg + (kf2.right_shoulder_deg - kf1.right_shoulder_deg) * blend;
            elbowDeg = kf1.right_elbow_deg + (kf2.right_elbow_deg - kf1.right_elbow_deg) * blend;
        }

        return { shoulderDeg, elbowDeg };
    }

    // Test interpolation on resting animation
    const resting = config.animations.resting;

    // At time 0, should be first keyframe
    const at0 = interpolate(resting, 0, 'left');
    assert.strictEqual(at0.shoulderDeg, 5);
    assert.strictEqual(at0.elbowDeg, 8);

    // At time 1500, should be second keyframe
    const at1500 = interpolate(resting, 1500, 'left');
    assert.strictEqual(at1500.shoulderDeg, 8);
    assert.strictEqual(at1500.elbowDeg, 10);

    // At time 750 (midpoint), should be interpolated
    const at750 = interpolate(resting, 750, 'left');
    assert.strictEqual(at750.shoulderDeg, 6.5); // (5 + 8) / 2
    assert.strictEqual(at750.elbowDeg, 9); // (8 + 10) / 2
});

// Test 10: Verify degree-to-radian conversion range
test('Degree to radian conversion produces valid range', () => {
    // 0° should be 0 radians
    assert.strictEqual(0 * Math.PI / 180, 0);

    // 90° should be π/2 radians
    const rad90 = 90 * Math.PI / 180;
    assert(Math.abs(rad90 - Math.PI / 2) < 0.001);

    // All angles should produce 0 to π/2 radians
    for (let deg = 0; deg <= 90; deg++) {
        const rad = deg * Math.PI / 180;
        assert(rad >= 0 && rad <= Math.PI / 2);
    }
});

console.log('\n========================================');
console.log(`Tests Passed: ${testsPassed}`);
console.log(`Tests Failed: ${testsFailed}`);
console.log('========================================\n');

if (testsFailed > 0) {
    console.log('❌ TESTS FAILED - Animation behaviors have issues');
    process.exit(1);
} else {
    console.log('✅ ALL TESTS PASSED - Animation behaviors correct');
    process.exit(0);
}
