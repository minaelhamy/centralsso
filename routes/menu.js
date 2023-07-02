'use strict'

const moment = require('moment')
const { Op } = require('sequelize')
const { v4: uuidv4 } = require('uuid')
const { Menu } = require('../models/menu')
const authSchema = require('../schemas/auth')
const menuSchema = require('../schemas/menu')
const obase64 = require('../lib/obase64')
const config = require('../config')
const FlyJson = require('fly-json-odm')

async function apiRoute (server, options) {
  async function _clearCache (groupname) {
    groupname = (groupname === undefined ? null : groupname)
    server.cacheman.del('menu_parent_list')
    server.cacheman.del('menu_parent_role_listadmin')
    server.cacheman.del('menu_parent_role_listmember')
    server.cacheman.del('menu_parent_role_list_groupedadmin')
    server.cacheman.del('menu_parent_role_list_groupedmember')
    if (groupname) {
      server.cacheman.del('menu_parent_group_list_' + groupname)
    } else {
      let listgroup = await Menu.findAll({
        group: 'group'
      }).catch(err => {
        return console.log(err)
      })
      if (listgroup) {
        listgroup = JSON.parse(JSON.stringify(listgroup))
        for (let i = 0; i < listgroup.length; i++) {
          server.cacheman.del('menu_parent_group_list_' + listgroup[i].group)
        }
      }
    }
  }

  server.post('/api/menu/parent/add', {
    schema: {
      headers: authSchema.auth,
      body: menuSchema.parentAdd
    },
    preHandler: server.auth([
      server.verifyToken,
      server.isRoleAdmin
    ], { relation: 'and' })
  }, async (request, reply) => {
    const timeNow = moment().valueOf()
    const data = {
      id: uuidv4(),
      name: request.body.name,
      url: request.body.url,
      role: request.body.role,
      position: request.body.position,
      icon: request.body.icon,
      group: request.body.group,
      status: 1,
      created_at: timeNow,
      modified_at: timeNow
    }

    const done = await Menu.create(data).catch(err => {
      return reply.sequelizeError(err)
    })

    if (done) {
      await _clearCache(request.body.group)
      reply.ok('Add new menu parent success!', { success: true })
    } else {
      reply.ok('Failed to add new menu parent!', { success: false })
    }

    await reply
  })

  server.post('/api/menu/parent/update', {
    schema: {
      headers: authSchema.auth,
      body: menuSchema.parentUpdate
    },
    preHandler: server.auth([
      server.verifyToken,
      server.isRoleAdmin
    ], { relation: 'and' })
  }, async (request, reply) => {
    const done = await Menu.update({
      name: request.body.name,
      url: request.body.url,
      role: request.body.role,
      position: request.body.position,
      status: request.body.status,
      icon: request.body.icon,
      group: request.body.group,
      modified_at: moment().valueOf()
    }, { where: { id: request.body.id } }).catch(err => {
      return reply.sequelizeError(err)
    })

    if (done) {
      await _clearCache(request.body.group)
      reply.ok('Update menu parent success', { success: true, data: done })
    } else {
      reply.ok('Failed to update menu parent', { success: false })
    }

    await reply
  })

  server.post('/api/menu/parent/delete', {
    schema: {
      headers: authSchema.auth,
      body: menuSchema.parentDelete
    },
    preHandler: server.auth([
      server.verifyToken,
      server.isRoleAdmin
    ], { relation: 'and' })
  }, async (request, reply) => {
    const done = await Menu.destroy({ where: { id: request.body.id } }).catch(err => {
      return reply.sequelizeError(err)
    })

    if (done) {
      await _clearCache()
      reply.ok('Delete menu parent success!', { success: true })
    } else {
      reply.ok('Failed to delete menu parent!', { success: false })
    }

    await reply
  })

  server.post('/api/menu/parent/set-menu-child', {
    schema: {
      headers: authSchema.auth,
      body: menuSchema.parentChild
    },
    preHandler: server.auth([
      server.verifyToken,
      server.isRoleAdmin
    ], { relation: 'and' })
  }, async (request, reply) => {
    const done = await Menu.update({
      child: JSON.stringify(request.body.child),
      modified_at: moment().valueOf()
    }, { where: { id: request.body.id } }).catch(err => {
      return reply.sequelizeError(err)
    })

    if (done) {
      await _clearCache()
      reply.ok('Set menu child success!', { success: true, data: done })
    } else {
      reply.ok('Failed to set menu child!', { success: false })
    }

    await reply
  })

  server.post('/api/menu/parent/set-status', {
    schema: {
      headers: authSchema.auth,
      body: menuSchema.parentStatus
    },
    preHandler: server.auth([
      server.verifyToken,
      server.isRoleAdmin
    ], { relation: 'and' })
  }, async (request, reply) => {
    const done = await Menu.update({
      status: request.body.status,
      modified_at: moment().valueOf()
    }, { where: { id: request.body.id } }).catch(err => {
      return reply.sequelizeError(err)
    })

    if (done) {
      await _clearCache()
      reply.ok('Set status menu parent success!', { success: true, data: done })
    } else {
      reply.ok('Failed to set status menu parent!', { success: false })
    }

    await reply
  })

  server.get('/api/menu/parent/list', {
    schema: {
      headers: authSchema.auth
    },
    preHandler: server.auth([
      server.verifyToken,
      server.isRoleAdmin
    ], { relation: 'and' })
  }, async (request, reply) => {
    const _keycache = 'menu_parent_list'
    let cached = await server.cacheman.get(_keycache)
    if (cached === null || cached === undefined) {
      const result = await Menu.findAll({ order: [['position', 'asc']] }).catch(err => {
        return reply.sequelizeError(err)
      })
      if (result) {
        // parse child menu if any
        for (let i = 0; i < result.length; i++) {
          if (result[i].child) result[i].child = JSON.parse(result[i].child)
        }
        // save to cache
        await server.cacheman.set(_keycache, { success: true, data: result }, config.cache.ttl.menu_parent_list)
      } else {
        await server.cacheman.set(_keycache, { success: true, data: [] }, config.cache.ttl.menu_parent_list)
      }
      // refresh cached data
      cached = await server.cacheman.get(_keycache)
    }

    reply.ok('Get list menu parent success!', cached)

    await reply
  })

  server.get('/api/menu/parent/list/:group', {
    schema: {
      headers: authSchema.auth
    },
    preHandler: server.auth([
      server.verifyToken,
      server.isRoleAdmin
    ])
  }, async (request, reply) => {
    const groupname = request.params.group
    const _keycache = 'menu_parent_group_list_' + groupname
    let cached = await server.cacheman.get(_keycache)
    if (cached === null || cached === undefined) {
      const result = await Menu.findAll({
        where: { group: groupname },
        order: [['position', 'asc']]
      }).catch(err => {
        return reply.sequelizeError(err)
      })
      if (result) {
        // parse child menu if any
        for (let i = 0; i < result.length; i++) {
          if (result[i].child) result[i].child = JSON.parse(result[i].child)
        }
        // save to cache
        await server.cacheman.set(_keycache, { success: true, data: result }, config.cache.ttl.menu_parent_group_list)
      } else {
        await server.cacheman.set(_keycache, { success: true, data: [] }, config.cache.ttl.menu_parent_group_list)
      }
      // refresh cached data
      cached = await server.cacheman.get(_keycache)
    }

    reply.ok('Get list menu parent by group success!', cached)

    await reply
  })

  server.get('/api/menu/parent/list-by-role', {
    schema: {
      headers: authSchema.auth
    },
    preHandler: server.auth([
      server.verifyToken
    ])
  }, async (request, reply) => {
    const userRole = obase64.decode(server.jwt.decode(request.headers['x-token']).hash)
    const _keycache = 'menu_parent_role_list' + userRole
    let cached = await server.cacheman.get(_keycache)
    if (cached === null || cached === undefined) {
      const result = await Menu.findAll({
        where: {
          role: { [Op.like]: '%' + userRole + '%' },
          status: 1
        },
        order: [['position', 'asc']]
      }).catch(err => {
        return reply.sequelizeError(err)
      })
      if (result) {
        // parse child menu if any
        for (let i = 0; i < result.length; i++) {
          if (result[i].child) result[i].child = JSON.parse(result[i].child)
        }
        // save to cache
        await server.cacheman.set(_keycache, { success: true, data: result }, config.cache.ttl.menu_parent_role_list)
      } else {
        await server.cacheman.set(_keycache, { success: true, data: [] }, config.cache.ttl.menu_parent_role_list)
      }
      // refresh cached data
      cached = await server.cacheman.get(_keycache)
    }

    reply.ok('Get list menu parent by role success!', cached)

    await reply
  })

  server.get('/api/menu/parent/list-by-role/grouped', {
    schema: {
      headers: authSchema.auth
    },
    preHandler: server.auth([
      server.verifyToken
    ])
  }, async (request, reply) => {
    const userRole = obase64.decode(server.jwt.decode(request.headers['x-token']).hash)
    const _keycache = 'menu_parent_role_list_grouped' + userRole
    let cached = await server.cacheman.get(_keycache)
    if (cached === null || cached === undefined) {
      let result = await Menu.findAll({
        where: {
          role: { [Op.like]: '%' + userRole + '%' },
          status: 1
        },
        order: [['position', 'asc']]
      }).catch(err => {
        return reply.sequelizeError(err)
      })
      if (result) {
        // parse child menu if any
        for (let i = 0; i < result.length; i++) {
          if (result[i].child) result[i].child = JSON.parse(result[i].child)
        }
        result = JSON.parse(JSON.stringify(result))
        // grouping
        const nosql = new FlyJson()
        const gresult = nosql.set(result).groupDetail('group').exec()
        const nresult = []
        for (const key in gresult[0].group) {
          if (Object.prototype.hasOwnProperty.call(gresult[0].group, key)) {
            nresult.push({ group: key, menu: gresult[0].group[key] })
          }
        }
        // save to cache
        await server.cacheman.set(_keycache, { success: true, data: nresult }, config.cache.ttl.menu_parent_role_list_grouped)
      } else {
        await server.cacheman.set(_keycache, { success: true, data: [] }, config.cache.ttl.menu_parent_role_list_grouped)
      }
      // refresh cached data
      cached = await server.cacheman.get(_keycache)
    }

    reply.ok('Get list menu parent by role grouped success!', cached)

    await reply
  })
}

module.exports = apiRoute
