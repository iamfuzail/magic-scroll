import * as THREE from "three";
import { createParticleSphere } from "./particles.js";

function createTextSprite(text) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  canvas.width = 1024;
  canvas.height = 256;

  context.fillStyle = "rgba(255,255,255,0)";
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.font = "bold 96px Arial";
  context.fillStyle = "#ffffff";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(text, canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);

  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    opacity: 0,
  });

  const sprite = new THREE.Sprite(material);
  sprite.scale.set(2.5, 0.6, 1);

  return sprite;
}


export function setupScene() {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 5;

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const particles = createParticleSphere(scene);

  function render() {
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }

  render();

 
  const textSprite = createTextSprite("MAGIC SCROLL");
scene.add(textSprite);
 return { particles, textSprite, camera }; // 🔑 THIS IS THE KEY

}
