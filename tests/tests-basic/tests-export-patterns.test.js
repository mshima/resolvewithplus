import path from 'path';
import test from 'node:test'
import assert from 'node:assert/strict'
import resolvewithplus from 'resolvewithplus';

test('should mock all exports from nodejsexample_01_exports', () => {
  const noderesolvedlibindex = path
    .resolve('./nodejsexample_01_exports/lib/index.js');
  const noderesolvedfeatureindex = path
    .resolve('./nodejsexample_01_exports/feature/index.js');

  assert.strictEqual(
    resolvewithplus('nodejsexample_01_exports'),
    noderesolvedlibindex);

  assert.strictEqual(
    resolvewithplus('nodejsexample_01_exports/lib'),
    noderesolvedlibindex);

  assert.strictEqual(
    resolvewithplus('nodejsexample_01_exports/lib/index'),
    noderesolvedlibindex);

  assert.strictEqual(
    resolvewithplus('nodejsexample_01_exports/lib/index.js'),
    noderesolvedlibindex);

  assert.strictEqual(
    resolvewithplus('nodejsexample_01_exports/feature'),
    noderesolvedfeatureindex);

  assert.strictEqual(
    resolvewithplus('nodejsexample_01_exports/feature/index'),
    noderesolvedfeatureindex);

  assert.strictEqual(
    resolvewithplus('nodejsexample_01_exports/feature/index.js'),
    noderesolvedfeatureindex);
});
