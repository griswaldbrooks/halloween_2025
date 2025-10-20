/*
 * Twitching Body Animatronic - Production Code
 *
 * Controls 3 servos (head, left arm, right arm) to create unsettling
 * twitching movements for haunted house effect.
 *
 * Behavior:
 *   - Mostly slow creepy movements (50-70% of time)
 *     - Head: Full 0-180° range with variations
 *     - Arms: ALWAYS extreme positions (0-30° or 150-180°) - no small movements!
 *     - Effect: "Pulling up" then "dropping down" - struggling to hold himself
 *   - Brief still periods (20-40% of time)
 *   - VIOLENT THRASHING quick jerks (~5% of time, but MUCH longer 600-1000ms)
 *     - Rapid position changes every 100ms (violent back-and-forth)
 *     - 15° steps at 0ms delay (MAXIMUM SPEED)
 *     - Creates intense frustrated/panicked/violent struggling effect
 *   - Varying cycle lengths for unpredictability
 *
 * Hardware:
 *   - DFRobot Beetle (DFR0282) or Arduino Leonardo
 *   - PCA9685 16-channel PWM driver
 *   - 3x HS-755MG servos (head, left arm, right arm)
 *   - 5V 5A+ power supply
 *   - Optional: Momentary button on Pin 9 for centering servos
 *
 * Wiring:
 *   Beetle <--> PCA9685 (I2C):
 *     SDA -> SDA
 *     SCL -> SCL
 *     VCC -> VCC
 *     GND -> GND
 *
 *   PCA9685 <--> Power Supply:
 *     V+ -> 5V (5A+)
 *     GND -> GND (common ground with Beetle)
 *
 *   PCA9685 <--> Servos:
 *     CH0 -> Head servo
 *     CH1 -> Left arm servo
 *     CH2 -> Right arm servo
 *
 *   Optional Button:
 *     Pin 9 -> Button -> GND (uses internal pullup)
 */

#include <Wire.h>
#include <Adafruit_PWMServoDriver.h>

// PCA9685 configuration
#define PCA9685_ADDRESS 0x40
Adafruit_PWMServoDriver pwm = Adafruit_PWMServoDriver(PCA9685_ADDRESS);

// Servo channels on PCA9685
#define HEAD_CHANNEL 0
#define LEFT_ARM_CHANNEL 1
#define RIGHT_ARM_CHANNEL 2

// HS-755MG pulse width settings (microseconds)
// These values were calibrated during hardware testing
#define SERVOMIN  600   // Minimum pulse width
#define SERVOMAX  2400  // Maximum pulse width
#define SERVO_FREQ 50   // 50Hz for analog servos

// Pin configuration
const int CENTER_BUTTON_PIN = 9;  // Button to center servos (optional)
const int LED_PIN = 13;           // Built-in LED for status

// Rest positions (center positions when "still")
const int HEAD_REST = 90;
const int LEFT_ARM_REST = 90;
const int RIGHT_ARM_REST = 90;

// Movement ranges - BOTH use full servo range for maximum impact
const int SLOW_MOVEMENT_RANGE = 90;   // +/- 90 degrees - FULL RANGE slow sweeps (0-180°)
const int QUICK_JERK_RANGE = 90;      // +/- 90 degrees - FULL RANGE quick jerks (0-180°)

// Behavior state
enum BehaviorState {
  STATE_STILL,
  STATE_SLOW_MOVEMENT,
  STATE_QUICK_JERK
};

BehaviorState currentState = STATE_STILL;
unsigned long stateStartTime = 0;
unsigned long currentStateDuration = 0;

// Movement tracking
int headTarget = HEAD_REST;
int leftArmTarget = LEFT_ARM_REST;
int rightArmTarget = RIGHT_ARM_REST;
int headCurrent = HEAD_REST;
int leftArmCurrent = LEFT_ARM_REST;
int rightArmCurrent = RIGHT_ARM_REST;

unsigned long lastMovementUpdate = 0;
const int SLOW_MOVEMENT_DELAY = 40;   // ms between position updates (slower for smoother motion)
const int QUICK_MOVEMENT_DELAY = 0;   // NO DELAY - maximum speed for violent jerks!

// Cycle definitions (time in milliseconds)
// Different cycles for variety
struct Cycle {
  unsigned long stillDuration;
  unsigned long slowMovementDuration;
  unsigned long quickJerkDuration;
};

