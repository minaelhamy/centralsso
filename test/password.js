'use strict'

/* global describe it */
const assert = require('assert')
const password = require('../lib/password.js')

describe('password function test', function () {
  it('generate password', async function () {
    await password.generate('abcdefg')
  })

  it('generate password with custom gensalt', async function () {
    await password.generate('abcdefg', 5)
  })

  it('compare password', async function () {
    const hashed = await password.generate('abcdefg')
    assert.strictEqual(await password.compare('abcdefg', hashed), true)
    assert.strictEqual(await password.compare('abcdef', hashed), false)
  })

  it('failed generate password', async function () {
    await assert.rejects(
      async () => password.generate(null),
      Error
    )
  })

  it('failed generate password with wrong gensalt', async function () {
    await assert.rejects(
      async () => password.generate('abcdefg', {}),
      Error
    )
  })

  it('failed compare password', async function () {
    const hashed = await password.generate('abcdefg')
    await assert.rejects(
      async () => password.compare(null, hashed),
      Error
    )
  })
})
