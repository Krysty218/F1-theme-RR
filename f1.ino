const int buttonPins[] = {2, 3, 4, 5}; // Pins for Buttons 1, 2, 3, and 4
int selectedButtonPin;                 // Pin for the randomly selected button
bool timingStarted = false;
unsigned long startTime = 0;

void setup() {
  // Configure button pins as input with pull-up resistors
  for (int i = 0; i < 4; i++) {
    pinMode(buttonPins[i], INPUT_PULLUP);
  }

  Serial.begin(9600); // Start serial communication
}

void loop() {
  // Wait for a "start" signal from the server
  if (Serial.available()) {
    String message = Serial.readStringUntil('\n');

    if (message.startsWith("start:")) {
      int buttonIndex = message.substring(6).toInt() - 1; // Convert to array index (1-based to 0-based)
      if (buttonIndex >= 0 && buttonIndex < 4) {          // Ensure valid index
        selectedButtonPin = buttonPins[buttonIndex];
        timingStarted = true;
        startTime = millis(); // Start timing
      }
    }
  }

  // Check if the selected button is pressed
  if (timingStarted && digitalRead(selectedButtonPin) == LOW) {
    unsigned long reactionTime = millis() - startTime;
    Serial.println("reaction_time:" + String(reactionTime)); // Send the reaction time
    timingStarted = false;                                  // Reset for the next round
  }
}
