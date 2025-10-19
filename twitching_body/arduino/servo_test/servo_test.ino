/*
 * Servo Test Script - Twitching Body Animatronic
 * Memory-optimized version for Beetle/Leonardo (limited RAM)
 *
 * Hardware:
 *   - DFRobot Beetle (DFR0282) or Arduino Leonardo
 *   - PCA9685 16-channel PWM driver
 *   - 3x HS-755MG servos (head, left arm, right arm)
 *   - 5V 5A+ power supply
 *
 * See WIRING.md for complete wiring diagram
 *
 * Serial Commands:
 *   i - I2C scan, 0/1/2 - Test servo, a - All servos,
 *   c - Center, s - Status, h - Help
 */

#include <Wire.h>
#include <Adafruit_PWMServoDriver.h>

// PCA9685 setup
#define PCA9685_ADDRESS 0x40
Adafruit_PWMServoDriver pwm = Adafruit_PWMServoDriver(PCA9685_ADDRESS);

// Servo channels
#define HEAD_CHANNEL 0
#define LEFT_ARM_CHANNEL 1
#define RIGHT_ARM_CHANNEL 2

// HS-755MG pulse width (microseconds)
// Hitec servos often need wider range than standard
// We'll calibrate these values through testing
#define SERVOMIN  600   // Minimum pulse (adjust if needed)
#define SERVOMAX  2400  // Maximum pulse (adjust if needed)
#define SERVO_CENTER 1500 // Center position
#define SERVO_FREQ 50

#define LED_PIN 13

bool pca9685Detected = false;

// Current servo angles (for interactive control)
int currentAngles[3] = {90, 90, 90};  // Head, LeftArm, RightArm
uint8_t selectedServo = 0;  // 0=Head, 1=LeftArm, 2=RightArm

void setup() {
  Serial.begin(9600);
  delay(500);

  pinMode(LED_PIN, OUTPUT);
  blinkLED(3, 100);

  Serial.println();
  Serial.println(F("=== SERVO TEST ==="));
  Serial.println(F("PCA9685 + 3x HS-755MG"));
  Serial.println();

  Wire.begin();
  Serial.println(F("> Init I2C..."));
  delay(100);

  testI2C();

  if (pca9685Detected) {
    Serial.println(F("> Init PCA9685..."));
    pwm.begin();
    pwm.setPWMFreq(SERVO_FREQ);
    delay(100);
    Serial.println(F("  OK - 50Hz"));

    Serial.println(F("> Centering servos..."));
    centerAllServos();
    delay(300);
    Serial.println(F("  OK"));
    digitalWrite(LED_PIN, HIGH);
  } else {
    Serial.println(F("  FAIL - Check wiring"));
    Serial.println(F("  SDA/SCL, VCC/GND"));
    blinkLED(10, 50);
  }

  Serial.println();
  printHelp();
}

void loop() {
  if (Serial.available() > 0) {
    char cmd = Serial.read();
    while (Serial.available() > 0) Serial.read();

    Serial.println();
    processCommand(cmd);
    Serial.println();
    Serial.print(F("Cmd: "));
  }
}

void processCommand(char cmd) {
  if (!pca9685Detected && cmd != 'i' && cmd != 'h' && cmd != 's') {
    Serial.println(F("PCA9685 not detected. Use 'i'"));
    return;
  }

  switch (cmd) {
    case 'i':
      testI2C();
      break;
    case '0':
      Serial.println(F("> HEAD test"));
      testServo(HEAD_CHANNEL, F("Head"));
      break;
    case '1':
      Serial.println(F("> LEFT ARM test"));
      testServo(LEFT_ARM_CHANNEL, F("Left"));
      break;
    case '2':
      Serial.println(F("> RIGHT ARM test"));
      testServo(RIGHT_ARM_CHANNEL, F("Right"));
      break;
    case 'a':
      Serial.println(F("> ALL servos test"));
      testAllServos();
      break;
    case 'c':
      Serial.println(F("> Center all"));
      centerAllServos();
      Serial.println(F("  OK - 1500us"));
      break;
    case 'm':
      Serial.println(F("> Manual calibration"));
      manualCalibration();
      break;
    case 'd':
      Serial.println(F("> Disable all servos"));
      disableAllServos();
      Serial.println(F("  OK - servos off"));
      break;
    case 'r':
      Serial.println(F("> Raw PWM test"));
      rawPWMTest();
      break;
    case 'p':
      printPositions();
      break;
    case '+':
      adjustServo(selectedServo, 10);
      break;
    case '-':
      adjustServo(selectedServo, -10);
      break;
    case '.':
      adjustServo(selectedServo, 1);
      break;
    case ',':
      adjustServo(selectedServo, -1);
      break;
    case '<':
      // Select previous servo
      selectedServo = (selectedServo == 0) ? 2 : selectedServo - 1;
      printSelectedServo();
      break;
    case '>':
      // Select next servo
      selectedServo = (selectedServo == 2) ? 0 : selectedServo + 1;
      printSelectedServo();
      break;
    case 's':
      printStatus();
      break;
    case 'h':
      printHelp();
      break;
    default:
      Serial.print(F("Unknown: "));
      Serial.println(cmd);
      Serial.println(F("Use 'h' for help"));
      break;
  }
}

