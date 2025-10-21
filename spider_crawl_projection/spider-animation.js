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
    paused: false
};

// Animation state
let spiders = [];
let animationId = null;

// FPS tracking
let fps = 0;
let frameCount = 0;
let lastFpsUpdate = Date.now();

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
    constructor() {
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

        // Gait state
        this.gaitPhase = 0;
        this.gaitTimer = 0;
        this.stepProgress = 0;

        // Create 8 legs using body model
        this.legs = [];
        const groupA = [1, 2, 5, 6]; // L1, R2, L3, R4

        for (let i = 0; i < 8; i++) {
            const attachment = this.body.getAttachment(i);

            // TOP-DOWN VIEW: Elbow bias determines which IK solution (knee position)
            // Custom configuration from interactive editor for natural spider leg bending
            // Pattern configured by user for optimal leg appearance
            const elbowBiasPattern = [-1, 1, -1, 1, 1, -1, 1, -1];
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

        // Gait timing
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
            this.updateLeg(leg);
        }

        // Body movement during lurch phases
        if (this.gaitPhase === 1 || this.gaitPhase === 4) {
            const lurchDistance = this.bodySize * 0.4;
            const lurchDelta = (lurchDistance / phaseDurations[this.gaitPhase]) * dt * speedMultiplier;

            this.x += lurchDelta;
            this.y += this.vy * speedMultiplier;
        }

        // Wrap around
        if (this.x > canvas.width + 50) {
            this.x = -50;
            this.y = Math.random() * canvas.height;
            this.initializeLegPositions();
        }

        if (this.y < 0 || this.y > canvas.height) {
            this.vy *= -1;
            this.y = Math.max(0, Math.min(canvas.height, this.y));
        }
    }

    updateLeg(leg) {
        const isSwinging = (this.gaitPhase === 0 && leg.group === 'A') ||
                          (this.gaitPhase === 3 && leg.group === 'B');

        if (isSwinging) {
            // SWING: Foot swings forward in TOP-DOWN view (X-Y plane)
            // Use custom foot positions (verified no intersections) as target
            const scale = this.bodySize / 100;
            const relPos = CUSTOM_FOOT_POSITIONS[leg.index];

            // Predict where body will be after the upcoming lurch phase
            const lurchDistance = this.bodySize * 0.4;
            const futureBodyX = this.x + lurchDistance;

            // Calculate swing target using custom positions (prevents intersections)
            const swingTargetX = futureBodyX + relPos.x * scale;
            const swingTargetY = this.y + relPos.y * scale;

            // Store swing start position at beginning of swing
            if (this.stepProgress === 0 || !leg.swingStartX) {
                leg.swingStartX = leg.worldFootX;
                leg.swingStartY = leg.worldFootY;
            }

            // Interpolate from start to target (smooth swing motion in X-Y plane)
            leg.worldFootX = leg.swingStartX + (swingTargetX - leg.swingStartX) * this.stepProgress;
            leg.worldFootY = leg.swingStartY + (swingTargetY - leg.swingStartY) * this.stepProgress;
        } else {
            // STANCE: Foot stays fixed in world space
            // Clear swing start position for next swing
            leg.swingStartX = null;
            leg.swingStartY = null;
        }
    }

    draw() {
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
        spiders.push(new Spider());
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
