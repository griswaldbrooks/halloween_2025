/*
 * Hatching Egg Spider - Main Animation Controller
 *
 * Behavior:
 * - Idle: Cycles between "resting" and "slow_struggle"
 * - Triggered: Plays "grasping" → "breaking_through" → back to idle cycle
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

// Animation indices (from animation-config.json order)
#define ANIM_RESTING 2
#define ANIM_SLOW_STRUGGLE 3
#define ANIM_BREAKING_THROUGH 4
#define ANIM_GRASPING 5

// Animation modes
enum AnimationMode {
  MODE_IDLE_CYCLE,      // Cycle between resting and slow_struggle
  MODE_TRIGGERED        // Play grasping -> breaking_through (multiple cycles)
};

// Triggered sequence configuration
#define TRIGGERED_CYCLES 3  // Number of times to repeat grasping->breaking_through

// Animation state
int currentAnimation = ANIM_RESTING;
unsigned long animationStartTime = 0;
bool animationActive = true;  // Start immediately with resting
bool lastTriggerState = HIGH;
AnimationMode currentMode = MODE_IDLE_CYCLE;
int triggeredStep = 0;  // 0=grasping, 1=breaking_through
int triggeredCyclesRemaining = 0;  // How many more cycles to run

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

  Serial.println(F("Mode: Idle Cycle (resting <-> slow_struggle)"));
  Serial.println(F("Trigger: grasping -> breaking_through"));
  Serial.println();

  // Start with resting animation
  startAnimation(ANIM_RESTING);
}

void loop() {
  // Check trigger button
  bool triggerState = digitalRead(TRIGGER_PIN);

  if (triggerState == LOW && lastTriggerState == HIGH) {
    // Trigger pressed - start triggered sequence
    Serial.print(F("TRIGGERED! Starting "));
    Serial.print(TRIGGERED_CYCLES);
    Serial.println(F(" cycles of grasping -> breaking_through"));
    currentMode = MODE_TRIGGERED;
    triggeredStep = 0;
    triggeredCyclesRemaining = TRIGGERED_CYCLES;
    startAnimation(ANIM_GRASPING);
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
    // Animation complete - determine next animation
    handleAnimationComplete();
    return;
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

void handleAnimationComplete() {
  Serial.println(F("Animation complete"));

  if (currentMode == MODE_IDLE_CYCLE) {
    // Cycle between resting and slow_struggle
    if (currentAnimation == ANIM_RESTING) {
      Serial.println(F("-> slow_struggle"));
      startAnimation(ANIM_SLOW_STRUGGLE);
    } else {
      Serial.println(F("-> resting"));
      startAnimation(ANIM_RESTING);
    }
  } else {
    // MODE_TRIGGERED: grasping -> breaking_through (multiple cycles)
    if (triggeredStep == 0) {
      // Just finished grasping, start breaking_through
      Serial.println(F("-> breaking_through"));
      triggeredStep = 1;
      startAnimation(ANIM_BREAKING_THROUGH);
    } else {
      // Finished breaking_through
      triggeredCyclesRemaining--;

      if (triggeredCyclesRemaining > 0) {
        // Continue with another cycle
        Serial.print(F("-> grasping ("));
        Serial.print(triggeredCyclesRemaining);
        Serial.println(F(" cycles remaining)"));
        triggeredStep = 0;
        startAnimation(ANIM_GRASPING);
      } else {
        // All cycles complete, return to idle
        Serial.println(F("-> back to idle cycle (resting)"));
        currentMode = MODE_IDLE_CYCLE;
        triggeredStep = 0;
        startAnimation(ANIM_RESTING);
      }
    }
  }
}
