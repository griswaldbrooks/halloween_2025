// Hatching Egg Spider - Animation Preview Application

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Configuration
let config = {
    upperLength: 80,
    lowerLength: 100,
    speed: 1.0,
    currentBehavior: 'resting',
    manualMode: false
};

// Manual control state
let manualAngles = {
    leftShoulder: 0,
    leftElbow: 0,
    rightShoulder: 0,
    rightElbow: 0
};

// Create two legs
const eggCenterX = canvas.width / 2;
const eggCenterY = canvas.height / 2;
const eggWidth = 120;
const eggHeight = 80;

const leftLeg = new SpiderLeg2D({
    mountX: eggCenterX - eggWidth / 2,
    mountY: eggCenterY,
    upperLength: config.upperLength,
    lowerLength: config.lowerLength,
    side: 'left'
});

const rightLeg = new SpiderLeg2D({
    mountX: eggCenterX + eggWidth / 2,
    mountY: eggCenterY,
    upperLength: config.upperLength,
    lowerLength: config.lowerLength,
    side: 'right'
});

// Animation state
let animationTime = 0;
let lastTimestamp = 0;

// Draw the egg shell
function drawEgg() {
    ctx.save();

    // Egg body
    ctx.fillStyle = '#8B7355';
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.ellipse(eggCenterX, eggCenterY, eggWidth / 2, eggHeight / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Cracks
    ctx.strokeStyle = '#3a2a1a';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 3]);

    // Vertical cracks
    ctx.beginPath();
    ctx.moveTo(eggCenterX - 20, eggCenterY - eggHeight / 2);
    ctx.lineTo(eggCenterX - 15, eggCenterY + eggHeight / 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(eggCenterX + 15, eggCenterY - eggHeight / 2);
    ctx.lineTo(eggCenterX + 20, eggCenterY + eggHeight / 2);
    ctx.stroke();

    ctx.setLineDash([]);
    ctx.restore();
}

// Draw a spider leg
function drawLeg(leg, label) {
    const positions = leg.getJointPositions();

    ctx.save();
    ctx.strokeStyle = '#2a1a0a';
    ctx.fillStyle = '#3a2a1a';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Draw leg segments
    ctx.beginPath();
    ctx.moveTo(positions.shoulder.x, positions.shoulder.y);
    ctx.lineTo(positions.elbow.x, positions.elbow.y);
    ctx.lineTo(positions.tip.x, positions.tip.y);
    ctx.stroke();

    // Draw joints
    ctx.fillStyle = '#654321';

    // Shoulder (mount point)
    ctx.beginPath();
    ctx.arc(positions.shoulder.x, positions.shoulder.y, 6, 0, Math.PI * 2);
    ctx.fill();

    // Elbow
    ctx.beginPath();
    ctx.arc(positions.elbow.x, positions.elbow.y, 5, 0, Math.PI * 2);
    ctx.fill();

    // Tip (claw)
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(positions.tip.x, positions.tip.y, 8, 0, Math.PI * 2);
    ctx.fill();

    // Label
    ctx.fillStyle = '#0f0';
    ctx.font = '12px monospace';
    ctx.fillText(label, positions.shoulder.x - 20, positions.shoulder.y - 15);

    // End effector coordinates in white
    ctx.fillStyle = '#fff';
    ctx.font = '11px monospace';
    const coordText = `(${Math.round(positions.tip.x)}, ${Math.round(positions.tip.y)})`;
    // Position text near the tip
    const textOffset = label.includes('Left') ? -60 : 10;
    ctx.fillText(coordText, positions.tip.x + textOffset, positions.tip.y - 10);

    ctx.restore();
}

// Update servo angle displays
function updateServoDisplay() {
    const leftServos = leftLeg.getServoDegrees();
    const rightServos = rightLeg.getServoDegrees();

    document.getElementById('leftShoulder').textContent = leftServos.shoulder;
    document.getElementById('leftElbow').textContent = leftServos.elbow;
    document.getElementById('rightShoulder').textContent = rightServos.shoulder;
    document.getElementById('rightElbow').textContent = rightServos.elbow;
}

// Animation loop
function animate(timestamp) {
    if (!lastTimestamp) lastTimestamp = timestamp;
    const deltaTime = timestamp - lastTimestamp;
    lastTimestamp = timestamp;

    if (config.manualMode) {
        // Manual mode - use slider values directly
        leftLeg.setAngles(
            manualAngles.leftShoulder * Math.PI / 180,
            manualAngles.leftElbow * Math.PI / 180
        );
        rightLeg.setAngles(
            manualAngles.rightShoulder * Math.PI / 180,
            manualAngles.rightElbow * Math.PI / 180
        );
    } else {
        // Animation mode
        // Update animation time based on speed
        animationTime += deltaTime * config.speed / 1000;

        // Get current behavior
        const behavior = AnimationBehaviors[config.currentBehavior];
        if (!behavior) {
            requestAnimationFrame(animate);
            return;
        }

        // Calculate normalized time (0-1) for current behavior
        const duration = behavior.duration / 1000;
        let t = (animationTime % duration) / duration;

        // Get target angles for both legs
        const leftAngles = behavior.getAngles(t, leftLeg);
        const rightAngles = behavior.getAngles(t, rightLeg);

        // Smooth animation towards target angles
        leftLeg.animateTowards(leftAngles.shoulder, leftAngles.elbow, 0.15);
        rightLeg.animateTowards(rightAngles.shoulder, rightAngles.elbow, 0.15);
    }

    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw scene
    drawLeg(leftLeg, 'LEFT');
    drawLeg(rightLeg, 'RIGHT');
    drawEgg();

    // Update servo displays
    updateServoDisplay();

    // Draw mode/status
    ctx.fillStyle = '#0f0';
    ctx.font = '16px monospace';
    if (config.manualMode) {
        ctx.fillText('Mode: MANUAL CONTROL', 20, 30);
        ctx.font = '12px monospace';
        ctx.fillText('Use sliders to adjust angles', 20, 50);
    } else {
        const behavior = AnimationBehaviors[config.currentBehavior];
        ctx.fillText(`Animation: ${behavior.name}`, 20, 30);
        ctx.font = '12px monospace';
        const duration = behavior.duration / 1000;
        let t = (animationTime % duration) / duration;
        ctx.fillText(`Progress: ${Math.floor(t * 100)}%`, 20, 50);
    }

    requestAnimationFrame(animate);
}

