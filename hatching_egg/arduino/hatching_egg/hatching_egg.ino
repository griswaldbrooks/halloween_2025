/*
 * Hatching Egg Spider - Production Animation Controller
 *
 * Autonomous Behavior:
 * - Idle Mode: Cycles resting (3s) ↔ slow_struggle (4.5s) continuously
 * - Triggered Mode: 14-step sequence with progressive speed increase, ending very slow
 *   Steps 1-7: Normal speed (1.0x)
 *   Steps 8-9: Faster (1.5x speed)
 *   Steps 10-11: Very fast (2.0x speed)
 *   Steps 12-13: Violent/jerky (2.5x speed)
 *   Step 14: Very slow/exhausted (0.3x speed)
 *   Total triggered duration: ~36 seconds
 *
 * Sequence:
 *   grasping → grasping → stabbing → grasping → stabbing → breaking_through → breaking_through →
 *   stabbing (faster) → breaking_through (faster) →
 *   stabbing (very fast) → breaking_through (very fast) →
 *   stabbing (violent) → breaking_through (violent) →
 *   breaking_through (slow/exhausted)
 *
 * Available Animations (7 total):
 * - 0: zero - Reference position (straight up)
 * - 1: max - Reference position (perpendicular)
 * - 2: resting - Curled inside egg with breathing
 * - 3: slow_struggle - Testing the shell
 * - 4: breaking_through - Violent pushing
 * - 5: grasping - Reaching and pulling
 * - 6: stabbing - Asymmetric poking
 *
 * For Interactive Testing:
 * Upload animation_tester/ instead - has serial commands (0-6, l, s, r, h)
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
#define ANIM_STABBING 6

// Animation modes
enum AnimationMode {
  MODE_IDLE_CYCLE,      // Cycle between resting and slow_struggle
  MODE_TRIGGERED        // Play 13-step sequence with progressive speed increase
};

// Triggered sequence steps (14 steps total with progressive speed)
#define TRIGGERED_SEQUENCE_LENGTH 14
const int triggeredSequence[TRIGGERED_SEQUENCE_LENGTH] = {
  ANIM_GRASPING,         // Step 0 - Normal speed
  ANIM_GRASPING,         // Step 1 - Normal speed
  ANIM_STABBING,         // Step 2 - Normal speed
  ANIM_GRASPING,         // Step 3 - Normal speed
  ANIM_STABBING,         // Step 4 - Normal speed
  ANIM_BREAKING_THROUGH, // Step 5 - Normal speed
  ANIM_BREAKING_THROUGH, // Step 6 - Normal speed
  ANIM_STABBING,         // Step 7 - Faster (1.5x)
  ANIM_BREAKING_THROUGH, // Step 8 - Faster (1.5x)
  ANIM_STABBING,         // Step 9 - Very fast (2.0x)
  ANIM_BREAKING_THROUGH, // Step 10 - Very fast (2.0x)
  ANIM_STABBING,         // Step 11 - Violent (2.5x)
  ANIM_BREAKING_THROUGH, // Step 12 - Violent (2.5x)
  ANIM_BREAKING_THROUGH  // Step 13 - Slow/exhausted (0.7x)
};

// Playback speed multiplier for each step (makes animations faster and jerkier)
// 1.0 = normal speed, 2.0 = 2x faster (half the duration), 0.3 = very slow (more duration)
const float triggeredSequenceSpeed[TRIGGERED_SEQUENCE_LENGTH] = {
  1.0,  // Step 0 - Normal
  1.0,  // Step 1 - Normal
  1.0,  // Step 2 - Normal
  1.0,  // Step 3 - Normal
  1.0,  // Step 4 - Normal
  1.0,  // Step 5 - Normal
  1.0,  // Step 6 - Normal
  1.5,  // Step 7 - Faster
  1.5,  // Step 8 - Faster
  2.0,  // Step 9 - Very fast
  2.0,  // Step 10 - Very fast
  2.5,  // Step 11 - Violent/jerky
  2.5,  // Step 12 - Violent/jerky
  0.3   // Step 13 - Very slow/exhausted
};

// Animation state
int currentAnimation = ANIM_RESTING;
unsigned long animationStartTime = 0;
bool animationActive = true;  // Start immediately with resting
bool lastTriggerState = HIGH;
AnimationMode currentMode = MODE_IDLE_CYCLE;
int triggeredStep = 0;  // Current step in triggered sequence (0-13)
float playbackSpeed = 1.0;  // Animation playback speed multiplier

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
  Serial.println(F("Trigger: 14-step sequence with progressive speed:"));
  Serial.println(F("  Steps 1-7: Normal speed"));
  Serial.println(F("  Steps 8-9: 1.5x faster"));
  Serial.println(F("  Steps 10-11: 2.0x very fast"));
  Serial.println(F("  Steps 12-13: 2.5x violent/jerky"));
  Serial.println(F("  Step 14: 0.3x very slow/exhausted"));
  Serial.println();

  // Start with resting animation
  startAnimation(ANIM_RESTING);
}

void loop() {
  // Check trigger button
  bool triggerState = digitalRead(TRIGGER_PIN);

  if (triggerState == LOW && lastTriggerState == HIGH) {
    // Trigger pressed - start triggered sequence
    Serial.println(F("TRIGGERED! Starting 14-step sequence with progressive speed..."));
    currentMode = MODE_TRIGGERED;
    triggeredStep = 0;
    playbackSpeed = triggeredSequenceSpeed[0];  // Set speed for first animation
    startAnimation(triggeredSequence[0]);
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

  // Calculate elapsed time with playback speed multiplier
  // Higher speed = faster playback (elapsed time passes faster)
  unsigned long realElapsed = millis() - animationStartTime;
  unsigned long elapsed = (unsigned long)(realElapsed * playbackSpeed);

  // Adjust duration check for playback speed
  // At 2x speed, animation finishes in half the time
  unsigned long adjustedDuration = (unsigned long)(duration / playbackSpeed);

  // Check if animation finished
  if (realElapsed >= adjustedDuration) {
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
    // MODE_TRIGGERED: Play through the 14-step sequence
    triggeredStep++;

    if (triggeredStep < TRIGGERED_SEQUENCE_LENGTH) {
      // Continue to next step in sequence
      int nextAnim = triggeredSequence[triggeredStep];
      playbackSpeed = triggeredSequenceSpeed[triggeredStep];  // Set speed for this step

      // Print animation name and speed for next step
      char name[64];
      strcpy_P(name, (char*)pgm_read_ptr(&(ANIMATIONS[nextAnim].name)));
      Serial.print(F("-> Step "));
      Serial.print(triggeredStep + 1);
      Serial.print(F("/"));
      Serial.print(TRIGGERED_SEQUENCE_LENGTH);
      Serial.print(F(": "));
      Serial.print(name);
      Serial.print(F(" ("));
      Serial.print(playbackSpeed);
      Serial.println(F("x speed)"));

      startAnimation(nextAnim);
    } else {
      // Sequence complete, return to idle
      Serial.println(F("-> Sequence complete, back to idle cycle (resting)"));
      currentMode = MODE_IDLE_CYCLE;
      triggeredStep = 0;
      playbackSpeed = 1.0;  // Reset to normal speed for idle animations
      startAnimation(ANIM_RESTING);
    }
  }
}
