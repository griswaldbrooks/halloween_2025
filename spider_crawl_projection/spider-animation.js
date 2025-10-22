// Spider Animation V2 - Proper kinematics + body model
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Load dependencies
const scripts = ['leg-kinematics.js', 'spider-model.js'];
scripts.forEach(src => {
    const script = document.createElement('script');
    script.src = src;
    document.head.appendChild(script);
});

// Configuration
let config = {
    spiderCount: 5,
    spiderSpeed: 1.0,
    spiderSize: 1.0,
    paused: false,
    animationMode: 'procedural' // 'keyframe', 'procedural', or 'hopping'
};

// Animation state
let spiders = [];
let animationId = null;
let keyframeAnimation = null; // Will load from keyframe-animation.json

// FPS tracking
let fps = 0;
let frameCount = 0;
let lastFpsUpdate = Date.now();

// Load keyframe animation
fetch('keyframe-animation.json')
    .then(response => response.json())
    .then(data => {
        keyframeAnimation = data;
        console.log('✅ Loaded keyframe animation:', data.name);
        console.log('   Keyframes:', data.keyframes.length);
        console.log('   Duration:', data.duration + 'ms');
    })
    .catch(err => {
        console.warn('⚠️ Could not load keyframe animation, using default positions');
    });

// Resize canvas to window
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    resetSpiders();
}

// Spider class with proper kinematics
// User's verified non-intersecting foot positions (relative to body center, bodySize=100)
const CUSTOM_FOOT_POSITIONS = [
    { x: 160.2, y: 100.2 },  // Leg 0
    { x: 160.2, y: -100.2 }, // Leg 1
    { x: 115.2, y: 130.4 },  // Leg 2
    { x: 115.2, y: -130.4 }, // Leg 3
    { x: -60.2, y: 130.4 },  // Leg 4
    { x: -60.2, y: -130.4 }, // Leg 5
    { x: -100.2, y: 100.2 }, // Leg 6
    { x: -100.2, y: -100.2 } // Leg 7
];

class Spider {
    constructor(index) {
        this.index = index;
        this.reset();
    }

    reset() {
        // Position
        this.x = -50;
        this.y = Math.random() * canvas.height;
        this.vx = 0.5 + Math.random() * 1.5;
        this.vy = (Math.random() - 0.5) * 0.3;

        // Body model
        this.bodySize = (8 + Math.random() * 8) * config.spiderSize;
        this.body = new SpiderBody(this.bodySize);

        // Animation state
        this.animationTime = Math.random() * 1000; // Keyframe animation time
        this.gaitPhase = 0;           // Procedural gait phase (0-5)
        this.gaitTimer = 0;           // Procedural phase timer
        this.stepProgress = 0;        // Procedural step progress (0-1)

        // Hopping state
        this.hopPhase = Math.floor(Math.random() * 5); // Start at random phase
        this.hopTimer = Math.random() * 200;           // Random offset in phase
        this.hopProgress = 0;
        this.hopStartX = 0;
        this.hopTargetX = 0;
        this.crawlCyclesRemaining = Math.floor(Math.random() * 13) + 1; // 1-13 crawl cycles between hops
        this.crawlPhase = 0;
        this.crawlTimer = 0;

        // Create 8 legs using body model
        this.legs = [];
        const groupA = [1, 2, 5, 6]; // L1, R2, L3, R4

        for (let i = 0; i < 8; i++) {
            const attachment = this.body.getAttachment(i);

            // TOP-DOWN VIEW: Elbow bias determines which IK solution (knee position)
            // Load pattern from keyframe animation if available, otherwise use default
            const defaultPattern = [-1, 1, -1, 1, 1, -1, 1, -1];
            const elbowBiasPattern = keyframeAnimation?.elbowBiasPattern || defaultPattern;
            const elbowBias = elbowBiasPattern[i];

            const leg = new Leg2D({
                attachX: attachment.x,
                attachY: attachment.y,
                upperLength: this.body.legUpperLength,
                lowerLength: this.body.legLowerLength,
                side: attachment.side,
                baseAngle: attachment.baseAngle,
                elbowBias: elbowBias
            });

            leg.index = i; // Track which leg this is (0-7)
            leg.group = groupA.includes(i) ? 'A' : 'B';
            leg.pairIndex = attachment.pair;
            leg.baseAngle = attachment.baseAngle;
            leg.worldFootX = 0;
            leg.worldFootY = 0;

            this.legs.push(leg);
        }

        this.initializeLegPositions();
        this.color = '#000000';
    }

