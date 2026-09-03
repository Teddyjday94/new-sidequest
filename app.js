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
      if (event.key === 'Escape' && links.classList.contains('is-open')) {
        close(true);
      }
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
      status.textContent = 'Opening the secure form submission…';
    });
  }

  function initChromeObject() {
    const canvas = document.getElementById('chrome-object');
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    const longitudinalSegments = 96;
    const radialSegments = 12;
    const baseVertices = [];
    const faces = [];
    let width = 0;
    let height = 0;
    let pixelRatio = 1;
    let frameId = 0;
    let lastFrame = 0;
    let pointerX = 0;
    let pointerY = 0;
    let easedX = 0;
    let easedY = 0;
    let phase = 0;
    let paused = document.hidden;

    for (let i = 0; i < longitudinalSegments; i += 1) {
      for (let j = 0; j < radialSegments; j += 1) {
        const major = 1.15;
        const minor = 0.38;
        const u = (i / longitudinalSegments) * Math.PI * 2;
        const v = (j / radialSegments) * Math.PI * 2;
        const warp = 0.1 * Math.sin(3 * u);
        const ring = major + (minor + warp) * Math.cos(v);
        baseVertices.push({
          x: ring * Math.cos(u),
          y: ring * Math.sin(u),
          z: (minor + warp) * Math.sin(v) + 0.12 * Math.sin(2 * u)
        });
      }
    }

    for (let i = 0; i < longitudinalSegments; i += 1) {
      for (let j = 0; j < radialSegments; j += 1) {
        const nextI = (i + 1) % longitudinalSegments;
        const nextJ = (j + 1) % radialSegments;
        faces.push([
          i * radialSegments + j,
          nextI * radialSegments + j,
          nextI * radialSegments + nextJ,
          i * radialSegments + nextJ
        ]);
      }
    }

    function resize() {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      draw();
    }

    function rotate(vertex, angleX, angleY, angleZ) {
      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);
      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);
      const cosZ = Math.cos(angleZ);
      const sinZ = Math.sin(angleZ);

      const x1 = vertex.x * cosY + vertex.z * sinY;
      const z1 = -vertex.x * sinY + vertex.z * cosY;
      const y2 = vertex.y * cosX - z1 * sinX;
      const z2 = vertex.y * sinX + z1 * cosX;

      return {
        x: x1 * cosZ - y2 * sinZ,
        y: x1 * sinZ + y2 * cosZ,
        z: z2
      };
    }

    function normal(a, b, c) {
      const ab = { x: b.x - a.x, y: b.y - a.y, z: b.z - a.z };
      const ac = { x: c.x - a.x, y: c.y - a.y, z: c.z - a.z };
      const cross = {
        x: ab.y * ac.z - ab.z * ac.y,
        y: ab.z * ac.x - ab.x * ac.z,
        z: ab.x * ac.y - ab.y * ac.x
      };
      const length = Math.hypot(cross.x, cross.y, cross.z) || 1;
      return { x: cross.x / length, y: cross.y / length, z: cross.z / length };
    }

    function shade(faceNormal) {
      const white = Math.abs(faceNormal.x * -0.42 + faceNormal.y * -0.68 + faceNormal.z * 0.6);
      const dark = Math.max(0, faceNormal.x * 0.62 + faceNormal.y * 0.25 - faceNormal.z * 0.74);
      const acid = Math.pow(Math.max(0, faceNormal.x * -0.48 + faceNormal.y * -0.8 + faceNormal.z * 0.36), 7);
      const gray = Math.max(18, Math.min(232, 45 + white * 205 - dark * 72));
      const red = Math.round(gray + (198 - gray) * acid);
      const green = Math.round(gray + (255 - gray) * acid);
      const blue = Math.round(gray + (85 - gray) * acid);
      return `rgb(${red} ${green} ${blue})`;
    }

    function draw() {
      if (!width || !height) return;

      context.clearRect(0, 0, width, height);
      easedX += (pointerX - easedX) * 0.045;
      easedY += (pointerY - easedY) * 0.045;

      const angleX = -0.72 + easedY * 0.16;
      const angleY = 0.68 + easedX * 0.16;
      const angleZ = -0.3 + phase;
      const focalLength = 4.6;
      const objectScale = Math.min(width, height) * 0.29;

      const vertices = baseVertices.map((vertex) => {
        const rotated = rotate(vertex, angleX, angleY, angleZ);
        const perspective = focalLength / (focalLength + rotated.z);
        return {
          ...rotated,
          px: width * 0.54 + rotated.x * objectScale * perspective,
          py: height * 0.48 + rotated.y * objectScale * perspective
        };
      });

      const sortedFaces = faces.map((indices) => {
        const points = indices.map((index) => vertices[index]);
        return {
          points,
          depth: points.reduce((sum, point) => sum + point.z, 0) / points.length,
          fill: shade(normal(points[0], points[1], points[2]))
        };
      }).sort((a, b) => b.depth - a.depth);

      sortedFaces.forEach((face) => {
        context.beginPath();
        context.moveTo(face.points[0].px, face.points[0].py);
        for (let i = 1; i < face.points.length; i += 1) {
          context.lineTo(face.points[i].px, face.points[i].py);
        }
        context.closePath();
        context.fillStyle = face.fill;
        context.fill();
      });
    }

    function tick(timestamp) {
      if (paused) return;
      if (timestamp - lastFrame >= 1000 / 30) {
        lastFrame = timestamp;
        phase += 0.0025;
        draw();
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
      if (paused) {
        window.cancelAnimationFrame(frameId);
      } else if (!reduceMotionQuery.matches) {
        frameId = window.requestAnimationFrame(tick);
      }
    }

    if ('ResizeObserver' in window) {
      new ResizeObserver(resize).observe(canvas);
    } else {
      window.addEventListener('resize', resize);
      resize();
    }

    window.addEventListener('pointermove', handlePointer, { passive: true });
    document.addEventListener('visibilitychange', handleVisibility);

    resize();
    if (!reduceMotionQuery.matches) {
      frameId = window.requestAnimationFrame(tick);
    }
  }
}());
