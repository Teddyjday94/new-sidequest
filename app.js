(function () {
  'use strict';

  const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  document.addEventListener('DOMContentLoaded', () => {
    initMenu();
    initReveals();
    initImageFallbacks();
    initFormFeedback();
    initLiquidSphere();
    const year = document.getElementById('current-year');
    if (year) year.textContent = String(new Date().getFullYear());
  });

  function initMenu() {
    const toggle = document.getElementById('menu-toggle');
    const links = document.getElementById('nav-links');
    if (!toggle || !links) return;
    const close = (returnFocus) => { links.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false'); if (returnFocus) toggle.focus(); };
    toggle.addEventListener('click', () => { const isOpen = toggle.getAttribute('aria-expanded') === 'true'; links.classList.toggle('is-open', !isOpen); toggle.setAttribute('aria-expanded', String(!isOpen)); });
    links.addEventListener('click', (event) => { if (event.target.closest('a')) close(false); });
    document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && links.classList.contains('is-open')) close(true); });
  }

  function initReveals() {
    const elements = [...document.querySelectorAll('.reveal')];
    if (!elements.length) return;
    if (reduceMotionQuery.matches || !('IntersectionObserver' in window)) { elements.forEach((element) => element.classList.add('is-visible')); return; }
    const observer = new IntersectionObserver((entries) => { entries.forEach((entry) => { if (!entry.isIntersecting) return; entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }); }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    elements.forEach((element) => observer.observe(element));
  }

  function initImageFallbacks() {
    document.querySelectorAll('.project-card img').forEach((image) => image.addEventListener('error', () => { const media = image.closest('.project-media'); if (media) media.classList.add('image-failed'); image.hidden = true; }));
  }

  function initFormFeedback() {
    const form = document.getElementById('inquiry-form');
    const status = document.getElementById('form-status');
    if (!form || !status) return;
    form.addEventListener('invalid', (event) => { event.target.setAttribute('aria-invalid', 'true'); status.textContent = 'Check the highlighted fields and try again.'; }, true);
    form.addEventListener('input', (event) => { if (event.target.matches('input, textarea, select') && event.target.validity.valid) event.target.removeAttribute('aria-invalid'); });
    form.addEventListener('submit', () => { status.textContent = 'Opening the secure form submission...'; });
  }

  async function initLiquidSphere() {
    const canvas = document.getElementById('chrome-object');
    if (!canvas) return;
    try {
      const THREE = await import('https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js');
      const context = canvas.getContext('webgl2', { alpha: true, antialias: true, powerPreference: 'high-performance' }) || canvas.getContext('webgl', { alpha: true, antialias: true, powerPreference: 'high-performance' });
      const renderer = new THREE.WebGLRenderer({ canvas, context, alpha: true, antialias: true, powerPreference: 'high-performance' });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.25;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
      camera.position.z = 3.9;
      const geometry = new THREE.SphereGeometry(1, 128, 128);
      const positionAttribute = geometry.attributes.position;
      const basePositions = new Float32Array(positionAttribute.array);
      const material = new THREE.MeshPhysicalMaterial({ color: 0x075126, metalness: 0.72, roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.08, iridescence: 0.45, iridescenceIOR: 1.35, transparent: true, opacity: 0.94 });
      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);
      scene.add(new THREE.AmbientLight(0x0b2414, 1.2));
      const key = new THREE.DirectionalLight(0xcaffdf, 3.8); key.position.set(-2, 3, 4); scene.add(key);
      const emerald = new THREE.PointLight(0x14ff71, 7, 8); emerald.position.set(2, -1, 2); scene.add(emerald);
      const lime = new THREE.PointLight(0x9cff55, 4, 7); lime.position.set(-2, 1, 1); scene.add(lime);

      function deform(time) {
        for (let index = 0; index < positionAttribute.count; index += 1) {
          const offset = index * 3;
          const x = basePositions[offset];
          const y = basePositions[offset + 1];
          const z = basePositions[offset + 2];
          const flow = (Math.sin(x * 3.1 + time * 0.7) + Math.sin(y * 4.0 - time * 0.46) + Math.sin(z * 3.6 + time * 0.35)) / 3;
          const ripple = Math.sin((y + flow * 0.2) * Math.PI * 1.35 - time * 1.8 + x * 0.75 + z * 0.35);
          const amount = flow * 0.055 + ripple * 0.018;
          const length = Math.hypot(x, y, z) || 1;
          positionAttribute.setXYZ(index, x + (x / length) * amount, y + (y / length) * amount, z + (z / length) * amount);
        }
        positionAttribute.needsUpdate = true;
        geometry.computeVertexNormals();
      }

      let width = 0; let height = 0; let pointerX = 0; let pointerY = 0; let easedX = 0; let easedY = 0; let frameId = 0; let lastFrame = 0; let paused = document.hidden;
      function resize() { const rect = canvas.getBoundingClientRect(); width = Math.max(1, rect.width); height = Math.max(1, rect.height); renderer.setSize(width, height, false); camera.aspect = width / height; camera.updateProjectionMatrix(); mesh.scale.setScalar(Math.min(width, height) * 0.00155); renderer.render(scene, camera); }
      function draw(timestamp) { easedX += (pointerX - easedX) * 0.045; easedY += (pointerY - easedY) * 0.045; deform(timestamp * 0.00045); mesh.rotation.y = timestamp * 0.00012 + easedX * 0.18; mesh.rotation.x = easedY * 0.12; renderer.render(scene, camera); }
      function tick(timestamp) { if (paused) return; if (timestamp - lastFrame >= 1000 / 45) { lastFrame = timestamp; draw(timestamp); } frameId = window.requestAnimationFrame(tick); }
      function handlePointer(event) { if (reduceMotionQuery.matches) return; const rect = canvas.getBoundingClientRect(); pointerX = Math.max(-1, Math.min(1, ((event.clientX - rect.left) / rect.width - 0.5) * 2)); pointerY = Math.max(-1, Math.min(1, ((event.clientY - rect.top) / rect.height - 0.5) * 2)); }
      function handleVisibility() { paused = document.hidden; if (paused) window.cancelAnimationFrame(frameId); else if (!reduceMotionQuery.matches) frameId = window.requestAnimationFrame(tick); }
      if ('ResizeObserver' in window) new ResizeObserver(resize).observe(canvas); else { window.addEventListener('resize', resize); resize(); }
      window.addEventListener('pointermove', handlePointer, { passive: true }); document.addEventListener('visibilitychange', handleVisibility); resize(); if (!reduceMotionQuery.matches) frameId = window.requestAnimationFrame(tick);
    } catch (error) { console.warn('Three.js liquid sphere unavailable.', error); }
  }
}());
