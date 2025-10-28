/*
 * Unit Tests for Servo Tester Logic
 *
 * Uses Google Test framework.
 * Build and run:
 *   pixi run test-servo-tester
 */

#include <gtest/gtest.h>
#include "arduino/servo_tester_logic.h"

// Tests for constrainPWM
TEST(ConstrainPWM, ValueInRange) {
    EXPECT_EQ(300, constrainPWM(300));
}

TEST(ConstrainPWM, BelowMinimum) {
    EXPECT_EQ(150, constrainPWM(100));
}

TEST(ConstrainPWM, AboveMaximum) {
    EXPECT_EQ(600, constrainPWM(700));
}

TEST(ConstrainPWM, AtMinimum) {
    EXPECT_EQ(150, constrainPWM(150));
}

TEST(ConstrainPWM, AtMaximum) {
    EXPECT_EQ(600, constrainPWM(600));
}

// Tests for adjustPosition
TEST(AdjustPosition, IncreaseNormal) {
    EXPECT_EQ(210, adjustPosition(200, 10));
}

TEST(AdjustPosition, DecreaseNormal) {
    EXPECT_EQ(190, adjustPosition(200, -10));
}

TEST(AdjustPosition, ConstrainHigh) {
    EXPECT_EQ(600, adjustPosition(590, 20));
}

TEST(AdjustPosition, ConstrainLow) {
    EXPECT_EQ(150, adjustPosition(160, -20));
}

// Tests for getChannel
TEST(GetChannel, Servo0_RightElbow) {
    EXPECT_EQ(0, getChannel(0));
}

TEST(GetChannel, Servo1_RightShoulder) {
    EXPECT_EQ(1, getChannel(1));
}

TEST(GetChannel, Servo2_LeftShoulder) {
    EXPECT_EQ(14, getChannel(2));
}

TEST(GetChannel, Servo3_LeftElbow) {
    EXPECT_EQ(15, getChannel(3));
}

TEST(GetChannel, InvalidServo) {
    EXPECT_EQ(-1, getChannel(4));
}

// Tests for isValidServoIndex
TEST(ValidServoIndex, Zero) {
    EXPECT_TRUE(isValidServoIndex(0));
}

TEST(ValidServoIndex, Three) {
    EXPECT_TRUE(isValidServoIndex(3));
}

TEST(ValidServoIndex, Negative) {
    EXPECT_FALSE(isValidServoIndex(-1));
}

TEST(ValidServoIndex, TooHigh) {
    EXPECT_FALSE(isValidServoIndex(4));
}

// Tests for parsePWMCommand
TEST(ParsePWMCommand, Plus) {
    EXPECT_EQ(10, parsePWMCommand('+'));
}

TEST(ParsePWMCommand, Minus) {
    EXPECT_EQ(-10, parsePWMCommand('-'));
}

TEST(ParsePWMCommand, Dot) {
    EXPECT_EQ(1, parsePWMCommand('.'));
}

TEST(ParsePWMCommand, Comma) {
    EXPECT_EQ(-1, parsePWMCommand(','));
}

TEST(ParsePWMCommand, Equals) {
    EXPECT_EQ(10, parsePWMCommand('='));
}

TEST(ParsePWMCommand, Invalid) {
    EXPECT_EQ(0, parsePWMCommand('x'));
}

// Tests for parseServoSelection
TEST(ParseServoSelection, Zero) {
    EXPECT_EQ(0, parseServoSelection('0'));
}

TEST(ParseServoSelection, Three) {
    EXPECT_EQ(3, parseServoSelection('3'));
}

TEST(ParseServoSelection, Invalid) {
    EXPECT_EQ(-1, parseServoSelection('a'));
}

// Tests for parseSpecialCommand
TEST(ParseSpecialCommand, LowercaseZ) {
    EXPECT_EQ('z', parseSpecialCommand('z'));
}

TEST(ParseSpecialCommand, UppercaseZ) {
    EXPECT_EQ('Z', parseSpecialCommand('Z'));
}

TEST(ParseSpecialCommand, LowercaseP) {
    EXPECT_EQ('p', parseSpecialCommand('p'));
}

TEST(ParseSpecialCommand, LowercaseH) {
    EXPECT_EQ('h', parseSpecialCommand('h'));
}

TEST(ParseSpecialCommand, QuestionMark) {
    EXPECT_EQ('?', parseSpecialCommand('?'));
}

TEST(ParseSpecialCommand, NotSpecial) {
    EXPECT_EQ(0, parseSpecialCommand('a'));
}

// Integration tests
TEST(IntegrationTest, FullWorkflow) {
    // Start at safe zero
    int pos = SAFE_ZERO_PWM;
    EXPECT_EQ(150, pos);

    // Increase by 10
    pos = adjustPosition(pos, parsePWMCommand('+'));
    EXPECT_EQ(160, pos);

    // Increase by 1
    pos = adjustPosition(pos, parsePWMCommand('.'));
    EXPECT_EQ(161, pos);

    // Decrease by 10
    pos = adjustPosition(pos, parsePWMCommand('-'));
    EXPECT_EQ(151, pos);

    // Try to go below minimum
    pos = adjustPosition(pos, parsePWMCommand('-'));
    EXPECT_EQ(150, pos);  // Constrained
}

int main(int argc, char **argv) {
    testing::InitGoogleTest(&argc, argv);
    return RUN_ALL_TESTS();
}
