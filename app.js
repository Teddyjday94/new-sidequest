(function () {
  'use strict';

  const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  document.addEventListener('DOMContentLoaded', () => {
    initMenu();
    initReveals();
    initImageFallbacks();
    initFormFeedback();
    initChromeObject();

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

  function initChromeObject() {
    const canvas = document.getElementById('chrome-object');
    if (!canvas) return;

    const gl = canvas.getContext('webgl', { alpha: true, antialias: true, premultipliedAlpha: false });
    if (!gl) {
      initChromeFallback(canvas);
      return;
    }

    const vertexSource = `
      attribute vec2 position;
      void main() { gl_Position = vec4(position, 0.0, 1.0); }
    `;
    const fragmentSource = `
      precision highp float;
      uniform vec2 resolution;
      uniform float time;
      uniform vec2 pointer;

      float hash21(vec2 p) {
        p = fract(p * vec2(123.34, 456.21));
        p += dot(p, p + 45.32);
        return fract(p.x * p.y);
      }

      float noise(vec3 p) {
        vec3 cell = floor(p);
        vec3 blend = fract(p);
        blend = blend * blend * (3.0 - 2.0 * blend);
        float a = hash21(cell.xy + cell.z * 37.0);
        float b = hash21(cell.xy + vec2(1.0, 0.0) + cell.z * 37.0);
        float c = hash21(cell.xy + vec2(0.0, 1.0) + cell.z * 37.0);
        float d = hash21(cell.xy + vec2(1.0, 1.0) + cell.z * 37.0);
        float e = hash21(cell.xy + (cell.z + 1.0) * 37.0);
        float f = hash21(cell.xy + vec2(1.0, 0.0) + (cell.z + 1.0) * 37.0);
        float g = hash21(cell.xy + vec2(0.0, 1.0) + (cell.z + 1.0) * 37.0);
        float h = hash21(cell.xy + vec2(1.0, 1.0) + (cell.z + 1.0) * 37.0);
        float lower = mix(mix(a, b, blend.x), mix(c, d, blend.x), blend.y);
        float upper = mix(mix(e, f, blend.x), mix(g, h, blend.x), blend.y);
        return mix(lower, upper, blend.z);
      }

      float fbm(vec3 p) {
        float value = 0.0;
        float amplitude = 0.5;
        for (int i = 0; i < 4; i++) {
          value += amplitude * noise(p);
          p = p * 2.03 + vec3(3.1, 1.7, 2.4);
          amplitude *= 0.5;
        }
        return value;
      }

      float scene(vec3 p) {
        float flow = fbm(p * 2.1 + vec3(time * 0.12, -time * 0.09, time * 0.08));
        float detail = noise(p * 2.2 - vec3(time * 0.08));
        float ripple = sin(p.y * 9.0 + p.z * 3.4 + sin(p.x * 4.5 + time * 0.5) * 1.2 - time * 1.25 + flow * 2.0);
        return length(p) - (0.78 + (flow - 0.5) * 0.1 + (detail - 0.5) * 0.012 + ripple * 0.012);
      }

      vec3 getNormal(vec3 p) {
        vec2 e = vec2(0.002, 0.0);
        return normalize(vec3(
          scene(p + e.xyy) - scene(p - e.xyy),
          scene(p + e.yxy) - scene(p - e.yxy),
          scene(p + e.yyx) - scene(p - e.yyx)
        ));
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);
        uv.x -= pointer.x * 0.035;
        uv.y += pointer.y * 0.035;
        vec3 rayOrigin = vec3(0.0, 0.0, 2.7);
        vec3 rayDirection = normalize(vec3(uv * 0.92, -2.35));
        float distanceTravelled = 0.0;
        float hit = 0.0;
        vec3 position = rayOrigin;

        for (int i = 0; i < 72; i++) {
          position = rayOrigin + rayDirection * distanceTravelled;
          float distanceToSurface = scene(position);
          if (distanceToSurface < 0.001) { hit = 1.0; break; }
          distanceTravelled += distanceToSurface * 0.68;
          if (distanceTravelled > 5.0) break;
        }

        if (hit < 0.5) discard;

        vec3 normal = getNormal(position);
        vec3 lightDirection = normalize(vec3(-0.6, 0.8, 1.0));
        float diffuse = max(dot(normal, lightDirection), 0.0);
        float fresnel = pow(1.0 - max(dot(normal, -rayDirection), 0.0), 2.8);
        float liquid = fbm(position * 3.4 + vec3(time * 0.16, time * 0.08, -time * 0.11));
        float bands = sin((position.x * 2.8 + position.y * 2.4 + position.z * 3.2) + liquid * 4.0 + time * 0.65);
        bands = smoothstep(-0.38, 0.55, bands);

        vec3 cyan = vec3(0.03, 0.52, 0.2);
        vec3 blue = vec3(0.008, 0.1, 0.045);
        vec3 violet = vec3(0.03, 0.34, 0.12);
        vec3 pink = vec3(0.38, 0.72, 0.05);
        vec3 color = mix(blue, violet, smoothstep(0.18, 0.78, liquid));
        color = mix(color, cyan, bands * 0.52 + diffuse * 0.32);
        color = mix(color, pink, smoothstep(0.62, 0.96, liquid) * (1.0 - diffuse) * 0.72);

        float specular = pow(max(dot(reflect(-lightDirection, normal), -rayDirection), 0.0), 34.0);
        color += vec3(0.52, 0.86, 0.62) * specular * 1.15;
        color += vec3(0.08, 0.62, 0.24) * fresnel * 0.42;
        color *= 0.58 + diffuse * 0.48;

        float edge = smoothstep(0.04, 0.5, fresnel);
        gl_FragColor = vec4(color, 0.92 + edge * 0.08);
      }
    `;

    const compile = (type, source) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return null;
      return shader;
    };

    const vertexShader = compile(gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = compile(gl.FRAGMENT_SHADER, fragmentSource);
    if (!vertexShader || !fragmentShader) {
      initChromeFallback(canvas);
      return;
    }

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      initChromeFallback(canvas);
      return;
    }

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.useProgram(program);
    const position = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    const resolution = gl.getUniformLocation(program, 'resolution');
    const time = gl.getUniformLocation(program, 'time');
    const pointer = gl.getUniformLocation(program, 'pointer');
    let width = 0;
    let height = 0;
    let frameId = 0;
    let lastFrame = 0;
    let pointerX = 0;
    let pointerY = 0;
    let easedX = 0;
    let easedY = 0;
    let paused = document.hidden;

    function resize() {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      gl.viewport(0, 0, canvas.width, canvas.height);
      draw(0);
    }

    function draw(timestamp) {
      if (!width || !height) return;
      easedX += (pointerX - easedX) * 0.045;
      easedY += (pointerY - easedY) * 0.045;
      gl.uniform2f(resolution, canvas.width, canvas.height);
      gl.uniform1f(time, timestamp * 0.001);
      gl.uniform2f(pointer, easedX, easedY);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
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
    else {
      window.addEventListener('resize', resize);
      resize();
    }
    window.addEventListener('pointermove', handlePointer, { passive: true });
    document.addEventListener('visibilitychange', handleVisibility);
    resize();
    if (!reduceMotionQuery.matches) frameId = window.requestAnimationFrame(tick);
  }

  function initChromeFallback(canvas) {
    const context = canvas.getContext('2d');
    if (!context) return;
    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(rect.width * ratio);
      canvas.height = Math.round(rect.height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      const radius = Math.min(rect.width, rect.height) * 0.365;
      const x = rect.width * 0.54;
      const y = rect.height * 0.48;
      const gradient = context.createRadialGradient(x - radius * 0.3, y - radius * 0.36, 0, x, y, radius);
      gradient.addColorStop(0, '#efffff');
      gradient.addColorStop(0.22, '#52dfff');
      gradient.addColorStop(0.62, '#6935c7');
      gradient.addColorStop(1, '#10175a');
      context.clearRect(0, 0, rect.width, rect.height);
      context.fillStyle = gradient;
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();
    };
    if ('ResizeObserver' in window) new ResizeObserver(draw).observe(canvas);
    else window.addEventListener('resize', draw);
    draw();
  }
}());
