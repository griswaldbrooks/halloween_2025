/*
 * Unit Tests for Servo Sweep Test Logic
 *
 * Tests the sweep logic functions before uploading to hardware.
 * Uses Google Test framework.
 *
 * Build and run:
 *   pixi run test-servo-sweep
 */

#include <gtest/gtest.h>
#include "arduino/servo_sweep_test_logic.h"

// Sweep State Initialization Tests
TEST(SweepState, InitEnabled) {
    ServoSweepState state = initSweepState(true);
    EXPECT_EQ(0, state.currentAngle);
    EXPECT_TRUE(state.goingUp);
    EXPECT_TRUE(state.enabled);
}

TEST(SweepState, InitDisabled) {
    ServoSweepState state = initSweepState(false);
    EXPECT_FALSE(updateSweepState(&state));
    EXPECT_EQ(0, state.currentAngle);
}

// Sweep Up Sequence Tests
TEST(SweepSequence, UpSequence) {
    ServoSweepState state = initSweepState(true);

    // Should go 0 -> 5 -> 10 -> ... -> 90
    for (int expected = SWEEP_STEP_DEGREES; expected <= 90; expected += SWEEP_STEP_DEGREES) {
        updateSweepState(&state);
        EXPECT_EQ(expected, state.currentAngle);
        EXPECT_TRUE(state.goingUp || expected == 90);
    }

    // At 90, should switch direction
    EXPECT_EQ(90, state.currentAngle);
    EXPECT_FALSE(state.goingUp);
}

// Sweep Down Sequence Tests
TEST(SweepSequence, DownSequence) {
    ServoSweepState state = initSweepState(true);

    // Move to 90
    while (state.currentAngle < 90) {
        updateSweepState(&state);
    }

    // Now sweep down: 90 -> 85 -> 80 -> ... -> 0
    for (int expected = 90 - SWEEP_STEP_DEGREES; expected >= 0; expected -= SWEEP_STEP_DEGREES) {
        updateSweepState(&state);
        EXPECT_EQ(expected, state.currentAngle);
        EXPECT_TRUE(!state.goingUp || expected == 0);
    }

    // At 0, should switch direction
    EXPECT_EQ(0, state.currentAngle);
    EXPECT_TRUE(state.goingUp);
}

// Full Sweep Cycle Test
TEST(SweepSequence, FullCycle) {
    ServoSweepState state = initSweepState(true);

    int steps = 0;
    int maxSteps = 100;  // Safety limit

    // Complete one full cycle: 0 -> 90 -> 0
    do {
        updateSweepState(&state);
        steps++;
        ASSERT_LT(steps, maxSteps) << "Full cycle should complete in reasonable steps";
    } while (!(state.currentAngle == 0 && state.goingUp && steps > 1));

    EXPECT_LT(steps, maxSteps);
    EXPECT_EQ(0, state.currentAngle);
    EXPECT_TRUE(state.goingUp);
}

// Sweep At Start Test
TEST(SweepControl, AllAtStart) {
    ServoSweepState states[4];
    for (int i = 0; i < 4; i++) {
        states[i] = initSweepState(true);
    }

    EXPECT_TRUE(isSweepAtStart(states, 4));

    // Move one servo
    updateSweepState(&states[0]);
    EXPECT_FALSE(isSweepAtStart(states, 4));
}

// Sweep Cycle Complete Test
TEST(SweepControl, CycleComplete) {
    ServoSweepState states[4];
    for (int i = 0; i < 4; i++) {
        states[i] = initSweepState(true);
    }

    EXPECT_TRUE(isSweepCycleComplete(states, 4));

    // Move servos away from 0
    for (int i = 0; i < 4; i++) {
        updateSweepState(&states[i]);
    }
    EXPECT_FALSE(isSweepCycleComplete(states, 4));
}

// Reset Sweep States Test
TEST(SweepControl, ResetStates) {
    ServoSweepState states[4];
    for (int i = 0; i < 4; i++) {
        states[i] = initSweepState(true);
        // Move to some position
        for (int j = 0; j < 5; j++) {
            updateSweepState(&states[i]);
        }
    }

    resetSweepStates(states, 4);

    for (int i = 0; i < 4; i++) {
        EXPECT_EQ(0, states[i].currentAngle);
        EXPECT_TRUE(states[i].goingUp);
    }
}

// PWM Value Tests for Right Elbow
TEST(PWMValues, RightElbow_0deg) {
    EXPECT_EQ(150, getSweepPWM(SERVO_RIGHT_ELBOW, 0));
}

TEST(PWMValues, RightElbow_90deg) {
    EXPECT_EQ(330, getSweepPWM(SERVO_RIGHT_ELBOW, 90));
}

// PWM Value Tests for Right Shoulder
TEST(PWMValues, RightShoulder_0deg) {
    EXPECT_EQ(150, getSweepPWM(SERVO_RIGHT_SHOULDER, 0));
}

TEST(PWMValues, RightShoulder_90deg) {
    EXPECT_EQ(280, getSweepPWM(SERVO_RIGHT_SHOULDER, 90));
}

// PWM Value Tests for Left Shoulder (Inverted)
TEST(PWMValues, LeftShoulder_0deg) {
    EXPECT_EQ(440, getSweepPWM(SERVO_LEFT_SHOULDER, 0));
}

TEST(PWMValues, LeftShoulder_90deg) {
    EXPECT_EQ(300, getSweepPWM(SERVO_LEFT_SHOULDER, 90));
}

// PWM Value Tests for Left Elbow (Inverted)
TEST(PWMValues, LeftElbow_0deg) {
    EXPECT_EQ(530, getSweepPWM(SERVO_LEFT_ELBOW, 0));
}

TEST(PWMValues, LeftElbow_90deg) {
    EXPECT_EQ(360, getSweepPWM(SERVO_LEFT_ELBOW, 90));
}

// Validate Sweep Ranges Test
TEST(SweepValidation, AllRangesSafe) {
    EXPECT_TRUE(validateSweepRanges());
}

// Test every angle in sweep produces safe PWM
class SweepSafetyTest : public ::testing::TestWithParam<std::tuple<int, int>> {
};

TEST_P(SweepSafetyTest, ProducesSafePWM) {
    int servo = std::get<0>(GetParam());
    int angle = std::get<1>(GetParam());
    int pwm = getSweepPWM(servo, angle);
    EXPECT_TRUE(isPWMSafe(pwm, servo))
        << "Servo " << servo << " at angle " << angle
        << " produced unsafe PWM " << pwm;
}

// Generate all combinations of servos and angles for testing
INSTANTIATE_TEST_SUITE_P(
    AllServosAndAngles,
    SweepSafetyTest,
    ::testing::Combine(
        ::testing::Values(0, 1, 2, 3),  // All 4 servos
        ::testing::Values(0, 5, 10, 15, 20, 25, 30, 35, 40, 45,
                         50, 55, 60, 65, 70, 75, 80, 85, 90)  // All sweep angles
    )
);

int main(int argc, char **argv) {
    testing::InitGoogleTest(&argc, argv);
    return RUN_ALL_TESTS();
}
