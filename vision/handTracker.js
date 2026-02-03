export function initHandTracking(onGesture) {
    const videoElement = document.getElementById("video");

    const hands = new Hands({
        locateFile: (file) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.7,
    });

    // --- STATE ---
    let lastGesture = "HAND_OPEN";
    const history = [];
    const MAX_HISTORY = 5;
    const depthHistory = [];
    const MAX_DEPTH_HISTORY = 5;


    let lastWristY = null;
    let lastTime = performance.now();

    hands.onResults((results) => {
        if (!results.multiHandLandmarks?.length) return;

        const landmarks = results.multiHandLandmarks[0];
        

        // Landmark references
        const thumb = landmarks[4];   // thumb tip
        const index = landmarks[8];   // index tip

// -----------------------------
// LANDMARK REFERENCES (ONCE)
// -----------------------------
const thumbTip  = landmarks[4];
const indexTip  = landmarks[8];
const middleTip = landmarks[12];
const ringTip   = landmarks[16];
const pinkyTip  = landmarks[20];
const wrist     = landmarks[0];

// -----------------------------
// PEACE SIGN DETECTION ✌️
// -----------------------------
const indexUp  = Math.abs(indexTip.y - wrist.y) > 0.15;
const middleUp = Math.abs(middleTip.y - wrist.y) > 0.15;
const ringDown = Math.abs(ringTip.y - wrist.y) < 0.1;
const pinkyDown = Math.abs(pinkyTip.y - wrist.y) < 0.1;

const isPeaceSign =
  indexUp &&
  middleUp &&
  ringDown &&
  pinkyDown;    

// -----------------------------
// THUMB GESTURE DETECTION 👍
// -----------------------------
const thumbDist  = Math.abs(thumbTip.y - wrist.y);
const indexDist  = Math.abs(indexTip.y - wrist.y);
const middleDist = Math.abs(middleTip.y - wrist.y);
const ringDist   = Math.abs(ringTip.y - wrist.y);
const pinkyDist  = Math.abs(pinkyTip.y - wrist.y);

const isThumbGesture =
  thumbDist > 0.15 &&
  indexDist < 0.1 &&
  middleDist < 0.1 &&
  ringDist < 0.1 &&
  pinkyDist < 0.1;


        // -----------------------------
// HAND POSITION (SCREEN SPACE)
// -----------------------------
const handX = (wrist.x - 0.5) * 2;   // normalize to -1 → 1
const handY = -(wrist.y - 0.5) * 2;  // invert Y for screen space


        // -----------------------------
        // WRIST VELOCITY (WAVE INTENSITY)
        // -----------------------------
        const rawZ = wrist.z;
        const normalizedDepth = Math.min(
            Math.max((-rawZ - 0.1) / 0.4, 0),
            1
        );
        

        // Temporal smoothing for depth
        depthHistory.push(normalizedDepth);
        if (depthHistory.length > MAX_DEPTH_HISTORY) depthHistory.shift();

        const depth =
            depthHistory.reduce((a, b) => a + b, 0) / depthHistory.length;


        const now = performance.now();
        let velocity = 0;

        if (lastWristY !== null) {
            const dy = wrist.y - lastWristY;
            const dt = now - lastTime;
            velocity = Math.min(Math.abs(dy / dt) * 1000, 1);
        }

        lastWristY = wrist.y;
        lastTime = now;

        // -----------------------------
        // PINCH DETECTION (GESTURE)
        // -----------------------------
        const dx = thumb.x - index.x;
        const dy = thumb.y - index.y;
        const pinchDistance = Math.sqrt(dx * dx + dy * dy);

        const hx = wrist.x - index.x;
        const hy = wrist.y - index.y;
        const handSize = Math.sqrt(hx * hx + hy * hy);

        const pinchRatio = pinchDistance / handSize;

        // Temporal smoothing
        history.push(pinchRatio);
        if (history.length > MAX_HISTORY) history.shift();

        const smoothRatio =
            history.reduce((a, b) => a + b, 0) / history.length;

        // -----------------------------
        // HYSTERESIS (NO FLICKER)
        // -----------------------------
        if (smoothRatio < 0.25 && lastGesture !== "FIST_CLOSED") {
            lastGesture = "FIST_CLOSED";
        }

        if (smoothRatio > 0.35 && lastGesture !== "HAND_OPEN") {
            lastGesture = "HAND_OPEN";
        }

        // -----------------------------
        // EMIT DATA (ONE CLEAN OUTPUT)
        // -----------------------------
        onGesture({
  gesture: lastGesture,
  velocity,
  depth,
  handX,
  handY,
  thumbGesture: isThumbGesture,
  peaceSign: isPeaceSign,
});


    });

    const camera = new Camera(videoElement, {
        onFrame: async () => {
            await hands.send({ image: videoElement });
        },
        width: 640,
        height: 480,
    });

    camera.start();
}
