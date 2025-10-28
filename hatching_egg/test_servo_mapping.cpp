/*
 * Unit Tests for Servo Mapping - Per-Servo Calibrated Ranges
 *
 * Tests the new servo_mapping.h with individual PWM ranges per servo.
 * Uses Google Test framework.
 *
 * Build and run:
 *   pixi run test-cpp
 */

#include <gtest/gtest.h>
#include "arduino/servo_mapping.h"

// Right Elbow Tests
TEST(ServoMapping, RightElbow_ZeroDegrees) {
    EXPECT_EQ(150, degreesToPWM(0, SERVO_RIGHT_ELBOW));
}

TEST(ServoMapping, RightElbow_MaxDegrees) {
    EXPECT_EQ(330, degreesToPWM(90, SERVO_RIGHT_ELBOW));
}

TEST(ServoMapping, RightElbow_MidDegrees) {
    EXPECT_EQ(240, degreesToPWM(45, SERVO_RIGHT_ELBOW));
}

// Right Shoulder Tests
TEST(ServoMapping, RightShoulder_ZeroDegrees) {
    EXPECT_EQ(150, degreesToPWM(0, SERVO_RIGHT_SHOULDER));
}

TEST(ServoMapping, RightShoulder_MaxDegrees) {
    EXPECT_EQ(280, degreesToPWM(90, SERVO_RIGHT_SHOULDER));
}

TEST(ServoMapping, RightShoulder_MidDegrees) {
    EXPECT_EQ(215, degreesToPWM(45, SERVO_RIGHT_SHOULDER));
}

// Left Shoulder Tests (Inverted)
TEST(ServoMapping, LeftShoulder_ZeroDegrees) {
    EXPECT_EQ(440, degreesToPWM(0, SERVO_LEFT_SHOULDER));
}

TEST(ServoMapping, LeftShoulder_MaxDegrees) {
    EXPECT_EQ(300, degreesToPWM(90, SERVO_LEFT_SHOULDER));
}

TEST(ServoMapping, LeftShoulder_MidDegrees) {
    EXPECT_EQ(370, degreesToPWM(45, SERVO_LEFT_SHOULDER));
}

// Left Elbow Tests (Inverted)
TEST(ServoMapping, LeftElbow_ZeroDegrees) {
    EXPECT_EQ(530, degreesToPWM(0, SERVO_LEFT_ELBOW));
}

TEST(ServoMapping, LeftElbow_MaxDegrees) {
    EXPECT_EQ(360, degreesToPWM(90, SERVO_LEFT_ELBOW));
}

TEST(ServoMapping, LeftElbow_MidDegrees) {
    EXPECT_EQ(445, degreesToPWM(45, SERVO_LEFT_ELBOW));
}

// Angle Constraint Tests
TEST(ServoMapping, ConstrainNegativeAngle_RightElbow) {
    EXPECT_EQ(150, degreesToPWM(-10, SERVO_RIGHT_ELBOW));
}

TEST(ServoMapping, ConstrainNegativeAngle_LeftShoulder) {
    EXPECT_EQ(440, degreesToPWM(-10, SERVO_LEFT_SHOULDER));
}

TEST(ServoMapping, ConstrainExcessiveAngle_RightElbow) {
    EXPECT_EQ(330, degreesToPWM(100, SERVO_RIGHT_ELBOW));
}

TEST(ServoMapping, ConstrainExcessiveAngle_LeftShoulder) {
    EXPECT_EQ(300, degreesToPWM(100, SERVO_LEFT_SHOULDER));
}

// PWM Safety Tests
TEST(PWMSafety, RightElbow_MinPWM) {
    EXPECT_TRUE(isPWMSafe(150, SERVO_RIGHT_ELBOW));
}

TEST(PWMSafety, RightElbow_MaxPWM) {
    EXPECT_TRUE(isPWMSafe(330, SERVO_RIGHT_ELBOW));
}

TEST(PWMSafety, RightElbow_MidPWM) {
    EXPECT_TRUE(isPWMSafe(240, SERVO_RIGHT_ELBOW));
}

TEST(PWMSafety, RightElbow_BelowMin) {
    EXPECT_FALSE(isPWMSafe(100, SERVO_RIGHT_ELBOW));
}

TEST(PWMSafety, RightElbow_AboveMax) {
    EXPECT_FALSE(isPWMSafe(400, SERVO_RIGHT_ELBOW));
}

TEST(PWMSafety, LeftShoulder_MinPWM) {
    EXPECT_TRUE(isPWMSafe(440, SERVO_LEFT_SHOULDER));
}

TEST(PWMSafety, LeftShoulder_MaxPWM) {
    EXPECT_TRUE(isPWMSafe(300, SERVO_LEFT_SHOULDER));
}

