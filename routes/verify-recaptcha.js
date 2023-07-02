'use strict'

const axios = require('axios').default
const config = require('../config.js')

async function verifyRecaptcha (server, options) {
  server.post('/verify/recaptcha', async (request, reply) => {
    if (request.body.token && config.recaptchaSecretKey) {
      axios({
        method: 'post',
        url: 'https://www.google.com/recaptcha/api/siteverify?secret=' + config.recaptchaSecretKey + '&response=' + request.body.token
      })
        .then(function (response) {
          if (response.data.success) {
            reply.ok('Verify Success!', { data: response.data })
          } else {
            reply.badRequest('Verify Failed!', { error: response.data['error-codes'] })
          }
        })
        .catch(function (error) {
          console.log(error)
          reply.badRequest('Verify Failed!', { error: 'Failed to connect with Google Recaptcha.' })
        })
    } else {
      reply.badRequest('Verify Failed!', { error: 'Recaptcha Token and Secret Key is required!' })
    }
    await reply
  })
}

module.exports = verifyRecaptcha