// Define 5 different behavior cycles
// New behavior: slow movement is dominant (50-70%), less still time (20-40%)
// Quick jerks LONGER for more visible violent thrashing
const int NUM_CYCLES = 5;
const Cycle cycles[NUM_CYCLES] = {
  {3000, 12000, 800},   // 3s still, 12s slow, 0.8s jerk - LONGER for violence
  {2000, 15000, 1000},  // 2s still, 15s slow, 1s jerk - LONGEST jerk
  {4000, 10000, 600},   // 4s still, 10s slow, 0.6s jerk
  {2500, 18000, 900},   // 2.5s still, 18s slow, 0.9s jerk - very long
  {5000, 8000, 700}     // 5s still, 8s slow, 0.7s jerk
};

int currentCycleIndex = 0;

void setup() {
  // Initialize serial for debugging
  Serial.begin(9600);
  delay(500);

  Serial.println();
  Serial.println(F("=== Twitching Body Animatronic ==="));
  Serial.println(F("Initializing..."));

  // Initialize LED and button
  pinMode(LED_PIN, OUTPUT);
  pinMode(CENTER_BUTTON_PIN, INPUT_PULLUP);

  // Startup blink
  blinkLED(3, 100);

  // Initialize I2C
  Wire.begin();
  Serial.println(F("I2C initialized"));

  // Initialize PCA9685
  pwm.begin();
  pwm.setPWMFreq(SERVO_FREQ);
  delay(100);
  Serial.println(F("PCA9685 initialized (50Hz)"));

  // Move to rest positions
  Serial.println(F("Moving to rest positions..."));
  setServoAngle(HEAD_CHANNEL, HEAD_REST);
  setServoAngle(LEFT_ARM_CHANNEL, LEFT_ARM_REST);
  setServoAngle(RIGHT_ARM_CHANNEL, RIGHT_ARM_REST);
  delay(500);

  // Check for center button press at startup
  if (digitalRead(CENTER_BUTTON_PIN) == LOW) {
    Serial.println();
    Serial.println(F("*** STARTUP CENTER MODE ***"));
    Serial.println(F("Button held - servos centered"));
    Serial.println(F("Release to start behavior"));
    Serial.println();

    digitalWrite(LED_PIN, HIGH);

    // Wait for button release
    while (digitalRead(CENTER_BUTTON_PIN) == LOW) {
      delay(50);
    }

    digitalWrite(LED_PIN, LOW);
    delay(500);
    Serial.println(F("Button released - starting"));
  }

  Serial.println(F("Servos initialized at rest positions"));
  Serial.println(F("Starting behavior cycle..."));
  Serial.println();

  // Visual feedback - ready
  blinkLED(2, 200);

  // Start first cycle
  startStillState();
}

void loop() {
  unsigned long currentTime = millis();

  // Check for center button press (anytime during operation)
  if (digitalRead(CENTER_BUTTON_PIN) == LOW) {
    handleCenterButton();
    return;  // Skip normal behavior while button held
  }

  // Check if current state duration has elapsed
  if (currentTime - stateStartTime >= currentStateDuration) {
    transitionToNextState();
  }

  // Execute behavior based on current state
  switch (currentState) {
    case STATE_STILL:
      executeStillBehavior();
      break;

    case STATE_SLOW_MOVEMENT:
      executeSlowMovement(currentTime);
      break;

    case STATE_QUICK_JERK:
      executeQuickJerk(currentTime);
      break;
  }

  delay(10);  // Small delay for stability
}

void startStillState() {
  currentState = STATE_STILL;
  stateStartTime = millis();
  currentStateDuration = cycles[currentCycleIndex].stillDuration;

  // Set targets to rest positions
  headTarget = HEAD_REST;
  leftArmTarget = LEFT_ARM_REST;
  rightArmTarget = RIGHT_ARM_REST;

  digitalWrite(LED_PIN, LOW);

  Serial.print(F("STATE: Still for "));
  Serial.print(currentStateDuration / 1000.0);
  Serial.println(F(" seconds"));
}

