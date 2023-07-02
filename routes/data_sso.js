'use strict'

const moment = require('moment')
const { Op } = require('sequelize')
const { v4: uuidv4 } = require('uuid')
const { DataSSO } = require('../models/data_sso')
const authSchema = require('../schemas/auth')
const ssoSchema = require('../schemas/data_sso')
const config = require('../config')

async function apiRoute (server, options) {
  server.post('/api/sso/add', {
    schema: {
      headers: authSchema.auth,
      body: ssoSchema.ssoAdd
    },
    preHandler: server.auth([
      server.verifyToken
    ])
  }, async (request, reply) => {
    // get hash
    const decoded = server.jwt.decode(request.headers['x-token'])
    const timeNow = moment().valueOf()
    const data = {
      id: uuidv4(),
      username: decoded.unm,
      name: request.body.name,
      key: uuidv4().replace(/-/gi, ''),
      callback_url: request.body.callback_url,
      status: 1,
      created_at: timeNow,
      modified_at: timeNow
    }

    const done = await DataSSO.create(data).catch(err => {
      return reply.sequelizeError(err)
    })

    if (done) {
      reply.ok('Add new data sso success!', { success: true })
    } else {
      reply.ok('Failed to add new data sso!', { success: false })
    }

    await reply
  })

  server.post('/api/sso/update', {
    schema: {
      headers: authSchema.auth,
      body: ssoSchema.ssoUpdate
    },
    preHandler: server.auth([
      server.verifyToken
    ])
  }, async (request, reply) => {
    const done = await DataSSO.update({
      name: request.body.name,
      key: uuidv4().replace(/-/gi, ''),
      callback_url: request.body.callback_url,
      modified_at: moment().valueOf()
    }, { where: { id: request.body.id } }).catch(err => {
      return reply.sequelizeError(err)
    })

    if (done) {
      reply.ok('Update data sso success', { success: true, data: done })
    } else {
      reply.ok('Failed to update data sso', { success: false })
    }
    await reply
  })

  server.post('/api/sso/delete', {
    schema: {
      headers: authSchema.auth,
      body: ssoSchema.ssoDelete
    },
    preHandler: server.auth([
      server.verifyToken
    ])
  }, async (request, reply) => {
    const done = await DataSSO.destroy({ where: { id: request.body.id } }).catch(err => {
      return reply.sequelizeError(err)
    })

    if (done) {
      reply.ok('Delete data sso success!', { success: true })
    } else {
      reply.ok('Failed to delete data sso!', { success: false })
    }

    await reply
  })

  server.post('/api/sso/set-status', {
    schema: {
      headers: authSchema.auth,
      body: ssoSchema.ssoStatus
    },
    preHandler: server.auth([
      server.verifyToken
    ])
  }, async (request, reply) => {
    const done = await DataSSO.update({
      status: request.body.status,
      modified_at: moment().valueOf()
    }, { where: { id: request.body.id } }).catch(err => {
      return reply.sequelizeError(err)
    })

    if (done) {
      reply.ok('Set status data sso success!', { success: true, data: done })
    } else {
      reply.ok('Failed to set status data sso!', { success: false })
    }

    await reply
  })

  server.post('/api/sso/list', {
    schema: {
      headers: authSchema.auth
    },
    preHandler: server.auth([
      server.verifyToken
    ])
  }, async (request, reply) => {
    // get hash
    const decoded = server.jwt.decode(request.headers['x-token'])
    /**
     * Assumed that user data will be very huge, so we won't using old pagination style.
     * This pagination will be like "loadmore" with last_created_at date and limit.
     */
    const query = { where: { username: decoded.unm } }
    if (request.body.last_created_at && request.body.last_created_at > 0) {
      query.where.created_at = { [Op.lt]: request.body.last_created_at }
    }

    if (request.body.search && request.body.search !== '') {
      Object.assign(query.where, {
        [Op.or]: [
          { name: { [Op.like]: '%' + request.body.search + '%' } },
          { key: { [Op.like]: '%' + request.body.search + '%' } }
        ]
      })
    }

    // Prevent limit to not more than 100
    let nlimit = 10
    if (request.body.limit && request.body.limit <= 100) {
      nlimit = request.body.limit
    }

    // sso list
    const total = await DataSSO.count(query).catch(err => {
      return reply.sequelizeError(err)
    })

    const pagination = {
      totalRecord: total,
      limit: nlimit,
      loadmore: false,
      last_created_at: 0
    }

    if (total) {
      Object.assign(query, { attributes: ['id', 'username', 'name', 'key', 'callback_url', 'status', 'created_at', 'modified_at'] })
      Object.assign(query, { order: [['created_at', 'desc']] })
      Object.assign(query, { limit: nlimit })
      let list = await DataSSO.findAll(query)
        .catch(err => {
          return reply.sequelizeError(err)
        })

      const isLoadmore = (total > nlimit)
      pagination.loadmore = isLoadmore

      if (list) {
        list = JSON.parse(JSON.stringify(list))
        for (let i = 0; i < list.length; i++) {
          list[i].sso_url = config.baseUrl + '/sso/login/' + list[i].key
        }
        if (isLoadmore) {
          pagination.last_created_at = list[list.length - 1].created_at
        }
        reply.ok('Get data sso list success!', { success: true, pagination, data: list })
      }
    } else {
      reply.ok('Get data sso list success!', { success: true, pagination, data: [] })
    }

    await reply
  })

  server.post('/api/master/sso/list', {
    schema: {
      headers: authSchema.auth
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
          { name: { [Op.like]: '%' + request.body.search + '%' } },
          { key: { [Op.like]: '%' + request.body.search + '%' } }
        ]
      })
    }

    // Prevent limit to not more than 100
    let nlimit = 10
    if (request.body.limit && request.body.limit <= 100) {
      nlimit = request.body.limit
    }

    // sso list
    const total = await DataSSO.count(query).catch(err => {
      return reply.sequelizeError(err)
    })

    const pagination = {
      totalRecord: total,
      limit: nlimit,
      loadmore: false,
      last_created_at: 0
    }

    if (total) {
      Object.assign(query, { attributes: ['id', 'username', 'name', 'key', 'callback_url', 'status', 'created_at', 'modified_at'] })
      Object.assign(query, { order: [['created_at', 'desc']] })
      Object.assign(query, { limit: nlimit })
      let list = await DataSSO.findAll(query)
        .catch(err => {
          return reply.sequelizeError(err)
        })

      const isLoadmore = (total > nlimit)
      pagination.loadmore = isLoadmore

      if (list) {
        list = JSON.parse(JSON.stringify(list))
        for (let i = 0; i < list.length; i++) {
          list[i].sso_url = config.baseUrl + '/sso/login/' + list[i].key
        }
        if (isLoadmore) {
          pagination.last_created_at = list[list.length - 1].created_at
        }
        reply.ok('Get data sso list success!', { success: true, pagination, data: list })
      }
    } else {
      reply.ok('Get data sso list success!', { success: true, pagination, data: [] })
    }

    await reply
  })
}

module.exports = apiRoute
