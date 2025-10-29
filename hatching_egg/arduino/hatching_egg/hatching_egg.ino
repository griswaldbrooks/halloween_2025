/*
 * Hatching Egg Spider - Main Animation Controller
 *
 * Hardware:
 * - DFRobot Beetle (Leonardo) on Pin 9 trigger
 * - PCA9685 PWM Servo Driver (I2C)
 * - 4x Servos with calibrated ranges:
 *   - Right Elbow (CH0): PWM 150-330 (0-90°)
 *   - Right Shoulder (CH1): PWM 150-280 (0-90°)
 *   - Left Shoulder (CH14): PWM 440-300 (0-90°, inverted)
 *   - Left Elbow (CH15): PWM 530-360 (0-90°, inverted)
 *
 * Configuration auto-generated from animation-config.json
 * To update: pixi run generate-config
 *
 * Calibrated: 2025-10-28
 */

#include <Wire.h>
#include <Adafruit_PWMServoDriver.h>
#include "animation_config.h"

// Servo driver
Adafruit_PWMServoDriver pwm = Adafruit_PWMServoDriver(I2C_ADDRESS);

// Animation state
int currentAnimation = DEFAULT_ANIMATION;
unsigned long animationStartTime = 0;
bool animationActive = false;
bool lastTriggerState = HIGH;

// Servo position cache
int lastLeftShoulder = -1;
int lastLeftElbow = -1;
int lastRightShoulder = -1;
int lastRightElbow = -1;

void setup() {
  Serial.begin(115200);
  while (!Serial && millis() < 3000);  // Wait up to 3s for serial

  Serial.println(F("Hatching Egg Spider"));
  Serial.println(F("==================="));

  // Initialize trigger pin
  pinMode(TRIGGER_PIN, INPUT_PULLUP);

  // Initialize PWM driver
  pwm.begin();
  pwm.setPWMFreq(SERVO_FREQ);
  delay(10);

  Serial.print(F("Animations: "));
  Serial.println(ANIMATION_COUNT);

  // Move to resting position
  moveToResting();

  Serial.println(F("Ready! Waiting for trigger..."));
  Serial.println();
  printHelp();
}

void loop() {
  // Check for serial commands
  if (Serial.available()) {
    handleSerialCommand();
  }

  // Check trigger
  bool triggerState = digitalRead(TRIGGER_PIN);

  if (triggerState == LOW && lastTriggerState == HIGH) {
    // Trigger pressed
    Serial.println(F("TRIGGERED!"));
    startAnimation(currentAnimation);
  }

  lastTriggerState = triggerState;

  // Update animation
  if (animationActive) {
    updateAnimation();
  }
}

void startAnimation(int animIndex) {
  if (animIndex >= ANIMATION_COUNT) {
    animIndex = 0;
  }

  currentAnimation = animIndex;
  animationStartTime = millis();
  animationActive = true;

  // Read animation name from PROGMEM
  char name[64];  // Increased from 32 to 64 bytes
  strcpy_P(name, (char*)pgm_read_ptr(&(ANIMATIONS[animIndex].name)));

  Serial.print(F("Starting: "));
  Serial.println(name);
}

void updateAnimation() {
  // Read animation from PROGMEM
  unsigned long duration = pgm_read_dword(&(ANIMATIONS[currentAnimation].duration_ms));
  bool loop = pgm_read_byte(&(ANIMATIONS[currentAnimation].loop));

  unsigned long elapsed = millis() - animationStartTime;

  // Check if animation finished
  if (elapsed >= duration) {
    if (loop) {
      // Restart animation
      animationStartTime = millis();
      elapsed = 0;
    } else {
      // Animation complete
      animationActive = false;
      moveToResting();
      Serial.println(F("Animation complete"));
      return;
    }
  }

  // Interpolate between keyframes
  int kfCount = pgm_read_word(&(ANIMATIONS[currentAnimation].keyframe_count));
  const Keyframe* keyframes = (const Keyframe*)pgm_read_ptr(&(ANIMATIONS[currentAnimation].keyframes));

  // Find surrounding keyframes
  int kf1 = 0;
  int kf2 = 1;

  for (int i = 0; i < kfCount - 1; i++) {
    unsigned long t1 = pgm_read_dword(&(keyframes[i].time_ms));
    unsigned long t2 = pgm_read_dword(&(keyframes[i + 1].time_ms));

    if (elapsed >= t1 && elapsed < t2) {
      kf1 = i;
      kf2 = i + 1;
      break;
    }
  }

  // Read keyframe data
  unsigned long t1 = pgm_read_dword(&(keyframes[kf1].time_ms));
  unsigned long t2 = pgm_read_dword(&(keyframes[kf2].time_ms));

  int ls1 = pgm_read_word(&(keyframes[kf1].left_shoulder_deg));
  int le1 = pgm_read_word(&(keyframes[kf1].left_elbow_deg));
  int rs1 = pgm_read_word(&(keyframes[kf1].right_shoulder_deg));
  int re1 = pgm_read_word(&(keyframes[kf1].right_elbow_deg));

  int ls2 = pgm_read_word(&(keyframes[kf2].left_shoulder_deg));
  int le2 = pgm_read_word(&(keyframes[kf2].left_elbow_deg));
  int rs2 = pgm_read_word(&(keyframes[kf2].right_shoulder_deg));
  int re2 = pgm_read_word(&(keyframes[kf2].right_elbow_deg));

  // Interpolate
  float t = (float)(elapsed - t1) / (float)(t2 - t1);
  t = constrain(t, 0.0, 1.0);

  int leftShoulder = ls1 + (int)((ls2 - ls1) * t);
  int leftElbow = le1 + (int)((le2 - le1) * t);
  int rightShoulder = rs1 + (int)((rs2 - rs1) * t);
  int rightElbow = re1 + (int)((re2 - re1) * t);

  // Move servos
  moveLegs(leftShoulder, leftElbow, rightShoulder, rightElbow);
}

