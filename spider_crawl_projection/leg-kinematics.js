// Leg Kinematics Module
// Handles forward and inverse kinematics for 2-segment spider legs

class Leg2D {
    constructor(config) {
        // Leg attachment point (relative to body center)
        this.attachX = config.attachX || 0;
        this.attachY = config.attachY || 0;

        // Leg segment lengths
        this.upperLength = config.upperLength || 10; // Coxa-femur
        this.lowerLength = config.lowerLength || 10; // Femur-tibia

        // Current joint angles (radians)
        this.coxaAngle = 0;  // Angle of upper segment from horizontal
        this.femurAngle = 0; // Angle of lower segment from upper segment

        // Leg properties
        this.side = config.side || 1; // 1 = right, -1 = left
        this.baseAngle = config.baseAngle || 0; // Direction leg points (0 = forward)
        this.elbowBias = config.elbowBias || 1; // 1 = bend one way, -1 = bend other way
    }

    // Forward Kinematics: Given joint angles, calculate foot position
    forwardKinematics() {
        // Upper segment endpoint (knee)
        const kneeX = this.attachX + Math.cos(this.coxaAngle) * this.upperLength;
        const kneeY = this.attachY + Math.sin(this.coxaAngle) * this.upperLength;

        // Lower segment endpoint (foot)
        const footAngle = this.coxaAngle + this.femurAngle;
        const footX = kneeX + Math.cos(footAngle) * this.lowerLength;
        const footY = kneeY + Math.sin(footAngle) * this.lowerLength;

        return {
            knee: { x: kneeX, y: kneeY },
            foot: { x: footX, y: footY }
        };
    }

    // Inverse Kinematics: Given desired foot position, calculate joint angles
    // Returns true if solution found, false if target unreachable
    inverseKinematics(targetX, targetY) {
        // Vector from attachment to target
        const dx = targetX - this.attachX;
        const dy = targetY - this.attachY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Check if target is reachable
        const maxReach = this.upperLength + this.lowerLength;
        const minReach = Math.abs(this.upperLength - this.lowerLength);

        if (distance > maxReach || distance < minReach) {
            // Target unreachable - extend as far as possible toward target
            const targetAngle = Math.atan2(dy, dx);
            this.coxaAngle = targetAngle;
            this.femurAngle = 0; // Fully extended
            return false;
        }

        // Use law of cosines to find angles
        // Angle at knee joint
        const cosKneeAngle = (this.upperLength * this.upperLength +
                             this.lowerLength * this.lowerLength -
                             distance * distance) /
                            (2 * this.upperLength * this.lowerLength);

        // Clamp to valid range
        const clampedCos = Math.max(-1, Math.min(1, cosKneeAngle));
        const kneeAngle = Math.acos(clampedCos);

        // Femur angle is supplement of knee angle
        this.femurAngle = Math.PI - kneeAngle;

        // Angle from attachment to target
        const targetAngle = Math.atan2(dy, dx);

        // Angle for upper segment using law of cosines
        const cosUpperAngle = (this.upperLength * this.upperLength +
                              distance * distance -
                              this.lowerLength * this.lowerLength) /
                             (2 * this.upperLength * distance);

        const clampedUpperCos = Math.max(-1, Math.min(1, cosUpperAngle));
        const upperAngleOffset = Math.acos(clampedUpperCos);

        // Coxa angle combines target direction and offset
        // FIXED: Use elbowBias to determine which IK solution (elbow up vs down)
        // elbowBias = 1: subtract offset (elbow bends one way)
        // elbowBias = -1: add offset (elbow bends opposite way)
        this.coxaAngle = targetAngle - (upperAngleOffset * this.elbowBias);

        return true;
    }

    // Set foot position using IK
    setFootPosition(x, y) {
        return this.inverseKinematics(x, y);
    }

    // Get current foot position using FK
    getFootPosition() {
        return this.forwardKinematics().foot;
    }

    // Get current knee position using FK
    getKneePosition() {
        return this.forwardKinematics().knee;
    }
}

// Export for use in browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Leg2D };
}
