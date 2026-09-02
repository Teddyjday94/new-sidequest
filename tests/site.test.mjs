import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');

test('presents Side Quest as a curated portfolio', () => {
  assert.match(html, /<title>Side Quest \|/i);
  assert.match(html, /Selected work/i);
  assert.match(html, /Business Builds/i);
  assert.match(html, /Passion Projects/i);
});

test('includes the approved project filtering experience', () => {
  assert.match(html, /data-filter="all"/);
  assert.match(html, /data-filter="business"/);
  assert.match(html, /data-filter="passion"/);
  assert.match(html, /data-project-category="business"/);
  assert.match(html, /data-project-category="passion"/);
});

test('links to the strongest live projects and owner contact', () => {
  const required = [
    'cinderellas-pet-palace.vercel.app',
    'legacy-tattoo-studio.vercel.app',
    'loop-and-petal.vercel.app',
    'dominion-god-simulator.vercel.app',
    'targaryan.vercel.app',
    'life-city.thomasday570.chatgpt.site',
    'mailto:thomasdbiz26@gmail.com'
  ];
  for (const value of required) assert.ok(html.includes(value), `Missing ${value}`);
});

test('provides progressive motion and accessibility safeguards', () => {
  assert.match(html, /id="world-canvas"/);
  assert.match(html, /prefers-reduced-motion/);
  assert.match(html, /aria-label="Primary navigation"/);
  assert.match(html, /aria-pressed=/);
  assert.match(html, /focus-visible/);
});
