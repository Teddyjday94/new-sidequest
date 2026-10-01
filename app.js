(function () {
  'use strict';

  var extensionStyles = document.createElement('link');
  extensionStyles.rel = 'stylesheet';
  extensionStyles.href = 'four-page.css';
  document.head.appendChild(extensionStyles);

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHeader();
    initActiveNav();
    initWorkFilters();
    initReveals();
    initScrollProgress();
    initPointerGlow();
    initParallax();
    initProjectTilt();
    initMagneticButtons();
    initProcessProgress();
    initImageFallbacks();
    initPageTransitions();
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

  function initActiveNav() {
    var page = document.body && document.body.dataset ? document.body.dataset.page : '';
    if (!page) return;
    document.querySelectorAll('[data-nav-page]').forEach(function (link) {
      if (link.getAttribute('data-nav-page') === page) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  }

  function initHeader() {
    var header = document.getElementById('site-header');
    if (!header) return;

    function update() {
      header.classList.toggle('is-scrolled', window.scrollY > 18);
    }

    update();
    if (reduceMotion.matches) return;
    window.addEventListener('scroll', update, { passive: true });
  }

  function initWorkFilters() {
    var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-work-filter]'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-category]'));
    if (!buttons.length || !cards.length) return;

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        var value = button.getAttribute('data-work-filter');
        buttons.forEach(function (item) {
          item.setAttribute('aria-pressed', String(item === button));
        });
        cards.forEach(function (card) {
          var hidden = value !== 'all' && card.getAttribute('data-category') !== value;
          card.classList.toggle('is-filtered-out', hidden);
          card.setAttribute('aria-hidden', String(hidden));
        });
      });
    });
  }

  function initReveals() {
    var items = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
    var groups = Array.prototype.slice.call(document.querySelectorAll('[data-reveal-group]'));

    groups.forEach(function (group) {
      Array.prototype.slice.call(group.querySelectorAll('.reveal')).forEach(function (item, index) {
        item.style.setProperty('--reveal-index', String(index));
      });
    });

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

  function initScrollProgress() {
    if (reduceMotion.matches) return;
    var indicator = document.querySelector('.scroll-progress');
    if (!indicator) return;
    var scheduled = false;

    function update() {
      scheduled = false;
      var root = document.documentElement;
      var max = Math.max(1, root.scrollHeight - window.innerHeight);
      var progress = Math.max(0, Math.min(1, window.scrollY / max));
      root.style.setProperty('--scroll-progress', progress.toFixed(4));
    }

    function schedule() {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(update);
    }

    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
  }

  function initPointerGlow() {
    if (!finePointer.matches || reduceMotion.matches) return;
    window.addEventListener('pointermove', function (event) {
      document.documentElement.style.setProperty('--mx', event.clientX + 'px');
      document.documentElement.style.setProperty('--my', event.clientY + 'px');
    }, { passive: true });
  }

  function initParallax() {
    var items = Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));
    if (!items.length || reduceMotion.matches) return;
    var scheduled = false;

    function update() {
      scheduled = false;
      var viewport = window.innerHeight || document.documentElement.clientHeight;
      items.forEach(function (item) {
        var rect = item.getBoundingClientRect();
        var center = rect.top + rect.height / 2;
        var delta = (center - viewport / 2) / Math.max(1, viewport);
        var movement = Math.max(-18, Math.min(18, delta * -24));
        item.style.setProperty('--parallax-y', movement.toFixed(2) + 'px');
      });
    }

    function schedule() {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(update);
    }

    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
  }

  function initProjectTilt() {
    if (!finePointer.matches || reduceMotion.matches) return;
    document.querySelectorAll('[data-tilt]').forEach(function (card) {
      card.addEventListener('pointermove', function (event) {
        var rect = card.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        var x = (event.clientX - rect.left) / rect.width;
        var y = (event.clientY - rect.top) / rect.height;
        card.style.setProperty('--rx', ((0.5 - y) * 2.2).toFixed(2) + 'deg');
        card.style.setProperty('--ry', ((x - 0.5) * 3.2).toFixed(2) + 'deg');
        var media = card.querySelector('.project-media img');
        if (media) {
          media.style.setProperty('--media-x', ((0.5 - x) * 7).toFixed(2) + 'px');
          media.style.setProperty('--media-y', ((0.5 - y) * 5).toFixed(2) + 'px');
        }
      });
      card.addEventListener('pointerleave', function () {
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
        var media = card.querySelector('.project-media img');
        if (media) {
          media.style.setProperty('--media-x', '0px');
          media.style.setProperty('--media-y', '0px');
        }
      });
    });
  }

  function initMagneticButtons() {
    if (!finePointer.matches || reduceMotion.matches) return;
    document.querySelectorAll('[data-magnetic]').forEach(function (button) {
      button.addEventListener('pointermove', function (event) {
        var rect = button.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        var x = event.clientX - (rect.left + rect.width / 2);
        var y = event.clientY - (rect.top + rect.height / 2);
        button.style.setProperty('--mag-x', Math.max(-6, Math.min(6, x * 0.08)).toFixed(2) + 'px');
        button.style.setProperty('--mag-y', Math.max(-5, Math.min(5, y * 0.08)).toFixed(2) + 'px');
      });
      button.addEventListener('pointerleave', function () {
        button.style.setProperty('--mag-x', '0px');
        button.style.setProperty('--mag-y', '0px');
      });
    });
  }

  function initProcessProgress() {
    var process = document.querySelector('.service-process');
    var rail = document.querySelector('[data-process-progress]');
    var steps = Array.prototype.slice.call(document.querySelectorAll('[data-process-step]'));
    if (!process || !rail || !steps.length) return;

    if (reduceMotion.matches) {
      rail.style.setProperty('--process-progress', '1');
      steps.forEach(function (step) { step.classList.add('is-active'); });
      return;
    }

    var scheduled = false;
    function update() {
      scheduled = false;
      var rect = process.getBoundingClientRect();
      var viewport = window.innerHeight || document.documentElement.clientHeight;
      var start = viewport * 0.72;
      var distance = Math.max(1, rect.height - viewport * 0.35);
      var progress = Math.max(0, Math.min(1, (start - rect.top) / distance));
      rail.style.setProperty('--process-progress', progress.toFixed(4));
      steps.forEach(function (step) {
        var stepRect = step.getBoundingClientRect();
        step.classList.toggle('is-active', stepRect.top < viewport * 0.68);
      });
    }
    function schedule() {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(update);
    }
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
  }

  function initImageFallbacks() {
    document.querySelectorAll('.project-media img, .lab-art img').forEach(function (image) {
      image.addEventListener('error', function () {
        image.style.display = 'none';
        var parent = image.parentElement;
        if (!parent || parent.querySelector('.image-fallback')) return;
        parent.classList.add('image-failed');
        var fallback = document.createElement('span');
        fallback.className = 'image-fallback';
        fallback.textContent = 'Project preview unavailable';
        parent.appendChild(fallback);
      });
    });
  }

  function initPageTransitions() {
    if (reduceMotion.matches) return;
    if (typeof document.startViewTransition === 'function') return;

    document.addEventListener('click', function (event) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      var anchor = event.target.closest && event.target.closest('a[href]');
      if (!anchor) return;
      if (anchor.hasAttribute('download')) return;
      var target = anchor.getAttribute('target');
      if (target === '_blank') return;
      var href = anchor.getAttribute('href') || '';
      if (!href || href.charAt(0) === '#' || href.indexOf('mailto:') === 0 || href.indexOf('tel:') === 0) return;

      var url;
      try { url = new URL(anchor.href || href, window.location.href); } catch (error) { return; }
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search && url.hash) return;

      event.preventDefault();
      document.body.classList.add('is-page-leaving');
      setTimeout(function () { window.location.href = url.href; }, 140);
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
