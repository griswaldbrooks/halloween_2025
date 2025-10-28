/*
 * Servo Sweep Test - Visual Verification Tool
 *
 * Continuously sweeps all 4 servos through their full calibrated range.
 * Each servo moves: 0° → 90° → 0° in 5° steps with 100ms pauses.
 *
 * Purpose:
 * - Verify all servos move smoothly without collisions
 * - Check inverted servos (left leg) work correctly
 * - Validate hardware-calibrated PWM ranges
 * - Real-time serial output shows angles and PWM values
 *
 * Hardware-Calibrated Ranges (2025-10-28):
 * - Right Elbow (CH0):    150 (0°) → 330 (90°)
 * - Right Shoulder (CH1): 150 (0°) → 280 (90°)
 * - Left Shoulder (CH14): 440 (0°) → 300 (90°) [inverted]
 * - Left Elbow (CH15):    530 (0°) → 360 (90°) [inverted]
 *
 * Unit tested with 181 tests in test_servo_sweep.cpp
 */

#include <Wire.h>
#include <Adafruit_PWMServoDriver.h>
#include "servo_mapping.h"
#include "servo_sweep_test_logic.h"

#define PCA9685_ADDRESS 0x40
#define SERVO_FREQ 50
#define LED_PIN 13
#define SERVO_COUNT 4

Adafruit_PWMServoDriver pwm = Adafruit_PWMServoDriver(PCA9685_ADDRESS);

// Sweep state for all 4 servos
ServoSweepState sweepStates[SERVO_COUNT];

// Tracking
unsigned long lastStepTime = 0;
int cycleCount = 0;
bool cycleStarted = false;

void setup() {
  Serial.begin(9600);
  delay(500);  // Reliable serial startup

  pinMode(LED_PIN, OUTPUT);

  // LED startup indicator
  for (int i = 0; i < 3; i++) {
    digitalWrite(LED_PIN, HIGH);
    delay(100);
    digitalWrite(LED_PIN, LOW);
    delay(100);
  }

  Serial.println(F("\n=== SERVO SWEEP TEST ==="));
  Serial.println(F("Calibrated Ranges:"));
  Serial.println(F("  Right Elbow (CH0):    PWM 150-330 (0-90°)"));
  Serial.println(F("  Right Shoulder (CH1): PWM 150-280 (0-90°)"));
  Serial.println(F("  Left Shoulder (CH14): PWM 440-300 (0-90°) [inv]"));
  Serial.println(F("  Left Elbow (CH15):    PWM 530-360 (0-90°) [inv]"));
  Serial.println();

  // Validate ranges before starting
  if (!validateSweepRanges()) {
    Serial.println(F("ERROR: Unsafe PWM ranges detected!"));
    Serial.println(F("DO NOT PROCEED - check calibration"));
    while(1) {
      digitalWrite(LED_PIN, HIGH);
      delay(100);
      digitalWrite(LED_PIN, LOW);
      delay(100);
    }
  }

  Serial.println(F("✓ All ranges validated safe"));
  Serial.println();

  // Initialize PWM driver
  pwm.begin();
  pwm.setPWMFreq(SERVO_FREQ);
  delay(100);

  // Initialize sweep states (all enabled)
  for (int i = 0; i < SERVO_COUNT; i++) {
    sweepStates[i] = initSweepState(true);
  }

  // Move all to starting position (0°)
  Serial.println(F("Moving to start position (0°)..."));
  updateServoPositions();
  delay(1000);

  Serial.println(F("Starting sweep test..."));
  Serial.println(F("Sweep: 0° → 90° → 0° (5° steps, 100ms)"));
  Serial.println();

  digitalWrite(LED_PIN, HIGH);  // LED on during sweep
}

