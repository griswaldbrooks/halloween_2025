/*
 * Struggling Spider Egg Sacs - Production Code
 *
 * Controls LEDs and servos to create terrifying effect of spiders
 * struggling to escape from egg sacs in haunted house.
 *
 * Behavior:
 *   - LEDs flicker violently (spiders moving inside trying to escape)
 *   - Random bursts of intense activity (violent struggling)
 *   - Occasional violent breakthrough (servo extends spider leg through sac)
 *   - Brief calm periods create false sense of security
 *   - Synchronized chaos when leg breaks through
 *
 * Hardware:
 *   - DFRobot Beetle (DFR0282) or Arduino Leonardo
 *   - PCA9685 16-channel PWM driver
 *   - LEDs on channels 0-11 (12 egg sacs with internal lighting)
 *   - Servos on channels 12-15 (4 spider legs that can poke out)
 *   - 5V power supply (adequate for LEDs + servos)
 *   - Optional: Momentary button on Pin 9 for pause/test
 *
 * Wiring:
 *   Beetle <--> PCA9685 (I2C):
 *     SDA -> SDA
 *     SCL -> SCL
 *     VCC -> VCC
 *     GND -> GND
 *
 *   PCA9685 <--> Power Supply:
 *     V+ -> 5V (calculate based on LED + servo current)
 *     GND -> GND (common ground with Beetle)
 *
 *   PCA9685 Channels:
 *     CH0-CH11 -> LEDs (through appropriate resistors)
 *     CH12-CH15 -> Spider leg servos
 *
 *   Optional Button:
 *     Pin 9 -> Button -> GND (uses internal pullup)
 */

#include <Wire.h>
#include <Adafruit_PWMServoDriver.h>

// PCA9685 configuration
#define PCA9685_ADDRESS 0x40
Adafruit_PWMServoDriver pwm = Adafruit_PWMServoDriver(PCA9685_ADDRESS);

// PWM frequency (1000Hz for LEDs is fine, servos will work too)
#define PWM_FREQ 1000

// Hardware allocation
#define NUM_LEDS 12        // Channels 0-11 for LEDs
#define NUM_SERVOS 4       // Channels 12-15 for spider legs
#define SERVO_START_CH 12  // First servo channel

// Servo pulse width settings (microseconds)
// These work at any PWM frequency due to library conversion
#define SERVOMIN  600   // Minimum pulse width (retracted)
#define SERVOMAX  2400  // Maximum pulse width (extended)

// Pin configuration
const int PAUSE_BUTTON_PIN = 9;  // Button to pause/test
const int LED_PIN = 13;          // Built-in LED for status

// Behavior states
enum BehaviorState {
  STATE_CALM,          // Low activity, false sense of security
  STATE_STRUGGLING,    // Violent flickering, spiders trying to escape
  STATE_BREAKTHROUGH   // One leg breaks through, maximum chaos
};

BehaviorState currentState = STATE_CALM;
unsigned long stateStartTime = 0;
unsigned long stateDuration = 0;

// LED state tracking
int ledBrightness[12];  // Current brightness for each LED

// Servo state
int servoPositions[4] = {0, 0, 0, 0};  // Current angle for each servo (0 = retracted)
int breakthroughServo = 0;  // Which servo is breaking through
unsigned long breakthroughPhaseStart = 0;
enum BreakthroughPhase {
  PHASE_BUILDUP,    // LEDs intensify before breakthrough
  PHASE_EXTEND,     // Leg extends violently
  PHASE_HOLD,       // Leg holds extended, LEDs crazy
  PHASE_RETRACT,    // Leg pulls back in
  PHASE_SETTLE      // LEDs settle down
};
BreakthroughPhase breakthroughPhase = PHASE_BUILDUP;

void setup() {
  // Initialize serial for debugging
  Serial.begin(9600);
  delay(500);

  Serial.println();
  Serial.println(F("=== Struggling Spider Egg Sacs ==="));
  Serial.println(F("Initializing..."));

  // Initialize LED and button
  pinMode(LED_PIN, OUTPUT);
  pinMode(PAUSE_BUTTON_PIN, INPUT_PULLUP);

  // Startup blink
  blinkLED(3, 100);

  // Initialize I2C
  Wire.begin();
  Serial.println(F("I2C initialized"));

  // Initialize PCA9685
  pwm.begin();
  pwm.setPWMFreq(PWM_FREQ);
  delay(100);
  Serial.print(F("PCA9685 initialized ("));
  Serial.print(PWM_FREQ);
  Serial.println(F("Hz)"));

  // Initialize random seed
  randomSeed(analogRead(A0));

  // Turn off all LEDs
  Serial.println(F("Initializing egg sacs..."));
  for (int i = 0; i < NUM_LEDS; i++) {
    ledBrightness[i] = 0;
    setLED(i, 0);
  }

  // Retract all servos (spider legs hidden)
  Serial.println(F("Retracting spider legs..."));
  for (int i = 0; i < NUM_SERVOS; i++) {
    servoPositions[i] = 0;
    setServoAngle(i, 0);
  }

  Serial.println(F("Egg sacs ready"));
  Serial.println(F("Starting behavior cycle..."));
  Serial.println();

  // Visual feedback - ready
  blinkLED(2, 200);

  // Start in calm state
  startCalmState();
}