    initializeLegPositions() {
        // Scale custom positions based on spider's actual body size
        const scale = this.bodySize / 100;

        for (let i = 0; i < this.legs.length; i++) {
            const leg = this.legs[i];
            const relPos = CUSTOM_FOOT_POSITIONS[i];

            // Scale and position relative to this spider's center
            leg.worldFootX = this.x + relPos.x * scale;
            leg.worldFootY = this.y + relPos.y * scale;
        }
    }

    update() {
        if (config.paused) return;

        const speedMultiplier = config.spiderSpeed;
        const dt = 16.67; // ~60fps

        if (config.animationMode === 'keyframe') {
            this.updateKeyframe(dt, speedMultiplier);
        } else if (config.animationMode === 'hopping') {
            this.updateHopping(dt, speedMultiplier);
        } else {
            this.updateProcedural(dt, speedMultiplier);
        }

        // Common movement and wrapping
        if (this.y < 0 || this.y > canvas.height) {
            this.vy *= -1;
            this.y = Math.max(0, Math.min(canvas.height, this.y));
        }

        if (this.x > canvas.width + 50) {
            this.x = -50;
            this.y = Math.random() * canvas.height;
            this.initializeLegPositions();
        }
    }

    updateKeyframe(dt, speedMultiplier) {
        if (!keyframeAnimation) return; // Wait for keyframes to load

        // Store previous time to calculate body movement
        const prevTime = this.animationTime;

        // Advance animation time
        this.animationTime += dt * speedMultiplier;

        // Loop the animation
        const duration = keyframeAnimation.duration;
        if (this.animationTime >= duration) {
            // When looping, calculate the delta across the boundary
            const deltaBeforeLoop = duration - prevTime;
            const deltaAfterLoop = this.animationTime - duration;

            // Apply movement from both segments
            this.applyBodyMovementFromKeyframes(prevTime, duration, speedMultiplier);
            this.animationTime = 0;
            this.applyBodyMovementFromKeyframes(0, deltaAfterLoop, speedMultiplier);
        } else {
            // Normal case: calculate body movement from leg changes
            this.applyBodyMovementFromKeyframes(prevTime, this.animationTime, speedMultiplier);
        }

        // Interpolate leg positions from keyframes
        this.interpolateKeyframes(this.animationTime);

        // Small lateral drift
        this.y += this.vy * speedMultiplier;
    }