void loop() {
  unsigned long currentTime = millis();

  // Step every SWEEP_DELAY_MS milliseconds
  if (currentTime - lastStepTime >= SWEEP_DELAY_MS) {
    lastStepTime = currentTime;

    // Track if we just started a cycle
    if (!cycleStarted && isSweepAtStart(sweepStates, SERVO_COUNT)) {
      cycleStarted = true;
    }

    // Update all servo states
    bool anyChanged = false;
    for (int i = 0; i < SERVO_COUNT; i++) {
      if (updateSweepState(&sweepStates[i])) {
        anyChanged = true;
      }
    }

    // Update servo positions
    if (anyChanged) {
      updateServoPositions();
      printCurrentState();
    }

    // Check if cycle completed
    if (cycleStarted && isSweepCycleComplete(sweepStates, SERVO_COUNT)) {
      // Check if all servos are going up (means they cycled back)
      bool allGoingUp = true;
      for (int i = 0; i < SERVO_COUNT; i++) {
        if (!sweepStates[i].goingUp) {
          allGoingUp = false;
          break;
        }
      }

      if (allGoingUp) {
        cycleCount++;
        Serial.println();
        Serial.print(F("✓ Sweep cycle #"));
        Serial.print(cycleCount);
        Serial.println(F(" complete"));
        Serial.println();
        cycleStarted = false;  // Ready for next cycle
      }
    }
  }
}

void updateServoPositions() {
  // Right Elbow (CH0)
  int pwm0 = getSweepPWM(SERVO_RIGHT_ELBOW, sweepStates[SERVO_RIGHT_ELBOW].currentAngle);
  pwm.setPWM(CH_RIGHT_ELBOW, 0, pwm0);

  // Right Shoulder (CH1)
  int pwm1 = getSweepPWM(SERVO_RIGHT_SHOULDER, sweepStates[SERVO_RIGHT_SHOULDER].currentAngle);
  pwm.setPWM(CH_RIGHT_SHOULDER, 0, pwm1);

  // Left Shoulder (CH14)
  int pwm14 = getSweepPWM(SERVO_LEFT_SHOULDER, sweepStates[SERVO_LEFT_SHOULDER].currentAngle);
  pwm.setPWM(CH_LEFT_SHOULDER, 0, pwm14);

  // Left Elbow (CH15)
  int pwm15 = getSweepPWM(SERVO_LEFT_ELBOW, sweepStates[SERVO_LEFT_ELBOW].currentAngle);
  pwm.setPWM(CH_LEFT_ELBOW, 0, pwm15);
}

void printCurrentState() {
  Serial.print(F("R.Elbow: "));
  Serial.print(sweepStates[SERVO_RIGHT_ELBOW].currentAngle);
  Serial.print(F("° (PWM "));
  Serial.print(getSweepPWM(SERVO_RIGHT_ELBOW, sweepStates[SERVO_RIGHT_ELBOW].currentAngle));
  Serial.print(F(")  "));

  Serial.print(F("R.Shoulder: "));
  Serial.print(sweepStates[SERVO_RIGHT_SHOULDER].currentAngle);
  Serial.print(F("° (PWM "));
  Serial.print(getSweepPWM(SERVO_RIGHT_SHOULDER, sweepStates[SERVO_RIGHT_SHOULDER].currentAngle));
  Serial.print(F(")  "));

  Serial.print(F("L.Shoulder: "));
  Serial.print(sweepStates[SERVO_LEFT_SHOULDER].currentAngle);
  Serial.print(F("° (PWM "));
  Serial.print(getSweepPWM(SERVO_LEFT_SHOULDER, sweepStates[SERVO_LEFT_SHOULDER].currentAngle));
  Serial.print(F(")  "));

  Serial.print(F("L.Elbow: "));
  Serial.print(sweepStates[SERVO_LEFT_ELBOW].currentAngle);
  Serial.print(F("° (PWM "));
  Serial.print(getSweepPWM(SERVO_LEFT_ELBOW, sweepStates[SERVO_LEFT_ELBOW].currentAngle));
  Serial.println(F(")"));
}
