// Unit tests for keyframe animation system
const { Leg2D } = require('./leg-kinematics.js');
const { SpiderBody } = require('./spider-model.js');
const fs = require('fs');

console.log("\n╔════════════════════════════════════════════╗");
console.log("║   KEYFRAME ANIMATION TEST SUITE           ║");
console.log("╚════════════════════════════════════════════╝\n");

// Load keyframe animation data
let animationData;
try {
    animationData = JSON.parse(fs.readFileSync('./keyframe-animation.json', 'utf8'));
} catch (err) {
    console.error("❌ ERROR: Could not load keyframe-animation.json");
    console.error(err.message);
    process.exit(1);
}

// Interpolation function (must match animation code)
function interpolatePose(keyframe1, keyframe2, t) {
    const result = [];
    for (let i = 0; i < 8; i++) {
        result.push({
            x: keyframe1.legs[i].x + (keyframe2.legs[i].x - keyframe1.legs[i].x) * t,
            y: keyframe1.legs[i].y + (keyframe2.legs[i].y - keyframe1.legs[i].y) * t
        });
    }
    return result;
}

// Find keyframes surrounding a time
function getKeyframesAtTime(time) {
    const keyframes = animationData.keyframes;

    if (keyframes.length === 0) return null;
    if (keyframes.length === 1) return { before: keyframes[0], after: keyframes[0], t: 0 };

    let beforeKf = keyframes[0];
    let afterKf = keyframes[keyframes.length - 1];

    for (let i = 0; i < keyframes.length - 1; i++) {
        if (keyframes[i].time <= time && keyframes[i + 1].time >= time) {
            beforeKf = keyframes[i];
            afterKf = keyframes[i + 1];
            break;
        }
    }

    const duration = afterKf.time - beforeKf.time;
    const elapsed = time - beforeKf.time;
    const t = duration > 0 ? elapsed / duration : 0;

    return { before: beforeKf, after: afterKf, t };
}

// Line segment intersection (from test-leg-intersections.js)
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

function testPoseForIntersections(legPositions, spiderX, spiderY, bodySize, elbowBiasPattern) {
    const body = new SpiderBody(bodySize);
    const legs = [];

    // Create legs
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

        leg.setFootPosition(legPositions[i].x, legPositions[i].y);
        legs.push(leg);
    }

    // Test all pairs for intersections
    const intersections = [];
    for (let i = 0; i < legs.length; i++) {
        for (let j = i + 1; j < legs.length; j++) {
            const pos1 = legs[i].forwardKinematics();
            const pos2 = legs[j].forwardKinematics();

            const leg1Attach = { x: spiderX + legs[i].attachX, y: spiderY + legs[i].attachY };
            const leg1Knee = { x: spiderX + pos1.knee.x, y: spiderY + pos1.knee.y };
            const leg1Foot = { x: spiderX + pos1.foot.x, y: spiderY + pos1.foot.y };

            const leg2Attach = { x: spiderX + legs[j].attachX, y: spiderY + legs[j].attachY };
            const leg2Knee = { x: spiderX + pos2.knee.x, y: spiderY + pos2.knee.y };
            const leg2Foot = { x: spiderX + pos2.foot.x, y: spiderY + pos2.foot.y };

            if (segmentsIntersect(leg1Attach, leg1Knee, leg2Attach, leg2Knee)) {
                const distAttach = Math.sqrt(
                    Math.pow(leg1Attach.x - leg2Attach.x, 2) +
                    Math.pow(leg1Attach.y - leg2Attach.y, 2)
                );
                if (distAttach > 1) intersections.push({ leg1: i, leg2: j });
            }
            if (segmentsIntersect(leg1Attach, leg1Knee, leg2Knee, leg2Foot)) {
                intersections.push({ leg1: i, leg2: j });
            }
            if (segmentsIntersect(leg1Knee, leg1Foot, leg2Attach, leg2Knee)) {
                intersections.push({ leg1: i, leg2: j });
            }
            if (segmentsIntersect(leg1Knee, leg1Foot, leg2Knee, leg2Foot)) {
                intersections.push({ leg1: i, leg2: j });
            }
        }
    }

    return intersections;
}

// Test 1: Keyframe Exact Matching
function testKeyframeMatching() {
    console.log("=== TEST 1: KEYFRAME EXACT MATCHING ===\n");

    let allPassed = true;

    animationData.keyframes.forEach((keyframe, index) => {
        console.log(`Keyframe ${index}: "${keyframe.name}" at ${keyframe.time}ms`);

        // Get pose at exact keyframe time
        const { before, after, t } = getKeyframesAtTime(keyframe.time);

        // At exact keyframe time, t should be 0 or 1
        const isExact = (before.time === keyframe.time && t === 0) ||
                       (after.time === keyframe.time && t === 1);

        if (isExact) {
            console.log(`  ✓ Exact match: t=${t.toFixed(3)}`);
        } else {
            console.log(`  ✗ Not exact: t=${t.toFixed(3)} (before=${before.time}, after=${after.time})`);
            allPassed = false;
        }

        // Check leg positions match
        const interpolated = interpolatePose(before, after, t);
        const expectedPose = t === 0 ? before.legs : after.legs;

        let maxError = 0;
        for (let i = 0; i < 8; i++) {
            const errorX = Math.abs(interpolated[i].x - expectedPose[i].x);
            const errorY = Math.abs(interpolated[i].y - expectedPose[i].y);
            const error = Math.sqrt(errorX * errorX + errorY * errorY);
            maxError = Math.max(maxError, error);
        }

        if (maxError < 0.01) {
            console.log(`  ✓ Pose matches: max error = ${maxError.toFixed(6)}`);
        } else {
            console.log(`  ✗ Pose mismatch: max error = ${maxError.toFixed(6)}`);
            allPassed = false;
        }

        console.log();
    });

    console.log(allPassed ? "✓✓✓ ALL KEYFRAME MATCHES PASSED ✓✓✓\n" : "✗✗✗ SOME KEYFRAME MATCHES FAILED ✗✗✗\n");
    return allPassed;
}