void loop() {
  unsigned long currentTime = millis();

  // Check for pause button
  if (digitalRead(PAUSE_BUTTON_PIN) == LOW) {
    handlePauseButton();
    return;
  }

  // Check if current state duration has elapsed
  if (currentTime - stateStartTime >= stateDuration) {
    transitionToNextState();
  }

  // Execute behavior based on current state
  switch (currentState) {
    case STATE_CALM:
      updateCalmState(currentTime);
      break;
    case STATE_STRUGGLING:
      updateStrugglingState(currentTime);
      break;
    case STATE_BREAKTHROUGH:
      updateBreakthroughState(currentTime);
      break;
  }

  // Small delay for stability
  delay(10);
}

// ===== STATE TRANSITIONS =====

void startCalmState() {
  currentState = STATE_CALM;
  stateStartTime = millis();
  stateDuration = random(3000, 8000);  // 3-8 seconds of calm

  Serial.println(F("[STATE] Calm - false security"));
  digitalWrite(LED_PIN, LOW);
}

void startStrugglingState() {
  currentState = STATE_STRUGGLING;
  stateStartTime = millis();
  stateDuration = random(10000, 20000);  // 10-20 seconds of struggling

  Serial.println(F("[STATE] Struggling - violent movement"));
  digitalWrite(LED_PIN, LOW);
}

void startBreakthroughState() {
  currentState = STATE_BREAKTHROUGH;
  stateStartTime = millis();
  stateDuration = 8000;  // Fixed 8 second breakthrough sequence

  // Pick random servo for breakthrough
  breakthroughServo = random(0, NUM_SERVOS);
  breakthroughPhase = PHASE_BUILDUP;
  breakthroughPhaseStart = millis();

  Serial.print(F("[STATE] BREAKTHROUGH - Leg "));
  Serial.println(breakthroughServo);
  digitalWrite(LED_PIN, HIGH);
}

void transitionToNextState() {
  // 20% calm, 60% struggling, 20% breakthrough
  int r = random(0, 100);

  if (r < 20) {
    startCalmState();
  } else if (r < 80) {
    startStrugglingState();
  } else {
    startBreakthroughState();
  }
}

// ===== STATE BEHAVIORS =====

void updateCalmState(unsigned long currentTime) {
  // Low random flickering - spiders moving slowly inside
  for (int i = 0; i < NUM_LEDS; i++) {
    // Slow random changes
    if (random(0, 100) < 5) {  // 5% chance each update
      int target = random(50, 300);  // Very dim
      ledBrightness[i] = target;
      setLED(i, target);
    }
  }

  // Ensure all servos retracted
  for (int i = 0; i < NUM_SERVOS; i++) {
    if (servoPositions[i] != 0) {
      servoPositions[i] = 0;
      setServoAngle(i, 0);
    }
  }
}

void updateStrugglingState(unsigned long currentTime) {
  // Violent random flickering - spiders struggling to escape
  for (int i = 0; i < NUM_LEDS; i++) {
    // High chance of change
    if (random(0, 100) < 30) {  // 30% chance each update
      int target = random(0, 2000);  // Wide range, violent changes
      ledBrightness[i] = target;
      setLED(i, target);
    }
  }

  // Servos stay retracted (not breaking through yet)
  for (int i = 0; i < NUM_SERVOS; i++) {
    if (servoPositions[i] != 0) {
      servoPositions[i] = 0;
      setServoAngle(i, 0);
    }
  }
}

