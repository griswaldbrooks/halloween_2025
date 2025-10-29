#!/usr/bin/env python3
"""
Unit tests for servo pulse width mapping - v2 (Per-Servo Ranges)

Tests verify that degree-to-PWM calculations are safe before uploading to hardware.
Each servo now has its own calibrated PWM range.
"""

import unittest
import json
from pathlib import Path


class TestServoPulseMapping(unittest.TestCase):
    """Test servo degree to PWM value mapping with per-servo ranges"""

    @classmethod
    def setUpClass(cls):
        """Load configuration"""
        config_path = Path(__file__).parent / 'animation-config.json'
        with open(config_path, 'r') as f:
            cls.config = json.load(f)

    def map_degrees_to_pulse(self, degrees, min_pulse, max_pulse):
        """
        Simulate Arduino map() function for 0-90° range
        map(value, fromLow, fromHigh, toLow, toHigh)
        """
        degrees = max(0, min(90, degrees))  # constrain to 0-90
        return int(min_pulse + (max_pulse - min_pulse) * degrees / 90)

    def test_right_elbow_zero_position(self):
        """Test that right elbow 0° maps to PWM 150"""
        hw = self.config['hardware']
        pulse = self.map_degrees_to_pulse(0, hw['right_leg']['elbow_min_pulse'],
                                           hw['right_leg']['elbow_max_pulse'])
        self.assertEqual(pulse, 150, "Right elbow 0° should map to PWM 150")

    def test_right_elbow_max_position(self):
        """Test that right elbow 90° maps to PWM 330"""
        hw = self.config['hardware']
        pulse = self.map_degrees_to_pulse(90, hw['right_leg']['elbow_min_pulse'],
                                           hw['right_leg']['elbow_max_pulse'])
        self.assertEqual(pulse, 330, "Right elbow 90° should map to PWM 330")

    def test_right_shoulder_zero_position(self):
        """Test that right shoulder 0° maps to PWM 150"""
        hw = self.config['hardware']
        pulse = self.map_degrees_to_pulse(0, hw['right_leg']['shoulder_min_pulse'],
                                           hw['right_leg']['shoulder_max_pulse'])
        self.assertEqual(pulse, 150, "Right shoulder 0° should map to PWM 150")

    def test_right_shoulder_max_position(self):
        """Test that right shoulder 90° maps to PWM 280"""
        hw = self.config['hardware']
        pulse = self.map_degrees_to_pulse(90, hw['right_leg']['shoulder_min_pulse'],
                                           hw['right_leg']['shoulder_max_pulse'])
        self.assertEqual(pulse, 280, "Right shoulder 90° should map to PWM 280")

    def test_left_shoulder_zero_position(self):
        """Test that left shoulder 0° maps to PWM 440 (inverted)"""
        hw = self.config['hardware']
        pulse = self.map_degrees_to_pulse(0, hw['left_leg']['shoulder_min_pulse'],
                                           hw['left_leg']['shoulder_max_pulse'])
        self.assertEqual(pulse, 440, "Left shoulder 0° should map to PWM 440")

    def test_left_shoulder_max_position(self):
        """Test that left shoulder 90° maps to PWM 300 (inverted)"""
        hw = self.config['hardware']
        pulse = self.map_degrees_to_pulse(90, hw['left_leg']['shoulder_min_pulse'],
                                           hw['left_leg']['shoulder_max_pulse'])
        self.assertEqual(pulse, 300, "Left shoulder 90° should map to PWM 300")

    def test_left_elbow_zero_position(self):
        """Test that left elbow 0° maps to PWM 530 (inverted)"""
        hw = self.config['hardware']
        pulse = self.map_degrees_to_pulse(0, hw['left_leg']['elbow_min_pulse'],
                                           hw['left_leg']['elbow_max_pulse'])
        self.assertEqual(pulse, 530, "Left elbow 0° should map to PWM 530")

    def test_left_elbow_max_position(self):
        """Test that left elbow 90° maps to PWM 360 (inverted)"""
        hw = self.config['hardware']
        pulse = self.map_degrees_to_pulse(90, hw['left_leg']['elbow_min_pulse'],
                                           hw['left_leg']['elbow_max_pulse'])
        self.assertEqual(pulse, 360, "Left elbow 90° should map to PWM 360")

    def test_pulse_width_ranges(self):
        """Test that min/max pulse values match calibrated hardware"""
        hw = self.config['hardware']

        # Right elbow: 150 (0°) to 330 (90°)
        self.assertEqual(hw['right_leg']['elbow_min_pulse'], 150)
        self.assertEqual(hw['right_leg']['elbow_max_pulse'], 330)

        # Right shoulder: 150 (0°) to 280 (90°)
        self.assertEqual(hw['right_leg']['shoulder_min_pulse'], 150)
        self.assertEqual(hw['right_leg']['shoulder_max_pulse'], 280)

        # Left shoulder: 440 (0°) to 300 (90°) - inverted
        self.assertEqual(hw['left_leg']['shoulder_min_pulse'], 440)
        self.assertEqual(hw['left_leg']['shoulder_max_pulse'], 300)

        # Left elbow: 530 (0°) to 360 (90°) - inverted
        self.assertEqual(hw['left_leg']['elbow_min_pulse'], 530)
        self.assertEqual(hw['left_leg']['elbow_max_pulse'], 360)

    def test_resting_animation_is_safe(self):
        """Test that resting animation uses small safe angles (0-15°)"""
        resting = self.config['animations']['resting']

        for kf in resting['keyframes']:
            self.assertGreaterEqual(kf['left_shoulder_deg'], 0,
                           "Resting left shoulder should be >= 0°")
            self.assertLessEqual(kf['left_shoulder_deg'], 15,
                           "Resting left shoulder should be <= 15°")
            self.assertGreaterEqual(kf['left_elbow_deg'], 0,
                           "Resting left elbow should be >= 0°")
            self.assertLessEqual(kf['left_elbow_deg'], 15,
                           "Resting left elbow should be <= 15°")
            self.assertGreaterEqual(kf['right_shoulder_deg'], 0,
                           "Resting right shoulder should be >= 0°")
            self.assertLessEqual(kf['right_shoulder_deg'], 15,
                           "Resting right shoulder should be <= 15°")
            self.assertGreaterEqual(kf['right_elbow_deg'], 0,
                           "Resting right elbow should be >= 0°")
            self.assertLessEqual(kf['right_elbow_deg'], 15,
                           "Resting right elbow should be <= 15°")

    def test_resting_animation_has_movement(self):
        """Test that resting animation has actual movement between keyframes"""
        resting = self.config['animations']['resting']
        keyframes = resting['keyframes']

        # Should have at least 2 keyframes
        self.assertGreaterEqual(len(keyframes), 2,
                               "Resting animation should have at least 2 keyframes")

        # Check if any values differ between first and middle keyframe
        first = keyframes[0]
        middle = keyframes[len(keyframes) // 2]

        has_movement = (
            first['left_shoulder_deg'] != middle['left_shoulder_deg'] or
            first['left_elbow_deg'] != middle['left_elbow_deg'] or
            first['right_shoulder_deg'] != middle['right_shoulder_deg'] or
            first['right_elbow_deg'] != middle['right_elbow_deg']
        )

        self.assertTrue(has_movement,
                       "Resting animation should have movement between keyframes")

    def test_animations_are_symmetric(self):
        """Test that all animations (except zero/max) are symmetric"""
        symmetric_animations = ['resting', 'slow_struggle', 'breaking_through', 'grasping']

        for anim_name in symmetric_animations:
            with self.subTest(animation=anim_name):
                anim = self.config['animations'][anim_name]

                for i, kf in enumerate(anim['keyframes']):
                    self.assertEqual(kf['left_shoulder_deg'], kf['right_shoulder_deg'],
                                   f"{anim_name} keyframe {i}: shoulders not symmetric")
                    self.assertEqual(kf['left_elbow_deg'], kf['right_elbow_deg'],
                                   f"{anim_name} keyframe {i}: elbows not symmetric")

    def test_slow_struggle_has_movement(self):
        """Test that slow_struggle animation has actual movement"""
        anim = self.config['animations']['slow_struggle']
        keyframes = anim['keyframes']

        # Should have multiple keyframes
        self.assertGreaterEqual(len(keyframes), 3,
                               "slow_struggle should have at least 3 keyframes")

        # Check that not all keyframes are identical
        first = keyframes[0]
        all_identical = all(
            kf['left_shoulder_deg'] == first['left_shoulder_deg'] and
            kf['left_elbow_deg'] == first['left_elbow_deg'] and
            kf['right_shoulder_deg'] == first['right_shoulder_deg'] and
            kf['right_elbow_deg'] == first['right_elbow_deg']
            for kf in keyframes
        )

        self.assertFalse(all_identical,
                        "slow_struggle should have varying keyframes")

    def test_breaking_through_has_movement(self):
        """Test that breaking_through animation has actual movement"""
        anim = self.config['animations']['breaking_through']
        keyframes = anim['keyframes']

        self.assertGreaterEqual(len(keyframes), 4,
                               "breaking_through should have at least 4 keyframes")

        # Check for variation
        angles = [kf['left_shoulder_deg'] for kf in keyframes]
        self.assertGreater(max(angles) - min(angles), 20,
                          "breaking_through should have significant shoulder movement")

    def test_grasping_has_movement(self):
        """Test that grasping animation has actual movement"""
        anim = self.config['animations']['grasping']
        keyframes = anim['keyframes']

        self.assertGreaterEqual(len(keyframes), 4,
                               "grasping should have at least 4 keyframes")

        # Check for variation
        angles = [kf['left_elbow_deg'] for kf in keyframes]
        self.assertGreater(max(angles) - min(angles), 20,
                          "grasping should have significant elbow movement")

    def test_animation_count(self):
        """Test that we have the expected number of animations"""
        # We have 7 animations: zero, max, resting, slow_struggle, breaking_through, grasping, stabbing
        self.assertEqual(len(self.config['animations']), 7,
                        "Should have 7 animations total")

    def test_all_keyframe_angles_in_range(self):
        """Test that all animation keyframes use valid 0-90° range"""
        for anim_name, anim in self.config['animations'].items():
            for i, kf in enumerate(anim['keyframes']):
                # Check all angles are 0-90
                self.assertGreaterEqual(kf['left_shoulder_deg'], 0,
                    f"{anim_name} keyframe {i}: left_shoulder_deg < 0")
                self.assertLessEqual(kf['left_shoulder_deg'], 90,
                    f"{anim_name} keyframe {i}: left_shoulder_deg > 90")

                self.assertGreaterEqual(kf['left_elbow_deg'], 0,
                    f"{anim_name} keyframe {i}: left_elbow_deg < 0")
                self.assertLessEqual(kf['left_elbow_deg'], 90,
                    f"{anim_name} keyframe {i}: left_elbow_deg > 90")

                self.assertGreaterEqual(kf['right_shoulder_deg'], 0,
                    f"{anim_name} keyframe {i}: right_shoulder_deg < 0")
                self.assertLessEqual(kf['right_shoulder_deg'], 90,
                    f"{anim_name} keyframe {i}: right_shoulder_deg > 90")

                self.assertGreaterEqual(kf['right_elbow_deg'], 0,
                    f"{anim_name} keyframe {i}: right_elbow_deg < 0")
                self.assertLessEqual(kf['right_elbow_deg'], 90,
                    f"{anim_name} keyframe {i}: right_elbow_deg > 90")

    def test_kinematics_angle_ranges(self):
        """Test that kinematic limits are correct (0-90°)"""
        kin = self.config['kinematics']

        self.assertEqual(kin['shoulder_min_angle'], 0, "Shoulder min should be 0°")
        self.assertEqual(kin['shoulder_max_angle'], 90, "Shoulder max should be 90°")
        self.assertEqual(kin['elbow_min_angle'], 0, "Elbow min should be 0°")
        self.assertEqual(kin['elbow_max_angle'], 90, "Elbow max should be 90°")

    def test_animation_names_fit_in_buffer(self):
        """Test that animation names don't exceed Arduino buffer size (PREVENTS BUFFER OVERFLOW)"""
        # Arduino code uses char name[64] for animation names
        MAX_NAME_LENGTH = 63  # 64 bytes - 1 for null terminator

        for anim_name, anim in self.config['animations'].items():
            name = anim['name']
            name_length = len(name)

            self.assertLessEqual(name_length, MAX_NAME_LENGTH,
                f"Animation '{anim_name}' name is {name_length} chars, exceeds buffer size {MAX_NAME_LENGTH}. "
                f"Name: '{name}'. This will cause buffer overflow and crash the Arduino!")


class TestServoChannels(unittest.TestCase):
    """Test servo channel assignments"""

    @classmethod
    def setUpClass(cls):
        """Load configuration"""
        config_path = Path(__file__).parent / 'animation-config.json'
        with open(config_path, 'r') as f:
            cls.config = json.load(f)

    def test_channel_assignments(self):
        """Test that channels match user's wiring"""
        hw = self.config['hardware']

        # User-specified wiring:
        # Channel 0 = Right Elbow
        # Channel 1 = Right Shoulder
        # Channel 14 = Left Shoulder
        # Channel 15 = Left Elbow

        self.assertEqual(hw['right_leg']['elbow_channel'], 0,
                        "Right elbow should be channel 0")
        self.assertEqual(hw['right_leg']['shoulder_channel'], 1,
                        "Right shoulder should be channel 1")
        self.assertEqual(hw['left_leg']['shoulder_channel'], 14,
                        "Left shoulder should be channel 14")
        self.assertEqual(hw['left_leg']['elbow_channel'], 15,
                        "Left elbow should be channel 15")


def run_tests():
    """Run all tests and report results"""
    loader = unittest.TestLoader()
    suite = unittest.TestSuite()

    suite.addTests(loader.loadTestsFromTestCase(TestServoPulseMapping))
    suite.addTests(loader.loadTestsFromTestCase(TestServoChannels))

    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)

    print("\n" + "="*70)
    if result.wasSuccessful():
        print("✅ ALL TESTS PASSED - Safe to upload to hardware")
        print("="*70)
        return 0
    else:
        print("❌ TESTS FAILED - DO NOT upload to hardware!")
        print(f"Failures: {len(result.failures)}")
        print(f"Errors: {len(result.errors)}")
        print("="*70)
        return 1


if __name__ == '__main__':
    exit(run_tests())
