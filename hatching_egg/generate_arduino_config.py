#!/usr/bin/env python3
"""
Generate Arduino configuration header from animation-config.json
This ensures Arduino code uses the exact same parameters as the JavaScript preview.
"""

import json
import sys
from pathlib import Path

def generate_arduino_header(config_path, output_path):
    """Generate Arduino header file from JSON config."""

    with open(config_path, 'r') as f:
        config = json.load(f)

    header_lines = [
        "// AUTO-GENERATED - DO NOT EDIT",
        "// Generated from animation-config.json",
        "// Run: pixi run generate-config",
        "",
        "#ifndef ANIMATION_CONFIG_H",
        "#define ANIMATION_CONFIG_H",
        "",
        "// Hardware Configuration",
    ]

    # Hardware config
    hw = config['hardware']
    header_lines.extend([
        f"#define I2C_ADDRESS {hw['i2c_address']}",
        f"#define SERVO_FREQ {hw['servo_frequency']}",
        "",
        "// Left Leg Servos",
        f"#define LEFT_SHOULDER_CHANNEL {hw['left_leg']['shoulder_channel']}",
        f"#define LEFT_ELBOW_CHANNEL {hw['left_leg']['elbow_channel']}",
        f"#define LEFT_SHOULDER_MIN_PULSE {hw['left_leg']['shoulder_min_pulse']}",
        f"#define LEFT_SHOULDER_MAX_PULSE {hw['left_leg']['shoulder_max_pulse']}",
        f"#define LEFT_ELBOW_MIN_PULSE {hw['left_leg']['elbow_min_pulse']}",
        f"#define LEFT_ELBOW_MAX_PULSE {hw['left_leg']['elbow_max_pulse']}",
        "",
        "// Right Leg Servos",
        f"#define RIGHT_SHOULDER_CHANNEL {hw['right_leg']['shoulder_channel']}",
        f"#define RIGHT_ELBOW_CHANNEL {hw['right_leg']['elbow_channel']}",
        f"#define RIGHT_SHOULDER_MIN_PULSE {hw['right_leg']['shoulder_min_pulse']}",
        f"#define RIGHT_SHOULDER_MAX_PULSE {hw['right_leg']['shoulder_max_pulse']}",
        f"#define RIGHT_ELBOW_MIN_PULSE {hw['right_leg']['elbow_min_pulse']}",
        f"#define RIGHT_ELBOW_MAX_PULSE {hw['right_leg']['elbow_max_pulse']}",
        "",
        f"#define TRIGGER_PIN {hw['trigger_pin']}",
        "",
    ])

    # Kinematics
    kin = config['kinematics']
    header_lines.extend([
        "// Kinematics",
        f"#define UPPER_SEGMENT_LENGTH {kin['upper_segment_length']}",
        f"#define LOWER_SEGMENT_LENGTH {kin['lower_segment_length']}",
        f"#define SHOULDER_MIN_ANGLE {kin['shoulder_min_angle']}",
        f"#define SHOULDER_MAX_ANGLE {kin['shoulder_max_angle']}",
        f"#define ELBOW_MIN_ANGLE {kin['elbow_min_angle']}",
        f"#define ELBOW_MAX_ANGLE {kin['elbow_max_angle']}",
        "",
    ])

    # Animation structures
    header_lines.extend([
        "// Animation Keyframe Structure",
        "struct Keyframe {",
        "  unsigned long time_ms;",
        "  int left_shoulder_deg;",
        "  int left_elbow_deg;",
        "  int right_shoulder_deg;",
        "  int right_elbow_deg;",
        "};",
        "",
        "struct Animation {",
        "  const char* name;",
        "  unsigned long duration_ms;",
        "  bool loop;",
        "  int keyframe_count;",
        "  const Keyframe* keyframes;",
        "};",
        "",
    ])

    # Generate animation name strings
    animations = config['animations']
    for anim_id, anim in animations.items():
        header_lines.append(f"const char {anim_id.upper()}_NAME[] PROGMEM = \"{anim['name']}\";")
    header_lines.append("")

    # Generate keyframes for each animation
    for anim_id, anim in animations.items():
        header_lines.append(f"// {anim['name']}")
        header_lines.append(f"const Keyframe {anim_id.upper()}_KEYFRAMES[] PROGMEM = {{")

        for kf in anim['keyframes']:
            header_lines.append(
                f"  {{{kf['time_ms']}, {kf['left_shoulder_deg']}, {kf['left_elbow_deg']}, "
                f"{kf['right_shoulder_deg']}, {kf['right_elbow_deg']}}},"
            )

        header_lines.append("};")
        header_lines.append("")

    # Animation array
    header_lines.extend([
        "// Animation Definitions",
        "const Animation ANIMATIONS[] PROGMEM = {",
    ])

    for anim_id, anim in animations.items():
        loop_str = "true" if anim['loop'] else "false"
        kf_count = len(anim['keyframes'])
        header_lines.append(
            f"  {{{anim_id.upper()}_NAME, {anim['duration_ms']}, {loop_str}, "
            f"{kf_count}, {anim_id.upper()}_KEYFRAMES}},"
        )

    header_lines.extend([
        "};",
        "",
        f"#define ANIMATION_COUNT {len(animations)}",
        f"#define DEFAULT_ANIMATION 1  // {config['default_animation']}",
        "",
        "#endif // ANIMATION_CONFIG_H",
        ""
    ])

    # Write output
    output = "\n".join(header_lines)
    with open(output_path, 'w') as f:
        f.write(output)

    print(f"✓ Generated {output_path}")
    print(f"  - {len(animations)} animations")
    print(f"  - {sum(len(a['keyframes']) for a in animations.values())} total keyframes")

if __name__ == '__main__':
    config_path = Path(__file__).parent / 'animation-config.json'
    output_path = Path(__file__).parent / 'arduino' / 'hatching_egg' / 'animation_config.h'

    # Create arduino directory if needed
    output_path.parent.mkdir(parents=True, exist_ok=True)

    generate_arduino_header(config_path, output_path)
