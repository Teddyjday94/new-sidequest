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
    const close = (returnFocus) => {
      links.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      if (returnFocus) toggle.focus();
    };
    toggle.addEventListener('click', () => {
      const isOpen = toggle.getAttribute('aria-expanded') === 'true';
      links.classList.toggle('is-open', !isOpen);
      toggle.setAttribute('aria-expanded', String(!isOpen));
    });
    links.addEventListener('click', (event) => {
      if (event.target.closest('a')) close(false);
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && links.classList.contains('is-open')) close(true);
    });
  }

  function initReveals() {
    const elements = [...document.querySelectorAll('.reveal')];
    if (!elements.length) return;
    if (reduceMotionQuery.matches || !('IntersectionObserver' in window)) {
      elements.forEach((element) => element.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    elements.forEach((element) => observer.observe(element));
  }

  function initImageFallbacks() {
    document.querySelectorAll('.project-card img').forEach((image) => {
      image.addEventListener('error', () => {
        const media = image.closest('.project-media');
        if (media) media.classList.add('image-failed');
        image.hidden = true;
      });
    });
  }

  function initFormFeedback() {
    const form = document.getElementById('inquiry-form');
    const status = document.getElementById('form-status');
    if (!form || !status) return;
    form.addEventListener('invalid', (event) => {
      event.target.setAttribute('aria-invalid', 'true');
      status.textContent = 'Check the highlighted fields and try again.';
    }, true);
    form.addEventListener('input', (event) => {
      if (event.target.matches('input, textarea, select') && event.target.validity.valid) {
        event.target.removeAttribute('aria-invalid');
      }
    });
    form.addEventListener('submit', () => {
      status.textContent = 'Opening the secure form submission...';
    });
  }

  async function initLiquidSphere() {
    const canvas = document.getElementById('chrome-object');
    if (!canvas) return;

    try {
      const THREE = await import('https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js');
      if (!canvas.isConnected) return;

      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
      camera.position.z = 3.9;
      const geometry = new THREE.SphereGeometry(1, 128, 128);
      const material = new THREE.MeshPhysicalMaterial({ color: 0x075126, metalness: 0.72, roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.08, iridescence: 0.45, iridescenceIOR: 1.35, transparent: true, opacity: 0.94 });
      const uniforms = { uTime: { value: 0 }, uSurfaceTime: { value: 0 }, uPointer: { value: new THREE.Vector2() } };

      material.onBeforeCompile = (shader) => {
        shader.uniforms.uTime = uniforms.uTime;
        shader.uniforms.uSurfaceTime = uniforms.uSurfaceTime;
        shader.uniforms.uPointer = uniforms.uPointer;
        const noise = `
          vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
          vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
          vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
          vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
          vec3 fade(vec3 t) { return t * t * t * (t * (t * 6.0 - 15.0) + 10.0); }
          float pnoise(vec3 p) {
            vec3 pi0 = mod(floor(p), 10.0), pi1 = mod(pi0 + 1.0, 10.0); pi0 = mod289(pi0); pi1 = mod289(pi1);
            vec3 pf0 = fract(p), pf1 = pf0 - 1.0; vec4 ix = vec4(pi0.x, pi1.x, pi0.x, pi1.x); vec4 iy = vec4(pi0.yy, pi1.yy); vec4 iz0 = pi0.zzzz, iz1 = pi1.zzzz;
            vec4 ixy = permute(permute(ix) + iy), ixy0 = permute(ixy + iz0), ixy1 = permute(ixy + iz1);
            vec4 gx0 = ixy0 * (1.0 / 7.0), gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5; gx0 = fract(gx0); vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0); vec4 sz0 = step(gz0, vec4(0.0)); gx0 -= sz0 * (step(0.0, gx0) - 0.5); gy0 -= sz0 * (step(0.0, gy0) - 0.5);
            vec4 gx1 = ixy1 * (1.0 / 7.0), gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5; gx1 = fract(gx1); vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1); vec4 sz1 = step(gz1, vec4(0.0)); gx1 -= sz1 * (step(0.0, gx1) - 0.5); gy1 -= sz1 * (step(0.0, gy1) - 0.5);
            vec3 g000=vec3(gx0.x,gy0.x,gz0.x), g100=vec3(gx0.y,gy0.y,gz0.y), g010=vec3(gx0.z,gy0.z,gz0.z), g110=vec3(gx0.w,gy0.w,gz0.w), g001=vec3(gx1.x,gy1.x,gz1.x), g101=vec3(gx1.y,gy1.y,gz1.y), g011=vec3(gx1.z,gy1.z,gz1.z), g111=vec3(gx1.w,gy1.w,gz1.w);
            vec4 n0=taylorInvSqrt(vec4(dot(g000,g000),dot(g010,g010),dot(g100,g100),dot(g110,g110))); g000*=n0.x; g010*=n0.y; g100*=n0.z; g110*=n0.w;
            vec4 n1=taylorInvSqrt(vec4(dot(g001,g001),dot(g011,g011),dot(g101,g101),dot(g111,g111))); g001*=n1.x; g011*=n1.y; g101*=n1.z; g111*=n1.w;
            float n000=dot(g000,pf0), n100=dot(g100,vec3(pf1.x,pf0.yz)), n010=dot(g010,vec3(pf0.x,pf1.y,pf0.z)), n110=dot(g110,vec3(pf1.xy,pf0.z)), n001=dot(g001,vec3(pf0.xy,pf1.z)), n101=dot(g101,vec3(pf1.x,pf0.y,pf1.z)), n011=dot(g011,vec3(pf0.x,pf1.yz)), n111=dot(g111,pf1);
            vec3 f=fade(pf0); vec4 z=mix(vec4(n000,n100,n010,n110),vec4(n001,n101,n011,n111),f.z); return 2.2*mix(mix(z.x,z.y,f.x),mix(z.z,z.w,f.x),f.y);
          }
          float displace(vec3 point) { float flow = pnoise(point / 5.0 + mod(uTime, 10.0)) * 0.12; float surfaceNoise = pnoise(point / 0.8 + mod(uSurfaceTime, 10.0)); float waves = (point.x * sin((point.y + surfaceNoise) * 3.1415926 * 1.35) + point.z * cos((point.y + surfaceNoise) * 3.1415926 * 1.35)) * 0.022; return flow + waves; }
          vec3 orthogonal(vec3 v) { return normalize(abs(v.x) > abs(v.z) ? vec3(-v.y, v.x, 0.0) : vec3(0.0, -v.z, v.y)); }
        `;
        shader.vertexShader = shader.vertexShader.replace('#include <common>', `#include <common>\n${noise}`);
        shader.vertexShader = shader.vertexShader.replace('#include <beginnormal_vertex>', 'vec3 displacedPosition = position + normal * displace(position); float offset = 0.002; vec3 tangent = orthogonal(normal); vec3 bitangent = normalize(cross(normal, tangent)); vec3 neighbour1 = position + tangent * offset; vec3 neighbour2 = position + bitangent * offset; vec3 displacedNeighbour1 = neighbour1 + normal * displace(neighbour1); vec3 displacedNeighbour2 = neighbour2 + normal * displace(neighbour2); vec3 displacedNormal = normalize(cross(displacedNeighbour1 - displacedPosition, displacedNeighbour2 - displacedPosition)); vec3 transformedNormal = objectNormal = displacedNormal;');
        shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', 'vec3 transformed = displacedPosition;');
      };

      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);
      scene.add(new THREE.AmbientLight(0x0b2414, 1.2));
      const key = new THREE.DirectionalLight(0xcaffdf, 3.8); key.position.set(-2, 3, 4); scene.add(key);
      const emerald = new THREE.PointLight(0x14ff71, 7, 8); emerald.position.set(2, -1, 2); scene.add(emerald);
      const lime = new THREE.PointLight(0x9cff55, 4, 7); lime.position.set(-2, 1, 1); scene.add(lime);

      let width = 0; let height = 0; let pointerX = 0; let pointerY = 0; let easedX = 0; let easedY = 0; let frameId = 0; let lastFrame = 0; let paused = document.hidden;
      function resize() { const rect = canvas.getBoundingClientRect(); width = Math.max(1, rect.width); height = Math.max(1, rect.height); renderer.setSize(width, height, false); camera.aspect = width / height; camera.updateProjectionMatrix(); mesh.scale.setScalar(Math.min(width, height) * 0.00265); renderer.render(scene, camera); }
      function draw(timestamp) { easedX += (pointerX - easedX) * 0.045; easedY += (pointerY - easedY) * 0.045; uniforms.uTime.value = timestamp * 0.00042; uniforms.uSurfaceTime.value = timestamp * 0.00092; uniforms.uPointer.value.set(easedX, easedY); mesh.rotation.y = timestamp * 0.00012 + easedX * 0.18; mesh.rotation.x = easedY * 0.12; renderer.render(scene, camera); }
      function tick(timestamp) { if (paused) return; if (timestamp - lastFrame >= 1000 / 45) { lastFrame = timestamp; draw(timestamp); } frameId = window.requestAnimationFrame(tick); }
      function handlePointer(event) { if (reduceMotionQuery.matches) return; const rect = canvas.getBoundingClientRect(); pointerX = Math.max(-1, Math.min(1, ((event.clientX - rect.left) / rect.width - 0.5) * 2)); pointerY = Math.max(-1, Math.min(1, ((event.clientY - rect.top) / rect.height - 0.5) * 2)); }
      function handleVisibility() { paused = document.hidden; if (paused) window.cancelAnimationFrame(frameId); else if (!reduceMotionQuery.matches) frameId = window.requestAnimationFrame(tick); }
      if ('ResizeObserver' in window) new ResizeObserver(resize).observe(canvas); else { window.addEventListener('resize', resize); resize(); }
      window.addEventListener('pointermove', handlePointer, { passive: true }); document.addEventListener('visibilitychange', handleVisibility); resize(); if (!reduceMotionQuery.matches) frameId = window.requestAnimationFrame(tick);
    } catch (error) { console.warn('Three.js liquid sphere unavailable.', error); }
  }
}());
