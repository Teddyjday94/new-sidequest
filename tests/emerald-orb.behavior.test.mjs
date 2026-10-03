import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

test('keeps the supplied artwork available when WebGL is unavailable', async () => {
  const source = await readFile(new URL('../app.js', import.meta.url), 'utf8');
  const listeners = new Map();
  const stage = { dataset: {} };
  const orb = { parentElement: stage };
  const canvas = { parentElement: stage, getContext() { return null; } };
  const document = {
    hidden: false,
    addEventListener(type, listener) { listeners.set(type, listener); },
    createElement() { return {}; },
    head: { appendChild() {} },
    getElementById(id) {
      if (id === 'orb-canvas') return canvas;
      if (id === 'emerald-orb') return orb;
      return null;
    },
    querySelector() { return null; },
    querySelectorAll() { return []; }
  };
  const window = {
    matchMedia() { return { matches: false }; },
    addEventListener() {}
  };

  vm.runInNewContext(source, { console: { warn() {} }, document, window }, {});
  listeners.get('DOMContentLoaded')();

  assert.equal(stage.dataset.orbMode, 'fallback');
});