void testI2C() {
  Serial.println(F("> I2C scan..."));

  byte error, address;
  int found = 0;

  for (address = 1; address < 127; address++) {
    Wire.beginTransmission(address);
    error = Wire.endTransmission();

    if (error == 0) {
      Serial.print(F("  0x"));
      if (address < 16) Serial.print(F("0"));
      Serial.print(address, HEX);

      if (address == PCA9685_ADDRESS) {
        Serial.println(F(" <- PCA9685!"));
        pca9685Detected = true;
      } else {
        Serial.println();
      }
      found++;
    }
  }

  if (found == 0) {
    Serial.println(F("  None found"));
    Serial.println(F("  Check SDA/SCL/VCC/GND"));
    pca9685Detected = false;
  } else if (!pca9685Detected) {
    Serial.print(F("  Found "));
    Serial.print(found);
    Serial.println(F(" but no PCA9685"));
  }
}

void testServo(uint8_t ch, const __FlashStringHelper* name) {
  Serial.print(F("  "));
  Serial.print(name);
  Serial.println(F(" sweep:"));

  Serial.print(F("    0->180 "));
  for (int a = 0; a <= 180; a += 10) {
    setServoAngle(ch, a);
    delay(80);
  }
  Serial.println(F("OK"));

  delay(300);

  Serial.print(F("    180->0 "));
  for (int a = 180; a >= 0; a -= 10) {
    setServoAngle(ch, a);
    delay(80);
  }
  Serial.println(F("OK"));

  setServoAngle(ch, 90);
  delay(200);
  Serial.println(F("  Done"));
}

void testAllServos() {
  Serial.println(F("  All sweep:"));

  Serial.print(F("    0->180 "));
  for (int a = 0; a <= 180; a += 5) {
    setServoAngle(HEAD_CHANNEL, a);
    setServoAngle(LEFT_ARM_CHANNEL, a);
    setServoAngle(RIGHT_ARM_CHANNEL, a);
    delay(20);
  }
  Serial.println(F("OK"));

  delay(300);

  Serial.print(F("    180->0 "));
  for (int a = 180; a >= 0; a -= 5) {
    setServoAngle(HEAD_CHANNEL, a);
    setServoAngle(LEFT_ARM_CHANNEL, a);
    setServoAngle(RIGHT_ARM_CHANNEL, a);
    delay(20);
  }
  Serial.println(F("OK"));

  centerAllServos();
  delay(200);
  Serial.println(F("  Done"));
}

void centerAllServos() {
  Serial.println(F("  Setting 1500us (center)..."));
  currentAngles[0] = 90;
  currentAngles[1] = 90;
  currentAngles[2] = 90;
  setServoPulse(HEAD_CHANNEL, SERVO_CENTER);
  setServoPulse(LEFT_ARM_CHANNEL, SERVO_CENTER);
  setServoPulse(RIGHT_ARM_CHANNEL, SERVO_CENTER);
}

void disableAllServos() {
  // Turn off PWM signal - servos will stop holding position
  pwm.setPWM(HEAD_CHANNEL, 0, 0);
  pwm.setPWM(LEFT_ARM_CHANNEL, 0, 0);
  pwm.setPWM(RIGHT_ARM_CHANNEL, 0, 0);
}

void setServoPulse(uint8_t ch, int pulse_us) {
  // Convert microseconds to PWM value (0-4095)
  // At 50Hz, period = 20,000us, each tick = 20000/4096 = 4.88us
  // Use long to prevent integer overflow (pulse_us * 4096 can exceed 32767)
  int pwmVal = ((long)pulse_us * 4096) / 20000;
  pwm.setPWM(ch, 0, pwmVal);

  Serial.print(F("    CH"));
  Serial.print(ch);
  Serial.print(F(": "));
  Serial.print(pulse_us);
  Serial.print(F("us -> PWM "));
  Serial.println(pwmVal);
}

void rawPWMTest() {
  Serial.println(F("  Direct PCA9685 PWM test"));
  Serial.println(F("  Testing CH0 (Head) only"));
  Serial.println(F("  Sending raw PWM values"));
  Serial.println();

  // Test raw PWM values directly (0-4095 range)
  // For 50Hz (20ms period), each count = ~4.88us
  // 307 = ~1500us (center for most servos)
  int pwmValues[] = {100, 150, 200, 250, 307, 350, 400, 450, 500};
  int numValues = sizeof(pwmValues) / sizeof(pwmValues[0]);

  for (int i = 0; i < numValues; i++) {
    Serial.print(F("  PWM value: "));
    Serial.print(pwmValues[i]);
    Serial.print(F(" (~"));
    Serial.print(((long)pwmValues[i] * 20000) / 4096);
    Serial.print(F("us) "));

    // Direct call to PCA9685
    pwm.setPWM(HEAD_CHANNEL, 0, pwmValues[i]);
    delay(1000);

    Serial.println(F("(watch servo)"));
  }

  Serial.println();
  Serial.println(F("  Done. Did servo move?"));
}

