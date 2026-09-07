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
      renderer.toneMappingExposure = 1.15;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
      camera.position.z = 3.9;
      const geometry = new THREE.SphereGeometry(1, 128, 128);
      const uniforms = { time: { value: 0 }, pointer: { value: new THREE.Vector2() } };
      const vertexShader = `
        uniform float time;
        varying vec3 vPosition;
        varying vec3 vNormal;
        float surface(vec3 p) {
          float flow = (sin(p.x * 2.4 + time * .7) + sin(p.y * 3.1 - time * .46) + sin(p.z * 2.8 + time * .35)) / 3.0;
          float noise = (sin(p.x * 2.8 + time * .48) + sin(p.z * 2.3 - time * .35)) * .5;
          float pole = .55 + .45 * sin((p.y + 1.0) * 1.5708);
          float wave = p.x * sin((p.y + noise * .32) * 6.754 - time * 1.35) + p.z * cos((p.y + noise * .32) * 6.754 - time * 1.1);
          float fold = sin((p.x + p.z) * 5.2 + p.y * 2.4 - time * .8) * .025;
          return flow * .1 + wave * .095 * pole + fold;
        }
        void main() {
          vec3 displaced = position + normal * surface(position);
          float offset = .003;
          vec3 tangent = normalize(abs(normal.x) > abs(normal.z) ? vec3(-normal.y, normal.x, 0.0) : vec3(0.0, -normal.z, normal.y));
          vec3 bitangent = normalize(cross(normal, tangent));
          vec3 normalA = normalize(cross((position + tangent * offset) + normal * surface(position + tangent * offset) - displaced, (position + bitangent * offset) + normal * surface(position + bitangent * offset) - displaced));
          vPosition = displaced;
          vNormal = normalize(normalMatrix * normalA);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
        }
      `;
      const fragmentShader = `
        precision highp float;
        uniform float time;
        uniform vec2 pointer;
        varying vec3 vPosition;
        varying vec3 vNormal;
        float field(vec3 p) {
          return (sin(p.x * 2.6 + time * .55) + sin(p.y * 3.4 - time * .32) + sin(p.z * 2.9 + time * .24) + sin((p.x + p.z) * 4.5 - time * .7)) * .25;
        }
        void main() {
          vec3 viewDir = normalize(cameraPosition - vPosition);
          vec3 lightDir = normalize(vec3(-.45, .8, 1.0));
          vec3 normal = normalize(vNormal + vec3(field(vPosition + .08) * .16));
          float diffuse = max(dot(normal, lightDir), 0.0);
          float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 2.7);
          float swirls = .5 + .5 * sin((vPosition.y + field(vPosition) * .35) * 8.0 + vPosition.x * 2.5 - time * 1.4);
          float veins = smoothstep(.58, .9, swirls) * (.65 + .35 * field(vPosition) + fresnel);
          vec3 deep = vec3(.003, .08, .025);
          vec3 emerald = vec3(.01, .38, .12);
          vec3 neon = vec3(.18, 1.0, .42);
          vec3 color = mix(deep, emerald, smoothstep(.12, .75, field(vPosition) + .5));
          color = mix(color, neon, veins * .8 + diffuse * .18);
          color += neon * pow(max(fresnel, 0.0), 1.8) * .55;
          float specular = pow(max(dot(reflect(-lightDir, normal), viewDir), 0.0), 42.0);
          color += vec3(.65, 1.0, .76) * specular * 1.25;
          color *= .62 + diffuse * .62;
          gl_FragColor = vec4(color, .96);
        }
      `;
      const material = new THREE.ShaderMaterial({ uniforms, vertexShader, fragmentShader, transparent: true, side: THREE.DoubleSide });
      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);
      const glowCanvas = document.createElement('canvas');
      glowCanvas.width = 256; glowCanvas.height = 256;
      const glowContext = glowCanvas.getContext('2d');
      const glowGradient = glowContext.createRadialGradient(128, 128, 8, 128, 128, 128);
      glowGradient.addColorStop(0, 'rgba(64, 255, 140, .78)');
      glowGradient.addColorStop(.34, 'rgba(20, 238, 96, .4)');
      glowGradient.addColorStop(1, 'rgba(0, 100, 36, 0)');
      glowContext.fillStyle = glowGradient; glowContext.fillRect(0, 0, 256, 256);
      const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(glowCanvas), blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, opacity: .9 }));
      glow.position.z = -.45; scene.add(glow);

      let width = 0; let height = 0; let pointerX = 0; let pointerY = 0; let easedX = 0; let easedY = 0; let frameId = 0; let lastFrame = 0; let paused = document.hidden;
      function resize() { const rect = canvas.getBoundingClientRect(); width = Math.max(1, rect.width); height = Math.max(1, rect.height); renderer.setSize(width, height, false); camera.aspect = width / height; camera.updateProjectionMatrix(); mesh.scale.setScalar(Math.min(width, height) * .00122); glow.scale.setScalar(Math.min(width, height) * .0029); renderer.render(scene, camera); }
      function draw(timestamp) { easedX += (pointerX - easedX) * .045; easedY += (pointerY - easedY) * .045; uniforms.time.value = timestamp * .00045; uniforms.pointer.value.set(easedX, easedY); mesh.rotation.y = timestamp * .00012 + easedX * .18; mesh.rotation.x = easedY * .12; glow.rotation.z = timestamp * .00004; renderer.render(scene, camera); }
      function tick(timestamp) { if (paused) return; if (timestamp - lastFrame >= 1000 / 45) { lastFrame = timestamp; draw(timestamp); } frameId = window.requestAnimationFrame(tick); }
      function handlePointer(event) { if (reduceMotionQuery.matches) return; const rect = canvas.getBoundingClientRect(); pointerX = Math.max(-1, Math.min(1, ((event.clientX - rect.left) / rect.width - .5) * 2)); pointerY = Math.max(-1, Math.min(1, ((event.clientY - rect.top) / rect.height - .5) * 2)); }
      function handleVisibility() { paused = document.hidden; if (paused) window.cancelAnimationFrame(frameId); else if (!reduceMotionQuery.matches) frameId = window.requestAnimationFrame(tick); }
      if ('ResizeObserver' in window) new ResizeObserver(resize).observe(canvas); else { window.addEventListener('resize', resize); resize(); }
      window.addEventListener('pointermove', handlePointer, { passive: true }); document.addEventListener('visibilitychange', handleVisibility); resize(); if (!reduceMotionQuery.matches) frameId = window.requestAnimationFrame(tick);
    } catch (error) { console.warn('Three.js liquid sphere unavailable.', error); }
  }
}());
