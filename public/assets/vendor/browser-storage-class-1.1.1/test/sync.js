/* global describe it */
const assert = require('assert');
const StorageShim = require('node-storage-shim');
const BrowserStorageClass = require('../src/browser-storage-class.js');

describe('synchronous storage test', function () {
  const browserStorage = new StorageShim();
  const storage = new BrowserStorageClass(browserStorage);

  it('add some data', function () {
    storage.set('yourkeyname1', 'Saving value as string');
    storage.set('yourkeyname2', ['saving', 'value', 'as', 'array']);
    storage.set('yourkeyname3', { name: 'budi', address: 'jakarta', info: 'saving value as object' });
    assert.strictEqual(storage.list().length, 3);
  });

  it('get data', function () {
    const data = storage.get('yourkeyname1');
    assert.strictEqual(data, 'Saving value as string');
  });

  it('check data', function () {
    assert.strictEqual(storage.has('yourkeyname2'), true);
  });

  it('remove single data', function () {
    storage.remove('yourkeyname2');
    assert.strictEqual(storage.list().length, 2);
    assert.deepStrictEqual(storage.list()[0].value, 'Saving value as string');
    assert.deepStrictEqual(storage.list()[1].value, { name: 'budi', address: 'jakarta', info: 'saving value as object' });
  });

  it('make sure type data still original', function () {
    storage.set('yourkeyname2', ['saving', 'value', 'as', 'array']);
    storage.set('yourkeyname4', [
      { no: 1, desc: 'test 1' },
      { no: 2, desc: ['data 1', 'data 2'] },
      { no: 3, desc: { no: 'a', child: 'nested 1' } }
    ]);
    assert.deepStrictEqual(storage.list()[0].value, 'Saving value as string');
    assert.deepStrictEqual(storage.list()[1].value, { name: 'budi', address: 'jakarta', info: 'saving value as object' });
    assert.deepStrictEqual(storage.list()[2].value, ['saving', 'value', 'as', 'array']);
    assert.deepStrictEqual(storage.list()[3].value, [
      { no: 1, desc: 'test 1' },
      { no: 2, desc: ['data 1', 'data 2'] },
      { no: 3, desc: { no: 'a', child: 'nested 1' } }
    ]);
    assert.deepStrictEqual(storage.get('yourkeyname4'), [
      { no: 1, desc: 'test 1' },
      { no: 2, desc: ['data 1', 'data 2'] },
      { no: 3, desc: { no: 'a', child: 'nested 1' } }
    ]);
  });

  it('clear all data', function () {
    storage.clear();
    assert.strictEqual(storage.list().length, 0);
  });
});