    applyBodyMovementFromKeyframes(startTime, endTime, speedMultiplier) {
        // CORRECT APPROACH: Divide the cycle into swing and stance phases
        // - During SWING: feet move in body coords, body stays still in world
        // - During STANCE: feet stay in body coords, body moves in world
        // Since keyframes are body-relative and planted feet don't move in body coords,
        // we need to move the body to compensate!

        const { before: startBefore, after: startAfter, t: startT } = this.getKeyframesAtTime(startTime);
        const { before: endBefore, after: endAfter, t: endT } = this.getKeyframesAtTime(endTime);

        const startPose = this.interpolatePose(startBefore, startAfter, startT);
        const endPose = this.interpolatePose(endBefore, endAfter, endT);

        const velocityThreshold = 5.0;

        let plantedDeltaX = 0; // How much planted feet moved in body coords
        let plantedCount = 0;
        let swingingDeltaX = 0;
        let swingingCount = 0;

        for (let i = 0; i < 8; i++) {
            const deltaX = endPose[i].x - startPose[i].x;
            const deltaY = endPose[i].y - startPose[i].y;
            const velocity = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

            if (velocity < velocityThreshold) {
                // PLANTED: foot stays at same body-relative position
                // In world space, this means body is moving relative to foot
                plantedDeltaX += deltaX;
                plantedCount++;
            } else {
                // SWINGING: foot is moving in body coords
                swingingDeltaX += deltaX;
                swingingCount++;
            }
        }

        // Debug logging
        if (this.debugCounter === undefined) this.debugCounter = 0;
        if (this.debugCounter % 60 === 0 && this.index === 0) {
            console.log(`[Keyframe Debug] Time: ${startTime.toFixed(0)}→${endTime.toFixed(0)}ms`);
            console.log(`  Planted: ${plantedCount}/8, AvgΔX: ${plantedCount > 0 ? (plantedDeltaX/plantedCount).toFixed(2) : 'N/A'}`);
            console.log(`  Swinging: ${swingingCount}/8, AvgΔX: ${swingingCount > 0 ? (swingingDeltaX/swingingCount).toFixed(2) : 'N/A'}`);
        }
        this.debugCounter++;

        const scale = this.bodySize / 100;
        let bodyMovement = 0;

        // Use a hybrid approach: prefer planted feet, but use swinging if no planted
        if (plantedCount >= 4) {
            // Enough planted feet - they define the reference frame
            // If planted feet don't move in body coords (deltaX = 0),
            // body doesn't move in world coords during this frame
            // If planted feet DO move slightly, compensate
            const avgPlantedDeltaX = plantedDeltaX / plantedCount;
            bodyMovement = avgPlantedDeltaX * scale;
        } else if (swingingCount > 0) {
            // Mostly swinging - use swing motion with reduced factor
            const avgSwingingDeltaX = swingingDeltaX / swingingCount;
            bodyMovement = avgSwingingDeltaX * scale * 0.3; // Much smaller factor during swing
        }

        if (this.debugCounter % 60 === 0 && this.index === 0) {
            console.log(`  Body movement: ${bodyMovement.toFixed(4)}`);
        }

        this.x += bodyMovement;
    }

    getKeyframesAtTime(time) {
        const keyframes = keyframeAnimation.keyframes;
        if (keyframes.length === 0) return { before: null, after: null, t: 0 };
        if (keyframes.length === 1) return { before: keyframes[0], after: keyframes[0], t: 0 };

        let beforeKf = keyframes[0];
        let afterKf = keyframes[keyframes.length - 1];

        for (let i = 0; i < keyframes.length - 1; i++) {
            if (keyframes[i].time <= time && keyframes[i + 1].time >= time) {
                beforeKf = keyframes[i];
                afterKf = keyframes[i + 1];
                break;
            }
        }

        const duration = afterKf.time - beforeKf.time;
        const elapsed = time - beforeKf.time;
        const t = duration > 0 ? elapsed / duration : 0;

        return { before: beforeKf, after: afterKf, t };
    }

    interpolatePose(keyframe1, keyframe2, t) {
        const result = [];
        for (let i = 0; i < 8; i++) {
            result.push({
                x: keyframe1.legs[i].x + (keyframe2.legs[i].x - keyframe1.legs[i].x) * t,
                y: keyframe1.legs[i].y + (keyframe2.legs[i].y - keyframe1.legs[i].y) * t
            });
        }
        return result;
    }

