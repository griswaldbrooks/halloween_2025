/*
 * LED Test Script - Pulsating Egg Sacs
 * Memory-optimized version for Beetle/Leonardo (limited RAM)
 *
 * Hardware:
 *   - DFRobot Beetle (DFR0282) or Arduino Leonardo
 *   - PCA9685 16-channel PWM driver
 *   - LEDs on channels 0-15 (configurable)
 *   - 5V power supply
 *
 * See WIRING.md for complete wiring diagram
 *
 * Serial Commands:
 *   i - I2C scan, 0-9 - Test LED channel, a - All LEDs,
 *   f - Fade test, p - Pulse test, s - Status, h - Help
 */

#include <Wire.h>
#include <Adafruit_PWMServoDriver.h>

// PCA9685 setup
#define PCA9685_ADDRESS 0x40
Adafruit_PWMServoDriver pwm = Adafruit_PWMServoDriver(PCA9685_ADDRESS);

// PWM frequency for LEDs (higher = less flicker)
#define PWM_FREQ 1000  // 1000Hz for smooth LED control

// Number of LED channels to use (up to 16)
#define NUM_LEDS 8

#define LED_PIN 13

bool pca9685Detected = false;

// Current LED brightness values (0-4095)
int currentBrightness[16] = {0};  // All LEDs start off
uint8_t selectedLED = 0;

