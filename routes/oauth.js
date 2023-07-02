'use strict'
const moment = require('moment')
const { v4: uuidv4 } = require('uuid')
const obase64 = require('../lib/obase64')
const schema = require('../schemas/oauth')
const { User } = require('../models/user')
const { DataSSO } = require('../models/data_sso')
const { LastLogin } = require('../models/last_login')
const config = require('../config.js')
const helper = require('../lib/helper')

async function _verifyKey (xKey) {
  const result = await DataSSO.findAll({
    where: {
      key: xKey,
      status: 1
    }
  })
  if (result && result.length > 0) {
    return true
  }
  return false
}

async function apiRoute (server, options) {
  server.get('/api/oauth/request_token', {
    schema: { headers: schema.reqToken }
  }, async (request, reply) => {
    if (request.headers['access-key'] === '') {
      return reply.badRequest('Access key is required!', { success: false })
    }

    const xKey = request.headers['access-key']

    // Check the access key is valid
    if (xKey === config.oauth.access_key) {
      const reqToken = obase64.encode(xKey, 5)
      reply.ok('Access token successfully generated!', { success: true, access_token: reqToken })
    } else {
      let cached = await server.cacheman.get('oauth_token_' + xKey)
      if (cached === null || cached === undefined) {
        const verified = await _verifyKey(xKey)
        await server.cacheman.set('oauth_token_' + xKey, verified, config.cache.ttl.master_data)
        // refresh cached data
        cached = await server.cacheman.get('oauth_token_' + xKey)
      }
      if (cached) {
        const reqToken = obase64.encode(xKey, 5)
        return reply.ok('Access token successfully generated!', { success: true, access_token: reqToken })
      }
      return reply.ok('Failed to generate access token!', { success: false })
    }

    await reply
  })

  server.post('/api/oauth/google', { schema: schema.google }, async (request, reply) => {
    if (request.headers['access-token'] === '') {
      return reply.badRequest('Access token is required!', { success: false })
    }
    let isValid = false
    const xToken = request.headers['access-token']
    try {
      const xKey = obase64.decode(xToken)
      if (xKey === config.oauth.access_key) {
        isValid = true
      } else {
        let cached = await server.cacheman.get('oauth_token_' + xKey)
        if (cached === null || cached === undefined) {
          const verified = await _verifyKey(xKey)
          await server.cacheman.set('oauth_token_' + xKey, verified, config.cache.ttl.master_data)
          // refresh cached data
          cached = await server.cacheman.get('oauth_token_' + xKey)
        }
        isValid = cached
      }
    } catch (err) {
      return reply.badRequest('Wrong access token!', { success: false })
    }

    if (!isValid) {
      return reply.badRequest('Wrong access token!', { success: false })
    }

    let etoken = ''

    const result = await User.findAll({
      where: { username: request.body.username }
    })
      .catch(err => {
        return reply.sequelizeError(err)
      })

    if (result) {
      if (result.length > 0) {
        // if user found
        if (result[0].method === 'oauth' && result[0].service === 'google') {
          if (result[0].status) {
            etoken = server.jwt.sign({
              uid: result[0].id,
              unm: result[0].username,
              name: result[0].fullname,
              mail: result[0].email,
              role: result[0].role,
              gravatar: (request.body.gravatar ? request.body.gravatar : helper.generateAvatar(result[0].email)),
              hash: obase64.encode(result[0].role)
            })

            server.jwt.verify(etoken, async function (err, decoded) {
              if (err) {
                return reply.badRequest(err.message, { success: false })
              };
              // if user found, update value gravatar
              if (request.body.gravatar !== result[0].gravatar) {
                await User.update({
                  gravatar: decoded.gravatar
                }, {
                  where: {
                    id: decoded.uid
                  }
                }).catch(err => {
                  return reply.sequelizeError(err)
                })
              }

              // last login
              // find user
              const clogin = await LastLogin.findOne({
                where: {
                  user_id: decoded.uid
                }
              }).catch(err => {
                return reply.sequelizeError(err)
              })
              if (clogin) {
                // if user found, update value last login
                await LastLogin.update({
                  username: decoded.unm,
                  email: decoded.mail,
                  gravatar: decoded.gravatar,
                  login_at: moment().valueOf()
                }, {
                  where: {
                    user_id: decoded.uid
                  }
                }).catch(err => {
                  return reply.sequelizeError(err)
                })
              } else {
                // if user not found, create new value last login
                await LastLogin.create({
                  user_id: decoded.uid,
                  username: decoded.unm,
                  email: decoded.mail,
                  gravatar: decoded.gravatar,
                  login_at: moment().valueOf()
                }).catch(err => {
                  return reply.sequelizeError(err)
                })
              }
              reply.ok('Oauth google success!', { success: true, token: etoken, expire: (decoded.exp * 1000) })
            })
          } else {
            reply.ok('Your account is suspended!', { success: false })
          }
        } else {
          reply.ok('Oauth google failed! Your account already registered via different service!', { success: false })
        }
      } else {
        // if user not found, register it
        const timeNow = moment().valueOf()

        const body = {
          id: uuidv4(),
          gravatar: (request.body.gravatar ? request.body.gravatar : helper.generateAvatar(request.body.email)),
          username: request.body.username,
          fullname: request.body.fullname,
          email: request.body.email,
          hash: '',
          status: 1,
          method: 'oauth',
          service: 'google',
          created_at: timeNow,
          modified_at: timeNow,
          created_at_month: moment(timeNow).format('MMMM'),
          created_at_year: parseInt(moment(timeNow).format('YYYY'))
        }

        const result = await User.count()

        if (result <= 0) {
          body.role = 'admin'
        } else {
          body.role = 'member'
        }

        // check email
        const isExist = await User.findAll({
          where: { email: request.body.email }
        })

        if (isExist && isExist.length === 0) {
          // standard user registration
          const result = User.create(body).catch(err => {
            return reply.sequelizeError(err)
          })
          if (result) {
            etoken = server.jwt.sign({
              uid: body.id,
              unm: body.username,
              name: body.fullname,
              mail: body.email,
              role: body.role,
              gravatar: body.gravatar,
              hash: obase64.encode(body.role)
            })
            server.jwt.verify(etoken, async function (err, decoded) {
              if (err) {
                return reply.badRequest(err.message, { success: false })
              };
              // last login
              // find user
              const clogin = await LastLogin.findOne({
                where: {
                  user_id: decoded.uid
                }
              }).catch(err => {
                return reply.sequelizeError(err)
              })
              if (clogin) {
                // if user found, update value last login
                await LastLogin.update({
                  username: decoded.unm,
                  email: decoded.mail,
                  gravatar: decoded.gravatar,
                  login_at: moment().valueOf()
                }, {
                  where: {
                    user_id: decoded.uid
                  }
                }).catch(err => {
                  return reply.sequelizeError(err)
                })
              } else {
                // if user not found, create value last login
                await LastLogin.create({
                  user_id: decoded.uid,
                  username: decoded.unm,
                  email: decoded.mail,
                  gravatar: decoded.gravatar,
                  login_at: moment().valueOf()
                }).catch(err => {
                  return reply.sequelizeError(err)
                })
              }
              reply.ok('Oauth google success!', { success: true, token: etoken, expire: (decoded.exp * 1000) })
            })
          } else {
            reply.ok('Failed to oauth google!', { success: false })
          }
        } else {
          reply.ok('Oauth google failed! Email address already registered via different service!', { success: false })
        }
      }
    } else {
      reply.ok('Failed to Oauth google!', { success: false })
    }

    await reply
  })
}

module.exports = apiRoute