    updateProcedural(dt, speedMultiplier) {
        // Gait timing (6-phase alternating tetrapod)
        const phaseDurations = [200, 150, 100, 200, 150, 100]; // ms

        this.gaitTimer += dt * speedMultiplier;

        if (this.gaitTimer >= phaseDurations[this.gaitPhase]) {
            this.gaitTimer = 0;
            this.gaitPhase = (this.gaitPhase + 1) % 6;
            this.stepProgress = 0;
        }

        this.stepProgress = this.gaitTimer / phaseDurations[this.gaitPhase];

        // Update legs based on gait phase
        for (const leg of this.legs) {
            this.updateLegProcedural(leg);
        }

        // Body movement during lurch phases
        if (this.gaitPhase === 1 || this.gaitPhase === 4) {
            const lurchDistance = this.bodySize * 0.4;
            const lurchDelta = (lurchDistance / phaseDurations[this.gaitPhase]) * dt * speedMultiplier;

            this.x += lurchDelta;
            this.y += this.vy * speedMultiplier;
        }
    }

    interpolateKeyframes(time) {
        const keyframes = keyframeAnimation.keyframes;
        if (keyframes.length === 0) return;
        if (keyframes.length === 1) {
            // Only one keyframe, use it directly
            this.applyKeyframe(keyframes[0]);
            return;
        }

        // Find surrounding keyframes
        let beforeKf = keyframes[0];
        let afterKf = keyframes[keyframes.length - 1];

        for (let i = 0; i < keyframes.length - 1; i++) {
            if (keyframes[i].time <= time && keyframes[i + 1].time >= time) {
                beforeKf = keyframes[i];
                afterKf = keyframes[i + 1];
                break;
            }
        }

        // Calculate interpolation factor
        const duration = afterKf.time - beforeKf.time;
        const elapsed = time - beforeKf.time;
        const t = duration > 0 ? elapsed / duration : 0;

        // Interpolate each leg position
        const scale = this.bodySize / 100; // Scale from reference size (100) to actual size

        for (let i = 0; i < 8; i++) {
            const before = beforeKf.legs[i];
            const after = afterKf.legs[i];

            // Linear interpolation
            const interpX = before.x + (after.x - before.x) * t;
            const interpY = before.y + (after.y - before.y) * t;

            // Apply to world position (scaled and offset by spider position)
            this.legs[i].worldFootX = this.x + interpX * scale;
            this.legs[i].worldFootY = this.y + interpY * scale;
        }
    }

    applyKeyframe(keyframe) {
        const scale = this.bodySize / 100;

        for (let i = 0; i < 8; i++) {
            const legPos = keyframe.legs[i];
            this.legs[i].worldFootX = this.x + legPos.x * scale;
            this.legs[i].worldFootY = this.y + legPos.y * scale;
        }
    }

    updateLegProcedural(leg) {
        const isSwinging = (this.gaitPhase === 0 && leg.group === 'A') ||
                          (this.gaitPhase === 3 && leg.group === 'B');

        if (isSwinging) {
            // SWING: Foot swings forward in TOP-DOWN view (X-Y plane)
            const scale = this.bodySize / 100;
            const relPos = CUSTOM_FOOT_POSITIONS[leg.index];

            // Predict where body will be after the upcoming lurch phase
            const lurchDistance = this.bodySize * 0.4;
            const futureBodyX = this.x + lurchDistance;

            // Calculate swing target
            const swingTargetX = futureBodyX + relPos.x * scale;
            const swingTargetY = this.y + relPos.y * scale;

            // Store swing start position at beginning of swing
            if (this.stepProgress === 0 || !leg.swingStartX) {
                leg.swingStartX = leg.worldFootX;
                leg.swingStartY = leg.worldFootY;
            }

            // Interpolate from start to target
            leg.worldFootX = leg.swingStartX + (swingTargetX - leg.swingStartX) * this.stepProgress;
            leg.worldFootY = leg.swingStartY + (swingTargetY - leg.swingStartY) * this.stepProgress;
        } else {
            // STANCE: Foot stays fixed in world space
            leg.swingStartX = null;
            leg.swingStartY = null;
        }
    }

