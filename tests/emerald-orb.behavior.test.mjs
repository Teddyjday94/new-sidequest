import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

test('marks the supplied artwork as the safe orb fallback before WebGL enhancement', async () => {
  const source = await readFile(new URL('../app.js', import.meta.url), 'utf8');
  const listeners = new Map();
  const orb = { dataset: {} };
  const canvas = {};
  const document = {
    hidden: false,
    addEventListener(type, listener) { listeners.set(type, listener); },
    getElementById(id) {
      if (id === 'chrome-object') return canvas;
      if (id === 'emerald-orb') return orb;
      return null;
    },
    querySelectorAll() { return []; }
  };
  const window = {
    matchMedia() { return { matches: false }; },
    addEventListener() {}
  };

  vm.runInNewContext(source, { console: { warn() {} }, document, window, CustomEvent: class {} }, {
    importModuleDynamically() {
      return Promise.reject(new Error('WebGL dependency intentionally unavailable in this test'));
    }
  });
  listeners.get('DOMContentLoaded')();
  await Promise.resolve();

  assert.equal(orb.dataset.orbMode, 'fallback');
});
