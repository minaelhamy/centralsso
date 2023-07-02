/**
 * Fastify Auth Condition Plugin
 */
'use strict'

const fp = require('fastify-plugin')
const obase64 = require('../lib/obase64')

async function authConditionPlugin (app) {
  app.decorate('verifyToken', async function (request, reply) {
    if (!request.headers['x-token']) {
      return reply.code(400).send({
        message: 'Missing token header',
        error: 'Bad Request',
        statusCode: 400
      })
    }
    return new Promise(function (resolve, reject) {
      app.jwt.verify(request.headers['x-token'], function (err, decoded) {
        if (err) { return reject(err) };
        resolve(decoded)
      })
    }).catch(function (error) {
      request.log.error(error)
      return reply.code(400).send({
        message: 'Token not valid',
        error: error.message,
        statusCode: 400
      })
    })
  })

  app.decorate('isRoleAdmin', async function (request, reply) {
    const decoded = await app.jwt.decode(request.headers['x-token'])
    if (decoded) {
      if (obase64.decode(decoded.hash) === 'admin') {
        return true
      }
    }
    return reply.code(401).send({
      message: 'You are not authorized!',
      error: 'Unauthorized',
      statusCode: 401
    })
  })

  app.decorate('isRoleMember', async function (request, reply) {
    const decoded = await app.jwt.decode(request.headers['x-token'])
    if (decoded) {
      if (obase64.decode(decoded.hash) === 'member') {
        return true
      }
    }
    return reply.code(401).send({
      message: 'You are not authorized!',
      error: 'Unauthorized',
      statusCode: 401
    })
  })
}

module.exports = fp(authConditionPlugin)
