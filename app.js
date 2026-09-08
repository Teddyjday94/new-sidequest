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
    const orb = document.getElementById('emerald-orb');
    if (!canvas || !orb) return;
    orb.dataset.orbMode = 'fallback';

    try {
      const THREE = await import('https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js');
      if (!canvas.isConnected) return;

      const texture = await new Promise((resolve, reject) => {
        new THREE.TextureLoader().load('assets/emerald-orb.jpeg', resolve, undefined, reject);
      });
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;

      const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance'
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.setClearColor(0x000000, 0);

      const scene = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
      camera.position.z = 2;
      const uniforms = {
        uTexture: { value: texture },
        uTime: { value: 0 },
        uPointer: { value: new THREE.Vector2() },
        uPulse: { value: 1 }
      };

      const material = new THREE.ShaderMaterial({
        uniforms,
        transparent: true,
        depthWrite: false,
        vertexShader: `
          varying vec2 vUv;

          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          precision highp float;

          uniform sampler2D uTexture;
          uniform float uTime;
          uniform float uPulse;
          uniform vec2 uPointer;
          varying vec2 vUv;

          mat2 rotate2d(float angle) {
            float s = sin(angle);
            float c = cos(angle);
            return mat2(c, -s, s, c);
          }

          void main() {
            vec2 centered = vUv - 0.5;
            float radius = length(centered);
            float angle = atan(centered.y, centered.x);

            float edgeRipple = sin(angle * 7.0 - uTime * 1.15) * 0.0065;
            edgeRipple += sin(angle * 4.0 + uTime * 0.82) * 0.0052;
            float silhouette = 1.0 - smoothstep(0.452 + edgeRipple, 0.477 + edgeRipple, radius);

            vec2 spun = rotate2d(uTime * 0.075) * centered;
            float liquidWave = sin(radius * 39.0 - uTime * 2.0 + sin(angle * 5.0 + uTime * 0.7) * 1.25);
            float crossWave = cos(spun.y * 18.0 + spun.x * 7.0 + uTime * 1.05);
            vec2 tangent = normalize(vec2(-spun.y, spun.x) + vec2(0.0001));
            vec2 radial = normalize(spun + vec2(0.0001));
            vec2 distortion = tangent * liquidWave * 0.0104;
            distortion += radial * crossWave * 0.0065;
            distortion += vec2(
              sin(spun.y * 14.0 + uTime * 0.9),
              cos(spun.x * 13.0 - uTime * 0.78)
            ) * 0.00455;
            distortion += uPointer * (1.0 - smoothstep(0.0, 0.47, radius)) * 0.0104;

            vec2 sampleUv = spun + distortion + 0.5;
            vec4 texel = texture2D(uTexture, sampleUv);

            float commonLight = min(texel.r, min(texel.g, texel.b));
            float whiteEdge = smoothstep(0.88, 0.99, commonLight) * smoothstep(0.32, 0.46, radius);
            float alpha = silhouette * (1.0 - whiteEdge * 0.96);

            vec2 spherePoint = centered / 0.47;
            float sphereZ = sqrt(max(0.0, 1.0 - dot(spherePoint, spherePoint)));
            vec3 normal = normalize(vec3(spherePoint, sphereZ));
            vec3 lightDirection = normalize(vec3(-0.4, 0.72, 0.9));
            float diffuse = max(dot(normal, lightDirection), 0.0);
            float fresnel = pow(1.0 - max(normal.z, 0.0), 2.4);
            float travellingGlint = smoothstep(0.73, 0.98, 0.5 + 0.5 * sin(angle * 3.0 - uTime * 1.3 + radius * 15.0));

            vec3 color = texel.rgb;
            color *= 0.88 + diffuse * 0.25;
            color.g *= 1.05;
            color += vec3(0.08, 0.82, 0.28) * fresnel * 0.546 * uPulse;
            color += vec3(0.38, 1.0, 0.58) * travellingGlint * 0.156 * (1.0 - radius);
            gl_FragColor = vec4(color, alpha);
          }
        `
      });

      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
      mesh.scale.setScalar(0.88);
      scene.add(mesh);

      let pointerX = 0;
      let pointerY = 0;
      let easedX = 0;
      let easedY = 0;
      let frameId = 0;
      let lastFrame = 0;
      let paused = document.hidden;

      function resize() {
        const rect = canvas.getBoundingClientRect();
        const width = Math.max(1, rect.width);
        const height = Math.max(1, rect.height);
        const aspect = width / height;
        renderer.setSize(width, height, false);
        camera.left = -aspect;
        camera.right = aspect;
        camera.top = 1;
        camera.bottom = -1;
        camera.updateProjectionMatrix();
        renderer.render(scene, camera);
      }

      function draw(timestamp) {
        easedX += (pointerX - easedX) * 0.045;
        easedY += (pointerY - easedY) * 0.045;
        uniforms.uTime.value = timestamp * 0.001;
        uniforms.uPointer.value.set(easedX, easedY);
        uniforms.uPulse.value = 0.9 + Math.sin(timestamp * 0.00135) * 0.13;
        mesh.rotation.x = easedY * 0.0455;
        mesh.rotation.y = easedX * 0.0715;
        renderer.render(scene, camera);
      }

      function tick(timestamp) {
        if (paused) return;
        if (timestamp - lastFrame >= 1000 / 45) {
          lastFrame = timestamp;
          draw(timestamp);
        }
        frameId = window.requestAnimationFrame(tick);
      }

      function handlePointer(event) {
        if (reduceMotionQuery.matches) return;
        const rect = canvas.getBoundingClientRect();
        pointerX = Math.max(-1, Math.min(1, ((event.clientX - rect.left) / rect.width - 0.5) * 2));
        pointerY = Math.max(-1, Math.min(1, ((event.clientY - rect.top) / rect.height - 0.5) * 2));
      }

      function handleVisibility() {
        paused = document.hidden;
        if (paused) window.cancelAnimationFrame(frameId);
        else if (!reduceMotionQuery.matches) frameId = window.requestAnimationFrame(tick);
      }

      if ('ResizeObserver' in window) new ResizeObserver(resize).observe(canvas);
      else window.addEventListener('resize', resize);
      window.addEventListener('pointermove', handlePointer, { passive: true });
      document.addEventListener('visibilitychange', handleVisibility);

      resize();
      draw(0);
      orb.dataset.orbMode = 'webgl';
      if (!reduceMotionQuery.matches) frameId = window.requestAnimationFrame(tick);
    } catch (error) {
      console.warn('Emerald orb enhancement unavailable; using the animated image fallback.', error);
    }
  }
}());