    updateHopping(dt, speedMultiplier) {
        // Hopping gait with crawling in between
        // Phase 4 is now "crawl mode" - spider crawls for 1-13 cycles before next hop
        const hopPhaseDurations = [100, 200, 60, 200]; // Crouch, Takeoff (longer!), Flight, Landing (longer!)
        const crawlPhaseDurations = [200, 150, 100, 200, 150, 100]; // Same as procedural gait

        if (this.hopPhase === 4) {
            // CRAWL MODE: Use procedural gait
            this.crawlTimer += dt * speedMultiplier;

            if (this.crawlTimer >= crawlPhaseDurations[this.crawlPhase]) {
                this.crawlTimer = 0;
                this.crawlPhase = (this.crawlPhase + 1) % 6;

                // Completed one crawl cycle?
                if (this.crawlPhase === 0) {
                    this.crawlCyclesRemaining--;
                    if (this.crawlCyclesRemaining <= 0) {
                        // Done crawling, prepare to hop again
                        this.hopPhase = 0;
                        this.hopTimer = 0;
                        this.crawlCyclesRemaining = Math.floor(Math.random() * 13) + 1; // New random count
                    }
                }
            }

            const stepProgress = this.crawlTimer / crawlPhaseDurations[this.crawlPhase];

            // Update legs using procedural crawl
            for (const leg of this.legs) {
                this.updateLegProceduralForHopping(leg, this.crawlPhase, stepProgress);
            }

            // Body movement during crawl lurch phases
            if (this.crawlPhase === 1 || this.crawlPhase === 4) {
                const lurchDistance = this.bodySize * 0.4;
                const lurchDelta = (lurchDistance / crawlPhaseDurations[this.crawlPhase]) * dt * speedMultiplier;
                this.x += lurchDelta;
                this.y += this.vy * speedMultiplier;
            }

        } else {
            // HOP MODE: Phases 0-3
            this.hopTimer += dt * speedMultiplier;

            if (this.hopTimer >= hopPhaseDurations[this.hopPhase]) {
                this.hopTimer = 0;
                this.hopPhase = (this.hopPhase + 1) % 4;
                this.hopProgress = 0;

                // Initialize hop distance at start of takeoff
                if (this.hopPhase === 1) {
                    this.hopStartX = this.x;
                    // Hop distance: 6-10x body size for very dramatic jumps!
                    this.hopTargetX = this.x + (this.bodySize * (6.0 + Math.random() * 4.0));
                }

                // After landing, switch to crawl mode
                if (this.hopPhase === 0) {
                    this.hopPhase = 4;
                    this.crawlPhase = 0;
                    this.crawlTimer = 0;
                }
            }

            this.hopProgress = this.hopTimer / hopPhaseDurations[this.hopPhase];

            // Update legs based on hop phase
            for (const leg of this.legs) {
                this.updateLegHopping(leg);
            }

            // Body movement during flight phase
            if (this.hopPhase === 2) {
                const hopDistance = this.hopTargetX - this.hopStartX;
                const hopDelta = (hopDistance / hopPhaseDurations[2]) * dt * speedMultiplier;
                this.x += hopDelta;
                this.y += this.vy * speedMultiplier;
            }
        }
    }

