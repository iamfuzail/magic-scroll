# ✨ Magic Scroll

Magic Scroll is an **interactive, gesture-controlled 3D particle experience** built for the web.  
Your hand becomes the controller — moving, shaping, bursting, and revealing a living particle sphere in real time.

This project combines **computer vision**, **creative coding**, and **interaction design** using modern web technologies.

🔗 Live Demo: https://iamfuzail.github.io/magic-scroll/

---

## 🚀 What This Project Demonstrates

- Real-time **hand tracking via webcam**
- Gesture-based interaction (no mouse / keyboard)
- GPU-friendly particle system
- Camera parallax for depth & immersion
- Clean separation of logic, visuals, and input
- Production-ready project structure

This is **not a toy demo** — it’s an interaction system.

---

## 🧠 Core Features

### ✋ Hand Gestures
| Gesture | Action |
|------|------|
| ✋ Open hand | Particles burst outward |
| ✊ Fist | Particles recollect + grab sphere |
| 🫳 Move hand | Sphere follows hand |
| 🫴 Move closer | Stronger waves & camera zoom |
| 👍 Thumb | Toggle color / visual mode |

### 🌊 Particle Behavior
- Sphere made of **thousands of atom-like particles**
- Continuous wave motion (never static)
- Burst & recollect driven by gesture state
- Motion layered, not reset

### 🎥 Camera & Depth
- Subtle parallax based on hand movement
- Depth-aware zoom using hand Z-axis
- Smooth interpolation (no jitter)

---

## 🛠️ Tech Stack

- **Three.js** — WebGL rendering
- **MediaPipe Hands** — real-time hand tracking
- **Vite** — development & build tooling
- **Canvas textures** — atom-style particles
- **ES Modules** — clean, modern architecture

---

## 📁 Project Structure