TEST(PWMSafety, LeftShoulder_MidPWM) {
    EXPECT_TRUE(isPWMSafe(370, SERVO_LEFT_SHOULDER));
}

TEST(PWMSafety, LeftShoulder_BelowRange) {
    EXPECT_FALSE(isPWMSafe(200, SERVO_LEFT_SHOULDER));
}

TEST(PWMSafety, LeftShoulder_AboveRange) {
    EXPECT_FALSE(isPWMSafe(500, SERVO_LEFT_SHOULDER));
}

// Channel Assignment Tests
TEST(ChannelAssignment, RightElbow) {
    EXPECT_EQ(CH_RIGHT_ELBOW, getServoChannel(SERVO_RIGHT_ELBOW));
}

TEST(ChannelAssignment, RightShoulder) {
    EXPECT_EQ(CH_RIGHT_SHOULDER, getServoChannel(SERVO_RIGHT_SHOULDER));
}

TEST(ChannelAssignment, LeftShoulder) {
    EXPECT_EQ(CH_LEFT_SHOULDER, getServoChannel(SERVO_LEFT_SHOULDER));
}

TEST(ChannelAssignment, LeftElbow) {
    EXPECT_EQ(CH_LEFT_ELBOW, getServoChannel(SERVO_LEFT_ELBOW));
}

// Angle Validation Tests
TEST(AngleValidation, ZeroDegreesValid) {
    EXPECT_TRUE(isAngleValid(0));
}

TEST(AngleValidation, MidRangeValid) {
    EXPECT_TRUE(isAngleValid(45));
}

TEST(AngleValidation, MaxDegreesValid) {
    EXPECT_TRUE(isAngleValid(90));
}

TEST(AngleValidation, NegativeInvalid) {
    EXPECT_FALSE(isAngleValid(-10));
}

TEST(AngleValidation, ExcessiveInvalid) {
    EXPECT_FALSE(isAngleValid(100));
}

// Animation Keyframe Tests
TEST(AnimationKeyframes, RestingPosition_AllServosAtZero) {
    EXPECT_TRUE(isPWMSafe(degreesToPWM(0, SERVO_RIGHT_ELBOW), SERVO_RIGHT_ELBOW));
    EXPECT_TRUE(isPWMSafe(degreesToPWM(0, SERVO_RIGHT_SHOULDER), SERVO_RIGHT_SHOULDER));
    EXPECT_TRUE(isPWMSafe(degreesToPWM(0, SERVO_LEFT_SHOULDER), SERVO_LEFT_SHOULDER));
    EXPECT_TRUE(isPWMSafe(degreesToPWM(0, SERVO_LEFT_ELBOW), SERVO_LEFT_ELBOW));
}

TEST(AnimationKeyframes, SlowStruggle_LeftShoulder35) {
    EXPECT_TRUE(isPWMSafe(degreesToPWM(35, SERVO_LEFT_SHOULDER), SERVO_LEFT_SHOULDER));
}

TEST(AnimationKeyframes, SlowStruggle_LeftElbow30) {
    EXPECT_TRUE(isPWMSafe(degreesToPWM(30, SERVO_LEFT_ELBOW), SERVO_LEFT_ELBOW));
}

TEST(AnimationKeyframes, SlowStruggle_RightShoulder65) {
    EXPECT_TRUE(isPWMSafe(degreesToPWM(65, SERVO_RIGHT_SHOULDER), SERVO_RIGHT_SHOULDER));
}

TEST(AnimationKeyframes, SlowStruggle_RightElbow30) {
    EXPECT_TRUE(isPWMSafe(degreesToPWM(30, SERVO_RIGHT_ELBOW), SERVO_RIGHT_ELBOW));
}

TEST(AnimationKeyframes, BreakingThrough_RightShoulder80) {
    EXPECT_TRUE(isPWMSafe(degreesToPWM(80, SERVO_RIGHT_SHOULDER), SERVO_RIGHT_SHOULDER));
}

TEST(AnimationKeyframes, BreakingThrough_RightElbow55) {
    EXPECT_TRUE(isPWMSafe(degreesToPWM(55, SERVO_RIGHT_ELBOW), SERVO_RIGHT_ELBOW));
}

TEST(AnimationKeyframes, Grasping_LeftElbow60) {
    EXPECT_TRUE(isPWMSafe(degreesToPWM(60, SERVO_LEFT_ELBOW), SERVO_LEFT_ELBOW));
}

TEST(AnimationKeyframes, Grasping_RightElbow60) {
    EXPECT_TRUE(isPWMSafe(degreesToPWM(60, SERVO_RIGHT_ELBOW), SERVO_RIGHT_ELBOW));
}

int main(int argc, char **argv) {
    testing::InitGoogleTest(&argc, argv);
    return RUN_ALL_TESTS();
}