    updateLegHopping(leg) {
        const scale = this.bodySize / 100;
        const relPos = CUSTOM_FOOT_POSITIONS[leg.index];

        // Back legs are pairs 2 and 3 (indices 4,5,6,7)
        const isBackLeg = leg.index >= 4;

        if (this.hopPhase === 0) {
            // CROUCH: Legs draw in slightly (0.8x normal reach)
            const crouchFactor = 0.8;
            const targetX = this.x + relPos.x * scale * crouchFactor;
            const targetY = this.y + relPos.y * scale * crouchFactor;

            // Smooth transition into crouch
            leg.worldFootX += (targetX - leg.worldFootX) * 0.3;
            leg.worldFootY += (targetY - leg.worldFootY) * 0.3;

        } else if (this.hopPhase === 1) {
            // TAKEOFF: Back legs extend, front legs retract
            if (isBackLeg) {
                // Back legs push out (1.2x reach)
                const pushFactor = 1.2;
                const targetX = this.x + relPos.x * scale * pushFactor;
                const targetY = this.y + relPos.y * scale * pushFactor;
                leg.worldFootX += (targetX - leg.worldFootX) * 0.5;
                leg.worldFootY += (targetY - leg.worldFootY) * 0.5;
            } else {
                // Front legs tuck in (0.5x reach)
                const tuckFactor = 0.5;
                const targetX = this.x + relPos.x * scale * tuckFactor;
                const targetY = this.y + relPos.y * scale * tuckFactor;
                leg.worldFootX += (targetX - leg.worldFootX) * 0.5;
                leg.worldFootY += (targetY - leg.worldFootY) * 0.5;
            }

        } else if (this.hopPhase === 2) {
            // FLIGHT: All legs tucked close to body (0.4x reach)
            const tuckFactor = 0.4;
            const targetX = this.x + relPos.x * scale * tuckFactor;
            const targetY = this.y + relPos.y * scale * tuckFactor;

            // Keep legs tucked as body moves
            leg.worldFootX = targetX;
            leg.worldFootY = targetY;

        } else if (this.hopPhase === 3) {
            // LANDING: Front legs extend first, back legs follow
            if (!isBackLeg) {
                // Front legs extend to catch landing (1.1x reach)
                const extendFactor = 1.1;
                const targetX = this.x + relPos.x * scale * extendFactor;
                const targetY = this.y + relPos.y * scale * extendFactor;
                leg.worldFootX += (targetX - leg.worldFootX) * 0.6;
                leg.worldFootY += (targetY - leg.worldFootY) * 0.6;
            } else {
                // Back legs prepare to land (0.9x reach)
                const landFactor = 0.9;
                const targetX = this.x + relPos.x * scale * landFactor;
                const targetY = this.y + relPos.y * scale * landFactor;
                leg.worldFootX += (targetX - leg.worldFootX) * 0.4;
                leg.worldFootY += (targetY - leg.worldFootY) * 0.4;
            }

        } else {
            // PAUSE: Return to normal stance (1.0x reach)
            const targetX = this.x + relPos.x * scale;
            const targetY = this.y + relPos.y * scale;

            leg.worldFootX += (targetX - leg.worldFootX) * 0.2;
            leg.worldFootY += (targetY - leg.worldFootY) * 0.2;
        }
    }

    updateLegProceduralForHopping(leg, crawlPhase, stepProgress) {
        // Same as updateLegProcedural but uses crawlPhase instead of this.gaitPhase
        const isSwinging = (crawlPhase === 0 && leg.group === 'A') ||
                          (crawlPhase === 3 && leg.group === 'B');

        if (isSwinging) {
            // SWING: Foot swings forward in TOP-DOWN view (X-Y plane)
            const scale = this.bodySize / 100;
            const relPos = CUSTOM_FOOT_POSITIONS[leg.index];

            // Predict where body will be after the upcoming lurch phase
            const lurchDistance = this.bodySize * 0.4;
            const futureBodyX = this.x + lurchDistance;

            // Calculate swing target
            const swingTargetX = futureBodyX + relPos.x * scale;
            const swingTargetY = this.y + relPos.y * scale;

            // Store swing start position at beginning of swing
            if (stepProgress === 0 || !leg.swingStartX) {
                leg.swingStartX = leg.worldFootX;
                leg.swingStartY = leg.worldFootY;
            }

            // Interpolate from start to target
            leg.worldFootX = leg.swingStartX + (swingTargetX - leg.swingStartX) * stepProgress;
            leg.worldFootY = leg.swingStartY + (swingTargetY - leg.swingStartY) * stepProgress;
        } else {
            // STANCE: Foot stays fixed in world space
            leg.swingStartX = null;
            leg.swingStartY = null;
        }
    }


