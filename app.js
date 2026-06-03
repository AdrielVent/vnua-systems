/* =============================================
   VNUA SYSTEMS — app.js
   Three.js Rubik's Cube + Interactive HUD
   Vanilla JS, no build tools required
============================================= */

'use strict';

// ─── WAIT FOR DOM ──────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initCursor();
  initCube();
  initScrollAnimations();
  initHUDClock();
  initSysLog();
});

// ─────────────────────────────────────────────
// 1. CUSTOM CURSOR
// ─────────────────────────────────────────────
function initCursor() {
  const cursor = document.getElementById('cursor');
  const ring   = document.getElementById('cursor-ring');
  if (!cursor || !ring) return;

  let mx = -100, my = -100;
  let rx = -100, ry = -100;

  window.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top  = my + 'px';
  });

  (function loop() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(loop);
  })();
}

// ─────────────────────────────────────────────
// 2. RUBIK'S CUBE — THREE.JS
// ─────────────────────────────────────────────
function initCube() {
  const canvas = document.getElementById('cube-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  // --- Scene setup ---
  const W = () => canvas.clientWidth  || window.innerWidth;
  const H = () => canvas.clientHeight || window.innerHeight;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(W(), H());
  renderer.setClearColor(0x000000, 0);
  renderer.shadowMap.enabled = true;

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(40, W() / H(), 0.1, 100);
  camera.position.set(5, 4, 8);
  camera.lookAt(0, 0, 0);

  // Responsive resize
  window.addEventListener('resize', () => {
    renderer.setSize(W(), H());
    camera.aspect = W() / H();
    camera.updateProjectionMatrix();
  });

  // --- Lighting ---
  scene.add(new THREE.AmbientLight(0xffffff, 0.35));

  const keyLight = new THREE.DirectionalLight(0xffffff, 1.8);
  keyLight.position.set(8, 12, 10);
  keyLight.castShadow = true;
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0x00f3ff, 0.4);
  fillLight.position.set(-6, 4, -4);
  scene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(0xff6b00, 0.25);
  rimLight.position.set(0, -6, -8);
  scene.add(rimLight);

  // --- Rubik's Cube Build ---
  // 6 face colors matching VNUA palette
  const FACE_COLORS = {
    right:  0xFF6B00,  // Orange  — VNUA LABS
    left:   0xFF003C,  // Red     — VNUA APPAREL
    top:    0xFFFFFF,  // White   — neutral
    bottom:0xFFD700,  // Gold    — accent
    front:  0x00E66B,  // Green   — VNUA SYSTEMS
    back:   0x0066FF,  // Blue    — VNUA STUDIO
  };

  const cubeGroup = new THREE.Group();
  scene.add(cubeGroup);

  // Gap between cubies
  const GAP = 1.05;
  // Cubie size
  const SZ = 0.96;

  // Store references to all 27 cubies and their face meshes
  const cubies = [];

  // Sticker geometry (slightly raised plane on each face)
  const stickerGeo = new THREE.PlaneGeometry(0.82, 0.82);
  const blackMat   = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.3, metalness: 0.7 });

  function makeStickerMat(color) {
    return new THREE.MeshStandardMaterial({
      color,
      roughness: 0.08,
      metalness: 0.05,
      envMapIntensity: 0.5,
    });
  }

  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        // Black plastic body
        const bodyGeo  = new THREE.BoxGeometry(SZ, SZ, SZ);
        const cubie    = new THREE.Mesh(bodyGeo, blackMat);
        cubie.position.set(x * GAP, y * GAP, z * GAP);
        cubeGroup.add(cubie);

        // Stickers — only show on exposed faces
        const addSticker = (color, pos, rotX, rotY) => {
          const mesh = new THREE.Mesh(stickerGeo, makeStickerMat(color));
          mesh.position.copy(cubie.position);
          mesh.position.x += pos[0];
          mesh.position.y += pos[1];
          mesh.position.z += pos[2];
          mesh.rotation.x = rotX || 0;
          mesh.rotation.y = rotY || 0;
          cubeGroup.add(mesh);
        };

        const half = SZ / 2 + 0.002;

        if (x ===  1) addSticker(FACE_COLORS.right,  [ half, 0, 0], 0,  Math.PI / 2);
        if (x === -1) addSticker(FACE_COLORS.left,   [-half, 0, 0], 0, -Math.PI / 2);
        if (y ===  1) addSticker(FACE_COLORS.top,    [0,  half, 0], -Math.PI / 2, 0);
        if (y === -1) addSticker(FACE_COLORS.bottom, [0, -half, 0],  Math.PI / 2, 0);
        if (z ===  1) addSticker(FACE_COLORS.front,  [0, 0,  half], 0, 0);
        if (z === -1) addSticker(FACE_COLORS.back,   [0, 0, -half], Math.PI, 0);

        cubies.push(cubie);
      }
    }
  }

  // --- Orbit Controls (manual, no external dep) ---
  let isDragging = false;
  let prevMouse  = { x: 0, y: 0 };
  let velX = 0, velY = 0;

  // Touch support
  let prevTouch = null;

  canvas.addEventListener('mousedown', e => {
    isDragging = true;
    prevMouse  = { x: e.clientX, y: e.clientY };
    velX = velY = 0;
  });

  window.addEventListener('mouseup',   () => { isDragging = false; });

  window.addEventListener('mousemove', e => {
    if (!isDragging) return;
    const dx = e.clientX - prevMouse.x;
    const dy = e.clientY - prevMouse.y;
    velX = dy * 0.008;
    velY = dx * 0.008;
    cubeGroup.rotation.x += velX;
    cubeGroup.rotation.y += velY;
    prevMouse = { x: e.clientX, y: e.clientY };
  });

  canvas.addEventListener('touchstart', e => {
    if (e.touches.length === 1) prevTouch = e.touches[0];
  }, { passive: true });

  canvas.addEventListener('touchmove', e => {
    if (!prevTouch || e.touches.length !== 1) return;
    const t  = e.touches[0];
    const dx = t.clientX - prevTouch.clientX;
    const dy = t.clientY - prevTouch.clientY;
    velX = dy * 0.01;
    velY = dx * 0.01;
    cubeGroup.rotation.x += velX;
    cubeGroup.rotation.y += velY;
    prevTouch = t;
    e.preventDefault();
  }, { passive: false });

  canvas.addEventListener('touchend', () => { prevTouch = null; });

  // --- Scramble Animation ---
  // Queue of face rotations for scramble effect
  const FACE_ROTATIONS = [
    { axis: 'y', layer:  1, dir:  1, name: 'U'  },
    { axis: 'y', layer: -1, dir: -1, name: 'D'  },
    { axis: 'x', layer:  1, dir:  1, name: 'R'  },
    { axis: 'x', layer: -1, dir: -1, name: 'L'  },
    { axis: 'z', layer:  1, dir:  1, name: 'F'  },
    { axis: 'z', layer: -1, dir: -1, name: 'B'  },
  ];

  let isAnimating = false;
  let moveQueue   = [];
  let currentMove = null;
  let moveProgress = 0;

  function getLayerCubies(axis, layerVal) {
    return cubeGroup.children.filter(obj => {
      const pos = obj.position;
      if (axis === 'x') return Math.round(pos.x / GAP) === layerVal;
      if (axis === 'y') return Math.round(pos.y / GAP) === layerVal;
      if (axis === 'z') return Math.round(pos.z / GAP) === layerVal;
    });
  }

  function applyRotation(objects, axis, angle) {
    const pivot = new THREE.Object3D();
    scene.add(pivot);
    objects.forEach(obj => { cubeGroup.remove(obj); pivot.add(obj); });
    if (axis === 'x') pivot.rotation.x += angle;
    if (axis === 'y') pivot.rotation.y += angle;
    if (axis === 'z') pivot.rotation.z += angle;
    pivot.updateMatrixWorld();
    objects.forEach(obj => {
      obj.applyMatrix4(pivot.matrixWorld);
      cubeGroup.add(obj);
    });
    scene.remove(pivot);
    // Snap positions
    objects.forEach(obj => {
      obj.position.x = Math.round(obj.position.x / GAP) * GAP;
      obj.position.y = Math.round(obj.position.y / GAP) * GAP;
      obj.position.z = Math.round(obj.position.z / GAP) * GAP;
    });
  }

  function queueScramble(moves = 8) {
    if (isAnimating) return;
    moveQueue = [];
    for (let i = 0; i < moves; i++) {
      moveQueue.push(FACE_ROTATIONS[Math.floor(Math.random() * FACE_ROTATIONS.length)]);
    }
    isAnimating = true;
    startNextMove();
  }

  function startNextMove() {
    if (moveQueue.length === 0) { isAnimating = false; return; }
    currentMove  = moveQueue.shift();
    moveProgress = 0;
  }

  function tickMoves() {
    if (!isAnimating || !currentMove) return;
    const step = Math.PI / 2 / 10; // 10 frames per 90° turn
    const objs = getLayerCubies(currentMove.axis, currentMove.layer);
    applyRotation(objs, currentMove.axis, step * currentMove.dir);
    moveProgress++;
    if (moveProgress >= 10) startNextMove();
  }

  // Expose to buttons
  window.scrambleCube = () => queueScramble(12);
  window.resetCubeView = () => {
    cubeGroup.rotation.set(0.3, 0.5, 0);
    velX = velY = 0;
  };

  // --- Idle auto-rotation ---
  let idleTimer = null;
  let autoRotate = true;
  const AUTO_VEL_X = 0.0018;
  const AUTO_VEL_Y = 0.0032;

  function resetIdleTimer() {
    autoRotate = false;
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => { autoRotate = true; }, 3000);
  }

  canvas.addEventListener('mousedown', resetIdleTimer);
  canvas.addEventListener('touchstart', resetIdleTimer, { passive: true });

  // Initial rotation
  cubeGroup.rotation.set(0.3, 0.5, 0);

  // --- Scroll-linked cube rotation ---
  let scrollProgress = 0;
  window.addEventListener('scroll', () => {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    scrollProgress = window.scrollY / total;
  });

  // --- Render loop ---
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();

    // Inertia damping
    if (!isDragging) {
      velX *= 0.92;
      velY *= 0.92;
      cubeGroup.rotation.x += velX;
      cubeGroup.rotation.y += velY;
    }

    // Auto-rotate when idle
    if (autoRotate && !isDragging) {
      cubeGroup.rotation.x += AUTO_VEL_X;
      cubeGroup.rotation.y += AUTO_VEL_Y;
    }

    // Scroll-linked tilt
    cubeGroup.rotation.z = scrollProgress * Math.PI * 0.5;

    // Floating bob
    cubeGroup.position.y = Math.sin(clock.getElapsedTime() * 0.6) * 0.12;

    // Face move animation
    tickMoves();

    renderer.render(scene, camera);
  }

  animate();

  // --- Canvas resize on hero scroll / intersection ---
  const hero = document.getElementById('hero');
  if (hero) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        canvas.style.opacity = e.isIntersecting ? '1' : '0';
      });
    }, { threshold: 0.1 });
    io.observe(hero);
  }
}