// Test 2: Interpolation Correctness
function testInterpolation() {
    console.log("=== TEST 2: INTERPOLATION CORRECTNESS ===\n");

    if (animationData.keyframes.length < 2) {
        console.log("⚠️  Need at least 2 keyframes to test interpolation\n");
        return true;
    }

    let allPassed = true;

    // Test interpolation between first two keyframes
    const kf1 = animationData.keyframes[0];
    const kf2 = animationData.keyframes[1];
    const duration = kf2.time - kf1.time;

    console.log(`Testing interpolation between "${kf1.name}" and "${kf2.name}"`);
    console.log(`Duration: ${duration}ms\n`);

    // Test at 0%, 25%, 50%, 75%, 100%
    const testPoints = [0, 0.25, 0.5, 0.75, 1.0];

    testPoints.forEach(t => {
        const time = kf1.time + duration * t;
        const { before, after, t: actualT } = getKeyframesAtTime(time);
        const interpolated = interpolatePose(before, after, actualT);

        console.log(`At t=${t.toFixed(2)} (${time.toFixed(0)}ms):`);

        // Check t value is correct
        const expectedT = t;
        const tError = Math.abs(actualT - expectedT);

        if (tError < 0.01) {
            console.log(`  ✓ Interpolation factor correct: t=${actualT.toFixed(3)}`);
        } else {
            console.log(`  ✗ Interpolation factor wrong: t=${actualT.toFixed(3)}, expected ${expectedT.toFixed(3)}`);
            allPassed = false;
        }

        // Check positions are linearly interpolated
        let maxError = 0;
        for (let i = 0; i < 8; i++) {
            const expectedX = kf1.legs[i].x + (kf2.legs[i].x - kf1.legs[i].x) * t;
            const expectedY = kf1.legs[i].y + (kf2.legs[i].y - kf1.legs[i].y) * t;

            const errorX = Math.abs(interpolated[i].x - expectedX);
            const errorY = Math.abs(interpolated[i].y - expectedY);
            const error = Math.sqrt(errorX * errorX + errorY * errorY);

            maxError = Math.max(maxError, error);
        }

        if (maxError < 0.01) {
            console.log(`  ✓ Positions correct: max error = ${maxError.toFixed(6)}`);
        } else {
            console.log(`  ✗ Positions wrong: max error = ${maxError.toFixed(6)}`);
            allPassed = false;
        }

        console.log();
    });

    console.log(allPassed ? "✓✓✓ ALL INTERPOLATION TESTS PASSED ✓✓✓\n" : "✗✗✗ SOME INTERPOLATION TESTS FAILED ✗✗✗\n");
    return allPassed;
}

// Test 3: No Intersections Throughout Animation
function testNoIntersectionsThroughout() {
    console.log("=== TEST 3: NO INTERSECTIONS THROUGHOUT ANIMATION ===\n");

    const spiderX = 400;
    const spiderY = 400;
    const bodySize = animationData.bodySize;
    const elbowBiasPattern = animationData.elbowBiasPattern;

    let allPassed = true;
    let totalIntersections = 0;

    // Sample animation at 50ms intervals
    const maxTime = Math.max(...animationData.keyframes.map(kf => kf.time));
    const sampleInterval = 50;

    console.log(`Sampling animation from 0ms to ${maxTime}ms at ${sampleInterval}ms intervals\n`);

    for (let time = 0; time <= maxTime; time += sampleInterval) {
        const { before, after, t } = getKeyframesAtTime(time);
        const pose = interpolatePose(before, after, t);

        const intersections = testPoseForIntersections(pose, spiderX, spiderY, bodySize, elbowBiasPattern);

        if (intersections.length > 0) {
            console.log(`✗ INTERSECTIONS at ${time}ms (t=${t.toFixed(2)} between "${before.name}" and "${after.name}"):`);
            intersections.forEach(({ leg1, leg2 }) => {
                console.log(`    Leg ${leg1} ↔ Leg ${leg2}`);
            });
            totalIntersections += intersections.length;
            allPassed = false;
        }
    }

    if (allPassed) {
        console.log("✓ No intersections detected at any sampled time point!");
    }

    console.log();
    console.log(allPassed ? "✓✓✓ ZERO INTERSECTIONS THROUGHOUT ANIMATION ✓✓✓\n" : `✗✗✗ FOUND ${totalIntersections} TOTAL INTERSECTIONS ✗✗✗\n`);
    return allPassed;
}

// Run all tests
const test1 = testKeyframeMatching();
const test2 = testInterpolation();
const test3 = testNoIntersectionsThroughout();

console.log("╔════════════════════════════════════════════╗");
console.log("║              TEST SUMMARY                  ║");
if (test1 && test2 && test3) {
    console.log("║                                            ║");
    console.log("║       ✓✓✓ ALL TESTS PASSED! ✓✓✓          ║");
} else {
    console.log("║                                            ║");
    console.log("║       ✗✗✗ SOME TESTS FAILED ✗✗✗         ║");
}
console.log("╚════════════════════════════════════════════╝\n");

process.exit((test1 && test2 && test3) ? 0 : 1);
