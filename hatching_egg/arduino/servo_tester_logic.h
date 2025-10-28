/*
 * Servo Tester Logic - Pure Functions (No Hardware Dependencies)
 *
 * This header contains testable logic for the servo tester.
 * Can be included in both Arduino sketches and local test programs.
 */

#ifndef SERVO_TESTER_LOGIC_H
#define SERVO_TESTER_LOGIC_H

// Safe PWM range (verified with hardware)
#define SAFE_ZERO_PWM 150   // 0° - verified safe
#define SAFE_MAX_PWM 600    // 180° - verified safe

// Servo channels
#define CH_RIGHT_ELBOW 0
#define CH_RIGHT_SHOULDER 1
#define CH_LEFT_SHOULDER 14
#define CH_LEFT_ELBOW 15

/**
 * Constrain PWM value to safe range
 */
inline int constrainPWM(int pwm) {
    if (pwm < SAFE_ZERO_PWM) return SAFE_ZERO_PWM;
    if (pwm > SAFE_MAX_PWM) return SAFE_MAX_PWM;
    return pwm;
}

/**
 * Adjust servo position by delta (returns new PWM value)
 */
inline int adjustPosition(int currentPWM, int delta) {
    int newPWM = currentPWM + delta;
    return constrainPWM(newPWM);
}

/**
 * Get hardware channel for servo index (0-3)
 * Returns -1 if invalid servo index
 */
inline int getChannel(int servoIndex) {
    switch(servoIndex) {
        case 0: return CH_RIGHT_ELBOW;
        case 1: return CH_RIGHT_SHOULDER;
        case 2: return CH_LEFT_SHOULDER;
        case 3: return CH_LEFT_ELBOW;
        default: return -1;
    }
}

/**
 * Check if servo index is valid (0-3)
 */
inline bool isValidServoIndex(int index) {
    return index >= 0 && index <= 3;
}

/**
 * Parse command character and return delta for PWM adjustment
 * Returns 0 if command doesn't adjust PWM
 */
inline int parsePWMCommand(char cmd) {
    switch(cmd) {
        case '+': case '=': return 10;   // Increase by 10
        case '-': case '_': return -10;  // Decrease by 10
        case '.': case '>': return 1;    // Increase by 1
        case ',': case '<': return -1;   // Decrease by 1
        default: return 0;
    }
}

/**
 * Parse servo selection command (0-3)
 * Returns -1 if not a valid servo selection command
 */
inline int parseServoSelection(char cmd) {
    if (cmd >= '0' && cmd <= '3') {
        return cmd - '0';
    }
    return -1;
}

/**
 * Check if command is a special command (z, p, etc.)
 * Returns the command character if special, 0 otherwise
 */
inline char parseSpecialCommand(char cmd) {
    switch(cmd) {
        case 'z': case 'Z':  // Reset to zero
        case 'p': case 'P':  // Print positions
        case 'h': case 'H':  // Help
        case '?':            // Help
            return cmd;
        default:
            return 0;
    }
}

#endif // SERVO_TESTER_LOGIC_H
