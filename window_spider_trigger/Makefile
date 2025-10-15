# Spider Window Trigger - Makefile
# Simplified commands for arduino-cli

# Configuration (can be overridden)
FQBN ?= arduino:avr:leonardo
PORT ?= /dev/ttyACM0
SKETCH := arduino/motion_trigger/motion_trigger.ino

.PHONY: help install compile upload monitor clean flash test

help:
	@echo "Spider Window Trigger - Arduino CLI Commands"
	@echo ""
	@echo "Usage:"
	@echo "  make install    - Install Arduino CLI and dependencies"
	@echo "  make compile    - Compile Arduino sketch"
	@echo "  make upload     - Upload to Arduino"
	@echo "  make flash      - Compile and upload in one step"
	@echo "  make monitor    - Open serial monitor"
	@echo "  make test       - Send test command to Arduino"
	@echo "  make clean      - Clean build artifacts"
	@echo "  make detect     - Detect connected Arduino boards"
	@echo ""
	@echo "Current configuration:"
	@echo "  Board: $(FQBN)"
	@echo "  Port: $(PORT)"

install:
	@echo "Installing arduino-cli..."
	@if ! command -v arduino-cli &> /dev/null; then \
		curl -fsSL https://raw.githubusercontent.com/arduino/arduino-cli/master/install.sh | sh; \
		echo ""; \
		echo "Add to PATH: export PATH=\$$PATH:\$$HOME/bin"; \
	else \
		echo "arduino-cli already installed"; \
	fi
	@echo ""
	@echo "Setting up Arduino core..."
	arduino-cli config init
	arduino-cli core update-index
	arduino-cli core install arduino:avr
	@echo "✓ Installation complete"

detect:
	@echo "Detecting connected boards..."
	arduino-cli board list

compile:
	@echo "Compiling $(SKETCH)..."
	arduino-cli compile --fqbn $(FQBN) $(SKETCH)
	@echo "✓ Compilation complete"

upload:
	@echo "Uploading to $(PORT)..."
	arduino-cli upload -p $(PORT) --fqbn $(FQBN) $(SKETCH)
	@echo "✓ Upload complete"

flash: compile upload
	@echo "✓ Flash complete"

monitor:
	@echo "Opening serial monitor on $(PORT) (Ctrl+C to exit)..."
	arduino-cli monitor -p $(PORT) -c baudrate=9600

test:
	@echo "Sending TEST command to Arduino..."
	@echo "TEST" > $(PORT)

clean:
	@echo "Cleaning build artifacts..."
	@rm -rf arduino/motion_trigger/build/
	@echo "✓ Clean complete"

# Quick shortcuts
c: compile
u: upload
f: flash
m: monitor
d: detect