void manualCalibration() {
  Serial.println(F("  Manual pulse width test"));
  Serial.println(F("  Testing CH0 (Head) only"));
  Serial.println();

  // Test a range of pulse widths to find limits
  int pulses[] = {500, 600, 700, 900, 1000, 1500, 2000, 2100, 2300, 2400, 2500};
  int numPulses = sizeof(pulses) / sizeof(pulses[0]);

  for (int i = 0; i < numPulses; i++) {
    Serial.print(F("  Setting "));
    Serial.print(pulses[i]);
    Serial.print(F("us... "));

    setServoPulse(HEAD_CHANNEL, pulses[i]);
    delay(1000);

    Serial.println(F("(watch servo)"));
  }

  Serial.println();
  Serial.println(F("  Done. Note which values caused:"));
  Serial.println(F("    - Full CCW (counterclockwise)"));
  Serial.println(F("    - Center"));
  Serial.println(F("    - Full CW (clockwise)"));
}

void setServoAngle(uint8_t ch, int angle) {
  angle = constrain(angle, 0, 180);
  currentAngles[ch] = angle;  // Track current angle
  int pulse_us = map(angle, 0, 180, SERVOMIN, SERVOMAX);
  setServoPulse(ch, pulse_us);
}

void adjustServo(uint8_t ch, int delta) {
  int newAngle = currentAngles[ch] + delta;
  newAngle = constrain(newAngle, 0, 180);

  Serial.print(F("> "));
  printServoName(ch);
  Serial.print(F(": "));
  Serial.print(currentAngles[ch]);
  Serial.print(F("° -> "));
  Serial.print(newAngle);
  Serial.println(F("°"));

  setServoAngle(ch, newAngle);
}

void printPositions() {
  Serial.println(F("=== POSITIONS ==="));
  Serial.print(F("Head (CH0):     "));
  Serial.print(currentAngles[0]);
  Serial.println(F("°"));
  Serial.print(F("Left Arm (CH1): "));
  Serial.print(currentAngles[1]);
  Serial.println(F("°"));
  Serial.print(F("Right Arm (CH2): "));
  Serial.print(currentAngles[2]);
  Serial.println(F("°"));
}

void printSelectedServo() {
  Serial.print(F("> Selected: "));
  printServoName(selectedServo);
  Serial.print(F(" ("));
  Serial.print(currentAngles[selectedServo]);
  Serial.println(F("°)"));
}

void printServoName(uint8_t ch) {
  switch(ch) {
    case HEAD_CHANNEL:
      Serial.print(F("Head"));
      break;
    case LEFT_ARM_CHANNEL:
      Serial.print(F("Left Arm"));
      break;
    case RIGHT_ARM_CHANNEL:
      Serial.print(F("Right Arm"));
      break;
  }
}

void printStatus() {
  Serial.println(F("=== STATUS ==="));
  Serial.print(F("PCA9685: 0x"));
  Serial.println(PCA9685_ADDRESS, HEX);
  Serial.print(F("Detected: "));
  Serial.println(pca9685Detected ? F("YES") : F("NO"));
  Serial.print(F("PWM: "));
  Serial.print(SERVO_FREQ);
  Serial.println(F("Hz"));
  Serial.println(F("Servos:"));
  Serial.println(F("  CH0=Head"));
  Serial.println(F("  CH1=LeftArm"));
  Serial.println(F("  CH2=RightArm"));
  Serial.print(F("Pulse: "));
  Serial.print(SERVOMIN);
  Serial.print(F("-"));
  Serial.print(SERVOMAX);
  Serial.println(F("us"));
}

void printHelp() {
  Serial.println(F("=== COMMANDS ==="));
  Serial.println(F("Testing:"));
  Serial.println(F("  i - I2C scan"));
  Serial.println(F("  0 - Test HEAD"));
  Serial.println(F("  1 - Test LEFT ARM"));
  Serial.println(F("  2 - Test RIGHT ARM"));
  Serial.println(F("  a - Test ALL servos"));
  Serial.println(F("  m - Manual calibration"));
  Serial.println(F("  r - Raw PWM test"));
  Serial.println();
  Serial.println(F("Control:"));
  Serial.println(F("  c - Center all (90°)"));
  Serial.println(F("  d - Disable all servos"));
  Serial.println(F("  p - Show positions"));
  Serial.println();
  Serial.println(F("Interactive:"));
  Serial.println(F("  < > - Select servo"));
  Serial.println(F("  + - - Adjust ±10°"));
  Serial.println(F("  . , - Adjust ±1°"));
  Serial.println();
  Serial.println(F("Info:"));
  Serial.println(F("  s - Status"));
  Serial.println(F("  h - Help"));
  Serial.print(F("Cmd: "));
}

void blinkLED(int n, int ms) {
  for (int i = 0; i < n; i++) {
    digitalWrite(LED_PIN, HIGH);
    delay(ms);
    digitalWrite(LED_PIN, LOW);
    delay(ms);
  }
}
