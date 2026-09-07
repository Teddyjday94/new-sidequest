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
      status.textContent = 'Opening the secure form submission...';
    });
  }

  function initChromeObject() {
    const canvas = document.getElementById('chrome-object');
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

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

    const blobs = Array.from({ length: 24 }, (_, index) => ({
      angle: index * 2.39996,
      distance: 0.1 + ((index * 37) % 71) / 100,
      size: 0.12 + ((index * 19) % 21) / 100,
      hue: index % 3,
      drift: 0.35 + ((index * 11) % 17) / 20
    }));

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

    function spherePath(centerX, centerY, radius, time) {
      const points = 96;
      context.beginPath();
      for (let index = 0; index <= points; index += 1) {
        const angle = (index / points) * Math.PI * 2;
        const wobble = 1 + 0.035 * Math.sin(angle * 3 + time * 1.4) + 0.022 * Math.sin(angle * 7 - time * 0.9);
        const x = centerX + Math.cos(angle) * radius * wobble;
        const y = centerY + Math.sin(angle) * radius * wobble;
        if (index === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
      }
      context.closePath();
    }

    function paintBlob(centerX, centerY, radius, blob, time) {
      const drift = time * blob.drift;
      const angle = blob.angle + drift * 0.18;
      const distance = radius * (blob.distance * 0.76 + Math.sin(drift + blob.angle) * 0.07);
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance * 0.82;
      const size = radius * (blob.size + Math.sin(drift * 1.3) * 0.025);
      const color = blob.hue === 0 ? 'rgba(18, 220, 255, 0.62)' : blob.hue === 1 ? 'rgba(244, 50, 210, 0.56)' : 'rgba(101, 75, 255, 0.58)';

      context.save();
      context.translate(x, y);
      context.rotate(angle + Math.sin(drift) * 0.5);
      context.scale(1, 0.62 + Math.sin(blob.angle) * 0.14);
      context.filter = 'blur(12px)';
      const gradient = context.createRadialGradient(-size * 0.3, -size * 0.35, 0, 0, 0, size);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.76)');
      gradient.addColorStop(0.2, color);
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      context.fillStyle = gradient;
      context.beginPath();
      context.ellipse(0, 0, size, size * 0.72, 0, 0, Math.PI * 2);
      context.fill();
      context.restore();
    }

    function draw() {
      if (!width || !height) return;

      context.clearRect(0, 0, width, height);
      easedX += (pointerX - easedX) * 0.045;
      easedY += (pointerY - easedY) * 0.045;

      const centerX = width * (0.54 + easedX * 0.025);
      const centerY = height * (0.48 + easedY * 0.025);
      const radius = Math.min(width, height) * 0.365;
      const lightX = centerX - radius * (0.35 + easedX * 0.12);
      const lightY = centerY - radius * (0.38 + easedY * 0.08);

      context.save();
      spherePath(centerX, centerY, radius, phase);
      context.clip();

      const base = context.createRadialGradient(lightX, lightY, radius * 0.04, centerX, centerY, radius * 1.15);
      base.addColorStop(0, '#f6ffff');
      base.addColorStop(0.16, '#91edff');
      base.addColorStop(0.42, '#5276de');
      base.addColorStop(0.7, '#8327ad');
      base.addColorStop(0.9, '#1b2369');
      base.addColorStop(1, '#070b2b');
      context.fillStyle = base;
      context.fillRect(centerX - radius, centerY - radius, radius * 2, radius * 2);

      context.globalCompositeOperation = 'screen';
      blobs.forEach((blob) => paintBlob(centerX, centerY, radius, blob, phase));

      const sheen = context.createRadialGradient(lightX, lightY, 0, lightX, lightY, radius * 0.82);
      sheen.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
      sheen.addColorStop(0.13, 'rgba(224, 255, 255, 0.2)');
      sheen.addColorStop(0.55, 'rgba(255, 255, 255, 0.02)');
      sheen.addColorStop(1, 'rgba(0, 0, 0, 0)');
      context.fillStyle = sheen;
      context.fillRect(centerX - radius, centerY - radius, radius * 2, radius * 2);
      context.restore();

      context.save();
      spherePath(centerX, centerY, radius, phase);
      context.strokeStyle = 'rgba(210, 255, 255, 0.58)';
      context.lineWidth = Math.max(1, radius * 0.012);
      context.shadowColor = 'rgba(99, 243, 255, 0.65)';
      context.shadowBlur = radius * 0.12;
      context.stroke();
      context.restore();

      context.save();
      context.translate(lightX, lightY);
      context.rotate(-0.35 + easedX * 0.15);
      context.scale(1, 0.42);
      context.filter = 'blur(15px)';
      const highlight = context.createRadialGradient(0, 0, 0, 0, 0, radius * 0.32);
      highlight.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
      highlight.addColorStop(0.24, 'rgba(219, 255, 255, 0.38)');
      highlight.addColorStop(1, 'rgba(255, 255, 255, 0)');
      context.fillStyle = highlight;
      context.beginPath();
      context.ellipse(0, 0, radius * 0.32, radius * 0.18, 0, 0, Math.PI * 2);
      context.fill();
      context.restore();
    }

    function tick(timestamp) {
      if (paused) return;
      if (timestamp - lastFrame >= 1000 / 30) {
        lastFrame = timestamp;
        phase += 0.012;
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
