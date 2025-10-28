/*
 * Servo Mapping Logic - Pure Functions (No Arduino Dependencies)
 *
 * This header can be included in both Arduino sketches and local test programs.
 */

#ifndef SERVO_MAPPING_H
#define SERVO_MAPPING_H

// Safe PWM range (user-verified with hardware)
#define SERVO_MIN_PWM 150   // 0° position
#define SERVO_MAX_PWM 600   // 180° position

// Servo channel assignments
#define RIGHT_ELBOW_CHANNEL 0
#define RIGHT_SHOULDER_CHANNEL 1
#define LEFT_SHOULDER_CHANNEL 14
#define LEFT_ELBOW_CHANNEL 15

/**
 * Constrain a value between min and max
 */
inline int constrainValue(int value, int min_val, int max_val) {
    if (value < min_val) return min_val;
    if (value > max_val) return max_val;
    return value;
}

/**
 * Map value from one range to another (Arduino map function)
 */
inline int mapValue(int value, int fromLow, int fromHigh, int toLow, int toHigh) {
    long range = (long)(value - fromLow) * (toHigh - toLow);
    return (int)(range / (fromHigh - fromLow) + toLow);
}

/**
 * Convert degrees (0-180) to PWM value (150-600)
 * This is the core function that ALL servo code must use.
 */
inline int degreesToPWM(int degrees) {
    // Constrain to safe range
    degrees = constrainValue(degrees, 0, 180);

    // Map to PWM range
    return mapValue(degrees, 0, 180, SERVO_MIN_PWM, SERVO_MAX_PWM);
}

/**
 * Validate that a PWM value is in the safe range
 */
inline bool isPWMSafe(int pwmValue) {
    return pwmValue >= SERVO_MIN_PWM && pwmValue <= SERVO_MAX_PWM;
}

/**
 * Validate that a degree value is in valid range
 */
inline bool isDegreeValid(int degrees) {
    return degrees >= 0 && degrees <= 180;
}

#endif // SERVO_MAPPING_H
