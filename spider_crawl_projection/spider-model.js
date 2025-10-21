// Spider Body Kinematic Model
// Defines spider anatomy: body shape, leg attachment points, proportions

class SpiderBody {
    constructor(size = 10) {
        this.size = size;

        // Body segments (in spider body coordinates, forward = +X)
        // FIXED: Match reference image proportions
        // Reference: Cephalothorax ~60%, Abdomen ~100%, Total ~160%
        this.cephalothorax = {
            length: size * 0.6,  // Smaller, as in reference
            width: size * 0.6,   // Roughly round
            center: size * 0.3   // Forward from body origin
        };

        this.abdomen = {
            length: size * 1.0,  // Large round abdomen
            width: size * 1.0,   // Round
            center: -size * 0.5  // Behind body origin
        };

        // Leg attachment points along cephalothorax
        // Format: { x: forward/back, y: left/right }
        // All legs attach to cephalothorax (not abdomen)
        this.legAttachments = this.calculateLegAttachments();

        // Leg dimensions
        // FIXED: Match reference leg length (~150 for size 100)
        // Top-down view: legs spread outward with natural curve
        this.legUpperLength = size * 0.75;  // Reasonable leg length
        this.legLowerLength = size * 0.75;  // Reasonable leg length
    }

    calculateLegAttachments() {
        // 4 pairs of legs distributed along cephalothorax length
        // Pairs go from front to back
        const cephStart = this.cephalothorax.center + this.cephalothorax.length / 2;
        const cephEnd = this.cephalothorax.center - this.cephalothorax.length / 2;
        const cephWidth = this.cephalothorax.width;

        const attachments = [];

        for (let pair = 0; pair < 4; pair++) {
            // Distribute evenly along cephalothorax
            // FIXED: Use 80% of length to keep attachments away from ellipse ends
            const t = pair / 3; // 0, 0.33, 0.67, 1.0
            const usableLength = this.cephalothorax.length * 0.8;
            const offset = this.cephalothorax.length * 0.1; // Start 10% in from edge
            const x = cephStart - offset - t * usableLength;

            // Left and right attachment points
            // Legs point outward from sides
            // FIXED: Use 60% of width to ensure attachments are well inside ellipse
            attachments.push({
                pair: pair,
                side: 1,  // Right
                x: x,
                y: cephWidth / 2 * 0.6,  // 60% of radius for safety
                baseAngle: this.getLegBaseAngle(pair, 1)
            });

            attachments.push({
                pair: pair,
                side: -1, // Left
                x: x,
                y: -cephWidth / 2 * 0.6,  // 60% of radius for safety
                baseAngle: this.getLegBaseAngle(pair, -1)
            });
        }

        return attachments;
    }

    // Calculate natural resting angle for each leg
    // FIXED: Corrected angles so legs don't cross and point in correct directions
    getLegBaseAngle(pairIndex, side) {
        // Coordinate system: 0° = right (+X), 90° = down (+Y), 180° = left, 270° = up
        // Right side (side > 0): legs should point downward (+Y), angles 0-180°
        // Left side (side < 0): legs should point upward (-Y), angles 180-360° (or negative)

        let baseAngle;

        if (pairIndex === 0) {
            // Front legs: point forward at 45° angle
            baseAngle = Math.PI / 4;  // 45°
        } else if (pairIndex === 1) {
            // Second pair: point more to the side
            baseAngle = Math.PI * 5 / 12;  // 75°
        } else if (pairIndex === 2) {
            // Third pair: point backward-ish to the side
            baseAngle = Math.PI * 7 / 12;  // 105°
        } else {
            // Back legs: point backward at 45° angle
            baseAngle = Math.PI * 3 / 4;  // 135°
        }

        // Mirror for left side (negative Y)
        // Left side angles are negative (symmetric across X axis)
        return side > 0 ? baseAngle : -baseAngle;
    }

    // Get attachment point for specific leg index (0-7)
    getAttachment(legIndex) {
        return this.legAttachments[legIndex];
    }
}

// Export for browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SpiderBody };
}
