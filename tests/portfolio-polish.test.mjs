import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const app = await readFile(new URL('../app.js', import.meta.url), 'utf8');

test('uses a zoomed-out treatment only for the Mow n Geaux and River City covers', () => {
  assert.ok(app.includes("mowCover.classList.add('project-cover--wide-view')"));
  assert.ok(app.includes('<div class="project-media"><img class="project-cover--wide-view"'));
  assert.ok(app.includes('.project-cover--wide-view{object-fit:contain!important;object-position:center center!important;'));
  assert.ok(app.includes('.project-card:hover .project-cover--wide-view{transform:scale(1);}'));
});

test('removes the circular hero-logo treatment while keeping the logo centered', () => {
  assert.ok(app.includes('.quest-logo-stage::before,.quest-visual::before,.quest-visual::after{display:none!important;}'));
  assert.ok(app.includes('.quest-logo-stage{place-items:center;}'));
  assert.ok(app.includes('.quest-logo{width:96%;height:96%;margin:auto;object-fit:contain;object-position:center center;transform:none;'));
});
