// import * as THREE from "three";

// // ----------------------------------
// // CREATE PARTICLE SPHERE
// // ----------------------------------
// let shockwaveTime = -1;
// let shockwaveStrength = 0;

// export function triggerShockwave(strength = 1) {
//   shockwaveTime = performance.now();
//   shockwaveStrength = strength;
// }

// export function createParticleSphere(scene) {
//   const count = 8000;
//   const geometry = new THREE.BufferGeometry();
//   const positions = new Float32Array(count * 3);

//   for (let i = 0; i < count; i++) {
//     const radius = 2;
//     const theta = Math.random() * Math.PI * 2;
//     const phi = Math.acos(2 * Math.random() - 1);

//     positions[i * 3]     = radius * Math.sin(phi) * Math.cos(theta);
//     positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
//     positions[i * 3 + 2] = radius * Math.cos(phi);
//   }

//   geometry.setAttribute(
//     "position",
//     new THREE.BufferAttribute(positions, 3)
//   );

//   // Store original positions (needed for waves)
//   geometry.userData.originalPositions = positions.slice();

//   const material = new THREE.PointsMaterial({
//     color: 0xffffff,
//     size: 0.02,
//   });

//   const points = new THREE.Points(geometry, material);
//   scene.add(points);

//   return points;
// }

// // ----------------------------------
// // APPLY WAVE MOTION
// // ----------------------------------
// export function applyWaveMotion(points, time, intensity, depth) {
//   const positions = points.geometry.attributes.position.array;
//   const originals = points.geometry.userData.originalPositions;

//   const baseFrequency = 0.0015;
//   const velocityBoost = 0.01;
//   const depthBoost = 0.02;
//   const maxAmplitude = 0.6;

//   const frequency =
//     baseFrequency +
//     intensity * velocityBoost +
//     depth * depthBoost;

//   const amplitude =
//     intensity * maxAmplitude * (0.5 + depth);

//   // Shockwave parameters
//   const shockSpeed = 0.005;
//   const shockDecay = 0.0006;

//   for (let i = 0; i < positions.length; i += 3) {
//     const ox = originals[i];
//     const oy = originals[i + 1];
//     const oz = originals[i + 2];

//     const radius = Math.sqrt(ox * ox + oy * oy + oz * oz) || 1;

//     // Base wave
//     let wave =
//       Math.sin(time * frequency + radius * 4) * amplitude;

//     // Shockwave contribution
//     if (shockwaveTime > 0) {
//       const elapsed = time - shockwaveTime;
//       const shockFront = elapsed * shockSpeed;
//       const distanceFromFront = Math.abs(radius - shockFront);

//       if (distanceFromFront < 0.15) {
//         const shock =
//           Math.cos(distanceFromFront * Math.PI * 6) *
//           shockwaveStrength *
//           Math.exp(-elapsed * shockDecay);

//         wave += shock;
//       }

//       // Auto-stop shockwave
//       if (elapsed > 2000) {
//         shockwaveTime = -1;
//       }
//     }

//     positions[i]     = ox + (ox / radius) * wave;
//     positions[i + 1] = oy + (oy / radius) * wave;
//     positions[i + 2] = oz + (oz / radius) * wave;
//   }

//   points.geometry.attributes.position.needsUpdate = true;
// }

import * as THREE from "three";

// -----------------------------
// INTERNAL STATE
// -----------------------------
let burstProgress = 0;        // 0 = collected, 1 = fully burst
let burstTarget = 0;          // where we want to go (0 or 1)
let burstStrength = 3;        // how far particles fly

function createCircleTexture() {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext("2d");
  const center = size / 2;

  // Radial gradient for spherical feel
  const gradient = ctx.createRadialGradient(
    center, center, 2,
    center, center, center
  );

  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.4, "rgba(255,255,255,0.9)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(center, center, center, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}


// -----------------------------
// CREATE PARTICLE SPHERE
// -----------------------------
export function createParticleSphere(scene) {
  const count = 8000;
  const geometry = new THREE.BufferGeometry();

  const positions = new Float32Array(count * 3);
  const originalPositions = new Float32Array(count * 3);
  const burstDirections = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const radius = 2;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta);
    const z = radius * Math.cos(phi);
    

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    originalPositions.set([x, y, z], i * 3);

    // Burst direction = outward + randomness
    const dir = new THREE.Vector3(x, y, z)
      .normalize()
      .add(
        new THREE.Vector3(
          (Math.random() - 0.5) * 0.3,
          (Math.random() - 0.5) * 0.3,
          (Math.random() - 0.5) * 0.3
        )
      )
      .normalize();

    burstDirections.set([dir.x, dir.y, dir.z], i * 3);
  }

  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3)
  );

  geometry.userData.originalPositions = originalPositions;
  geometry.userData.burstDirections = burstDirections;

  const material = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.02,
  });

  const points = new THREE.Points(geometry, material);
  scene.add(points);

  return points;
}

// -----------------------------
// CONTROL BURST STATE
// -----------------------------
export function setBurstState(open) {
  burstTarget = open ? 1 : 0;
}

// -----------------------------
// UPDATE PARTICLES (EVERY FRAME)
// -----------------------------
export function updateParticles(points, time, waveIntensity, depth) {
  const positions = points.geometry.attributes.position.array;
  const originals = points.geometry.userData.originalPositions;
  const directions = points.geometry.userData.burstDirections;

  // Smooth transition between states
  burstProgress += (burstTarget - burstProgress) * 0.08;

  // Wave parameters
  const waveFreq = 0.0015 + waveIntensity * 0.01 + depth * 0.02;
  const waveAmp = waveIntensity * (0.4 + depth);

  for (let i = 0; i < positions.length; i += 3) {
    const ox = originals[i];
    const oy = originals[i + 1];
    const oz = originals[i + 2];

    const dx = directions[i];
    const dy = directions[i + 1];
    const dz = directions[i + 2];

    // Burst offset
    const burstOffset = burstProgress * burstStrength;

    let x = ox + dx * burstOffset;
    let y = oy + dy * burstOffset;
    let z = oz + dz * burstOffset;

    // Wave overlay (never stops)
    const radius = Math.sqrt(ox * ox + oy * oy + oz * oz) || 1;
    const wave =
      Math.sin(time * waveFreq + radius * 4) * waveAmp;

    x += (ox / radius) * wave;
    y += (oy / radius) * wave;
    z += (oz / radius) * wave;

    positions[i]     = x;
    positions[i + 1] = y;
    positions[i + 2] = z;
  }

  points.geometry.attributes.position.needsUpdate = true;
}
