'use strict'
const moment = require('moment')
const { Op } = require('sequelize')
const { v4: uuidv4 } = require('uuid')
const FlyJson = require('fly-json-odm')
const helper = require('../lib/helper')
const config = require('../config')
const password = require('../lib/password')
const obase64 = require('../lib/obase64')
const schema = require('../schemas/user')
const authSchema = require('../schemas/auth')
const { db, User } = require('../models/user')
const { ForgotPassword } = require('../models/forgot_password')
const { ActivationUser } = require('../models/activation_user')
const { LastLogin } = require('../models/last_login')

async function apiRoute (server, options) {
  server.post('/api/user/register', { schema: schema.register }, async (request, reply) => {
    const timeNow = moment().valueOf()

    const body = {
      id: uuidv4(),
      username: request.body.username,
      gravatar: helper.generateAvatar(request.body.email),
      fullname: request.body.name,
      email: request.body.email,
      hash: await password.generate(request.body.password),
      status: 1,
      method: 'internal',
      service: 'internal',
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

    const isExist = await User.findAll({
      where: {
        [Op.or]: [
          { username: request.body.username },
          { username: request.body.email }
        ]
      }
    })

    if (isExist && isExist.length === 0) {
      if (config.useActivationUser) {
        // check if user ever made a registration before?
        const vuser = await ActivationUser.findAll({
          where: {
            username: request.body.username,
            status: 0,
            expired_at: {
              [Op.gte]: moment().valueOf()
            }
          },
          order: [['created_at', 'desc']]
        }).catch(err => {
          return reply.sequelizeError(err)
        })
        if (vuser && vuser.length > 0) {
          // just resend email
          const htmlEmail = await server.view('email-activation', {
            mail_subject: 'User Activation at ' + config.siteName,
            mail_activation_link: config.baseUrl + '/user-activation/' + vuser[0].id,
            mail_sitename: config.siteName,
            mail_baseurl: config.baseUrl,
            mail_img_logo: ''
          })

          server.nodemailer.sendMail({
            from: '"' + config.siteName + '" <' + config.nodeMailerTransport.auth.user + '>',
            to: body.email,
            subject: 'User Activation at ' + config.siteName,
            html: htmlEmail
          }, (err, info) => {
            if (err) {
              return reply.badRequest('Send Email Failed!', { error: err })
            }
            reply.ok('Activation link already resend to your email.', { success: true })
          })
        } else {
          // create new waiting user
          const cbody = {
            id: body.id,
            username: body.username,
            data: JSON.stringify(body),
            status: 0,
            created_at: body.created_at,
            modified_at: body.modified_at,
            expired_at: moment(body.created_at).add((60 * 60 * 24 * 3), 'seconds').valueOf() // expired in 3days
          }
          const cuser = await ActivationUser.create(cbody).catch(err => {
            return reply.sequelizeError(err)
          })
          if (cuser) {
            // sending email
            const htmlEmail = await server.view('email-activation', {
              mail_subject: 'User Activation at ' + config.siteName,
              mail_activation_link: config.baseUrl + '/user-activation/' + body.id,
              mail_sitename: config.siteName,
              mail_baseurl: config.baseUrl,
              mail_img_logo: ''
            })

            server.nodemailer.sendMail({
              from: '"' + config.siteName + '" <' + config.nodeMailerTransport.auth.user + '>',
              to: body.email,
              subject: 'User Activation at ' + config.siteName,
              html: htmlEmail
            }, (err, info) => {
              if (err) {
                return reply.badRequest('Send Email Failed!', { error: err })
              }
              reply.ok('Activation link has already sent to your email.', { success: true })
            })
          }
        }
      } else {
        // standard user registration
        const result = User.create(body).catch(err => {
          return reply.sequelizeError(err)
        })
        if (result) {
          reply.ok('Register new user success!', { success: true })
        } else {
          reply.ok('Failed to register new user!', { success: false })
        }
      }
    } else {
      reply.ok('Register new user failed! Username or email address already exists!', { success: false })
    }

    await reply
  })

  server.post('/api/user/activation', { schema: schema.activation }, async (request, reply) => {
    const found = await ActivationUser.findAll({
      where: {
        [Op.and]: [
          { id: request.body.id },
          { status: 0 }
        ]
      }
    }).catch(err => {
      return reply.sequelizeError(err)
    })

    if (found && found.length > 0) {
      const body = JSON.parse(found[0].data)
      // create new user
      const registered = User.create(body).catch(err => {
        return reply.sequelizeError(err)
      })

      if (registered) {
        // delete current user
        const deleted = await ActivationUser.destroy({
          where: {
            username: body.username
          }
        }).catch(err => {
          return reply.sequelizeError(err)
        })
        if (deleted) {
          // cleanup
          ActivationUser.destroy({
            expired_at: {
              [Op.lte]: moment().valueOf()
            }
          }).catch(err => {
            return reply.sequelizeError(err)
          })
          reply.ok('Activation success, now you can login!', { success: true })
        }
      } else {
        reply.ok('Activation failed!', { success: false })
      }
    } else {
      reply.ok('Activation failed! User not found or already activated.', { success: false })
    }

    await reply
  })

  server.post('/api/user/login', { schema: schema.login }, async (request, reply) => {
    let etoken = ''

    const result = await User.findAll({
      where: {
        [Op.or]: [
          { username: request.body.username },
          { email: request.body.username }
        ]
      }
    })
      .catch(err => {
        return reply.sequelizeError(err)
      })

    if (result && result.length > 0) {
      if (result[0].status) {
        etoken = server.jwt.sign({
          uid: result[0].id,
          unm: result[0].username,
          name: (result[0].fullname ? result[0].fullname : result[0].username),
          mail: result[0].email,
          role: result[0].role,
          gravatar: (result[0].gravatar ? result[0].gravatar : helper.generateAvatar(result[0].email)),
          hash: obase64.encode(result[0].role)
        })

        const pass = await password.compare(request.body.password, result[0].hash).catch(err => {
          return reply.error(err.message)
        })

        if (pass) {
          server.jwt.verify(etoken, async function (err, decoded) {
            if (err) {
              return reply.badRequest(err.message, { success: pass })
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
            reply.ok('Login user success!', { success: pass, token: etoken, expire: (decoded.exp * 1000) })
          })
        } else {
          reply.ok('Wrong username or password!', { success: false })
        }
      } else {
        reply.ok('Your account is suspended!', { success: false })
      }
    } else {
      reply.ok('Wrong username or password!', { success: false })
    }

    await reply
  })

  server.get('/api/user/check-username/:username', { schema: schema.checkUsername }, async (request, reply) => {
    const result = await User.findAll({ where: { username: request.params.username } }).catch(err => {
      return reply.sequelizeError(err)
    })

    if (result) {
      reply.ok((result.length > 0) ? 'Username is not available!' : 'Username is OK!', {
        data: {
          total: result.length
        }
      })
    }

    await reply
  })

  server.get('/api/user/check-email/:email', { schema: schema.checkEmail }, async (request, reply) => {
    const result = await User.findAll({ where: { email: request.params.email } }).catch(err => {
      return reply.sequelizeError(err)
    })

    if (result) {
      reply.ok((result.length > 0) ? 'Email address is not available!' : 'Email address is OK!', {
        data: {
          total: result.length
        }
      })
    }

    await reply
  })

  server.post('/api/user/generate-reset-password', { schema: schema.forgotPassword }, async (request, reply) => {
    const forgotpass = {
      id: uuidv4(),
      status: 0,
      created_at: moment().valueOf(),
      expired_at: moment().add((60 * 60 * 24 * 3), 'seconds').valueOf() // expired in 3days
    }

    const result = await User.findOne({ where: { email: request.body.email } }).catch(err => {
      return reply.sequelizeError(err)
    })

    if (result) {
      forgotpass.user_id = result.id
      const done = await ForgotPassword.create(forgotpass).catch(err => {
        return reply.sequelizeError(err)
      })

      if (done) {
        const htmlEmail = await server.view('email-reset', {
          mail_subject: 'Link Reset Password at ' + config.siteName,
          mail_reset_link: config.baseUrl + '/reset-password/' + done.id,
          mail_sitename: config.siteName,
          mail_baseurl: config.baseUrl,
          mail_img_logo: ''
        })

        server.nodemailer.sendMail({
          from: '"' + config.siteName + '" <' + config.nodeMailerTransport.auth.user + '>',
          to: result.email,
          subject: 'Link Reset Password at ' + config.siteName,
          html: htmlEmail
        }, (err, info) => {
          if (err) {
            return reply.badRequest('Send Message Failed!', { error: err })
          }
          reply.ok('Reset password link has already sent to your email.', { success: true })
        })
      }
    } else {
      reply.ok('Email address is not exists.', { success: false })
    }

    await reply
  })

  server.post('/api/user/reset-password', { schema: schema.resetPassword }, async (request, reply) => {
    const result = await ForgotPassword.findAll({
      where: {
        [Op.and]: [
          { id: request.body.id },
          { status: 0 }
        ]
      }
    }).catch(err => {
      return reply.sequelizeError(err)
    })

    if (result && result.length > 0) {
      // find user and update
      const done = await User.update({
        hash: await password.generate(request.body.password),
        modified_at: moment().valueOf()
      }, { where: { id: result[0].user_id } }).catch(err => {
        return reply.sequelizeError(err)
      })

      if (done) {
        // reupdate to make expired this request reset password
        const reupdate = await ForgotPassword.update({
          status: 1
        }, { where: { id: request.body.id } }).catch(err => {
          return reply.sequelizeError(err)
        })

        if (reupdate) {
          reply.ok('Your password has been successfully changed!', { success: true })
        } else {
          reply.ok('Failed to reset your password! Please contact us, something went wrong and we need more futher information from you.', { success: false })
        }
      } else {
        reply.ok('Failed to reset your password! Please contact us, something went wrong and we need more futher information from you.', { success: false })
      }
    } else {
      reply.ok('The request to reset password has been expired!', { success: false })
    }

    await reply
  })

  server.post('/api/user/change-password', {
    schema: {
      headers: authSchema.auth,
      body: schema.changePassword
    },
    preHandler: server.auth([
      server.verifyToken
    ])
  }, async (request, reply) => {
    // get hash
    const decoded = server.jwt.decode(request.headers['x-token'])
    const found = await User.findOne({ where: { id: decoded.uid } }).catch(err => {
      return reply.sequelizeError(err)
    })

    if (found) {
      // compare password
      const pass = await password.compare(request.body.oldpassword, found.hash).catch(err => {
        return reply.error(err.message)
      })

      if (pass) {
        // update password
        const updated = await User.update({
          hash: await password.generate(request.body.newpassword),
          modified_at: moment().valueOf()
        }, { where: { id: decoded.uid } }).catch(err => {
          return reply.sequelizeError(err)
        })
        if (updated) {
          reply.ok('Your password successfully changed!', { success: true, data: updated })
        } else {
          reply.ok('Failed to change your password!', { success: false })
        }
      } else {
        reply.ok('Your old password is wrong!', { success: false })
      }
    } else {
      reply.forbidden('Invalid token!', { success: false })
    }

    await reply
  })

  server.post('/api/user/my-profile', {
    schema: {
      headers: authSchema.auth
    },
    preHandler: server.auth([
      server.verifyToken
    ])
  }, async (request, reply) => {
    // get hash
    const decoded = server.jwt.decode(request.headers['x-token'])
    // update profile
    let profile = await User.findOne({ where: { id: decoded.uid } }).catch(err => {
      return reply.sequelizeError(err)
    })

    if (profile) {
      profile.hash = undefined
      profile.data = JSON.parse(profile.data)
      profile = JSON.parse(JSON.stringify(profile))
      profile.gravatar = (profile.gravatar ? profile.gravatar : helper.generateAvatar(profile.email))
      reply.ok('Get my profile successfully!', { success: true, data: profile })
    } else {
      reply.ok('Failed to get my profile!', { success: false })
    }

    await reply
  })

  server.post('/api/user/my-profile/update', {
    schema: {
      headers: authSchema.auth,
      body: schema.editProfile
    },
    preHandler: server.auth([
      server.verifyToken
    ])
  }, async (request, reply) => {
    // get hash
    const decoded = server.jwt.decode(request.headers['x-token'])
    // update profile
    const query = {
      fullname: request.body.fullname,
      data: JSON.stringify(request.body.data),
      modified_at: moment().valueOf()
    }

    const emailexist = await User.findAll({
      where: {
        email: request.body.email,
        id: { [Op.ne]: decoded.uid }
      }
    }).catch(err => {
      return reply.sequelizeError(err)
    })

    if (emailexist && emailexist.length === 0) {
      query.email = request.body.email
      query.gravatar = helper.generateAvatar(request.body.email)
    }

    const updated = await User.update(query, { where: { id: decoded.uid } }).catch(err => {
      return reply.sequelizeError(err)
    })

    if (updated) {
      updated.hash = undefined
      // delete cache
      server.cacheman.del('public_profile_' + decoded.unm)
      reply.ok('Your profile successfully updated!', { success: true, data: updated })
    } else {
      reply.ok('Failed to update your profile!', { success: false })
    }

    await reply
  })

  server.post('/api/user/my-profile/suspend', {
    schema: {
      headers: authSchema.auth,
      body: schema.suspendUser
    },
    preHandler: server.auth([
      server.verifyToken
    ])
  }, async (request, reply) => {
    // get hash
    const decoded = server.jwt.decode(request.headers['x-token'])
    // update profile
    const query = {
      username: request.body.username,
      status: 0,
      modified_at: moment().valueOf()
    }

    const userexist = await User.findAll({
      where: {
        username: request.body.username,
        id: decoded.uid
      }
    }).catch(err => {
      return reply.sequelizeError(err)
    })

    if (userexist && userexist.length > 0) {
      const updated = await User.update(query, { where: { id: decoded.uid } }).catch(err => {
        return reply.sequelizeError(err)
      })

      if (updated) {
        // delete cache
        server.cacheman.del('public_profile_' + decoded.unm)
        reply.ok('Your profile successfully suspended!', { success: true, data: updated })
      } else {
        reply.ok('Failed to suspend your profile!', { success: false })
      }
    } else {
      reply.ok('Failed to suspend your profile!', { success: false })
    }

    await reply
  })

  server.get('/api/user/profile/:username', {
    schema: schema.getProfile
  }, async (request, reply) => {
    const _keycache = 'public_profile_' + request.params.username
    let cached = await server.cacheman.get(_keycache)
    if (cached === null || cached === undefined) {
      // get profile
      const profile = await User.findOne({
        where: {
          username: request.params.username
        }
      }).catch(err => {
        return reply.sequelizeError(err)
      })
      if (profile) {
        const gravatar = (profile.gravatar ? profile.gravatar : helper.generateAvatar(profile.email))
        profile.id = undefined
        profile.hash = undefined
        profile.email = undefined
        profile.role = undefined
        const nosql = new FlyJson()
        const nprofile = JSON.parse(nosql.safeStringify(profile))
        nprofile.data = JSON.parse(nprofile.data)
        nprofile.gravatar = gravatar
        await server.cacheman.set(_keycache, { success: true, data: nprofile }, config.cache.ttl.public_profile)
      } else {
        await server.cacheman.set(_keycache, { success: false }, config.cache.ttl.public_profile)
      }
      // refresh cached data
      cached = await server.cacheman.get(_keycache)
    }
    if (cached.success) {
      reply.ok('Get user profile successfully!', cached)
    } else {
      reply.ok('User Not Found!', cached)
    }

    await reply
  })

  server.post('/api/user/add', {
    schema: {
      headers: authSchema.auth,
      body: schema.addUser
    },
    preHandler: server.auth([
      server.verifyToken,
      server.isRoleAdmin
    ], { relation: 'and' })
  }, async (request, reply) => {
    const timeNow = moment().valueOf()
    const user = {
      id: uuidv4(),
      username: request.body.username,
      email: request.body.email,
      gravatar: helper.generateAvatar(request.body.email),
      role: request.body.role,
      hash: await password.generate(request.body.password),
      status: 1,
      created_at: timeNow,
      modified_at: timeNow
    }

    const isExist = await User.findAll({
      where: {
        [Op.or]: [
          { username: request.body.username },
          { email: request.body.email }
        ]
      }
    }).catch(err => {
      return reply.sequelizeError(err)
    })

    if (isExist && isExist.length === 0) {
      const result = await User.create(user).catch(err => {
        return reply.sequelizeError(err)
      })

      if (result) {
        reply.ok('Add new user success!', { success: true })
      } else {
        reply.ok('Failed to add new user!', { success: false })
      }
    } else {
      reply.ok('Failed to add new user. Username or email already exists!', { success: false })
    }

    await reply
  })

  server.post('/api/user/update', {
    schema: {
      headers: authSchema.auth,
      body: schema.updateUser
    },
    preHandler: server.auth([
      server.verifyToken,
      server.isRoleAdmin
    ], { relation: 'and' })
  }, async (request, reply) => {
    const isExist = await User.findAll({
      where: {
        email: request.body.email,
        username: { [Op.not]: request.body.username }
      }
    })

    if (isExist && isExist.length === 0) {
      // update user
      const updated = await User.update({
        email: request.body.email,
        role: request.body.role,
        status: request.body.status,
        modified_at: moment().valueOf()
      }, { where: { username: request.body.username } }).catch(err => {
        return reply.sequelizeError(err)
      })

      if (updated) {
        updated.hash = undefined
        // delete cache
        server.cacheman.del('public_profile_' + request.body.username)
        reply.ok('User successfully updated!', { success: true, data: updated })
      } else {
        reply.ok('Failed to update user!', { success: false })
      }
    } else {
      reply.ok('Update user failed! Email address already exists!', { success: false })
    }

    await reply
  })

  server.post('/api/user/status/update', {
    schema: {
      headers: authSchema.auth,
      body: schema.updateStatusUser
    },
    preHandler: server.auth([
      server.verifyToken,
      server.isRoleAdmin
    ], { relation: 'and' })
  }, async (request, reply) => {
    // update user
    const updated = await User.update({
      status: request.body.status,
      modified_at: moment().valueOf()
    }, { where: { username: request.body.username } }).catch(err => {
      return reply.sequelizeError(err)
    })

    if (updated) {
      updated.hash = undefined
      // delete cache
      server.cacheman.del('public_profile_' + request.body.username)
      reply.ok('User successfully updated!', { success: true, data: updated })
    } else {
      reply.ok('Failed to update user!', { success: false })
    }

    await reply
  })

  server.post('/api/user/delete', {
    schema: {
      headers: authSchema.auth,
      body: schema.deleteUser
    },
    preHandler: server.auth([
      server.verifyToken,
      server.isRoleAdmin
    ], { relation: 'and' })
  }, async (request, reply) => {
    // delete user
    const deleted = await User.destroy({ where: { username: request.body.username } }).catch(err => {
      return reply.sequelizeError(err)
    })

    if (deleted) {
      // delete cache
      server.cacheman.del('public_profile_' + request.body.username)
      reply.ok('User successfully deleted!', { success: true })
    } else {
      reply.ok('Failed to delete user! Username not found!', { success: false })
    }

    await reply
  })

  server.post('/api/user/list', {
    schema: {
      headers: authSchema.auth,
      body: schema.listUser
    },
    preHandler: server.auth([
      server.verifyToken,
      server.isRoleAdmin
    ], { relation: 'and' })
  }, async (request, reply) => {
    /**
     * Assumed that user data will be very huge, so we won't using old pagination style.
     * This pagination will be like "loadmore" with last_created_at date and limit.
     */
    const query = { where: {} }
    if (request.body.last_created_at && request.body.last_created_at > 0) {
      query.where.created_at = { [Op.lt]: request.body.last_created_at }
    }

    if (request.body.search && request.body.search !== '') {
      Object.assign(query.where, {
        [Op.or]: [
          { username: { [Op.like]: '%' + request.body.search + '%' } },
          { email: { [Op.like]: '%' + request.body.search + '%' } },
          { role: { [Op.like]: '%' + request.body.search + '%' } }
        ]
      })
    }

    // Prevent limit to not more than 100
    let nlimit = 10
    if (request.body.limit && request.body.limit <= 100) {
      nlimit = request.body.limit
    }

    // user list
    const total = await User.count(query).catch(err => {
      return reply.sequelizeError(err)
    })

    const pagination = {
      totalRecord: total,
      limit: nlimit,
      loadmore: false,
      last_created_at: 0
    }

    if (total) {
      Object.assign(query, { attributes: ['id', 'username', 'fullname', 'email', 'gravatar', 'role', 'method', 'service', 'status', 'created_at', 'modified_at'] })
      Object.assign(query, { order: [['created_at', 'desc']] })
      Object.assign(query, { limit: nlimit })
      let list = await User.findAll(query)
        .catch(err => {
          return reply.sequelizeError(err)
        })

      const isLoadmore = (total > nlimit)
      pagination.loadmore = isLoadmore

      if (list) {
        list = JSON.parse(JSON.stringify(list))
        for (let i = 0; i < list.length; i++) {
          list[i].gravatar = (list[i].gravatar ? list[i].gravatar : helper.generateAvatar(list[i].email))
        }
        if (isLoadmore) {
          pagination.last_created_at = list[list.length - 1].created_at
        }
        reply.ok('Get user list success!', { success: true, pagination, data: list })
      }
    } else {
      reply.ok('Get user list success!', { success: true, pagination, data: [] })
    }

    await reply
  })

  server.post('/api/user/lastlogin/list', {
    schema: {
      headers: authSchema.auth,
      body: schema.listUserLastLogin
    },
    preHandler: server.auth([
      server.verifyToken,
      server.isRoleAdmin
    ], { relation: 'and' })
  }, async (request, reply) => {
    /**
     * Assumed that user data will be very huge, so we won't using old pagination style.
     * This pagination will be like "loadmore" with last_login_at date and limit.
     */
    const query = { where: {} }
    if (request.body.last_login_at && request.body.last_login_at > 0) {
      query.where.login_at = { [Op.lt]: request.body.last_login_at }
    }

    if (request.body.search && request.body.search !== '') {
      Object.assign(query.where, {
        [Op.or]: [
          { user_id: { [Op.like]: '%' + request.body.search + '%' } },
          { username: { [Op.like]: '%' + request.body.search + '%' } },
          { email: { [Op.like]: '%' + request.body.search + '%' } }
        ]
      })
    }

    // Prevent limit to not more than 100
    let nlimit = 10
    if (request.body.limit && request.body.limit <= 100) {
      nlimit = request.body.limit
    }

    // user list last login
    const total = await LastLogin.count(query).catch(err => {
      return reply.sequelizeError(err)
    })

    const pagination = {
      totalRecord: total,
      limit: nlimit,
      loadmore: false,
      last_login_at: 0
    }

    if (total) {
      Object.assign(query, { attributes: ['user_id', 'username', 'email', 'gravatar', 'login_at'] })
      Object.assign(query, { order: [['login_at', 'desc']] })
      Object.assign(query, { limit: nlimit })
      let list = await LastLogin.findAll(query)
        .catch(err => {
          return reply.sequelizeError(err)
        })

      const isLoadmore = (total > nlimit)
      pagination.loadmore = isLoadmore

      if (list) {
        list = JSON.parse(JSON.stringify(list))
        for (let i = 0; i < list.length; i++) {
          list[i].gravatar = (list[i].gravatar ? list[i].gravatar : helper.generateAvatar(list[i].email))
        }
        if (isLoadmore) {
          pagination.last_login_at = list[list.length - 1].login_at
        }
        reply.ok('Get user last login list success!', { success: true, pagination, data: list })
      }
    } else {
      reply.ok('Get user last login list success!', { success: true, pagination, data: [] })
    }

    await reply
  })

  server.get('/api/user/total/list', {
    schema: {
      headers: authSchema.auth
    },
    preHandler: server.auth([
      server.verifyToken,
      server.isRoleAdmin
    ], { relation: 'and' })
  }, async (request, reply) => {
    const _keycache = 'total_user_list'
    let cached = await server.cacheman.get(_keycache)
    if (cached === null || cached === undefined) {
      const dlist = await User.findAll({
        attributes: ['created_at_month', [db.cast(db.fn('count', db.col('created_at_month')), 'int'), 'total']],
        where: {
          created_at_year: moment().format('YYYY')
        },
        order: [
          ['created_at', 'ASC']
        ],
        group: ['created_at', 'created_at_month']
      }).catch(err => {
        return reply.sequelizeError(err)
      })
      if (dlist) {
        const data1 = [{
          created_at_month: 'January',
          total: 0
        },
        {
          created_at_month: 'February',
          total: 0
        },
        {
          created_at_month: 'March',
          total: 0
        },
        {
          created_at_month: 'April',
          total: 0
        },
        {
          created_at_month: 'May',
          total: 0
        },
        {
          created_at_month: 'June',
          total: 0
        },
        {
          created_at_month: 'July',
          total: 0
        },
        {
          created_at_month: 'August',
          total: 0
        },
        {
          created_at_month: 'September',
          total: 0
        },
        {
          created_at_month: 'October',
          total: 0
        },
        {
          created_at_month: 'November',
          total: 0
        },
        {
          created_at_month: 'December',
          total: 0
        }]
        const nlist = []
        const result = JSON.parse(JSON.stringify(dlist))
        const nosql = new FlyJson()
        const nresult = nosql.set(data1).join('new', result)
          .merge('created_at_month', 'created_at_month')
          .exec()
        let lastmonth = 'January'
        if (result.length > 0) {
          lastmonth = result[result.length - 1].created_at_month
        }
        for (let i = 0; nresult.length; i++) {
          nlist.push(nresult[i])
          if (nresult[i].created_at_month === lastmonth) break
        }
        // save to cache
        await server.cacheman.set(_keycache, { success: true, data: nlist }, config.cache.ttl.total_user_list)
      } else {
        await server.cacheman.set(_keycache, { success: true, data: [] }, config.cache.ttl.total_user_list)
      }
      // refresh cached data
      cached = await server.cacheman.get(_keycache)
    }

    reply.ok('Get total registered user monthly list', cached)

    await reply
  })

  server.get('/api/user/total/month', {
    schema: {
      headers: authSchema.auth
    },
    preHandler: server.auth([
      server.verifyToken,
      server.isRoleAdmin
    ], { relation: 'and' })
  }, async (request, reply) => {
    const _keycache = 'total_user_month'
    let cached = await server.cacheman.get(_keycache)
    if (cached === null || cached === undefined) {
      const dtotal = await User.count({
        where: {
          created_at: {
            [Op.between]: [moment().startOf('month').valueOf(), moment().endOf('month').valueOf()]
          }
        }
      }).catch(err => {
        return reply.sequelizeError(err)
      })
      if (dtotal) {
        // save to cache
        await server.cacheman.set(_keycache, { success: true, total: dtotal }, config.cache.ttl.total_user_month)
      } else {
        await server.cacheman.set(_keycache, { success: true, total: 0 }, config.cache.ttl.total_user_month)
      }
      // refresh cached data
      cached = await server.cacheman.get(_keycache)
    }

    reply.ok('Get total user of this month.', cached)

    await reply
  })

  server.get('/api/user/total/year', {
    schema: {
      headers: authSchema.auth
    },
    preHandler: server.auth([
      server.verifyToken,
      server.isRoleAdmin
    ], { relation: 'and' })
  }, async (request, reply) => {
    const _keycache = 'total_user_year'
    let cached = await server.cacheman.get(_keycache)
    if (cached === null || cached === undefined) {
      const dtotal = await User.count({
        where: {
          created_at: {
            [Op.between]: [moment().startOf('year').valueOf(), moment().endOf('year').valueOf()]
          }
        }
      }).catch(err => {
        return reply.sequelizeError(err)
      })
      if (dtotal) {
        // save to cache
        await server.cacheman.set(_keycache, { success: true, total: dtotal }, config.cache.ttl.total_user_year)
      } else {
        await server.cacheman.set(_keycache, { success: true, total: 0 }, config.cache.ttl.total_user_year)
      }
      // refresh cached data
      cached = await server.cacheman.get(_keycache)
    }

    reply.ok('Get total user of this year.', cached)

    await reply
  })

  server.get('/api/user/total/active', {
    schema: {
      headers: authSchema.auth
    },
    preHandler: server.auth([
      server.verifyToken,
      server.isRoleAdmin
    ], { relation: 'and' })
  }, async (request, reply) => {
    const _keycache = 'total_user_active'
    let cached = await server.cacheman.get(_keycache)
    if (cached === null || cached === undefined) {
      const dtotal = await LastLogin.count({
        where: {
          login_at: {
            [Op.gte]: moment().subtract(30, 'days').valueOf()
          }
        }
      }).catch(err => {
        return reply.sequelizeError(err)
      })
      if (dtotal) {
        // save to cache
        await server.cacheman.set(_keycache, { success: true, total: dtotal }, config.cache.ttl.total_user_active)
      } else {
        await server.cacheman.set(_keycache, { success: true, total: 0 }, config.cache.ttl.total_user_active)
      }
      // refresh cached data
      cached = await server.cacheman.get(_keycache)
    }

    reply.ok('Get total active user.', cached)

    await reply
  })

  server.get('/api/user/total/inactive', {
    schema: {
      headers: authSchema.auth
    },
    preHandler: server.auth([
      server.verifyToken,
      server.isRoleAdmin
    ], { relation: 'and' })
  }, async (request, reply) => {
    const _keycache = 'total_user_inactive'
    let cached = await server.cacheman.get(_keycache)
    if (cached === null || cached === undefined) {
      const dtotal = await LastLogin.count({
        where: {
          login_at: {
            [Op.lte]: moment().subtract(30, 'days').valueOf()
          }
        }
      }).catch(err => {
        return reply.sequelizeError(err)
      })
      if (dtotal) {
        // save to cache
        await server.cacheman.set(_keycache, { success: true, total: dtotal }, config.cache.ttl.total_user_inactive)
      } else {
        await server.cacheman.set(_keycache, { success: true, total: 0 }, config.cache.ttl.total_user_inactive)
      }
      // refresh cached data
      cached = await server.cacheman.get(_keycache)
    }

    reply.ok('Get total inactive user.', cached)

    await reply
  })
}

module.exports = apiRoute