void moveLegs(int leftShoulder, int leftElbow, int rightShoulder, int rightElbow) {
  // Only move servos if position changed (reduce jitter)
  if (leftShoulder != lastLeftShoulder) {
    setServo(LEFT_SHOULDER_CHANNEL, leftShoulder, LEFT_SHOULDER_MIN_PULSE, LEFT_SHOULDER_MAX_PULSE);
    lastLeftShoulder = leftShoulder;
  }

  if (leftElbow != lastLeftElbow) {
    setServo(LEFT_ELBOW_CHANNEL, leftElbow, LEFT_ELBOW_MIN_PULSE, LEFT_ELBOW_MAX_PULSE);
    lastLeftElbow = leftElbow;
  }

  if (rightShoulder != lastRightShoulder) {
    setServo(RIGHT_SHOULDER_CHANNEL, rightShoulder, RIGHT_SHOULDER_MIN_PULSE, RIGHT_SHOULDER_MAX_PULSE);
    lastRightShoulder = rightShoulder;
  }

  if (rightElbow != lastRightElbow) {
    setServo(RIGHT_ELBOW_CHANNEL, rightElbow, RIGHT_ELBOW_MIN_PULSE, RIGHT_ELBOW_MAX_PULSE);
    lastRightElbow = rightElbow;
  }
}

void setServo(int channel, int degrees, int minPulse, int maxPulse) {
  // Convert degrees (0-90°) to pulse width
  // Calibrated ranges support 0-90° movement
  degrees = constrain(degrees, 0, 90);
  int pulse = map(degrees, 0, 90, minPulse, maxPulse);
  pwm.setPWM(channel, 0, pulse);
}

void moveToResting() {
  // Move to first keyframe of first animation (resting position)
  const Keyframe* keyframes = (const Keyframe*)pgm_read_ptr(&(ANIMATIONS[0].keyframes));

  int ls = pgm_read_word(&(keyframes[0].left_shoulder_deg));
  int le = pgm_read_word(&(keyframes[0].left_elbow_deg));
  int rs = pgm_read_word(&(keyframes[0].right_shoulder_deg));
  int re = pgm_read_word(&(keyframes[0].right_elbow_deg));

  moveLegs(ls, le, rs, re);
}

void handleSerialCommand() {
  char cmd = Serial.read();

  // Clear any remaining characters
  while (Serial.available()) {
    Serial.read();
  }

  switch (cmd) {
    case '0':
    case '1':
    case '2':
    case '3':
    case '4':
    case '5':
    case '6':
      {
        int animIndex = cmd - '0';
        if (animIndex < ANIMATION_COUNT) {
          Serial.print(F("Selected animation "));
          Serial.println(animIndex);
          currentAnimation = animIndex;
          startAnimation(animIndex);
        } else {
          Serial.println(F("Invalid animation index"));
        }
      }
      break;

    case 's':
    case 'S':
      Serial.println(F("Stopping animation..."));
      animationActive = false;
      moveToResting();
      break;

    case 'r':
    case 'R':
      Serial.println(F("Restarting current animation..."));
      startAnimation(currentAnimation);
      break;

    case 'l':
    case 'L':
      printAnimationList();
      break;

    case 'h':
    case 'H':
    case '?':
      printHelp();
      break;

    case '\n':
    case '\r':
      // Ignore newlines
      break;

    default:
      Serial.print(F("Unknown command: "));
      Serial.println(cmd);
      Serial.println(F("Type 'h' for help"));
      break;
  }
}

void printHelp() {
  Serial.println();
  Serial.println(F("===== Hatching Egg Spider Commands ====="));
  Serial.println(F("0-6  : Select animation by number"));
  Serial.println(F("l    : List all animations"));
  Serial.println(F("s    : Stop current animation"));
  Serial.println(F("r    : Restart current animation"));
  Serial.println(F("h    : Show this help"));
  Serial.println(F("========================================"));
  Serial.println();
}

void printAnimationList() {
  Serial.println();
  Serial.println(F("Available Animations:"));
  Serial.println(F("---------------------"));

  for (int i = 0; i < ANIMATION_COUNT; i++) {
    char name[64];  // Already 64 bytes - good!
    strcpy_P(name, (char*)pgm_read_ptr(&(ANIMATIONS[i].name)));

    Serial.print(i);
    Serial.print(F(". "));
    Serial.println(name);
  }

  Serial.println();
  Serial.print(F("Current: "));
  Serial.println(currentAnimation);
  Serial.println();
}
