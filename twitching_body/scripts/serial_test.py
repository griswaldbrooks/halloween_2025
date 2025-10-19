#!/usr/bin/env python3
"""
Serial test script for servo test code
Reads output and sends test commands
"""

import serial
import time
import sys

PORT = '/dev/ttyACM0'
BAUD = 9600
TIMEOUT = 2

def test_serial():
    print("Opening serial port...")
    try:
        ser = serial.Serial(PORT, BAUD, timeout=TIMEOUT)
        time.sleep(2)  # Wait for Arduino reset

        print("\n=== Reading startup output ===")
        start_time = time.time()
        while time.time() - start_time < 5:
            if ser.in_waiting:
                line = ser.readline().decode('utf-8', errors='ignore').strip()
                if line:
                    print(line)

        print("\n=== Sending 'i' command (I2C scan) ===")
        ser.write(b'i')
        time.sleep(2)
        while ser.in_waiting:
            line = ser.readline().decode('utf-8', errors='ignore').strip()
            if line:
                print(line)

        print("\n=== Sending 's' command (status) ===")
        ser.write(b's')
        time.sleep(1)
        while ser.in_waiting:
            line = ser.readline().decode('utf-8', errors='ignore').strip()
            if line:
                print(line)

        print("\n=== Sending 'h' command (help) ===")
        ser.write(b'h')
        time.sleep(1)
        while ser.in_waiting:
            line = ser.readline().decode('utf-8', errors='ignore').strip()
            if line:
                print(line)

        ser.close()
        print("\n=== Test complete ===")
        return True

    except serial.SerialException as e:
        print(f"Error: {e}")
        return False
    except KeyboardInterrupt:
        print("\nInterrupted")
        return False

if __name__ == '__main__':
    success = test_serial()
    sys.exit(0 if success else 1)
