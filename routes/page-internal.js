'use strict'

const config = require('../config')
const helper = require('../lib/helper')
const pjson = require('../package.json')

async function pageInternalRoute (server, options) {
  /**
   * Default variable for template engine
   */
  const templateData = {
    baseUrl: config.baseUrl,
    baseAssetsUrl: config.baseAssetsUrl,
    year: helper.copyrightYear(config.startYearCopyright),
    siteName: config.siteName,
    siteDescription: config.siteDescription,
    authorName: config.authorName,
    authorEmail: config.authorEmail,
    authorWebsite: config.authorWebsite,
    webmaster: config.webmaster,
    tracker: config.tracker,
    social: config.social,
    version: pjson.version
  }

  /**
   * Template Engine doesn't have html cache so we need to inject it manually via onRequest hooks.
   * This server.useHtmlCache will only work if you set isProduction to true.
   */
  server.get('/data-user', { onRequest: server.useHtmlCache }, async (request, reply) => {
    // Shallow Clone
    const newTemplateData = { ...templateData }
    newTemplateData.siteTitle = config.siteTitle
    newTemplateData.title = 'Data User'
    const html = await server.view('backend/data_user', newTemplateData)
    await reply.html(html)
  })

  server.get('/example-data', { onRequest: server.useHtmlCache }, async (request, reply) => {
    // Shallow Clone
    const newTemplateData = { ...templateData }
    newTemplateData.siteTitle = config.siteTitle
    newTemplateData.title = 'Example Data'
    const html = await server.view('backend/example_data', newTemplateData)
    await reply.html(html)
  })

  server.get('/blank-admin', { onRequest: server.useHtmlCache }, async (request, reply) => {
    // Shallow Clone
    const newTemplateData = { ...templateData }
    newTemplateData.siteTitle = config.siteTitle
    newTemplateData.title = 'Blank'
    const html = await server.view('backend/blank_admin', newTemplateData)
    await reply.html(html)
  })

  server.get('/dashboard', { onRequest: server.useHtmlCache }, async (request, reply) => {
    // Shallow Clone
    const newTemplateData = { ...templateData }
    newTemplateData.siteTitle = config.siteTitle
    newTemplateData.title = 'Dashboard'
    const html = await server.view('backend/dashboard', newTemplateData)
    await reply.html(html)
  })

  server.get('/data-faq', { onRequest: server.useHtmlCache }, async (request, reply) => {
    const newTemplateData = { ...templateData }
    newTemplateData.title = 'Data FAQ'
    const html = await server.view('backend/data_faq', newTemplateData)
    await reply.html(html)
  })

  server.get('/data-sso', { onRequest: server.useHtmlCache }, async (request, reply) => {
    const newTemplateData = { ...templateData }
    newTemplateData.siteTitle = config.siteTitle
    newTemplateData.title = 'Data SSO'
    const html = await server.view('backend/data_sso', newTemplateData)
    await reply.html(html)
  })

  server.get('/data-menu', { onRequest: server.useHtmlCache }, async (request, reply) => {
    const newTemplateData = { ...templateData }
    newTemplateData.title = 'Data Menu'
    const html = await server.view('backend/data_menu', newTemplateData)
    await reply.html(html)
  })

  server.get('/my-profile', { onRequest: server.useHtmlCache }, async (request, reply) => {
    const newTemplateData = { ...templateData }
    newTemplateData.title = 'My Profile'
    const html = await server.view('backend/my_profile', newTemplateData)
    await reply.html(html)
  })

  server.get('/my-sso', { onRequest: server.useHtmlCache }, async (request, reply) => {
    const newTemplateData = { ...templateData }
    newTemplateData.siteTitle = config.siteTitle
    newTemplateData.title = 'My SSO'
    const html = await server.view('backend/my_sso', newTemplateData)
    await reply.html(html)
  })

  server.get('/support', { onRequest: server.useHtmlCache }, async (request, reply) => {
    const newTemplateData = { ...templateData }
    newTemplateData.title = 'Support'
    const html = await server.view('backend/support', newTemplateData)
    await reply.html(html)
  })
}

module.exports = pageInternalRoute
