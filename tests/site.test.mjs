import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const css = await readFile(new URL('../styles.css', import.meta.url), 'utf8');

test('presents Sidequest Creative as a client and side-project portfolio', () => {
  assert.match(html, /<title>Sidequest Creative \\|/i);
  assert.match(html, /<h2>Client work<\\/h2>/i);
  assert.match(html, /<h2>Side projects<\\/h2>/i);
  assert.match(html, /data-project-type="client"/);
  assert.match(html, /data-project-type="side"/);
});

test('features Chocolate Oracle and HandFX while retiring replaced portfolio cards', () => {
  assert.match(html, /href="https:\\/\\/chocolateoracle\\.vercel\\.app\\/"/);
  assert.match(html, /<h3>Chocolate Oracle<\\/h3>/);
  assert.match(html, /href="https:\\/\\/handfx-three\\.vercel\\.app\\/"/);
  assert.match(html, /<h3>HandFX<\\/h3>/);

  const retiredContent = [
    'legacy-tattoo-studio.vercel.app',
    'frederics-upholstery.vercel.app',
    'caterascreation.vercel.app',
    'dominion-god-simulator.vercel.app',
    'vargo-seven.vercel.app',
    'boba-lover.vercel.app',
    'cinderellas-pet-palace.vercel.app',
    '<h3>Vargo Automotive</h3>',
    '<h3>Boba Lover</h3>',
    '<h3>Cinderella’s Pet Palace</h3>'
  ];
  for (const content of retiredContent) {
    assert.ok(!html.includes(content), `Still includes retired project content: ${content}`);
  }

  assert.equal((html.match(/<article class="project-card/g) ?? []).length, 9);
});

test('ships optimized portfolio images for Chocolate Oracle and HandFX', async () => {
  const chocolate = await readFile(new URL('../assets/projects/chocolate-oracle.webp', import.meta.url));
  const handfx = await readFile(new URL('../assets/projects/handfx.webp', import.meta.url));

  assert.ok(chocolate.length > 10_000, 'Chocolate Oracle image should be a real optimized preview');
  assert.ok(handfx.length > 2_000, 'HandFX image should be a real optimized preview');
  assert.equal(chocolate.subarray(0, 4).toString('ascii'), 'RIFF');
  assert.equal(handfx.subarray(0, 4).toString('ascii'), 'RIFF');
});

test('features Santa Jim Hope with real project photography', async () => {
  assert.match(html, /href="https:\\/\\/github\\.com\\/Teddyjday94\\/santa-jim-hope-site"/);
  assert.match(html, /<h3>Santa Jim Hope<\\/h3>/);

  const image = await readFile(new URL('../assets/projects/santa-jim-hope.jpg', import.meta.url));
  assert.ok(image.length > 100_000, 'Santa Jim Hope image should not be an empty placeholder');
  assert.deepEqual([...image.subarray(0, 3)], [0xff, 0xd8, 0xff]);
});

test('keeps navigation and reduced-motion accessibility safeguards', () => {
  assert.match(html, /aria-label="Primary"/);
  assert.match(html, /class="skip-link"/);
  assert.match(css, /prefers-reduced-motion/);
});
