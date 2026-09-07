import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('ships the emerald orb artwork as a valid JPEG asset', async () => {
  const image = await readFile(new URL('../assets/emerald-orb.jpeg', import.meta.url));

  assert.ok(image.length > 100_000, 'emerald orb artwork should not be an empty placeholder');
  assert.deepEqual([...image.subarray(0, 3)], [0xff, 0xd8, 0xff]);
});
