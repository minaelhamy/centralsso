/**
 * Fastify Data Routes Plugin
 */
'use strict'

const fp = require('fastify-plugin')

async function dataRoutesPlugin (app) {
  if (!app.hasDecorator('dataRoutes')) {
    app.decorate('dataRoutes', [])
    app.addHook('onRoute', (routeOptions) => {
      app.dataRoutes.push({
        method: routeOptions.method,
        schema: routeOptions.schema,
        url: routeOptions.url,
        path: routeOptions.path,
        routePath: routeOptions.routePath,
        bodyLimit: routeOptions.bodyLimit,
        logLevel: routeOptions.logLevel,
        logSerializers: routeOptions.logSerializers,
        prefix: routeOptions.prefix
      })
    })
  }
}

module.exports = fp(dataRoutesPlugin)
