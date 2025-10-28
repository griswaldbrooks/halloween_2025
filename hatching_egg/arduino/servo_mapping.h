/*
 * Servo Mapping Logic - Per-Servo Calibrated Ranges
 *
 * This header contains testable logic for servo angle-to-PWM mapping.
 * Each servo has its own calibrated PWM range.
 *
 * Calibrated Ranges (hardware tested):
 * - Right Elbow (CH0):    150 (0°) to 330 (90°)  - normal
 * - Right Shoulder (CH1): 150 (0°) to 280 (90°)  - normal
 * - Left Shoulder (CH14): 440 (0°) to 300 (90°)  - inverted
 * - Left Elbow (CH15):    530 (0°) to 360 (90°)  - inverted
 */

#ifndef SERVO_MAPPING_V2_H
#define SERVO_MAPPING_V2_H

// Servo indices
#define SERVO_RIGHT_ELBOW 0
#define SERVO_RIGHT_SHOULDER 1
#define SERVO_LEFT_SHOULDER 2
#define SERVO_LEFT_ELBOW 3

// Channel assignments
#define CH_RIGHT_ELBOW 0
#define CH_RIGHT_SHOULDER 1
#define CH_LEFT_SHOULDER 14
#define CH_LEFT_ELBOW 15

// Per-servo PWM ranges (calibrated with hardware)
struct ServoPWMRange {
    int min_pwm;  // PWM value for 0°
    int max_pwm;  // PWM value for 90°
};

// Calibrated ranges for each servo
inline ServoPWMRange getServoPWMRange(int servoIndex) {
    switch (servoIndex) {
        case SERVO_RIGHT_ELBOW:    return {150, 330};  // Normal: 0°=150, 90°=330
        case SERVO_RIGHT_SHOULDER: return {150, 280};  // Normal: 0°=150, 90°=280
        case SERVO_LEFT_SHOULDER:  return {440, 300};  // Inverted: 0°=440, 90°=300
        case SERVO_LEFT_ELBOW:     return {530, 360};  // Inverted: 0°=530, 90°=360
        default:                   return {150, 330};  // Fallback
    }
}

// Get channel number for servo index
inline int getServoChannel(int servoIndex) {
    switch (servoIndex) {
        case SERVO_RIGHT_ELBOW:    return CH_RIGHT_ELBOW;
        case SERVO_RIGHT_SHOULDER: return CH_RIGHT_SHOULDER;
        case SERVO_LEFT_SHOULDER:  return CH_LEFT_SHOULDER;
        case SERVO_LEFT_ELBOW:     return CH_LEFT_ELBOW;
        default:                   return -1;
    }
}

// Constrain value to range [min, max]
inline int constrainValue(int value, int minVal, int maxVal) {
    if (value < minVal) return minVal;
    if (value > maxVal) return maxVal;
    return value;
}

// Map value from one range to another (like Arduino map())
inline int mapValue(int value, int fromMin, int fromMax, int toMin, int toMax) {
    return (value - fromMin) * (toMax - toMin) / (fromMax - fromMin) + toMin;
}

/**
 * Convert angle (0-90°) to PWM value for specific servo
 *
 * @param degrees Angle in degrees (0-90)
 * @param servoIndex Which servo (SERVO_RIGHT_ELBOW, etc.)
 * @return PWM value constrained to servo's safe range
 */
inline int degreesToPWM(int degrees, int servoIndex) {
    // Constrain angle to safe range
    degrees = constrainValue(degrees, 0, 90);

    // Get calibrated range for this servo
    ServoPWMRange range = getServoPWMRange(servoIndex);

    // Map angle to PWM (handles both normal and inverted ranges)
    int pwm = mapValue(degrees, 0, 90, range.min_pwm, range.max_pwm);

    // Constrain to safe range (handles inverted ranges correctly)
    int pwmMin = (range.min_pwm < range.max_pwm) ? range.min_pwm : range.max_pwm;
    int pwmMax = (range.min_pwm > range.max_pwm) ? range.min_pwm : range.max_pwm;

    return constrainValue(pwm, pwmMin, pwmMax);
}

/**
 * Check if PWM value is safe for a specific servo
 */
inline bool isPWMSafe(int pwm, int servoIndex) {
    ServoPWMRange range = getServoPWMRange(servoIndex);
    int pwmMin = (range.min_pwm < range.max_pwm) ? range.min_pwm : range.max_pwm;
    int pwmMax = (range.min_pwm > range.max_pwm) ? range.min_pwm : range.max_pwm;
    return (pwm >= pwmMin && pwm <= pwmMax);
}

/**
 * Check if angle is valid (0-90°)
 */
inline bool isAngleValid(int degrees) {
    return (degrees >= 0 && degrees <= 90);
}

#endif // SERVO_MAPPING_V2_H
