/**
 * Fastify HTML Cache Plugin
 */
'use strict'

const fp = require('fastify-plugin')
const moment = require('moment')
const config = require('../config.js')
const helper = require('../lib/helper')
const md5 = require('md5')

async function htmlCachePlugin (app) {
  app.decorate('useHtmlCache', async function (request, reply) {
    function injectResponseHeader (etag) {
      return {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=' + 86400,
        Expires: moment().add(86400, 'seconds').utc().format('ddd, DD MMM YYYY HH:mm:ss') + ' GMT',
        Pragma: 'public',
        Etag: etag
      }
    }
    // Template Engine View doesn't have browser cache, so we must inject it manually each routes.
    if (config.isProduction) {
      const etag = '"' + md5(request.url + helper.autoEtag(config.autoEtagAfterHour)) + '"'
      if (request.headers['if-none-match'] === etag) {
        return reply.code(304).send('')
      }
      reply.headers(injectResponseHeader(etag))
    }
  })
}

module.exports = fp(htmlCachePlugin)
