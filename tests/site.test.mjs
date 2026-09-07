import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const css = await readFile(new URL('../styles.css', import.meta.url), 'utf8');

test('presents Sidequest Creative as a client and side-project portfolio', () => {
  assert.match(html, /<title>Sidequest Creative \|/i);
  assert.match(html, /<h2>Client work<\/h2>/i);
  assert.match(html, /<h2>Side projects<\/h2>/i);
  assert.match(html, /data-project-type="client"/);
  assert.match(html, /data-project-type="side"/);
});

test('features Boba Lover and retires the four approved project cards', () => {
  assert.match(html, /href="https:\/\/boba-lover\.vercel\.app"/);
  assert.match(html, /<h3>Boba Lover<\/h3>/);

  const retiredLinks = [
    'legacy-tattoo-studio.vercel.app',
    'frederics-upholstery.vercel.app',
    'caterascreation.vercel.app',
    'dominion-god-simulator.vercel.app'
  ];
  for (const link of retiredLinks) {
    assert.ok(!html.includes(link), `Still includes retired project: ${link}`);
  }

  assert.equal((html.match(/<article class="project-card/g) ?? []).length, 9);
});

test('ships a real Boba Lover image for the portfolio card', async () => {
  const image = await readFile(new URL('../assets/projects/boba-lover.jpg', import.meta.url));
  assert.ok(image.length > 100_000, 'Boba Lover image should not be an empty placeholder');
  assert.deepEqual([...image.subarray(0, 3)], [0xff, 0xd8, 0xff]);
});

test('keeps navigation and reduced-motion accessibility safeguards', () => {
  assert.match(html, /aria-label="Primary"/);
  assert.match(html, /class="skip-link"/);
  assert.match(css, /prefers-reduced-motion/);
});
