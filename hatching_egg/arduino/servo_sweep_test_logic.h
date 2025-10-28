/*
 * Servo Sweep Test Logic - Pure Functions (No Hardware Dependencies)
 *
 * This header contains testable logic for the servo sweep test.
 * Can be included in both Arduino sketches and local test programs.
 */

#ifndef SERVO_SWEEP_TEST_LOGIC_H
#define SERVO_SWEEP_TEST_LOGIC_H

// Include servo mapping for per-servo ranges
#ifdef ARDUINO
#include "../servo_mapping.h"
#else
// For local testing, include with correct path
#include "servo_mapping.h"
#endif

// Sweep parameters
#define SWEEP_STEP_DEGREES 5     // Move in 5° increments
#define SWEEP_DELAY_MS 100       // Pause 100ms between steps

/**
 * Sweep state for a single servo
 */
struct ServoSweepState {
    int currentAngle;    // Current angle (0-90°)
    bool goingUp;        // true = 0→90, false = 90→0
    bool enabled;        // true = active in sweep
};

/**
 * Initialize sweep state for a servo
 */
inline ServoSweepState initSweepState(bool enabled = true) {
    ServoSweepState state;
    state.currentAngle = 0;
    state.goingUp = true;
    state.enabled = enabled;
    return state;
}

/**
 * Update sweep state - returns true if angle changed
 */
inline bool updateSweepState(ServoSweepState* state) {
    if (!state->enabled) {
        return false;
    }

    if (state->goingUp) {
        state->currentAngle += SWEEP_STEP_DEGREES;
        if (state->currentAngle >= 90) {
            state->currentAngle = 90;
            state->goingUp = false;
        }
        return true;
    } else {
        state->currentAngle -= SWEEP_STEP_DEGREES;
        if (state->currentAngle <= 0) {
            state->currentAngle = 0;
            state->goingUp = true;
        }
        return true;
    }
}

/**
 * Check if sweep is at starting position (all servos at 0°, going up)
 */
inline bool isSweepAtStart(const ServoSweepState* states, int count) {
    for (int i = 0; i < count; i++) {
        if (states[i].enabled) {
            if (states[i].currentAngle != 0 || !states[i].goingUp) {
                return false;
            }
        }
    }
    return true;
}

/**
 * Check if all servos have completed one full sweep cycle
 * (returned to 0° after reaching 90°)
 */
inline bool isSweepCycleComplete(const ServoSweepState* states, int count) {
    for (int i = 0; i < count; i++) {
        if (states[i].enabled) {
            // Must be at 0° and going up (which means it cycled back)
            // But we need to track if it actually went up once
            // Use the fact that after one cycle, it's back at 0 going up
            // This is detected by caller tracking state
            if (states[i].currentAngle != 0) {
                return false;
            }
        }
    }
    return true;
}

/**
 * Reset all sweep states to starting position
 */
inline void resetSweepStates(ServoSweepState* states, int count) {
    for (int i = 0; i < count; i++) {
        states[i].currentAngle = 0;
        states[i].goingUp = true;
    }
}

/**
 * Get expected PWM for servo at given angle using calibrated ranges
 */
inline int getSweepPWM(int servoIndex, int degrees) {
    return degreesToPWM(degrees, servoIndex);
}

/**
 * Validate that all sweep angles produce safe PWM values
 */
inline bool validateSweepRanges() {
    // Test all 4 servos at 0°, 45°, 90°
    for (int servo = 0; servo < 4; servo++) {
        if (!isPWMSafe(degreesToPWM(0, servo), servo)) return false;
        if (!isPWMSafe(degreesToPWM(45, servo), servo)) return false;
        if (!isPWMSafe(degreesToPWM(90, servo), servo)) return false;
    }
    return true;
}

#endif // SERVO_SWEEP_TEST_LOGIC_H
