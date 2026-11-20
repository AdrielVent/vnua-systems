// The cube: a 3×3 puzzle cube you can drag, turn one layer at a time, and reset.
// Renders only while on screen. With Reduce Motion on, it doesn't spin and turns are instant.
window.addEventListener('DOMContentLoaded', function () {
  var figure = document.getElementById('cube');
  var stage = document.getElementById('cube-stage');
  if (!window.THREE) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  } catch (e) { return; }
  figure.classList.add('is-on');
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  stage.appendChild(renderer.domElement);
  renderer.domElement.setAttribute('aria-hidden', 'true');

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0, 11);

  // Bright, even light so the sticker colors read true instead of muddy
  scene.add(new THREE.HemisphereLight(0xffffff, 0xbbbbbb, 2.6));
  var key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(4, 6, 8);
  scene.add(key);
  var fill = new THREE.DirectionalLight(0xffffff, 1.2);
  fill.position.set(-6, -2, 4);
  scene.add(fill);

  // Sticker order follows BoxGeometry faces: +x, -x, +y, -y, +z, -z
  var stickerColors = [0xc8102e, 0xff6a13, 0xf4f4f0, 0xf2c200, 0x0b9b48, 0x0a52be];
  var stickerMats = stickerColors.map(function (c) { return new THREE.MeshStandardMaterial({ color: c, roughness: 0.42, metalness: 0 }); });
  var bodyMat = new THREE.MeshStandardMaterial({ color: 0x141414, roughness: 0.6, metalness: 0 });
  var bodyGeo = new THREE.BoxGeometry(0.98, 0.98, 0.98);
  var stickerGeo = new THREE.PlaneGeometry(0.84, 0.84);
  var GAP = 1.0;

  var puzzle = new THREE.Group();
  puzzle.rotation.set(0.5, -0.65, 0);
  scene.add(puzzle);

  var cubies = [];
  var faces = [
    { axis: 'x', sign: 1, rot: [0, Math.PI / 2, 0] },
    { axis: 'x', sign: -1, rot: [0, -Math.PI / 2, 0] },
    { axis: 'y', sign: 1, rot: [-Math.PI / 2, 0, 0] },
    { axis: 'y', sign: -1, rot: [Math.PI / 2, 0, 0] },
    { axis: 'z', sign: 1, rot: [0, 0, 0] },
    { axis: 'z', sign: -1, rot: [0, Math.PI, 0] }
  ];
  for (var x = -1; x <= 1; x++) for (var y = -1; y <= 1; y++) for (var z = -1; z <= 1; z++) {
    var cubie = new THREE.Group();
    cubie.add(new THREE.Mesh(bodyGeo, bodyMat));
    var p = { x: x, y: y, z: z };
    faces.forEach(function (f, i) {
      if (p[f.axis] !== f.sign) return;
      var s = new THREE.Mesh(stickerGeo, stickerMats[i]);
      s.rotation.set(f.rot[0], f.rot[1], f.rot[2]);
      s.position[f.axis] = f.sign * 0.495;
      cubie.add(s);
    });
    cubie.position.set(x * GAP, y * GAP, z * GAP);
    cubie.userData.home = { pos: cubie.position.clone(), quat: cubie.quaternion.clone() };
    puzzle.add(cubie);
    cubies.push(cubie);
  }

  function resize() {
    var w = stage.clientWidth, h = stage.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    needsRender = true;
  }

  // Simple tween helper (no animation library)
  function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  var tweens = [];
  function tween(duration, step, done) {
    if (reduceMotion.matches || duration === 0) { step(1); if (done) done(); needsRender = true; wake(); return; }
    tweens.push({ start: performance.now(), duration: duration, step: step, done: done });
    wake();
  }

  // Turn one random layer by a quarter turn
  var busy = false;
  var pivot = new THREE.Group();
  puzzle.add(pivot);
  function turnLayer() {
    if (busy) return;
    busy = true;
    var axes = ['x', 'y', 'z'];
    var axis = axes[Math.floor(Math.random() * 3)];
    var layer = [-1, 0, 1][Math.floor(Math.random() * 3)];
    var dir = Math.random() < 0.5 ? 1 : -1;
    var slice = cubies.filter(function (c) { return Math.abs(c.position[axis] - layer * GAP) < 0.1; });
    pivot.rotation.set(0, 0, 0);
    pivot.updateMatrixWorld();
    slice.forEach(function (c) { pivot.attach(c); });
    tween(320, function (t) { pivot.rotation[axis] = dir * (Math.PI / 2) * ease(t); }, function () {
      pivot.rotation[axis] = dir * Math.PI / 2;
      pivot.updateMatrixWorld();
      slice.forEach(function (c) {
        puzzle.attach(c);
        c.position.set(Math.round(c.position.x / GAP) * GAP, Math.round(c.position.y / GAP) * GAP, Math.round(c.position.z / GAP) * GAP);
      });
      pivot.rotation.set(0, 0, 0);
      busy = false;
      needsRender = true;
    });
  }

  function reset() {
    if (busy) return;
    busy = true;
    var from = cubies.map(function (c) { return { pos: c.position.clone(), quat: c.quaternion.clone() }; });
    var fromRot = puzzle.quaternion.clone();
    var homeRot = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.5, -0.65, 0));
    tween(600, function (t) {
      var k = ease(t);
      cubies.forEach(function (c, i) {
        c.position.lerpVectors(from[i].pos, c.userData.home.pos, k);
        c.quaternion.slerpQuaternions(from[i].quat, c.userData.home.quat, k);
      });
      puzzle.quaternion.slerpQuaternions(fromRot, homeRot, k);
    }, function () { busy = false; });
  }

  document.getElementById('cube-turn').addEventListener('click', turnLayer);
  document.getElementById('cube-reset').addEventListener('click', reset);

  // Drag to rotate the whole cube
  var dragging = false, lastX = 0, lastY = 0;
  stage.addEventListener('pointerdown', function (e) { dragging = true; lastX = e.clientX; lastY = e.clientY; stage.setPointerCapture(e.pointerId); });
  stage.addEventListener('pointermove', function (e) {
    if (!dragging) return;
    var dx = (e.clientX - lastX) * 0.01, dy = (e.clientY - lastY) * 0.01;
    lastX = e.clientX; lastY = e.clientY;
    var qy = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), dx);
    var qx = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), dy);
    puzzle.quaternion.premultiply(qy).premultiply(qx);
    needsRender = true; wake();
  });
  function endDrag() { dragging = false; }
  stage.addEventListener('pointerup', endDrag);
  stage.addEventListener('pointercancel', endDrag);

  // Render loop: runs only while the cube is visible and something is moving
  var visible = true, needsRender = true, running = false;
  function frame(now) {
    running = false;
    if (!visible || document.hidden) return;
    for (var i = tweens.length - 1; i >= 0; i--) {
      var tw = tweens[i];
      var t = Math.min(1, (now - tw.start) / tw.duration);
      tw.step(t);
      if (t === 1) { tweens.splice(i, 1); if (tw.done) tw.done(); }
    }
    var spinning = !reduceMotion.matches && !dragging;
    if (spinning) puzzle.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), 0.0025);
    if (needsRender || spinning || tweens.length) { renderer.render(scene, camera); needsRender = false; }
    if (spinning || tweens.length || dragging) wake();
  }
  function wake() { if (!running) { running = true; requestAnimationFrame(frame); } }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) { visible = entries[0].isIntersecting; if (visible) { needsRender = true; wake(); } }).observe(stage);
  }
  document.addEventListener('visibilitychange', function () { if (!document.hidden) { needsRender = true; wake(); } });
  if (reduceMotion.addEventListener) reduceMotion.addEventListener('change', function () { needsRender = true; wake(); });
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(stage);
  window.addEventListener('resize', resize);
  resize();
  wake();
});
