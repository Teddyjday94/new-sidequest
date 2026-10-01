(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHeader();
    initPortfolioUpdates();
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

  function initPortfolioUpdates() {
    var proofCount = document.querySelector('.hero-proof > div:first-child strong');
    if (proofCount) proofCount.textContent = '07';

    var mowLink = document.querySelector('.project-grid--clients a[href*="ascensionmowngeaux"]');
    if (mowLink) {
      mowLink.href = 'https://ascensionmowngeaux.com/';
      var mowDomain = mowLink.querySelector('.browser-bar small');
      if (mowDomain) mowDomain.textContent = 'ascensionmowngeaux.com';
      var mowCard = mowLink.closest('.project-card');
      if (mowCard) mowCard.setAttribute('data-project', 'ascension-mow-geaux');
    }

    var grid = document.querySelector('.project-grid--clients');
    if (grid && !grid.querySelector('[data-project="river-city-rolloffs"]')) {
      var article = document.createElement('article');
      article.className = 'project-card project-card--feature reveal';
      article.setAttribute('data-tilt', '');
      article.setAttribute('data-project', 'river-city-rolloffs');
      article.style.gridColumn = '1 / -1';
      article.innerHTML = [
        '<a href="https://rivercityrolloffsla.com/" target="_blank" rel="noopener">',
          '<div class="project-browser">',
            '<div class="browser-bar"><span></span><span></span><span></span><small>rivercityrolloffsla.com</small></div>',
            '<div class="project-media"><img src="https://raw.githubusercontent.com/Teddyjday94/river-city-rolloffs/main/assets/568274538_122108232015036618_1036784660605543071_n.jpg" alt="River City RollOffs truck hauling a roll-off dumpster" loading="lazy"></div>',
            '<div class="project-shade" aria-hidden="true"></div>',
            '<span class="project-index">07</span>',
          '</div>',
          '<div class="project-body">',
            '<div><p class="project-type">Dumpster rentals / Local service</p><h3>River City RollOffs</h3></div>',
            '<p>A bold local-service site built around fast rental requests, clear service areas, real jobsite proof, and direct call-or-text paths that make booking a dumpster simple.</p>',
            '<div class="project-tags"><span>Multi-page</span><span>Lead generation</span><span>Local SEO</span></div>',
            '<span class="project-link">View live site <b aria-hidden="true">↗</b></span>',
          '</div>',
        '</a>'
      ].join('');
      grid.appendChild(article);
    }

    if (!document.getElementById('logo-centering-tune')) {
      var logoTune = document.createElement('style');
      logoTune.id = 'logo-centering-tune';
      logoTune.textContent = [
        '.brand-logo-frame{place-items:center;width:36px;height:36px;flex-basis:36px;}',
        '.brand-logo{width:36px;height:36px;max-width:none;object-fit:cover;object-position:center center;}',
        '.quest-logo-stage{place-items:center;}',
        '.quest-logo-stage::before,.quest-visual::before,.quest-visual::after{display:none!important;}',
        '.quest-logo{width:96%;height:96%;margin:auto;object-fit:contain;object-position:center center;transform:none;filter:drop-shadow(0 10px 20px rgba(0,0,0,.28));}',
        '[data-project="ascension-mow-geaux"] .project-media,[data-project="river-city-rolloffs"] .project-media{background:#0d1015;}',
        '[data-project="ascension-mow-geaux"] .project-media img,[data-project="river-city-rolloffs"] .project-media img{object-fit:contain;object-position:center center;padding:14px 18px;transform:scale(.96);}',
        '[data-project="ascension-mow-geaux"]:hover .project-media img,[data-project="river-city-rolloffs"]:hover .project-media img{transform:scale(1);}',
        '@media (max-width:520px){.quest-logo{width:94%;height:94%;transform:none;}[data-project="ascension-mow-geaux"] .project-media img,[data-project="river-city-rolloffs"] .project-media img{padding:10px 12px;transform:scale(.97);}}'
      ].join('');
      document.head.appendChild(logoTune);
    }
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
