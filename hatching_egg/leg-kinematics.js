// 2-Segment Leg Kinematics for Hatching Egg Spider
// Each leg has: shoulder servo (base rotation) and elbow servo (knee bend)
//
// COORDINATE SYSTEM:
// - 0° = straight up (legs point vertically upward)
// - 90° = perpendicular (shoulder horizontal, elbow perpendicular to upper leg)
// - Canvas: 0° = right, rotated -90° so 0° appears as "up" visually
//
// SERVO RANGES:
// - All servos: 0-90° (matches hardware calibration)
// - Shoulder: 0° (up) → 90° (horizontal from body)
// - Elbow: 0° (parallel to upper leg) → 90° (perpendicular to upper leg)
//
// MIRRORING:
// - Left leg: shoulder AND elbow angles are negated before rendering
// - This creates symmetric mirror behavior
// - Both legs bend downward at 90° elbow angle
//
// PWM MAPPING (verified with 31 tests in test_leg_kinematics.js):
// - Right Elbow (CH0):     0°→150 PWM, 90°→330 PWM (normal)
// - Right Shoulder (CH1):  0°→150 PWM, 90°→280 PWM (normal)
// - Left Shoulder (CH14):  0°→440 PWM, 90°→300 PWM (inverted)
// - Left Elbow (CH15):     0°→530 PWM, 90°→360 PWM (inverted)
//
// VERIFIED POSITIONS:
// - Zero (0°,0°): Both legs straight up - tips at (240,120) and (360,120)
// - Max (90°,90°): Perpendicular with elbows down - tips at (160,400) and (440,400)

class SpiderLeg2D {
    constructor(config) {
        // Mount position (where servo attaches to egg)
        this.mountX = config.mountX || 0;
        this.mountY = config.mountY || 0;

        // Segment lengths
        this.upperLength = config.upperLength || 80;  // Shoulder to elbow
        this.lowerLength = config.lowerLength || 100; // Elbow to tip

        // Current angles (in radians)
        this.shoulderAngle = config.shoulderAngle || 0;  // Rotation from mount
        this.elbowAngle = config.elbowAngle || Math.PI / 2; // Bend at elbow

        // Servo limits (in radians) - matches hardware 0-90° range
        this.shoulderMin = 0;
        this.shoulderMax = Math.PI / 2;  // 90°
        this.elbowMin = 0;
        this.elbowMax = Math.PI / 2;     // 90°

        // Visual properties
        this.side = config.side || 'left'; // 'left' or 'right'
    }

    // Forward Kinematics: Calculate positions from angles
    getJointPositions() {
        // Shoulder position (at mount point)
        const shoulder = {
            x: this.mountX,
            y: this.mountY
        };

        // Convert servo angles to canvas rendering angles
        // Canvas: 0=right, π/2=down, π=left, 3π/2=up
        // Servo: 0=up, π/2=perpendicular outward
        //
        // Right leg: 0° servo → up → -π/2 canvas
        //            π/2 servo → right → 0 canvas
        // Left leg:  0° servo → up → -π/2 canvas
        //            π/2 servo → left → π canvas (mirrored)
        let shoulderRender, elbowRender;
        if (this.side === 'left') {
            // Left leg: mirror by negating angles, then offset
            shoulderRender = -this.shoulderAngle - Math.PI / 2;
            // Negate elbow angle too for proper mirroring
            elbowRender = -this.elbowAngle;
        } else {
            // Right leg: standard offset
            shoulderRender = this.shoulderAngle - Math.PI / 2;
            elbowRender = this.elbowAngle;
        }

        // Elbow position
        const elbow = {
            x: this.mountX + Math.cos(shoulderRender) * this.upperLength,
            y: this.mountY + Math.sin(shoulderRender) * this.upperLength
        };

        // Tip position (end of leg)
        const tip = {
            x: elbow.x + Math.cos(shoulderRender + elbowRender) * this.lowerLength,
            y: elbow.y + Math.sin(shoulderRender + elbowRender) * this.lowerLength
        };

        return { shoulder, elbow, tip };
    }

    // Set angles with servo limits
    setAngles(shoulderAngle, elbowAngle) {
        this.shoulderAngle = Math.max(this.shoulderMin, Math.min(this.shoulderMax, shoulderAngle));
        this.elbowAngle = Math.max(this.elbowMin, Math.min(this.elbowMax, elbowAngle));
    }

    // Animate to target angles with easing
    animateTowards(targetShoulder, targetElbow, speed = 0.1) {
        const shoulderDiff = targetShoulder - this.shoulderAngle;
        const elbowDiff = targetElbow - this.elbowAngle;

        this.shoulderAngle += shoulderDiff * speed;
        this.elbowAngle += elbowDiff * speed;

        // Apply limits
        this.shoulderAngle = Math.max(this.shoulderMin, Math.min(this.shoulderMax, this.shoulderAngle));
        this.elbowAngle = Math.max(this.elbowMin, Math.min(this.elbowMax, this.elbowAngle));
    }

    // Convert angles to servo degrees (0-90° range matching hardware)
    getServoDegrees() {
        return {
            shoulder: Math.round((this.shoulderAngle - this.shoulderMin) / (this.shoulderMax - this.shoulderMin) * 90),
            elbow: Math.round((this.elbowAngle - this.elbowMin) / (this.elbowMax - this.elbowMin) * 90)
        };
    }
}

// Export for Node.js if running in Node environment
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SpiderLeg2D };
}