// ─────────────────────────────────────────────
// 3. SCROLL ANIMATIONS (Intersection Observer fallback)
// ─────────────────────────────────────────────
function initScrollAnimations() {
  // Only run IntersectionObserver fallback if native CSS scroll-driven not supported
  if (CSS.supports('(animation-timeline: view()) and (animation-range: entry)')) return;

  const targets = document.querySelectorAll('.card, .stat-block, .about-inner > *');
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add('is-visible'), i * 80);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  targets.forEach(el => observer.observe(el));
}

// ─────────────────────────────────────────────
// 4. HUD CLOCK
// ─────────────────────────────────────────────
function initHUDClock() {
  const el = document.getElementById('hud-time');
  if (!el) return;
  function tick() {
    const now = new Date();
    const hh  = String(now.getHours()).padStart(2, '0');
    const mm  = String(now.getMinutes()).padStart(2, '0');
    const ss  = String(now.getSeconds()).padStart(2, '0');
    el.textContent = `${hh}:${mm}:${ss}`;
  }
  tick();
  setInterval(tick, 1000);
}

// ─────────────────────────────────────────────
// 5. SYSTEM LOG TYPEWRITER
// ─────────────────────────────────────────────
function initSysLog() {
  const container = document.getElementById('sys-log-lines');
  if (!container) return;

  const lines = [
    { text: '> LOADING VNUA OS_INIT...', color: 'default', delay: 300 },
    { text: '> ESTABLISHING SECURE TUNNEL...', color: 'default', delay: 700 },
    { text: '> SYNCING CAD REPOSITORIES... [OK]', color: 'ok', delay: 1200 },
    { text: '> LOADING CREATIVE DIRECTIVES... [OK]', color: 'ok', delay: 1800 },
    { text: '> COMPILING PORTFOLIO ASSETS... [OK]', color: 'ok', delay: 2400 },
    { text: '> ESTABLISHING SYSTEMS ARCHITECTURE... [OK]', color: 'ok', delay: 3000 },
    { text: '> PROTOTYPE LAB NOMINAL. READY TO BUILD.', color: 'ok', delay: 3700 },
  ];

  lines.forEach(({ text, color, delay }) => {
    setTimeout(() => {
      const line = document.createElement('div');
      line.className = 'sys-log-line';
      const span = document.createElement('span');
      if (color === 'ok')  span.className = 'ok';
      if (color === 'err') span.className = 'err';
      span.textContent = text;
      line.appendChild(span);
      container.appendChild(line);
      container.scrollTop = container.scrollHeight;
    }, delay);
  });
}
