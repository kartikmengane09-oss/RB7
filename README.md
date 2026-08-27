# RB7 — Red Bull Racing 2011 Interactive 3D Experience

An interactive 3D web experience showcasing the **Red Bull Racing RB7**, the car that competed in the 2011 Formula One season.

The website combines a 3D car model, scroll-driven animations, technical information, season statistics, and an interactive race gallery into a cinematic one-page experience.

---

## 🚗 Project Overview

The main experience is built around the RB7 3D model.

As the user scrolls through the page:

1. The RB7 transitions from its initial perspective into a side view.
2. The car remains the primary visual focus.
3. The wheels spin independently during the driving sequence.
4. The camera maintains the intended side-view composition.
5. Season and technical information appears alongside the car.
6. Information panels animate in and out according to the scroll timeline.
7. The final composition leaves space for additional season information.
8. A race-results/gallery section can transition into view after the main car sequence.

The goal is to create a **cinematic, premium automotive/F1-style presentation** rather than a conventional website.

---

## 🛠️ Tech Stack

- React
- JavaScript
- Three.js
- React Three Fiber
- GSAP
- CSS
- ReactBits components
- GLTF/GLB 3D assets

---

## 📁 Current Architecture

The project is intentionally built around the existing animation architecture.

The important parts of the experience include:

### 3D Scene

Responsible for:

- Loading the RB7 model
- Positioning the car
- Camera positioning
- Camera target
- Car transformations
- Wheel rotation
- Lighting
- Rendering

### Scroll Animation

GSAP controls the main scroll timeline.

The scroll timeline is responsible for coordinating:

- Car movement
- Car rotation
- Camera transitions
- Information animations
- Final positioning
- Transition into subsequent sections

The goal is to keep these animations synchronized without allowing unrelated changes to break the existing scroll architecture.

---

## 🏎️ Car Animation

The RB7 uses a side-view driving sequence.

An important design requirement is that the **car itself should not accidentally translate or rotate because of wheel animation**.

The wheels should rotate independently.

Conceptually:

```text
SCROLL
   │
   ├── Car animation
   │
   ├── Camera animation
   │
   ├── Information animation
   │
   └── Wheel rotation
          │
          └── Independent from car translation