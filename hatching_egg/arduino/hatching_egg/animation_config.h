// AUTO-GENERATED - DO NOT EDIT
// Generated from animation-config.json
// Run: pixi run generate-config

#ifndef ANIMATION_CONFIG_H
#define ANIMATION_CONFIG_H

// Hardware Configuration
#define I2C_ADDRESS 0x40
#define SERVO_FREQ 50

// Left Leg Servos
#define LEFT_SHOULDER_CHANNEL 14
#define LEFT_ELBOW_CHANNEL 15
#define LEFT_SHOULDER_MIN_PULSE 440
#define LEFT_SHOULDER_MAX_PULSE 300
#define LEFT_ELBOW_MIN_PULSE 530
#define LEFT_ELBOW_MAX_PULSE 360

// Right Leg Servos
#define RIGHT_SHOULDER_CHANNEL 1
#define RIGHT_ELBOW_CHANNEL 0
#define RIGHT_SHOULDER_MIN_PULSE 150
#define RIGHT_SHOULDER_MAX_PULSE 280
#define RIGHT_ELBOW_MIN_PULSE 150
#define RIGHT_ELBOW_MAX_PULSE 330

#define TRIGGER_PIN 9

// Kinematics
#define UPPER_SEGMENT_LENGTH 80
#define LOWER_SEGMENT_LENGTH 100
#define SHOULDER_MIN_ANGLE 0
#define SHOULDER_MAX_ANGLE 90
#define ELBOW_MIN_ANGLE 0
#define ELBOW_MAX_ANGLE 90

// Animation Keyframe Structure
struct Keyframe {
  unsigned long time_ms;
  int left_shoulder_deg;
  int left_elbow_deg;
  int right_shoulder_deg;
  int right_elbow_deg;
};

struct Animation {
  const char* name;
  unsigned long duration_ms;
  bool loop;
  int keyframe_count;
  const Keyframe* keyframes;
};

const char ZERO_NAME[] PROGMEM = "Zero Position (Reference)";
const char MAX_NAME[] PROGMEM = "Max Position (Reference)";
const char RESTING_NAME[] PROGMEM = "Resting (Curled Inside Egg)";
const char SLOW_STRUGGLE_NAME[] PROGMEM = "Slow Struggle (Testing the Shell)";
const char BREAKING_THROUGH_NAME[] PROGMEM = "Breaking Through (Violent Pushing)";
const char GRASPING_NAME[] PROGMEM = "Grasping (Reaching and Pulling)";
const char EMERGED_NAME[] PROGMEM = "Emerged (Fully Extended Menacing Pose)";

// Zero Position (Reference)
const Keyframe ZERO_KEYFRAMES[] PROGMEM = {
  {0, 0, 0, 0, 0},
};

// Max Position (Reference)
const Keyframe MAX_KEYFRAMES[] PROGMEM = {
  {0, 90, 90, 90, 90},
};

// Resting (Curled Inside Egg)
const Keyframe RESTING_KEYFRAMES[] PROGMEM = {
  {0, 5, 8, 5, 8},
  {1500, 8, 10, 8, 10},
  {3000, 5, 8, 5, 8},
};

// Slow Struggle (Testing the Shell)
const Keyframe SLOW_STRUGGLE_KEYFRAMES[] PROGMEM = {
  {0, 15, 10, 15, 10},
  {1200, 35, 20, 35, 20},
  {2000, 25, 30, 25, 30},
  {3200, 45, 40, 45, 40},
  {4500, 15, 10, 15, 10},
};

// Breaking Through (Violent Pushing)
const Keyframe BREAKING_THROUGH_KEYFRAMES[] PROGMEM = {
  {0, 25, 20, 25, 20},
  {350, 20, 75, 20, 75},
  {600, 30, 30, 30, 30},
  {950, 70, 70, 70, 70},
  {1200, 35, 35, 35, 35},
  {1550, 15, 80, 15, 80},
  {1800, 80, 65, 80, 65},
  {2400, 25, 20, 25, 20},
};

// Grasping (Reaching and Pulling)
const Keyframe GRASPING_KEYFRAMES[] PROGMEM = {
  {0, 40, 25, 40, 25},
  {800, 25, 70, 25, 70},
  {1400, 50, 45, 50, 45},
  {1800, 30, 65, 30, 65},
  {2400, 65, 70, 65, 70},
  {3000, 50, 50, 50, 50},
  {3500, 40, 25, 40, 25},
};

// Emerged (Fully Extended Menacing Pose)
const Keyframe EMERGED_KEYFRAMES[] PROGMEM = {
  {0, 75, 80, 75, 80},
  {1500, 85, 85, 85, 85},
  {2500, 70, 75, 70, 75},
  {4000, 75, 80, 75, 80},
};

// Animation Definitions
const Animation ANIMATIONS[] PROGMEM = {
  {ZERO_NAME, 1000, true, 1, ZERO_KEYFRAMES},
  {MAX_NAME, 1000, true, 1, MAX_KEYFRAMES},
  {RESTING_NAME, 3000, true, 3, RESTING_KEYFRAMES},
  {SLOW_STRUGGLE_NAME, 4500, true, 5, SLOW_STRUGGLE_KEYFRAMES},
  {BREAKING_THROUGH_NAME, 2400, true, 8, BREAKING_THROUGH_KEYFRAMES},
  {GRASPING_NAME, 3500, true, 7, GRASPING_KEYFRAMES},
  {EMERGED_NAME, 4000, true, 4, EMERGED_KEYFRAMES},
};

#define ANIMATION_COUNT 7
#define DEFAULT_ANIMATION 1  // slow_struggle

#endif // ANIMATION_CONFIG_H
