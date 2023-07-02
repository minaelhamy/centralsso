'use strict'

/* global describe it */
const assert = require('assert')
const hash = require('../lib/obase64')

describe('obase64 function test', function () {
  it('randomizer', async function () {
    const result = hash._randomizer()
    const result0 = hash._randomizer(0)
    const result1 = hash._randomizer(1)
    const result2 = hash._randomizer(2)
    const result3 = hash._randomizer(3)
    const result4 = hash._randomizer(4)
    const result5 = hash._randomizer(5)
    const result6 = hash._randomizer(6)
    const result7 = hash._randomizer(7)
    const result8 = hash._randomizer(8)
    const result9 = hash._randomizer(9)
    const result10 = hash._randomizer(10)
    const result11 = hash._randomizer(11)
    const result12 = hash._randomizer(12)
    assert.strictEqual(result.length, 2)
    assert.strictEqual(result0.length, 2)
    assert.strictEqual(result1.length, 2)
    assert.strictEqual(result2.length, 3)
    assert.strictEqual(result3.length, 4)
    assert.strictEqual(result4.length, 5)
    assert.strictEqual(result5.length, 6)
    assert.strictEqual(result6.length, 7)
    assert.strictEqual(result7.length, 8)
    assert.strictEqual(result8.length, 9)
    assert.strictEqual(result9.length, 10)
    assert.strictEqual(result10.length, 11)
    assert.strictEqual(result11.length, 11)
    assert.strictEqual(result12.length, 11)
  })

  it('encode', async function () {
    const result1 = await hash.encode('member')
    const result2 = await hash.encode('member')
    assert.notEqual(result1, result2)
  })

  it('decode', async function () {
    assert.strictEqual(await hash.decode('A==UyO6NjZXIW1iptZ2MTNjc'), 'member')
  })

  it('encode with more hardness level', async function () {
    const result1 = await hash.encode('member', 5)
    const result2 = await hash.encode('member', 5)
    assert.notEqual(result1, result2)
    assert.strictEqual(await hash.decode(result1), 'member')
    assert.strictEqual(await hash.decode(result2), 'member')
  })
})
