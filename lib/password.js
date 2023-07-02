'use strict'

const bcrypt = require('bcryptjs')

/**
 * Generate password
 * @param {string} pass this is user password
 * @param {(round: number)} gensalt [Optional] this for auto generate salt. Default is 10
 * @return Promise
 */
function generate (pass, gensalt) {
  gensalt = (gensalt === undefined) ? 10 : gensalt
  return new Promise(function (resolve, reject) {
    bcrypt.genSalt(gensalt, function (err, salt) {
      if (err) return reject(err)
      bcrypt.hash(pass, salt, function (err, hash) {
        if (err) return reject(err)
        return resolve(hash)
      })
    })
  })
}

/**
 * Compare password with hash value
 * @param {string} pass this is the user password
 * @param {string} hash this is the hashed password
 * @return Promise
 */
function compare (pass, hash) {
  return new Promise(function (resolve, reject) {
    bcrypt.compare(pass, hash, function (err, res) {
      if (err) return reject(err)
      return resolve(res)
    })
  })
}

module.exports = {
  generate,
  compare
}
