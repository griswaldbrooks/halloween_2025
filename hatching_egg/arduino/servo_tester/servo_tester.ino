/*
 * Hatching Egg Servo Tester - Interactive Calibration Tool
 *
 * Manual control tool for finding safe servo PWM limits.
 * Allows precise adjustment of each servo to determine collision-free ranges.
 *
 * Usage:
 * - Select servo with 0-3
 * - Adjust PWM with +/- (10 steps) or ./. (1 step)
 * - Press 'z' to return all servos to safe zero
 *
 * Core logic is unit tested in test_servo_tester.cpp (37 tests)
 */

#include <Wire.h>
#include <Adafruit_PWMServoDriver.h>
#include "servo_tester_logic.h"  // TESTED logic functions

#define PCA9685_ADDRESS 0x40
#define SERVO_FREQ 50
#define LED_PIN 13

Adafruit_PWMServoDriver pwm = Adafruit_PWMServoDriver(PCA9685_ADDRESS);

// Current positions (PWM values)
int positions[4] = {SAFE_ZERO_PWM, SAFE_ZERO_PWM, SAFE_ZERO_PWM, SAFE_ZERO_PWM};
int selectedServo = 0;

void setup() {
  Serial.begin(9600);
  delay(500);
  
  pinMode(LED_PIN, OUTPUT);
  for (int i = 0; i < 3; i++) {
    digitalWrite(LED_PIN, HIGH);
    delay(100);
    digitalWrite(LED_PIN, LOW);
    delay(100);
  }
  
  Serial.println(F("\n=== HATCHING EGG - SAFE CALIBRATION ==="));
  Serial.println(F("PWM Range: 150 (0°) to 600 (180°)"));
  Serial.println();
  
  pwm.begin();
  pwm.setPWMFreq(SERVO_FREQ);
  delay(100);
  
  // Set all to safe zero (PWM 150)
  Serial.println(F("Setting all servos to SAFE ZERO (PWM 150)..."));
  for (int i = 0; i < 4; i++) {
    setServoPWM(i, 150);
  }
  
  digitalWrite(LED_PIN, HIGH);
  delay(1000);
  
  printHelp();
  printStatus();
}

void loop() {
  if (Serial.available() > 0) {
    char cmd = Serial.read();
    while (Serial.available()) Serial.read();
    
    Serial.println();
    processCommand(cmd);
    Serial.println();
    Serial.print(F("Cmd: "));
  }
}

void processCommand(char cmd) {
  // Use TESTED logic functions

  // Check for servo selection (0-3)
  int servoIndex = parseServoSelection(cmd);
  if (servoIndex >= 0) {
    selectedServo = servoIndex;
    Serial.print(F("Selected: Servo "));
    Serial.print(servoIndex);
    Serial.print(F(" (CH"));
    Serial.print(getChannel(servoIndex));
    Serial.println(F(")"));
    printStatus();
    return;
  }

  // Check for PWM adjustment commands (+, -, ., ,)
  int delta = parsePWMCommand(cmd);
  if (delta != 0) {
    adjustServo(delta);
    return;
  }

  // Check for special commands (z, p, h)
  char special = parseSpecialCommand(cmd);
  if (special != 0) {
    switch (special) {
      case 'z': case 'Z':
        Serial.println(F("Returning ALL to safe zero (PWM 150)..."));
        for (int i = 0; i < 4; i++) {
          positions[i] = SAFE_ZERO_PWM;
          setServoPWM(i, SAFE_ZERO_PWM);
        }
        printStatus();
        break;
      case 'p': case 'P':
        printStatus();
        break;
      case 'h': case 'H': case '?':
        printHelp();
        break;
    }
    return;
  }

  // Unknown command
  Serial.print(F("Unknown: "));
  Serial.println(cmd);
}

void adjustServo(int delta) {
  // Use TESTED adjustPosition function
  int currentPWM = positions[selectedServo];
  int newPWM = adjustPosition(currentPWM, delta);

  Serial.print(F("Servo "));
  Serial.print(selectedServo);
  Serial.print(F(": PWM "));
  Serial.print(currentPWM);
  Serial.print(F(" -> "));
  Serial.println(newPWM);

  positions[selectedServo] = newPWM;
  setServoPWM(selectedServo, newPWM);
}

void setServoPWM(int servo, int pwmValue) {
  // Use TESTED getChannel function
  int channel = getChannel(servo);
  if (channel >= 0) {
    pwm.setPWM(channel, 0, pwmValue);
  }
}

void printStatus() {
  Serial.println(F("\n--- Positions (PWM) ---"));
  Serial.print(F("  [0] Right Elbow    : "));
  Serial.println(positions[0]);
  Serial.print(F("  [1] Right Shoulder : "));
  Serial.println(positions[1]);
  Serial.print(F("  [2] Left Shoulder  : "));
  Serial.println(positions[2]);
  Serial.print(F("  [3] Left Elbow     : "));
  Serial.println(positions[3]);
  Serial.print(F("\n-> Selected: ["));
  Serial.print(selectedServo);
  Serial.println(F("]"));
}

void printHelp() {
  Serial.println(F("Commands:"));
  Serial.println(F("  0-3  Select servo"));
  Serial.println(F("  +    Increase PWM by 10"));
  Serial.println(F("  -    Decrease PWM by 10"));
  Serial.println(F("  .    Increase PWM by 1"));
  Serial.println(F("  ,    Decrease PWM by 1"));
  Serial.println(F("  z    Return ALL to safe zero (150)"));
  Serial.println(F("  p    Show positions"));
  Serial.println(F("  h    Help"));
  Serial.println(F("\nSAFE RANGE: PWM 150-600"));
  Serial.println();
}
