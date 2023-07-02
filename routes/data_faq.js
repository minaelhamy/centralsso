'use strict'

const moment = require('moment')
const { v4: uuidv4 } = require('uuid')
const { DataFaq } = require('../models/data_faq')
const authSchema = require('../schemas/auth')
const faqSchema = require('../schemas/data_faq')
const config = require('../config')

async function apiRoute (server, options) {
  function _clearCache () {
    server.cacheman.del('data_faq_list')
    server.cacheman.del('data_faq_active_list')
  }

  server.post('/api/master/faq/add', {
    schema: {
      headers: authSchema.auth,
      body: faqSchema.faqAdd
    },
    preHandler: server.auth([
      server.verifyToken,
      server.isRoleAdmin
    ], { relation: 'and' })
  }, async (request, reply) => {
    const timeNow = moment().valueOf()
    const data = {
      id: uuidv4(),
      question: request.body.question,
      answer: request.body.answer,
      position: request.body.position,
      status: 1,
      created_at: timeNow,
      modified_at: timeNow
    }

    const done = await DataFaq.create(data).catch(err => {
      return reply.sequelizeError(err)
    })

    if (done) {
      _clearCache()
      reply.ok('Add new data faq success!', { success: true })
    } else {
      reply.ok('Failed to add new data faq!', { success: false })
    }

    await reply
  })

  server.post('/api/master/faq/update', {
    schema: {
      headers: authSchema.auth,
      body: faqSchema.faqUpdate
    },
    preHandler: server.auth([
      server.verifyToken,
      server.isRoleAdmin
    ], { relation: 'and' })
  }, async (request, reply) => {
    const done = await DataFaq.update({
      question: request.body.question,
      answer: request.body.answer,
      position: request.body.position,
      modified_at: moment().valueOf()
    }, { where: { id: request.body.id } }).catch(err => {
      return reply.sequelizeError(err)
    })

    if (done) {
      _clearCache()
      reply.ok('Update data faq success', { success: true, data: done })
    } else {
      reply.ok('Failed to update data faq', { success: false })
    }
    await reply
  })

  server.post('/api/master/faq/delete', {
    schema: {
      headers: authSchema.auth,
      body: faqSchema.faqDelete
    },
    preHandler: server.auth([
      server.verifyToken,
      server.isRoleAdmin
    ], { relation: 'and' })
  }, async (request, reply) => {
    const done = await DataFaq.destroy({ where: { id: request.body.id } }).catch(err => {
      return reply.sequelizeError(err)
    })

    if (done) {
      _clearCache()
      reply.ok('Delete data faq success!', { success: true })
    } else {
      reply.ok('Failed to delete data faq!', { success: false })
    }

    await reply
  })

  server.post('/api/master/faq/set-status', {
    schema: {
      headers: authSchema.auth,
      body: faqSchema.faqStatus
    },
    preHandler: server.auth([
      server.verifyToken,
      server.isRoleAdmin
    ], { relation: 'and' })
  }, async (request, reply) => {
    const done = await DataFaq.update({
      status: request.body.status,
      modified_at: moment().valueOf()
    }, { where: { id: request.body.id } }).catch(err => {
      return reply.sequelizeError(err)
    })

    if (done) {
      _clearCache()
      reply.ok('Set status data faq success!', { success: true, data: done })
    } else {
      reply.ok('Failed to set status data faq!', { success: false })
    }

    await reply
  })

  server.get('/api/master/faq/list', {
    schema: {
      headers: authSchema.auth
    },
    preHandler: server.auth([
      server.verifyToken,
      server.isRoleAdmin
    ], { relation: 'and' })
  }, async (request, reply) => {
    const _keycache = 'data_faq_list'
    let cached = await server.cacheman.get(_keycache)
    if (cached === null || cached === undefined) {
      const result = await DataFaq.findAll({ order: [['position', 'asc']] }).catch(err => {
        return reply.sequelizeError(err)
      })
      if (result) {
        // save to cache
        await server.cacheman.set(_keycache, { success: true, data: result }, config.cache.ttl.master_data)
      } else {
        await server.cacheman.set(_keycache, { success: true, data: [] }, config.cache.ttl.master_data)
      }
      // refresh cached data
      cached = await server.cacheman.get(_keycache)
    }

    reply.ok('Get list data faq success!', cached)

    await reply
  })

  server.get('/api/faq/list', async (request, reply) => {
    const _keycache = 'data_faq_active_list'
    let cached = await server.cacheman.get(_keycache)
    if (cached === null || cached === undefined) {
      const result = await DataFaq.findAll({
        where: { status: 1 },
        order: [['position', 'asc']]
      }).catch(err => {
        return reply.sequelizeError(err)
      })
      if (result) {
        // save to cache
        await server.cacheman.set(_keycache, { success: true, data: result }, config.cache.ttl.master_data)
      } else {
        await server.cacheman.set(_keycache, { success: true, data: [] }, config.cache.ttl.master_data)
      }
      // refresh cached data
      cached = await server.cacheman.get(_keycache)
    }

    reply.ok('Get list data faq success!', cached)

    await reply
  })
}

module.exports = apiRoute
