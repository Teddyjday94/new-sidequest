(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHeader();
    initReveals();
    initPointerGlow();
    initProjectTilt();
    initImageFallbacks();
    initFormFeedback();

    var year = document.getElementById('current-year');
    if (year) year.textContent = String(new Date().getFullYear());
  });

  function initMenu() {
    var toggle = document.getElementById('menu-toggle');
    var links = document.getElementById('nav-links');
    if (!toggle || !links) return;

    function closeMenu(returnFocus) {
      links.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      if (returnFocus) toggle.focus();
    }

    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      links.classList.toggle('is-open', !open);
    });

    links.addEventListener('click', function (event) {
      if (event.target.closest('a')) closeMenu(false);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && links.classList.contains('is-open')) closeMenu(true);
    });
  }

  function initHeader() {
    var header = document.getElementById('site-header');
    if (!header) return;

    function update() {
      header.classList.toggle('is-scrolled', window.scrollY > 18);
    }

    update();
    window.addEventListener('scroll', update, { passive: true });
  }

  function initReveals() {
    var items = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
    if (!items.length) return;

    if (reduceMotion.matches || !('IntersectionObserver' in window)) {
      items.forEach(function (item) { item.classList.add('is-visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -7% 0px' });

    items.forEach(function (item) { observer.observe(item); });
  }

  function initPointerGlow() {
    if (!finePointer.matches || reduceMotion.matches) return;

    window.addEventListener('pointermove', function (event) {
      document.documentElement.style.setProperty('--mx', event.clientX + 'px');
      document.documentElement.style.setProperty('--my', event.clientY + 'px');
    }, { passive: true });
  }

  function initProjectTilt() {
    if (!finePointer.matches || reduceMotion.matches) return;

    document.querySelectorAll('[data-tilt]').forEach(function (card) {
      card.addEventListener('pointermove', function (event) {
        var rect = card.getBoundingClientRect();
        var x = (event.clientX - rect.left) / rect.width;
        var y = (event.clientY - rect.top) / rect.height;
        var ry = (x - 0.5) * 2.4;
        var rx = (0.5 - y) * 1.8;
        card.style.setProperty('--rx', rx.toFixed(2) + 'deg');
        card.style.setProperty('--ry', ry.toFixed(2) + 'deg');
      });

      card.addEventListener('pointerleave', function () {
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
      });
    });
  }

  function initImageFallbacks() {
    document.querySelectorAll('.project-media img, .lab-art img').forEach(function (image) {
      image.addEventListener('error', function () {
        image.style.display = 'none';
        var parent = image.parentElement;
        if (!parent) return;
        parent.classList.add('image-failed');
        var fallback = document.createElement('span');
        fallback.textContent = 'Project preview';
        fallback.style.cssText = 'position:absolute;inset:0;display:grid;place-items:center;color:#a8afa6;font-family:monospace;font-size:12px;letter-spacing:.08em;text-transform:uppercase;background:radial-gradient(circle at 50% 45%,rgba(185,255,88,.12),transparent 32%),#0d1015;';
        parent.appendChild(fallback);
      });
    });
  }

  function initFormFeedback() {
    var form = document.getElementById('inquiry-form');
    var status = document.getElementById('form-status');
    if (!form || !status) return;

    form.addEventListener('invalid', function (event) {
      event.target.setAttribute('aria-invalid', 'true');
      status.textContent = 'Check the highlighted fields and try again.';
    }, true);

    form.addEventListener('input', function (event) {
      if (event.target.matches('input, textarea, select') && event.target.validity.valid) {
        event.target.removeAttribute('aria-invalid');
      }
    });

    form.addEventListener('submit', function () {
      status.textContent = 'Sending your inquiry...';
    });
  }
}());