void startSlowMovementState() {
  currentState = STATE_SLOW_MOVEMENT;
  stateStartTime = millis();
  currentStateDuration = cycles[currentCycleIndex].slowMovementDuration;
  lastMovementUpdate = millis();

  // HEAD: Keep random full range (working perfectly)
  headTarget = HEAD_REST + random(-SLOW_MOVEMENT_RANGE, SLOW_MOVEMENT_RANGE + 1);

  // ARMS: Always go to EXTREMES for dramatic effect (no small movements!)
  // Pick extreme positions: either very low (0-30°) or very high (150-180°)
  // This creates "pulling up" or "dropping down" effect
  bool pullUp = random(0, 2);  // 0 or 1

  if (pullUp) {
    // Pulling up - arms go high (one higher than the other)
    leftArmTarget = random(150, 181);   // 150-180° (very high)
    rightArmTarget = random(0, 31);     // 0-30° (very low)
  } else {
    // Dropping down - arms go low/reversed
    leftArmTarget = random(0, 31);      // 0-30° (very low)
    rightArmTarget = random(150, 181);  // 150-180° (very high)
  }

  digitalWrite(LED_PIN, HIGH);

  Serial.print(F("STATE: Slow movement for "));
  Serial.print(currentStateDuration / 1000.0);
  Serial.print(F(" seconds (targets: H:"));
  Serial.print(headTarget);
  Serial.print(F(" LA:"));
  Serial.print(leftArmTarget);
  Serial.print(F(" RA:"));
  Serial.print(rightArmTarget);
  Serial.println(F(")"));
}

void startQuickJerkState() {
  currentState = STATE_QUICK_JERK;
  stateStartTime = millis();
  currentStateDuration = cycles[currentCycleIndex].quickJerkDuration;
  lastMovementUpdate = millis();

  // HEAD: Keep random full range (working perfectly)
  headTarget = HEAD_REST + random(-QUICK_JERK_RANGE, QUICK_JERK_RANGE + 1);

  // ARMS: CHAOTIC movement - random extreme positions (frustrated/escaping)
  // Pick completely random extreme positions for erratic, panicked effect
  leftArmTarget = random(0, 181);   // Anywhere from 0-180° (chaotic)
  rightArmTarget = random(0, 181);  // Anywhere from 0-180° (chaotic)
  // Not necessarily opposite - adds to the chaotic/frustrated feeling

  // Blink LED rapidly during jerk
  digitalWrite(LED_PIN, HIGH);

  Serial.print(F("STATE: QUICK JERK for "));
  Serial.print(currentStateDuration);
  Serial.print(F(" ms (targets: H:"));
  Serial.print(headTarget);
  Serial.print(F(" LA:"));
  Serial.print(leftArmTarget);
  Serial.print(F(" RA:"));
  Serial.print(rightArmTarget);
  Serial.println(F(")"));
}

void transitionToNextState() {
  // State machine: Still -> Slow Movement -> Quick Jerk -> (next cycle) Still
  if (currentState == STATE_STILL) {
    startSlowMovementState();
  } else if (currentState == STATE_SLOW_MOVEMENT) {
    startQuickJerkState();
  } else if (currentState == STATE_QUICK_JERK) {
    // Move to next cycle
    currentCycleIndex = (currentCycleIndex + 1) % NUM_CYCLES;
    Serial.print(F(">>> Starting cycle "));
    Serial.print(currentCycleIndex + 1);
    Serial.print(F(" of "));
    Serial.println(NUM_CYCLES);
    Serial.println();
    startStillState();
  }
}

void executeStillBehavior() {
  // Slowly return to rest positions if not already there
  moveServoToward(HEAD_CHANNEL, headCurrent, headTarget, 1);
  moveServoToward(LEFT_ARM_CHANNEL, leftArmCurrent, leftArmTarget, 1);
  moveServoToward(RIGHT_ARM_CHANNEL, rightArmCurrent, rightArmTarget, 1);
}

void executeSlowMovement(unsigned long currentTime) {
  // Smooth slow movements - update positions gradually
  if (currentTime - lastMovementUpdate >= SLOW_MOVEMENT_DELAY) {
    moveServoToward(HEAD_CHANNEL, headCurrent, headTarget, 1);
    moveServoToward(LEFT_ARM_CHANNEL, leftArmCurrent, leftArmTarget, 1);
    moveServoToward(RIGHT_ARM_CHANNEL, rightArmCurrent, rightArmTarget, 1);

    // Occasionally change head target (head motion is perfect, keep this)
    if (random(0, 100) < 5) {  // 5% chance each update
      headTarget = HEAD_REST + random(-SLOW_MOVEMENT_RANGE, SLOW_MOVEMENT_RANGE + 1);
    }

    // DON'T change arm targets during slow movement - let them complete the full sweep!
    // This ensures arms always do dramatic full-range movements

    lastMovementUpdate = currentTime;
  }
}

