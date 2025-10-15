/*
 * Spider Window Scare - Switch Trigger
 *
 * Detects when a momentary switch is pressed (e.g., when guest picks up object)
 * and sends trigger signal to computer via serial connection.
 *
 * Hardware:
 *   - DFRobot Beetle (DFR0282) - Leonardo compatible
 *   - Momentary Switch (Normally Open)
 *     One terminal -> Digital Pin 9
 *     Other terminal -> GND
 *   - Internal pull-up resistor used (INPUT_PULLUP)
 *
 * Serial Output:
 *   Sends "TRIGGER" when switch pressed
 *   Sends "READY" on startup
 */

// Configuration
const int SWITCH_PIN = 9;         // Momentary switch pin (Pin 9 for Beetle compatibility)
const int LED_PIN = 13;           // Built-in LED for visual feedback
const long DEBOUNCE_DELAY = 50;   // Debounce delay for switch (ms)
const long COOLDOWN_DELAY = 3000; // Cooldown between triggers (ms)
const int BAUD_RATE = 9600;       // Serial communication speed

// State variables
unsigned long lastTriggerTime = 0;
unsigned long lastDebounceTime = 0;
bool switchState = HIGH;          // HIGH = not pressed (pull-up)
bool lastSwitchState = HIGH;
bool switchPressed = false;

void setup() {
  // Initialize serial communication
  Serial.begin(BAUD_RATE);

  // Initialize pins
  pinMode(SWITCH_PIN, INPUT_PULLUP); // Enable internal pull-up resistor
  pinMode(LED_PIN, OUTPUT);

  // Visual feedback during startup
  for (int i = 0; i < 3; i++) {
    digitalWrite(LED_PIN, HIGH);
    delay(200);
    digitalWrite(LED_PIN, LOW);
    delay(200);
  }

  Serial.println("STARTUP");
  Serial.println("Switch trigger ready");
  Serial.println("Press switch to trigger scare");

  Serial.println("READY");
  digitalWrite(LED_PIN, HIGH);
  delay(500);
  digitalWrite(LED_PIN, LOW);
}

void loop() {
  // Read switch state (LOW = pressed, HIGH = not pressed due to pull-up)
  int reading = digitalRead(SWITCH_PIN);
  unsigned long currentTime = millis();

  // Debounce the switch
  if (reading != lastSwitchState) {
    lastDebounceTime = currentTime;
  }

  if ((currentTime - lastDebounceTime) > DEBOUNCE_DELAY) {
    // Switch state has been stable for debounce period
    if (reading != switchState) {
      switchState = reading;

      // Check if switch was just pressed (went from HIGH to LOW)
      if (switchState == LOW && !switchPressed) {
        // Switch pressed!

        // Check if enough time has passed since last trigger (cooldown)
        if (currentTime - lastTriggerTime > COOLDOWN_DELAY) {
          // Send trigger signal
          Serial.println("TRIGGER");

          // Visual feedback
          digitalWrite(LED_PIN, HIGH);

          // Update last trigger time
          lastTriggerTime = currentTime;

          // Mark as pressed
          switchPressed = true;

          // Debug info
          Serial.print("Switch pressed at: ");
          Serial.print(currentTime / 1000);
          Serial.println(" seconds");
        } else {
          // Still in cooldown period
          Serial.println("COOLDOWN");
          unsigned long timeRemaining = COOLDOWN_DELAY - (currentTime - lastTriggerTime);
          Serial.print("Wait ");
          Serial.print(timeRemaining / 1000);
          Serial.println(" more seconds");
        }
      } else if (switchState == HIGH && switchPressed) {
        // Switch released
        digitalWrite(LED_PIN, LOW);
        switchPressed = false;
        Serial.println("SWITCH_RELEASED");
      }
    }
  }

  // Update state
  lastSwitchState = reading;

  // Small delay for stability
  delay(10);
}

/*
 * Serial Commands:
 *
 * Send these commands from computer to Arduino:
 *   "STATUS"  - Get current switch state
 *   "RESET"   - Reset cooldown timer
 *   "TEST"    - Manual trigger (for testing)
 */

void serialEvent() {
  while (Serial.available()) {
    String command = Serial.readStringUntil('\n');
    command.trim();

    if (command == "STATUS") {
      Serial.print("Switch: ");
      Serial.println(switchState == LOW ? "PRESSED" : "RELEASED");
      Serial.print("Cooldown: ");
      unsigned long timeSinceTrigger = millis() - lastTriggerTime;
      if (timeSinceTrigger < COOLDOWN_DELAY) {
        Serial.print(COOLDOWN_DELAY - timeSinceTrigger);
        Serial.println(" ms remaining");
      } else {
        Serial.println("Ready");
      }
    } else if (command == "RESET") {
      lastTriggerTime = 0;
      Serial.println("Cooldown reset");
    } else if (command == "TEST") {
      Serial.println("TRIGGER");
      Serial.println("Manual test trigger");
    }
  }
}