    draw() {
        // In hopping mode, spider is invisible during flight phase (phase 2)
        if (config.animationMode === 'hopping' && this.hopPhase === 2) {
            return; // Don't draw anything - spider disappears mid-hop!
        }

        ctx.save();
        ctx.translate(this.x, this.y);

        ctx.strokeStyle = this.color;
        ctx.fillStyle = this.color;
        ctx.lineWidth = this.bodySize * 0.1;
        ctx.lineCap = 'round';

        // Draw legs
        for (const leg of this.legs) {
            this.drawLeg(leg);
        }

        // Draw cephalothorax
        ctx.beginPath();
        ctx.ellipse(
            this.body.cephalothorax.center, 0,
            this.body.cephalothorax.length / 2,
            this.body.cephalothorax.width / 2,
            0, 0, Math.PI * 2
        );
        ctx.fill();

        // Draw abdomen
        ctx.beginPath();
        ctx.ellipse(
            this.body.abdomen.center, 0,
            this.body.abdomen.length / 2,
            this.body.abdomen.width / 2,
            0, 0, Math.PI * 2
        );
        ctx.fill();

        ctx.restore();
    }

    drawLeg(leg) {
        // Target position for foot (in world space)
        const targetX = leg.worldFootX - this.x;
        const targetY = leg.worldFootY - this.y;

        // Use inverse kinematics to calculate joint angles
        leg.setFootPosition(targetX, targetY);

        // Use forward kinematics to get actual positions
        const positions = leg.forwardKinematics();

        // Draw upper segment
        ctx.beginPath();
        ctx.moveTo(leg.attachX, leg.attachY);
        ctx.lineTo(positions.knee.x, positions.knee.y);
        ctx.stroke();

        // Draw lower segment
        ctx.beginPath();
        ctx.moveTo(positions.knee.x, positions.knee.y);
        ctx.lineTo(positions.foot.x, positions.foot.y);
        ctx.stroke();
    }
}

// Initialize spiders
function resetSpiders() {
    spiders = [];
    for (let i = 0; i < config.spiderCount; i++) {
        spiders.push(new Spider(i));
    }
}

// Main animation loop
function animate() {
    // Clear canvas
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Update and draw spiders
    for (const spider of spiders) {
        spider.update();
        spider.draw();
    }

    // Update FPS
    frameCount++;
    const now = Date.now();
    if (now - lastFpsUpdate >= 1000) {
        fps = frameCount;
        frameCount = 0;
        lastFpsUpdate = now;

        document.getElementById('fps').textContent = fps;
        document.getElementById('activeSpiders').textContent = spiders.length;
    }

    animationId = requestAnimationFrame(animate);
}

// Control functions (keep existing from original)
function toggleControls() {
    document.getElementById('controls').classList.toggle('hidden');
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
}

function updateSpiderCount(value) {
    config.spiderCount = parseInt(value);
    document.getElementById('spiderCountLabel').textContent = value;
    resetSpiders();
}

function updateSpeed(value) {
    config.spiderSpeed = parseFloat(value);
    document.getElementById('speedLabel').textContent = value + 'x';
}

function updateSize(value) {
    config.spiderSize = parseFloat(value);
    document.getElementById('sizeLabel').textContent = value + 'x';
    resetSpiders();
}

function updateAnimationMode(mode) {
    config.animationMode = mode;
    console.log('🕷️ Animation mode:', mode);
    // Reset spiders to reinitialize their state for the new mode
    resetSpiders();
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    switch(e.key.toLowerCase()) {
        case 'h':
            toggleControls();
            break;
        case 'f':
            toggleFullscreen();
            break;
        case 'r':
            resetSpiders();
            break;
        case ' ':
            config.paused = !config.paused;
            e.preventDefault();
            break;
    }
});

// Wait for kinematics to load, then start
setTimeout(() => {
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    animate();
    console.log('🕷️ Spider Animation V2 (Kinematics) Started');
}, 100);
