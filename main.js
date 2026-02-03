import { setupScene } from "./scene/setupScene.js";
import { initHandTracking } from "./vision/handTracker.js";
import { updateParticles, setBurstState } from "./scene/particles.js";

// -----------------------------
// GLOBAL INTERACTION STATE
// -----------------------------
let currentGesture = "HAND_OPEN";
let waveIntensity = 0;
let depthIntensity = 0;

let handX = 0;
let handY = 0;
let isGrabbing = false;

let thumbMode = false;
let thumbLatch = false;

let sceneIndex = 0;
let peaceLatch = false;

// Target position the sphere wants to go to
const targetPosition = { x: 0, y: 0 };

// -----------------------------
// SETUP 3D SCENE
// -----------------------------
const { particles, textSprite, camera } = setupScene();

// -----------------------------
// CAMERA PARALLAX STATE
// -----------------------------
const baseCameraZ = camera.position.z;


// -----------------------------
// TEXT UPDATE HELPER
// -----------------------------
function updateText(sprite, text) {
  const canvas = sprite.material.map.image;
  const ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = "bold 96px Arial";
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";  
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  sprite.material.map.needsUpdate = true;
}

// -----------------------------
// INIT HAND TRACKING
// -----------------------------
initHandTracking((data) => {
  currentGesture = data.gesture;
  waveIntensity = data.velocity;
  depthIntensity = data.depth;

  handX = data.handX;
  handY = data.handY;

  isGrabbing = currentGesture === "FIST_CLOSED";

  // -----------------------------
  // THUMB MODE TOGGLE 👍
  // -----------------------------
  if (data.thumbGesture && !thumbLatch) {
    thumbMode = !thumbMode;
    thumbLatch = true;
    console.log("Thumb mode:", thumbMode);
  }

  if (!data.thumbGesture) {
    thumbLatch = false;
  }

  // -----------------------------
  // PEACE SIGN → SWITCH TEXT ✌️
  // -----------------------------
  if (data.peaceSign && !peaceLatch) {
    sceneIndex = (sceneIndex + 1) % 2;

    updateText(
      textSprite,
      sceneIndex === 0 ? "MAGIC SCROLL" : "WELCOME ✨"
    );

    peaceLatch = true;
    console.log("✌️ Scene switched:", sceneIndex);
  }

  if (!data.peaceSign) {
    peaceLatch = false;
  }

  // -----------------------------
  // BURST CONTROL
  // -----------------------------
  setBurstState(currentGesture === "HAND_OPEN");
});

// -----------------------------
// ANIMATION LOOP (VISUALS ONLY)
// -----------------------------
function animate() {
  // -----------------------------
  // GRAB & FOLLOW
  // -----------------------------
  if (isGrabbing) {
    targetPosition.x = handX * 3;
    targetPosition.y = handY * 2;
  } else {
    targetPosition.x *= 0.9;
    targetPosition.y *= 0.9;
  }

  particles.position.x += (targetPosition.x - particles.position.x) * 0.15;
  particles.position.y += (targetPosition.y - particles.position.y) * 0.15;

  // -----------------------------
  // THUMB MODE → COLOR
  // -----------------------------
  particles.material.color.set(
    thumbMode ? 0xff66ff : 0xffffff
  );

  // -----------------------------
  // CAMERA PARALLAX (HAND = MOUSE)
  // -----------------------------
   const safeHandX = isFinite(handX) ? handX : 0;
const safeHandY = isFinite(handY) ? handY : 0;
  const parallaxStrength = isGrabbing ? 0.25 : 0.4;  // subtle is premium
  const depthZoomStrength = 0.6;

  const targetCamX = handX * parallaxStrength;
  const targetCamY = handY * parallaxStrength;
  const targetCamZ =
    baseCameraZ - depthIntensity * depthZoomStrength;

  camera.position.x += (targetCamX - camera.position.x) * 0.08;
  camera.position.y += (targetCamY - camera.position.y) * 0.08;
  camera.position.z += (targetCamZ - camera.position.z) * 0.08;

  camera.lookAt(particles.position);

 



  // -----------------------------
  // PARTICLES (BURST + WAVES)
  // -----------------------------
  updateParticles(
    particles,
    performance.now(),
    waveIntensity,
    depthIntensity
  );

  requestAnimationFrame(animate);
}

animate();