void executeQuickJerk(unsigned long currentTime) {
  // VIOLENT THRASHING - maximum speed, multiple position changes
  if (currentTime - lastMovementUpdate >= QUICK_MOVEMENT_DELAY) {
    // Move MUCH faster - 15 degrees per step for violent snapping
    moveServoToward(HEAD_CHANNEL, headCurrent, headTarget, 15);
    moveServoToward(LEFT_ARM_CHANNEL, leftArmCurrent, leftArmTarget, 15);
    moveServoToward(RIGHT_ARM_CHANNEL, rightArmCurrent, rightArmTarget, 15);

    // THRASH: Change targets rapidly during the jerk (every ~100ms)
    // This creates violent back-and-forth movement instead of just one motion
    static unsigned long lastThrash = 0;
    if (currentTime - lastThrash >= 100) {  // Change direction every 100ms
      // Pick NEW random extreme positions - creates thrashing effect
      headTarget = random(0, 181);
      leftArmTarget = random(0, 181);
      rightArmTarget = random(0, 181);
      lastThrash = currentTime;

      Serial.print(F("  THRASH! New targets: H:"));
      Serial.print(headTarget);
      Serial.print(F(" LA:"));
      Serial.print(leftArmTarget);
      Serial.print(F(" RA:"));
      Serial.println(rightArmTarget);
    }

    lastMovementUpdate = currentTime;
  }
}

// Helper function to move servo toward target position
void moveServoToward(uint8_t channel, int &current, int target, int step) {
  if (current < target) {
    current = min(current + step, target);
    setServoAngle(channel, current);
  } else if (current > target) {
    current = max(current - step, target);
    setServoAngle(channel, current);
  }
}

// Set servo angle (0-180 degrees)
void setServoAngle(uint8_t channel, int angle) {
  angle = constrain(angle, 0, 180);
  int pulse_us = map(angle, 0, 180, SERVOMIN, SERVOMAX);
  setServoPulse(channel, pulse_us);
}

// Set servo pulse width in microseconds
void setServoPulse(uint8_t channel, int pulse_us) {
  // Convert microseconds to PWM value (0-4095)
  // At 50Hz, period = 20,000us, each tick = 20000/4096 = 4.88us
  // Use long to prevent integer overflow (pulse_us * 4096 can exceed 32767)
  int pwmVal = ((long)pulse_us * 4096) / 20000;
  pwm.setPWM(channel, 0, pwmVal);
}

// Handle center button press (can be triggered anytime)
void handleCenterButton() {
  static bool buttonWasPressed = false;

  if (!buttonWasPressed) {
    // First detection of button press
    Serial.println();
    Serial.println(F("*** CENTER BUTTON PRESSED ***"));
    Serial.println(F("Centering all servos..."));

    // Center all servos immediately
    setServoAngle(HEAD_CHANNEL, 90);
    setServoAngle(LEFT_ARM_CHANNEL, 90);
    setServoAngle(RIGHT_ARM_CHANNEL, 90);

    // Update current positions
    headCurrent = 90;
    leftArmCurrent = 90;
    rightArmCurrent = 90;

    digitalWrite(LED_PIN, HIGH);
    buttonWasPressed = true;

    Serial.println(F("Servos centered at 90°"));
    Serial.println(F("Holding... (release to resume)"));
  }

  // Keep LED on while button held
  digitalWrite(LED_PIN, HIGH);

  // Check if button was released
  if (digitalRead(CENTER_BUTTON_PIN) == HIGH && buttonWasPressed) {
    digitalWrite(LED_PIN, LOW);
    buttonWasPressed = false;
    Serial.println(F("Button released - resuming behavior"));
    Serial.println();

    // Reset state machine
    startStillState();
  }
}

// Blink LED for visual feedback
void blinkLED(int count, int delayMs) {
  for (int i = 0; i < count; i++) {
    digitalWrite(LED_PIN, HIGH);
    delay(delayMs);
    digitalWrite(LED_PIN, LOW);
    delay(delayMs);
  }
}