void updateBreakthroughState(unsigned long currentTime) {
  unsigned long phaseElapsed = currentTime - breakthroughPhaseStart;

  switch (breakthroughPhase) {
    case PHASE_BUILDUP:
      // LEDs intensify rapidly (1 second)
      for (int i = 0; i < NUM_LEDS; i++) {
        int target = random(500, 2500);  // Medium-high, getting brighter
        ledBrightness[i] = target;
        setLED(i, target);
      }

      if (phaseElapsed > 1000) {
        breakthroughPhase = PHASE_EXTEND;
        breakthroughPhaseStart = currentTime;
        Serial.println(F("  [EXTEND] Leg breaking through!"));
      }
      break;

    case PHASE_EXTEND:
      // MAXIMUM LED chaos + servo extends (2 seconds)
      for (int i = 0; i < NUM_LEDS; i++) {
        int target = random(0, 4095);  // MAXIMUM chaos
        ledBrightness[i] = target;
        setLED(i, target);
      }

      // Extend servo violently
      int targetAngle = map(phaseElapsed, 0, 2000, 0, 180);
      targetAngle = constrain(targetAngle, 0, 180);
      servoPositions[breakthroughServo] = targetAngle;
      setServoAngle(breakthroughServo, targetAngle);

      if (phaseElapsed > 2000) {
        breakthroughPhase = PHASE_HOLD;
        breakthroughPhaseStart = currentTime;
        Serial.println(F("  [HOLD] Leg fully extended!"));
      }
      break;

    case PHASE_HOLD:
      // Hold extended, LEDs still crazy (2 seconds)
      for (int i = 0; i < NUM_LEDS; i++) {
        int target = random(1000, 4095);  // High activity
        ledBrightness[i] = target;
        setLED(i, target);
      }

      // Hold servo at 180
      if (servoPositions[breakthroughServo] != 180) {
        servoPositions[breakthroughServo] = 180;
        setServoAngle(breakthroughServo, 180);
      }

      if (phaseElapsed > 2000) {
        breakthroughPhase = PHASE_RETRACT;
        breakthroughPhaseStart = currentTime;
        Serial.println(F("  [RETRACT] Leg pulling back..."));
      }
      break;

    case PHASE_RETRACT:
      // LEDs settling, servo retracts (2 seconds)
      for (int i = 0; i < NUM_LEDS; i++) {
        int target = random(200, 1000);  // Decreasing activity
        ledBrightness[i] = target;
        setLED(i, target);
      }

      // Retract servo
      targetAngle = map(phaseElapsed, 0, 2000, 180, 0);
      targetAngle = constrain(targetAngle, 0, 180);
      servoPositions[breakthroughServo] = targetAngle;
      setServoAngle(breakthroughServo, targetAngle);

      if (phaseElapsed > 2000) {
        breakthroughPhase = PHASE_SETTLE;
        breakthroughPhaseStart = currentTime;
        Serial.println(F("  [SETTLE] Leg retracted"));
      }
      break;

    case PHASE_SETTLE:
      // Final settling (1 second)
      for (int i = 0; i < NUM_LEDS; i++) {
        int target = random(0, 500);  // Low activity
        ledBrightness[i] = target;
        setLED(i, target);
      }

      // Ensure retracted
      if (servoPositions[breakthroughServo] != 0) {
        servoPositions[breakthroughServo] = 0;
        setServoAngle(breakthroughServo, 0);
      }

      if (phaseElapsed > 1000) {
        // Breakthrough complete, will transition to next state
        Serial.println(F("  [COMPLETE] Breakthrough finished"));
      }
      break;
  }
}

void handlePauseButton() {
  Serial.println(F("[PAUSE] Button pressed"));
  Serial.println(F("All LEDs 50%, servos retracted"));
  Serial.println(F("Release to resume"));

  digitalWrite(LED_PIN, HIGH);

  // Set all LEDs to 50%
  for (int i = 0; i < NUM_LEDS; i++) {
    setLED(i, 2048);
  }

  // Retract all servos
  for (int i = 0; i < NUM_SERVOS; i++) {
    setServoAngle(i, 0);
  }

  // Wait for release
  while (digitalRead(PAUSE_BUTTON_PIN) == LOW) {
    delay(50);
  }

  digitalWrite(LED_PIN, LOW);
  Serial.println(F("[RESUME] Button released"));

  // Reset timing
  stateStartTime = millis();
}

// ===== HARDWARE CONTROL =====

void setLED(uint8_t ch, int brightness) {
  brightness = constrain(brightness, 0, 4095);
  pwm.setPWM(ch, 0, brightness);
}

void setServoAngle(uint8_t servoNum, int angle) {
  angle = constrain(angle, 0, 180);
  uint8_t ch = SERVO_START_CH + servoNum;

  // Convert angle to pulse width
  int pulse_us = map(angle, 0, 180, SERVOMIN, SERVOMAX);

  // Convert microseconds to PWM value
  // At 1000Hz, period = 1000us, each tick = 1000/4096 = 0.244us
  // PWM = pulse_us / 0.244
  int pwmVal = (pulse_us * 4096) / 1000;
  pwm.setPWM(ch, 0, pwmVal);
}

void blinkLED(int n, int ms) {
  for (int i = 0; i < n; i++) {
    digitalWrite(LED_PIN, HIGH);
    delay(ms);
    digitalWrite(LED_PIN, LOW);
    delay(ms);
  }
}