void setup() {
  Serial.begin(9600);
  delay(500);

  pinMode(LED_PIN, OUTPUT);
  blinkLED(3, 100);

  Serial.println();
  Serial.println(F("=== LED TEST ==="));
  Serial.println(F("PCA9685 + LED Control"));
  Serial.println();

  Wire.begin();
  Serial.println(F("> Init I2C..."));
  delay(100);

  testI2C();

  if (pca9685Detected) {
    Serial.println(F("> Init PCA9685..."));
    pwm.begin();
    pwm.setPWMFreq(PWM_FREQ);
    delay(100);
    Serial.print(F("  OK - "));
    Serial.print(PWM_FREQ);
    Serial.println(F("Hz"));

    Serial.println(F("> Turning off all LEDs..."));
    allOff();
    delay(100);
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
    case '1':
    case '2':
    case '3':
    case '4':
    case '5':
    case '6':
    case '7':
    case '8':
    case '9':
      {
        uint8_t ch = cmd - '0';
        if (ch < NUM_LEDS) {
          Serial.print(F("> LED "));
          Serial.print(ch);
          Serial.println(F(" test"));
          testLED(ch);
        } else {
          Serial.print(F("LED "));
          Serial.print(ch);
          Serial.print(F(" out of range (0-"));
          Serial.print(NUM_LEDS - 1);
          Serial.println(F(")"));
        }
      }
      break;
    case 'a':
      Serial.println(F("> ALL LEDs test"));
      testAllLEDs();
      break;
    case 'f':
      Serial.println(F("> Fade test"));
      fadeTest();
      break;
    case 'p':
      Serial.println(F("> Pulse test"));
      pulseTest();
      break;
    case 'b':
      Serial.println(F("> Breathing test"));
      breathingTest();
      break;
    case 'o':
      Serial.println(F("> All OFF"));
      allOff();
      Serial.println(F("  OK"));
      break;
    case 'n':
      Serial.println(F("> All ON (max)"));
      allOn();
      Serial.println(F("  OK"));
      break;
    case '+':
      adjustLED(selectedLED, 256);
      break;
    case '-':
      adjustLED(selectedLED, -256);
      break;
    case '.':
      adjustLED(selectedLED, 16);
      break;
    case ',':
      adjustLED(selectedLED, -16);
      break;
    case '<':
      selectedLED = (selectedLED == 0) ? (NUM_LEDS - 1) : selectedLED - 1;
      printSelectedLED();
      break;
    case '>':
      selectedLED = (selectedLED >= NUM_LEDS - 1) ? 0 : selectedLED + 1;
      printSelectedLED();
      break;
    case 'v':
      printBrightness();
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

void testLED(uint8_t ch) {
  Serial.println(F("  Fade up/down:"));

  Serial.print(F("    0->100% "));
  for (int b = 0; b <= 4095; b += 64) {
    setLED(ch, b);
    delay(30);
  }
  Serial.println(F("OK"));

  delay(300);

  Serial.print(F("    100->0% "));
  for (int b = 4095; b >= 0; b -= 64) {
    setLED(ch, b);
    delay(30);
  }
  Serial.println(F("OK"));

  setLED(ch, 0);
  Serial.println(F("  Done"));
}

void testAllLEDs() {
  Serial.println(F("  All fade up/down:"));

  Serial.print(F("    0->100% "));
  for (int b = 0; b <= 4095; b += 32) {
    for (uint8_t ch = 0; ch < NUM_LEDS; ch++) {
      setLED(ch, b);
    }
    delay(10);
  }
  Serial.println(F("OK"));

  delay(500);

  Serial.print(F("    100->0% "));
  for (int b = 4095; b >= 0; b -= 32) {
    for (uint8_t ch = 0; ch < NUM_LEDS; ch++) {
      setLED(ch, b);
    }
    delay(10);
  }
  Serial.println(F("OK"));

  allOff();
  Serial.println(F("  Done"));
}

void fadeTest() {
  Serial.println(F("  Individual fade sequence"));

  for (uint8_t ch = 0; ch < NUM_LEDS; ch++) {
    Serial.print(F("    LED "));
    Serial.print(ch);
    Serial.print(F("... "));

    // Fade in
    for (int b = 0; b <= 4095; b += 128) {
      setLED(ch, b);
      delay(10);
    }

    delay(200);

    // Fade out
    for (int b = 4095; b >= 0; b -= 128) {
      setLED(ch, b);
      delay(10);
    }

    Serial.println(F("OK"));
    delay(100);
  }

  Serial.println(F("  Done"));
}

void pulseTest() {
  Serial.println(F("  Synchronized pulse (5 cycles)"));

  for (int cycle = 0; cycle < 5; cycle++) {
    Serial.print(F("    Cycle "));
    Serial.print(cycle + 1);
    Serial.print(F("... "));

    // Pulse up
    for (int b = 0; b <= 4095; b += 64) {
      for (uint8_t ch = 0; ch < NUM_LEDS; ch++) {
        setLED(ch, b);
      }
      delay(5);
    }

    // Pulse down
    for (int b = 4095; b >= 0; b -= 64) {
      for (uint8_t ch = 0; ch < NUM_LEDS; ch++) {
        setLED(ch, b);
      }
      delay(5);
    }

    Serial.println(F("OK"));
  }

  allOff();
  Serial.println(F("  Done"));
}

void breathingTest() {
  Serial.println(F("  Breathing pattern (5 breaths)"));

  for (int breath = 0; breath < 5; breath++) {
    Serial.print(F("    Breath "));
    Serial.print(breath + 1);
    Serial.print(F("... "));

    // Inhale (slow)
    for (int b = 0; b <= 4095; b += 32) {
      for (uint8_t ch = 0; ch < NUM_LEDS; ch++) {
        setLED(ch, b);
      }
      delay(15);
    }

    delay(100);

    // Exhale (slow)
    for (int b = 4095; b >= 0; b -= 32) {
      for (uint8_t ch = 0; ch < NUM_LEDS; ch++) {
        setLED(ch, b);
      }
      delay(15);
    }

    delay(200);
    Serial.println(F("OK"));
  }

  allOff();
  Serial.println(F("  Done"));
}

void allOff() {
  for (uint8_t ch = 0; ch < 16; ch++) {
    setLED(ch, 0);
  }
}

void allOn() {
  for (uint8_t ch = 0; ch < NUM_LEDS; ch++) {
    setLED(ch, 4095);
  }
}

void setLED(uint8_t ch, int brightness) {
  brightness = constrain(brightness, 0, 4095);
  currentBrightness[ch] = brightness;
  pwm.setPWM(ch, 0, brightness);
}

void adjustLED(uint8_t ch, int delta) {
  int newBrightness = currentBrightness[ch] + delta;
  newBrightness = constrain(newBrightness, 0, 4095);

  Serial.print(F("> LED "));
  Serial.print(ch);
  Serial.print(F(": "));
  Serial.print(currentBrightness[ch]);
  Serial.print(F(" -> "));
  Serial.println(newBrightness);

  setLED(ch, newBrightness);
}

void printBrightness() {
  Serial.println(F("=== BRIGHTNESS ==="));
  for (uint8_t ch = 0; ch < NUM_LEDS; ch++) {
    Serial.print(F("LED "));
    Serial.print(ch);
    Serial.print(F(": "));
    Serial.print(currentBrightness[ch]);
    Serial.print(F(" ("));
    Serial.print((currentBrightness[ch] * 100) / 4095);
    Serial.println(F("%)"));
  }
}

void printSelectedLED() {
  Serial.print(F("> Selected: LED "));
  Serial.print(selectedLED);
  Serial.print(F(" ("));
  Serial.print(currentBrightness[selectedLED]);
  Serial.println(F(")"));
}

void printStatus() {
  Serial.println(F("=== STATUS ==="));
  Serial.print(F("PCA9685: 0x"));
  Serial.println(PCA9685_ADDRESS, HEX);
  Serial.print(F("Detected: "));
  Serial.println(pca9685Detected ? F("YES") : F("NO"));
  Serial.print(F("PWM: "));
  Serial.print(PWM_FREQ);
  Serial.println(F("Hz"));
  Serial.print(F("Active LEDs: "));
  Serial.println(NUM_LEDS);
  Serial.println(F("Channels: 0-15"));
  Serial.print(F("Brightness: 0-4095"));
}

void printHelp() {
  Serial.println(F("=== COMMANDS ==="));
  Serial.println(F("Testing:"));
  Serial.println(F("  i - I2C scan"));
  Serial.println(F("  0-9 - Test LED channel"));
  Serial.println(F("  a - Test ALL LEDs"));
  Serial.println(F("  f - Fade sequence"));
  Serial.println(F("  p - Pulse test"));
  Serial.println(F("  b - Breathing test"));
  Serial.println();
  Serial.println(F("Control:"));
  Serial.println(F("  o - All OFF"));
  Serial.println(F("  n - All ON (max)"));
  Serial.println(F("  v - Show brightness"));
  Serial.println();
  Serial.println(F("Interactive:"));
  Serial.println(F("  < > - Select LED"));
  Serial.println(F("  + - - Adjust ±256"));
  Serial.println(F("  . , - Adjust ±16"));
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
