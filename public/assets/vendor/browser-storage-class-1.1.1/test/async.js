/* global describe it */
const assert = require('assert');
const StorageShim = require('node-storage-shim');
const BrowserStorageClass = require('../src/browser-storage-class.js');

describe('asynchronous storage test', function () {
  const browserStorage = new StorageShim();
  const storage = new BrowserStorageClass(browserStorage, true);

  it('add some data', async function () {
    await storage.set('yourkeyname1', 'Saving value as string');
    await storage.set('yourkeyname2', ['saving', 'value', 'as', 'array']);
    await storage.set('yourkeyname3', { name: 'budi', address: 'jakarta', info: 'saving value as object' });
    const result = await storage.list();
    assert.strictEqual(result.length, 3);
  });

  it('get data', async function () {
    const result = await storage.get('yourkeyname1');
    assert.strictEqual(result, 'Saving value as string');
  });

  it('check data', async function () {
    const result = await storage.has('yourkeyname2');
    assert.strictEqual(result, true);
  });

  it('remove single data', async function () {
    await storage.remove('yourkeyname2');
    const result = await storage.list();
    assert.strictEqual(result.length, 2);
    assert.deepStrictEqual(result[0].value, 'Saving value as string');
    assert.deepStrictEqual(result[1].value, { name: 'budi', address: 'jakarta', info: 'saving value as object' });
  });

  it('make sure type data still original', async function () {
    await storage.set('yourkeyname2', ['saving', 'value', 'as', 'array']);
    await storage.set('yourkeyname4', [
      { no: 1, desc: 'test 1' },
      { no: 2, desc: ['data 1', 'data 2'] },
      { no: 3, desc: { no: 'a', child: 'nested 1' } }
    ]);
    const result = await storage.list();
    assert.deepStrictEqual(result[0].value, 'Saving value as string');
    assert.deepStrictEqual(result[1].value, { name: 'budi', address: 'jakarta', info: 'saving value as object' });
    assert.deepStrictEqual(result[2].value, ['saving', 'value', 'as', 'array']);
    assert.deepStrictEqual(result[3].value, [
      { no: 1, desc: 'test 1' },
      { no: 2, desc: ['data 1', 'data 2'] },
      { no: 3, desc: { no: 'a', child: 'nested 1' } }
    ]);
    const result2 = await storage.get('yourkeyname4');
    assert.deepStrictEqual(result2, [
      { no: 1, desc: 'test 1' },
      { no: 2, desc: ['data 1', 'data 2'] },
      { no: 3, desc: { no: 'a', child: 'nested 1' } }
    ]);
  });

  it('clear all data', async function () {
    await storage.clear();
    const result = await storage.list();
    assert.strictEqual(result.length, 0);
  });
});
