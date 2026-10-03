(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHeader();
    initActiveNav();
    initWorkFilters();
    initSplitHeadings();
    initReveals();
    initCountUps();
    initSpotlights();
    initMarqueeVelocity();
    initFooterWordmark();
    initNeonTraces();
    initScrollProgress();
    initPointerGlow();
    initParallax();
    initProjectTilt();
    initMagneticButtons();
    initProcessProgress();
    initImageFallbacks();
    initOrb();
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

    var lastY = window.scrollY;
    var links = document.getElementById('nav-links');

    function update() {
      var y = window.scrollY;
      header.classList.toggle('is-scrolled', y > 18);
      // Tuck the header away while reading down the page; bring it back on any scroll up.
      var menuOpen = links && links.classList.contains('is-open');
      if (!reduceMotion.matches && !menuOpen && Math.abs(y - lastY) > 6) {
        header.classList.toggle('is-hidden', y > lastY && y > 240);
      }
      if (Math.abs(y - lastY) > 6) lastY = y;
    }

    update();
    window.addEventListener('scroll', update, { passive: true });
    header.addEventListener('focusin', function () { header.classList.remove('is-hidden'); });
  }

  // Wraps each word of a heading so it can rise in on its own beat.
  function initSplitHeadings() {
    if (reduceMotion.matches) return;
    var headings = document.querySelectorAll('.hero h1, .page-hero h1, .section-intro h2, .process-story__intro h2, .closing-cta__inner h2, .why-grid h2');
    headings.forEach(function (heading) {
      if (heading.classList.contains('split')) return;
      var count = 0;
      heading.setAttribute('aria-label', heading.textContent.replace(/\s+/g, ' ').trim());

      function wrap(node) {
        Array.prototype.slice.call(node.childNodes).forEach(function (child) {
          if (child.nodeType === 3) {
            var parts = child.textContent.split(/(\s+)/);
            var fragment = document.createDocumentFragment();
            parts.forEach(function (part) {
              if (!part) return;
              if (/^\s+$/.test(part)) {
                fragment.appendChild(document.createTextNode(' '));
                return;
              }
              var word = document.createElement('span');
              word.className = 'word';
              word.setAttribute('aria-hidden', 'true');
              var inner = document.createElement('span');
              inner.className = 'word-inner';
              inner.style.setProperty('--w', String(count++));
              inner.textContent = part;
              word.appendChild(inner);
              fragment.appendChild(word);
            });
            node.replaceChild(fragment, child);
          } else if (child.nodeType === 1 && child.tagName !== 'BR') {
            wrap(child);
          }
        });
      }

      wrap(heading);
      heading.classList.add('split');
      // Headings outside a .reveal block reveal themselves.
      if (!heading.closest('.reveal')) heading.classList.add('reveal');
    });
  }

  // Counts stat numbers up from zero when they scroll into view, keeping leading zeros.
  function initCountUps() {
    var stats = Array.prototype.slice.call(document.querySelectorAll('.hero-proof strong, .page-stat'));
    if (!stats.length || reduceMotion.matches || !('IntersectionObserver' in window)) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        var element = entry.target;
        var target = element.dataset.count;
        var value = parseInt(target, 10);
        var width = target.length;
        var started = 0;
        function step(now) {
          if (!started) started = now;
          var progress = Math.min(1, (now - started) / 1400);
          var eased = 1 - Math.pow(1 - progress, 4);
          element.textContent = String(Math.round(value * eased)).padStart(width, '0');
          if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
    }, { threshold: 0.6 });

    stats.forEach(function (element) {
      var text = element.textContent.trim();
      if (!/^\d+$/.test(text)) return;
      element.dataset.count = text;
      element.textContent = text.replace(/\d/g, '0');
      observer.observe(element);
    });
  }

  // Cards whose border and surface light up around the cursor.
  function initSpotlights() {
    if (!finePointer.matches || reduceMotion.matches) return;
    var cards = document.querySelectorAll('.project-card, .service-preview-card, .service-card, .capability-matrix article, .closing-cta__inner, .inquiry-form');
    cards.forEach(function (card) {
      card.classList.add('spotlight');
      card.addEventListener('pointermove', function (event) {
        var rect = card.getBoundingClientRect();
        card.style.setProperty('--sx', (event.clientX - rect.left).toFixed(0) + 'px');
        card.style.setProperty('--sy', (event.clientY - rect.top).toFixed(0) + 'px');
      }, { passive: true });
    });
  }

  // Footer "SideQuest Creative": each line is scaled to its share of the content width,
  // "SideQuest" letters rise in and "Creative" flickers on like a neon sign.
  function initFooterWordmark() {
    var marks = Array.prototype.slice.call(document.querySelectorAll('.footer-wordmark'));
    if (!marks.length) return;
    // Share of the content width each line should span.
    var widths = { 'wm-line--main': 1, 'wm-line--sub': 0.6 };

    marks.forEach(function (mark) {
      var count = 0;
      mark.querySelectorAll('.wm-line').forEach(function (line) {
        var letters = line.textContent.trim().split('');
        line.textContent = '';
        letters.forEach(function (letter, index) {
          var span = document.createElement('span');
          span.className = 'wm-letter';
          span.textContent = letter;
          span.style.setProperty('--i', String(count++));
          span.style.setProperty('--j', String(index));
          span.style.setProperty('--p', (index / Math.max(1, letters.length - 1)).toFixed(3));
          line.appendChild(span);
        });
      });
    });

    function fit() {
      marks.forEach(function (mark) {
        var available = mark.clientWidth;
        mark.querySelectorAll('.wm-line').forEach(function (line) {
          var share = widths['wm-line--main'];
          Object.keys(widths).forEach(function (name) { if (line.classList.contains(name)) share = widths[name]; });
          var first = line.querySelector('.wm-letter');
          var last = line.lastElementChild;
          if (!first || !last || !available) return;
          // Measure the letters at a known size, then scale to the target width.
          line.style.fontSize = '100px';
          var natural = last.getBoundingClientRect().right - first.getBoundingClientRect().left;
          if (!natural) return;
          line.style.fontSize = (100 * available * share / natural * 0.99).toFixed(2) + 'px';
        });
      });
    }

    fit();
    window.addEventListener('resize', fit);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);

    if (reduceMotion.matches || !('IntersectionObserver' in window)) {
      marks.forEach(function (mark) { mark.classList.add('is-visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.2 });

    marks.forEach(function (mark) { observer.observe(mark); });
  }

  // Adds a border layer that a neon light traces around once when each card reveals.
  function initNeonTraces() {
    if (reduceMotion.matches) return;
    document.querySelectorAll('.project-card.reveal, .service-preview-card.reveal, .service-card.reveal, .closing-cta__inner.reveal, .quest-panel.reveal, .capability-matrix article.reveal').forEach(function (card) {
      if (getComputedStyle(card).position === 'static') card.style.position = 'relative';
      var trace = document.createElement('span');
      trace.className = 'neon-trace';
      trace.setAttribute('aria-hidden', 'true');
      card.appendChild(trace);
    });
  }

  // The hero marquee speeds up with scroll velocity, then eases back to its cruise.
  function initMarqueeVelocity() {
    var track = document.querySelector('.hero-marquee > div');
    if (!track || reduceMotion.matches || typeof track.getAnimations !== 'function') return;
    var lastY = window.scrollY;
    var boost = 0;
    var running = false;

    function frame() {
      boost *= 0.92;
      track.getAnimations().forEach(function (animation) { animation.playbackRate = 1 + boost; });
      if (boost > 0.02) requestAnimationFrame(frame);
      else running = false;
    }

    window.addEventListener('scroll', function () {
      var y = window.scrollY;
      boost = Math.min(5, boost + Math.abs(y - lastY) * 0.04);
      lastY = y;
      if (!running) {
        running = true;
        requestAnimationFrame(frame);
      }
    }, { passive: true });
  }

  function initWorkFilters() {
    var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-work-filter]'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-category]'));
    if (!buttons.length || !cards.length) return;

    // A pill that slides between filters instead of the highlight jumping.
    var bar = buttons[0].parentElement;
    var indicator = document.createElement('span');
    indicator.className = 'filter-indicator';
    indicator.setAttribute('aria-hidden', 'true');
    bar.insertBefore(indicator, bar.firstChild);
    bar.classList.add('has-indicator');

    function moveIndicator() {
      var active = buttons.filter(function (item) { return item.getAttribute('aria-pressed') === 'true'; })[0];
      if (!active) return;
      indicator.style.width = active.offsetWidth + 'px';
      indicator.style.height = active.offsetHeight + 'px';
      indicator.style.transform = 'translate(' + active.offsetLeft + 'px,' + active.offsetTop + 'px)';
    }

    moveIndicator();
    window.addEventListener('resize', moveIndicator);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(moveIndicator);

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        var value = button.getAttribute('data-work-filter');
        buttons.forEach(function (item) {
          item.setAttribute('aria-pressed', String(item === button));
        });
        moveIndicator();
        var shown = 0;
        cards.forEach(function (card) {
          var hidden = value !== 'all' && card.getAttribute('data-category') !== value;
          card.classList.toggle('is-filtered-out', hidden);
          card.setAttribute('aria-hidden', String(hidden));
          card.classList.remove('is-entering');
          if (!hidden && !reduceMotion.matches) {
            // Restart the entrance animation for the cards that stay or return.
            void card.offsetWidth;
            card.style.setProperty('--enter-index', String(shown++));
            card.classList.add('is-entering');
          }
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
      items.forEach(function (item) { item.classList.add('is-visible', 'reveal-done'); });
      return;
    }

    // Once an item has finished its entrance, hand it back to its own hover and tilt
    // styles: drop the stagger delay and the reveal's transform lock.
    function finish(item) {
      var index = parseFloat(item.style.getPropertyValue('--reveal-index')) || 0;
      window.setTimeout(function () { item.classList.add('reveal-done'); }, 900 + index * 70);
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        finish(entry.target);
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

  function initOrb() {
    var canvas = document.getElementById('orb-canvas');
    var artwork = document.getElementById('emerald-orb');
    if (!canvas || !artwork || !canvas.parentElement) return;

    var stage = canvas.parentElement;
    stage.dataset.orbMode = 'fallback';
    var gl = canvas.getContext('webgl', { alpha: true, antialias: true, powerPreference: 'low-power' });
    if (!gl) {
      console.warn('WebGL is unavailable; showing the supplied emerald orb artwork.');
      return;
    }

    var vertexSource = [
      'attribute vec2 a_position;',
      'void main() { gl_Position = vec4(a_position, 0.0, 1.0); }'
    ].join('\n');
    // Iridescent bubble orb: a thick, uneven film ring with chromatic fringes,
    // wrapped around a dark well of spiralling threads that pull toward the centre.
    var fragmentSource = [
      'precision highp float;',
      'uniform vec2 u_resolution;',
      'uniform float u_time;',
      'uniform vec2 u_pointer;',
      'uniform sampler2D u_logo;',
      'uniform float u_hasLogo;',
      'const float RADIUS = 0.66;',
      'const float LOGO_HALF = 0.43;',
      'const float LOGO_DEPTH = 0.075;',
      'const float CAMERA = 3.2;',
      'const int LAYERS = 12;',
      'const int LOOPS = 7;',
      'const int CHORDS = 48;',
      // The mark sits right of centre inside its square image; this re-centres it.
      'const vec2 LOGO_CENTER = vec2(0.535, 0.5);',
      'const float TAU = 6.28318;',
      'const vec3 LIME = vec3(0.725, 1.0, 0.345);',
      'const vec3 EMERALD = vec3(0.1, 0.95, 0.55);',
      'const vec3 AQUA = vec3(0.24, 1.0, 0.86);',
      'const vec3 DEEP = vec3(0.06, 0.48, 0.95);',
      // Film colours kept inside the brand range: lime, emerald, aqua, deep teal-blue.
      'vec3 film(float h) {',
      '  h = fract(h) * 4.0;',
      '  if (h < 1.0) return mix(LIME, EMERALD, h);',
      '  if (h < 2.0) return mix(EMERALD, AQUA, h - 1.0);',
      '  if (h < 3.0) return mix(AQUA, DEEP, h - 2.0);',
      '  return mix(DEEP, LIME, h - 3.0);',
      '}',
      'mat2 rotate2(float a) {',
      '  float s = sin(a);',
      '  float c = cos(a);',
      '  return mat2(c, -s, s, c);',
      '}',
      // One loop of the ring: a circle tilted out of the screen and turned, seen as an ellipse.
      // Returns (signed distance to the ellipse, angle along the loop).
      'vec2 loop(vec2 p, float radius, float tilt, float turn) {',
      '  vec2 q = rotate2(-turn) * p;',
      '  float squash = max(abs(cos(tilt)), 0.12);',
      '  q.y /= squash;',
      '  float len = max(length(q), 0.0001);',
      '  vec2 n = q / len;',
      '  float slope = length(vec2(n.x, n.y / squash));',
      '  return vec2((len - radius) / slope, atan(q.y, q.x));',
      '}',
      // The logo art sits on a dark tile; its brightness doubles as a cut-out mask.
      'vec4 logoSample(vec2 uv) {',
      '  if (uv.x < 0.0 || uv.y < 0.0 || uv.x > 1.0 || uv.y > 1.0) return vec4(0.0);',
      '  vec3 c = texture2D(u_logo, uv).rgb;',
      '  return vec4(c, smoothstep(0.17, 0.32, max(c.r, max(c.g, c.b))));',
      '}',
      // Where a camera ray meets the logo plane pushed `depth` back along its own normal.
      'vec2 logoUv(vec3 rd, mat3 tilt, float depth) {',
      '  vec3 ro = vec3(0.0, 0.0, -CAMERA);',
      '  vec3 n = tilt * vec3(0.0, 0.0, 1.0);',
      '  float hit = dot(n * depth - ro, n) / dot(rd, n);',
      '  vec3 local = (ro + rd * hit) * tilt;',
      '  return local.xy / (2.0 * LOGO_HALF) + LOGO_CENTER;',
      '}',
      'void main() {',
      '  vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution) / (0.5 * min(u_resolution.x, u_resolution.y));',
      '  float t = u_time;',
      '  float r = length(p) / RADIUS;',
      '  vec3 color = vec3(0.0);',
      '  float alpha = 0.0;',
      // Ring: a bundle of thin loops, each wobbling and spinning at its own pace, so the
      // band thickens, splits and crosses itself instead of reading as one clean circle.
      '  vec3 bloom = vec3(0.0);',
      '  for (int i = 0; i < LOOPS; i++) {',
      '    float k = float(i);',
      '    float f = k / float(LOOPS);',
      '    float direction = mod(k, 2.0) < 1.0 ? 1.0 : -1.0;',
      '    float radius = RADIUS * (0.9 + 0.07 * sin(k * 2.3 + t * 0.9));',
      '    float tilt = 0.22 + 0.32 * sin(t * (0.7 + f * 0.7) + k * 1.7) + u_pointer.y * 0.25;',
      '    float turn = k * 0.9 + u_pointer.x * 0.4 + t * (0.45 + f * 0.8) * direction;',
      '    vec2 d = loop(p, radius, tilt, turn);',
      // A bright stretch races around each loop, like light caught on a spinning hoop.
      '    float race = 0.5 + 0.5 * sin(d.y - t * (2.4 + f * 1.8) * direction);',
      '    float front = 0.3 + 0.7 * race * race;',
      '    float blur = 0.018 + 0.05 * (0.5 + 0.5 * sin(d.y * 2.0 + t * 1.7 + k));',
      '    float body = exp(-d.x * d.x / (blur * blur));',
      '    float core = exp(-abs(d.x) * 240.0);',
      '    vec3 tint = film(f * 0.6 + 0.32 * sin(d.y + k * 0.7) + t * 0.08);',
      '    color += tint * (body * 0.5 + core * 0.42) * front;',
      '    bloom += tint * exp(-abs(d.x) * 13.0) * front;',
      '  }',
      // String-art chords: straight lines tangent to an inner circle, leaving the centre hollow.
      '  if (r < 0.98) {',
      '    vec2 c = p - u_pointer * 0.03;',
      '    vec3 strands = vec3(0.0);',
      '    for (int i = 0; i < CHORDS; i++) {',
      '      float k = float(i);',
      '      float heading = k * TAU / float(CHORDS) + t * 0.55 + 0.35 * sin(t * 0.8 + k * 0.6);',
      // Chords hug the ring, so they fan into curved envelopes rather than crossing the middle.
      '      float reach = RADIUS * (0.64 + 0.12 * sin(k * 1.9 + t * 1.3));',
      '      float line = exp(-abs(dot(c, vec2(cos(heading), sin(heading))) - reach) * 260.0);',
      '      float sweep = max(cos(heading - t * 1.1), 0.0);',
      '      strands += film(k / float(CHORDS) + t * 0.1) * line * sweep * sweep * sweep * sweep;',
      '    }',
      '    color += strands * 0.6 * smoothstep(0.97, 0.75, r);',
      '    alpha = 0.88 * smoothstep(0.98, 0.9, r);',
      '  }',
      // Bloom off the loops, faded out before the canvas edge.
      '  color += bloom * 0.11 * smoothstep(1.0, 0.76, length(p));',
      '  color = 1.0 - exp(-color * 1.3);',
      '  alpha = max(alpha, max(color.r, max(color.g, color.b)));',
      // 3D logo: a chrome slab that leans toward the cursor and catches the ring's light.
      '  if (u_hasLogo > 0.5 && r < 0.97) {',
      '    float pitch = u_pointer.y * 0.42 + sin(t * 0.47) * 0.1;',
      '    float yaw = -u_pointer.x * 0.52 + sin(t * 0.31) * 0.17;',
      '    float cp = cos(pitch), sp = sin(pitch), cy = cos(yaw), sy = sin(yaw);',
      '    mat3 tilt = mat3(cy, 0.0, -sy, 0.0, 1.0, 0.0, sy, 0.0, cy) * mat3(1.0, 0.0, 0.0, 0.0, cp, sp, 0.0, -sp, cp);',
      '    vec3 rd = normalize(vec3(p, CAMERA));',
      '    vec2 uv = logoUv(rd, tilt, 0.0);',
      '    vec4 front = logoSample(uv);',
      // Extruded sides: march back through the slab until the cut-out is hit.
      '    vec3 side = vec3(0.0);',
      '    float sideAlpha = 0.0;',
      '    for (int i = 1; i <= LAYERS; i++) {',
      '      float k = float(i) / float(LAYERS);',
      '      float a = logoSample(logoUv(rd, tilt, LOGO_DEPTH * k)).a * (1.0 - sideAlpha);',
      '      vec3 metal = mix(vec3(0.5, 0.62, 0.58), vec3(0.03, 0.14, 0.1), k);',
      '      side += (metal + film(k * 0.6 + t * 0.05 + yaw) * 0.18 * (1.0 - k)) * a;',
      '      sideAlpha += a;',
      '    }',
      // Bevel normals from the mask edge, so the chrome rounds off at its outline.
      '    float e = 0.012;',
      '    float gx = logoSample(uv + vec2(e, 0.0)).a - logoSample(uv - vec2(e, 0.0)).a;',
      '    float gy = logoSample(uv + vec2(0.0, e)).a - logoSample(uv - vec2(0.0, e)).a;',
      '    vec3 normal = normalize(tilt * vec3(-gx * 1.4, -gy * 1.4, -1.0));',
      '    vec3 view = -rd;',
      '    vec3 lightDir = normalize(vec3(-0.55, 0.7, -0.9));',
      '    float diffuse = 0.62 + 0.55 * max(dot(normal, lightDir), 0.0);',
      '    float spec = pow(max(dot(reflect(-lightDir, normal), view), 0.0), 36.0);',
      '    vec3 bounce = reflect(rd, normal);',
      '    float fresnel = 0.1 + pow(1.0 - max(dot(normal, view), 0.0), 3.0);',
      '    vec3 env = film(atan(bounce.y, bounce.x) / TAU + t * 0.05);',
      '    float chrome = smoothstep(0.25, 0.6, dot(front.rgb, vec3(0.3, 0.59, 0.11)));',
      '    float sheen = exp(-pow(uv.x + uv.y - 1.0 - sin(t * 0.4) * 0.8 + (yaw - pitch) * 1.4, 2.0) * 30.0);',
      '    vec3 face = front.rgb * diffuse * 1.08;',
      '    face += env * fresnel * 0.45 + vec3(1.0, 1.0, 0.95) * spec * 0.7;',
      '    face += vec3(0.9, 1.0, 0.95) * sheen * chrome * 0.32;',
      '    face += film(atan(gy, gx) / TAU + t * 0.06) * length(vec2(gx, gy)) * 0.55;',
      // Contact shadow and a soft emerald glow thrown onto the vortex behind.
      '    vec2 back = uv + vec2(-0.035, 0.05);',
      '    float shade = (logoSample(back).a + logoSample(back + vec2(0.03, 0.0)).a + logoSample(back - vec2(0.0, 0.03)).a) / 3.0;',
      '    vec2 haloUv = (uv - LOGO_CENTER) * 0.86 + LOGO_CENTER;',
      '    float halo = (logoSample(haloUv).a + logoSample(haloUv + vec2(0.05, 0.0)).a + logoSample(haloUv - vec2(0.05, 0.0)).a) / 3.0;',
      '    color = color * (1.0 - shade * 0.55) + EMERALD * halo * 0.07;',
      '    vec3 logo = face * front.a + side * (1.0 - front.a);',
      '    float logoAlpha = front.a + sideAlpha * (1.0 - front.a);',
      '    color = mix(color, clamp(logo, 0.0, 1.0), logoAlpha);',
      '    alpha = max(alpha, logoAlpha);',
      '  }',
      '  gl_FragColor = vec4(color, clamp(alpha, 0.0, 1.0));',
      '}'
    ].join('\n');

    function compileShader(type, source) {
      var shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.warn('Could not compile the emerald orb shader: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    var vertexShader = compileShader(gl.VERTEX_SHADER, vertexSource);
    var fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragmentSource);
    if (!vertexShader || !fragmentShader) return;

    var program = gl.createProgram();
    if (!program) {
      console.warn('Could not create the emerald orb shader program.');
      return;
    }
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn('Could not link the emerald orb shader: ' + gl.getProgramInfoLog(program));
      return;
    }

    var buffer = gl.createBuffer();
    if (!buffer) {
      console.warn('Could not create the emerald orb geometry.');
      return;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.useProgram(program);

    var position = gl.getAttribLocation(program, 'a_position');
    var resolution = gl.getUniformLocation(program, 'u_resolution');
    var time = gl.getUniformLocation(program, 'u_time');
    var pointer = gl.getUniformLocation(program, 'u_pointer');
    if (position < 0 || !resolution || !time || !pointer) {
      console.warn('The emerald orb shader is missing a required input.');
      return;
    }
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    gl.disable(gl.BLEND);

    // The logo is drawn inside the shader as a tilting 3D slab once its texture is ready;
    // until then (or if the upload fails, e.g. on file://) the <img> stays visible.
    var logoImage = stage.querySelector('.quest-logo');
    var logoTexture = gl.createTexture();
    var logoSampler = gl.getUniformLocation(program, 'u_logo');
    var hasLogo = gl.getUniformLocation(program, 'u_hasLogo');
    gl.uniform1i(logoSampler, 0);
    gl.uniform1f(hasLogo, 0);

    function uploadLogo() {
      if (!logoTexture || !logoImage || !logoImage.naturalWidth) return;
      try {
        gl.bindTexture(gl.TEXTURE_2D, logoTexture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, logoImage);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      } catch (error) {
        console.warn('Could not load the logo into the orb; keeping the flat logo.', error);
        return;
      }
      gl.uniform1f(hasLogo, 1);
      stage.dataset.logoMode = 'webgl';
      // Reduced motion draws a single still frame, so redraw it now the logo is in.
      if (reduceMotion.matches) window.requestAnimationFrame(render);
    }

    if (logoImage) {
      if (logoImage.complete && logoImage.naturalWidth) uploadLogo();
      else logoImage.addEventListener('load', uploadLogo, { once: true });
    }

    var pixelRatio = Math.min(window.devicePixelRatio || 1, 1.75);
    var restX = -0.18;
    var restY = 0.12;
    var targetX = restX;
    var targetY = restY;
    var pointerX = restX;
    var pointerY = restY;
    var startedAt = 0;
    var frameRequest = 0;

    function resize() {
      var bounds = canvas.getBoundingClientRect();
      var width = Math.max(1, Math.round(bounds.width * pixelRatio));
      var height = Math.max(1, Math.round(bounds.height * pixelRatio));
      if (canvas.width === width && canvas.height === height) return;
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
    }

    function render(timestamp) {
      resize();
      if (!startedAt) startedAt = timestamp;
      gl.uniform2f(resolution, canvas.width, canvas.height);
      // Start a few seconds in so the ribbons open on an interesting pose.
      gl.uniform1f(time, 6.5 + (reduceMotion.matches ? 0 : (timestamp - startedAt) / 1000));
      pointerX += (targetX - pointerX) * 0.06;
      pointerY += (targetY - pointerY) * 0.06;
      gl.uniform2f(pointer, pointerX, pointerY);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      stage.dataset.orbMode = 'webgl';
    }

    function animate(timestamp) {
      if (document.hidden) {
        frameRequest = 0;
        return;
      }
      render(timestamp);
      if (!reduceMotion.matches) frameRequest = window.requestAnimationFrame(animate);
    }

    function start() {
      if (!frameRequest) frameRequest = window.requestAnimationFrame(animate);
    }

    function stop() {
      if (!frameRequest) return;
      window.cancelAnimationFrame(frameRequest);
      frameRequest = 0;
    }

    canvas.addEventListener('webglcontextlost', function (event) {
      event.preventDefault();
      stop();
      stage.dataset.orbMode = 'fallback';
    });
    // The orb leans toward the cursor anywhere nearby, not only while hovered.
    window.addEventListener('pointermove', function (event) {
      var bounds = stage.getBoundingClientRect();
      var reach = Math.max(1, bounds.width * 1.6);
      var dx = (event.clientX - (bounds.left + bounds.width / 2)) / reach;
      var dy = ((bounds.top + bounds.height / 2) - event.clientY) / reach;
      targetX = Math.max(-1, Math.min(1, dx));
      targetY = Math.max(-1, Math.min(1, dy));
    }, { passive: true });
    document.addEventListener('pointerleave', function () {
      targetX = restX;
      targetY = restY;
    });
    window.addEventListener('resize', resize, { passive: true });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop();
      else start();
    });

    if (reduceMotion.matches) render(0);
    else start();
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
