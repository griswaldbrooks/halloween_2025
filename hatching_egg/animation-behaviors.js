// Animation Behaviors for Hatching Egg Spider
// Loads animations from animation-config.json

const AnimationBehaviors = {};

// Load animations from JSON
fetch('animation-config.json')
    .then(response => response.json())
    .then(config => {
        // Convert each animation from JSON to the format needed by preview
        for (const [animName, anim] of Object.entries(config.animations)) {
            AnimationBehaviors[animName] = {
                name: anim.name,
                duration: anim.duration_ms,
                loop: anim.loop,
                keyframes: anim.keyframes,
                getAngles: function(t, leg) {
                    // t is normalized time 0-1
                    const timeMs = t * this.duration;

                    // Find keyframes to interpolate between
                    let kf1, kf2;
                    for (let i = 0; i < this.keyframes.length - 1; i++) {
                        if (timeMs >= this.keyframes[i].time_ms && timeMs <= this.keyframes[i + 1].time_ms) {
                            kf1 = this.keyframes[i];
                            kf2 = this.keyframes[i + 1];
                            break;
                        }
                    }

                    // If we're past the last keyframe, use the last one
                    if (!kf1) {
                        kf1 = this.keyframes[this.keyframes.length - 1];
                        kf2 = kf1;
                    }

                    // Interpolate between keyframes
                    const t1 = kf1.time_ms;
                    const t2 = kf2.time_ms;
                    const blend = t1 === t2 ? 0 : (timeMs - t1) / (t2 - t1);

                    // Get shoulder and elbow angles for this leg
                    let shoulderDeg, elbowDeg;
                    if (leg.side === 'left') {
                        shoulderDeg = kf1.left_shoulder_deg + (kf2.left_shoulder_deg - kf1.left_shoulder_deg) * blend;
                        elbowDeg = kf1.left_elbow_deg + (kf2.left_elbow_deg - kf1.left_elbow_deg) * blend;
                    } else {
                        shoulderDeg = kf1.right_shoulder_deg + (kf2.right_shoulder_deg - kf1.right_shoulder_deg) * blend;
                        elbowDeg = kf1.right_elbow_deg + (kf2.right_elbow_deg - kf1.right_elbow_deg) * blend;
                    }

                    // Convert degrees to radians
                    return {
                        shoulder: shoulderDeg * Math.PI / 180,
                        elbow: elbowDeg * Math.PI / 180
                    };
                }
            };
        }

        // Trigger a redraw once animations are loaded
        if (window.animationsLoaded) {
            window.animationsLoaded();
        }
    })
    .catch(error => {
        console.error('Failed to load animations:', error);
    });
