import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const app = await readFile(new URL('../app.js', import.meta.url), 'utf8');
const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');

test('uses the supplied static screenshots as clean-filling portfolio covers', async () => {
  assert.ok(app.includes("mowCard.setAttribute('data-project', 'ascension-mow-geaux')"));
  assert.ok(app.includes("article.setAttribute('data-project', 'river-city-rolloffs')"));
  assert.ok(html.includes('src="assets/projects/ascension-mow-n-geaux.png"'));
  assert.ok(app.includes('src="assets/projects/river-city-rolloffs.png"'));
  assert.ok(app.includes('[data-project="ascension-mow-geaux"] .project-media img,[data-project="river-city-rolloffs"] .project-media img{object-fit:cover;object-position:center center;padding:0;transform:none;}'));

  for (const filename of ['ascension-mow-n-geaux.png', 'river-city-rolloffs.png']) {
    const image = await readFile(new URL(`../assets/projects/${filename}`, import.meta.url));
    assert.ok(image.length > 100_000, `${filename} should contain the supplied screenshot`);
    assert.deepEqual([...image.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  }
});

test('removes the circular hero-logo treatment while keeping the logo centered', () => {
  assert.ok(app.includes('.quest-logo-stage::before,.quest-visual::before,.quest-visual::after{display:none!important;}'));
  assert.ok(app.includes('.quest-logo-stage{place-items:center;}'));
  assert.ok(app.includes('.quest-logo{display:block!important;width:96%;height:96%;margin:auto;object-fit:contain;object-position:center center;transform:none;'));
  assert.ok(html.includes('<img class="quest-logo" src="assets/brand/sidequest-logo-clean.webp"'));
});
