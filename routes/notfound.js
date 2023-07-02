'use strict'

const config = require('../config')
const helper = require('../lib/helper')
const pjson = require('../package.json')

async function handlerNotFound (server, options) {
  server.setNotFoundHandler(async function (request, reply) {
    if (request.raw.url.indexOf('/api/') !== -1) {
      reply.notFound('Route ' + request.method + ':' + request.url + ' not found!')
    } else {
      const html = await server.view('404', {
        baseUrl: config.baseUrl,
        baseAssetsUrl: config.baseAssetsUrl,
        year: helper.copyrightYear(config.startYearCopyright),
        siteName: config.siteName,
        authorName: config.authorName,
        authorEmail: config.authorEmail,
        authorWebsite: config.authorWebsite,
        webmaster: config.webmaster,
        tracker: config.tracker,
        oauth: config.oauth,
        version: pjson.version
      })
      reply.html(html, 404)
    }
    await reply
  })
}

module.exports = handlerNotFound