// Control handlers
document.querySelectorAll('.behavior-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active class from all buttons
        document.querySelectorAll('.behavior-btn').forEach(b => b.classList.remove('active'));

        // Add active class to clicked button
        btn.classList.add('active');

        // Update behavior
        config.currentBehavior = btn.dataset.behavior;
        animationTime = 0; // Reset animation time

        console.log('Switched to behavior:', config.currentBehavior);
    });
});

document.getElementById('upperLength').addEventListener('input', (e) => {
    config.upperLength = parseInt(e.target.value);
    document.getElementById('upperLengthLabel').textContent = config.upperLength;
    leftLeg.upperLength = config.upperLength;
    rightLeg.upperLength = config.upperLength;
});

document.getElementById('lowerLength').addEventListener('input', (e) => {
    config.lowerLength = parseInt(e.target.value);
    document.getElementById('lowerLengthLabel').textContent = config.lowerLength;
    leftLeg.lowerLength = config.lowerLength;
    rightLeg.lowerLength = config.lowerLength;
});

document.getElementById('speed').addEventListener('input', (e) => {
    config.speed = parseFloat(e.target.value);
    document.getElementById('speedLabel').textContent = config.speed.toFixed(1);
});

// Mode switching
document.getElementById('manualMode').addEventListener('click', () => {
    config.manualMode = true;
    document.getElementById('manualMode').classList.add('active');
    document.getElementById('animationMode').classList.remove('active');
    document.getElementById('manualControls').style.display = 'block';
    document.getElementById('animationControls').style.display = 'none';
    console.log('Switched to Manual Control mode');
});

document.getElementById('animationMode').addEventListener('click', () => {
    config.manualMode = false;
    document.getElementById('animationMode').classList.add('active');
    document.getElementById('manualMode').classList.remove('active');
    document.getElementById('manualControls').style.display = 'none';
    document.getElementById('animationControls').style.display = 'block';
    console.log('Switched to Animation Playback mode');
});

// Manual control sliders
document.getElementById('manualLeftShoulder').addEventListener('input', (e) => {
    manualAngles.leftShoulder = parseInt(e.target.value);
    document.getElementById('manualLeftShoulderLabel').textContent = manualAngles.leftShoulder;
});

document.getElementById('manualLeftElbow').addEventListener('input', (e) => {
    manualAngles.leftElbow = parseInt(e.target.value);
    document.getElementById('manualLeftElbowLabel').textContent = manualAngles.leftElbow;
});

document.getElementById('manualRightShoulder').addEventListener('input', (e) => {
    manualAngles.rightShoulder = parseInt(e.target.value);
    document.getElementById('manualRightShoulderLabel').textContent = manualAngles.rightShoulder;
});

document.getElementById('manualRightElbow').addEventListener('input', (e) => {
    manualAngles.rightElbow = parseInt(e.target.value);
    document.getElementById('manualRightElbowLabel').textContent = manualAngles.rightElbow;
});

// Copy angles to console
function copyManualAngles() {
    const output = {
        left_shoulder_deg: manualAngles.leftShoulder,
        left_elbow_deg: manualAngles.leftElbow,
        right_shoulder_deg: manualAngles.rightShoulder,
        right_elbow_deg: manualAngles.rightElbow
    };
    console.log('Current angles:');
    console.log(JSON.stringify(output, null, 2));
    console.log('\nCopy this into animation-config.json keyframe:');
    console.log(`"left_shoulder_deg": ${output.left_shoulder_deg},`);
    console.log(`"left_elbow_deg": ${output.left_elbow_deg},`);
    console.log(`"right_shoulder_deg": ${output.right_shoulder_deg},`);
    console.log(`"right_elbow_deg": ${output.right_elbow_deg}`);
}

// Wait for animations to load, then start
window.animationsLoaded = function() {
    console.log('🕷️ Hatching Egg Spider Preview Started');
    console.log('Available behaviors:', Object.keys(AnimationBehaviors));
    console.log('Modes: Animation Playback, Manual Control');
    requestAnimationFrame(animate);
};

// If animations are already loaded (shouldn't happen, but just in case)
if (Object.keys(AnimationBehaviors).length > 0) {
    window.animationsLoaded();
}
