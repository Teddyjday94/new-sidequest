import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const baseCss = await readFile(new URL('../four-page-base.css', import.meta.url), 'utf8');
const orbCss = await readFile(new URL('../hq-fixes.css', import.meta.url), 'utf8');
const app = await readFile(new URL('../app.js', import.meta.url), 'utf8');

test('layers the SideQuest logo over the supplied emerald orb artwork', () => {
  assert.ok(html.includes('class="quest-orb-art" src="assets/emerald-orb.jpeg"'));
  assert.ok(html.includes('class="quest-logo" src="assets/brand/sidequest-logo-clean.webp"'));
  assert.ok(html.includes('class="quest-orbit quest-orbit--outer"'));
});

test('replaces the hard-edged logo tile with a motion-safe circular treatment', () => {
  assert.ok(!baseCss.includes('border:1px solid rgba(174,255,89,.92)'));
  assert.ok(orbCss.includes('mix-blend-mode: screen'));
  assert.ok(app.includes('vec3 film(float h)'), 'iridescent film palette');
  assert.ok(app.includes('vec2 loop(vec2 p, float radius, float tilt, float turn)'), 'ring built from tilted loops');
  assert.ok(app.includes('const int CHORDS'), 'string-art chords inside the ring');
  assert.ok(app.includes('uniform float u_time;'));
  assert.ok(app.includes('stage.dataset.orbMode = \'webgl\''));
  assert.ok(orbCss.includes('@media (prefers-reduced-motion: reduce)'));
});

test('retains an artwork fallback and responds to pointer movement', () => {
  assert.ok(app.includes('WebGL is unavailable; showing the supplied emerald orb artwork.'));
  assert.ok(app.includes('window.addEventListener(\'pointermove\''));
  assert.ok(app.includes('document.hidden'));
  assert.ok(orbCss.includes('.quest-logo-stage[data-orb-mode="webgl"] .quest-orb-canvas'));
});

test('draws the logo as a 3D slab in the shader, keeping the flat logo as fallback', () => {
  assert.ok(app.includes('uniform sampler2D u_logo;'));
  assert.ok(app.includes("stage.dataset.logoMode = 'webgl';"));
  assert.ok(app.includes('keeping the flat logo'), 'texture upload failures fall back to the <img>');
  assert.ok(orbCss.includes('.quest-logo-stage[data-logo-mode="webgl"] .quest-logo'));
});

test('never divides by zero when a ring loop turns edge-on', () => {
  // loop() divides by the loop's squash; an edge-on loop (cos = 0) would render an infinite streak.
  assert.ok(app.includes('float squash = max(abs(cos(tilt)), 0.12);'));
});

test('re-centres the logo mark, which sits right of centre in its image', () => {
  assert.ok(app.includes('const vec2 LOGO_CENTER = vec2(0.535, 0.5);'));
  assert.ok(app.includes('+ LOGO_CENTER;'));
});
