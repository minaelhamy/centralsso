'use strict'

const config = require('../config')
const moment = require('moment')
const helper = require('../lib/helper')
const pjson = require('../package.json')
const { Op } = require('sequelize')
const { ForgotPassword } = require('../models/forgot_password')
const { ActivationUser } = require('../models/activation_user')
const { DataSSO } = require('../models/data_sso')

async function pageRoute (server, options) {
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
    oauth: config.oauth,
    version: pjson.version
  }

  /**
   * Template Engine doesn't have html cache so we need to inject it manually via onRequest hooks.
   * This server.useHtmlCache will work if you set isProduction to true only.
   */
  server.get('/', { onRequest: server.useHtmlCache }, async (request, reply) => {
    // Shallow Clone
    const newTemplateData = { ...templateData }
    newTemplateData.title = config.siteTitle
    const html = await server.view('index', newTemplateData)
    await reply.html(html)
  })

  server.get('/blank', { onRequest: server.useHtmlCache }, async (request, reply) => {
    const html = await server.view('blank', templateData)
    await reply.html(html)
  })

  server.get('/about', { onRequest: server.useHtmlCache }, async (request, reply) => {
    const newTemplateData = { ...templateData }
    newTemplateData.title = 'About'
    const html = await server.view('about', newTemplateData)
    await reply.html(html)
  })

  server.get('/terms-and-conditions', { onRequest: server.useHtmlCache }, async (request, reply) => {
    const newTemplateData = { ...templateData }
    newTemplateData.title = 'Terms & Conditions'
    const html = await server.view('terms-and-conditions', newTemplateData)
    await reply.html(html)
  })

  server.get('/privacy-policy', { onRequest: server.useHtmlCache }, async (request, reply) => {
    const newTemplateData = { ...templateData }
    newTemplateData.title = 'Privacy Policy'
    const html = await server.view('privacy-policy', newTemplateData)
    await reply.html(html)
  })

  server.get('/contact', { onRequest: server.useHtmlCache }, async (request, reply) => {
    const newTemplateData = { ...templateData }
    newTemplateData.title = 'Contact'
    newTemplateData.useMailer = config.useMailer
    newTemplateData.captcha = config.recaptchaSiteKey
    newTemplateData.hideBadge = config.hideRecaptchaBadge

    const html = await server.view('contact', newTemplateData)
    await reply.html(html)
  })

  server.get('/sign-up', { onRequest: server.useHtmlCache }, async (request, reply) => {
    const newTemplateData = { ...templateData }
    newTemplateData.title = 'Sign up'
    const html = await server.view('sign-up', newTemplateData)
    await reply.html(html)
  })

  server.get('/sign-in', { onRequest: server.useHtmlCache }, async (request, reply) => {
    const newTemplateData = { ...templateData }
    newTemplateData.title = 'Sign in'
    const html = await server.view('sign-in', newTemplateData)
    await reply.html(html)
  })

  server.get('/forgot-password', { onRequest: server.useHtmlCache }, async (request, reply) => {
    const newTemplateData = { ...templateData }
    newTemplateData.title = 'Forgot Password'
    const html = await server.view('forgot-password', newTemplateData)
    await reply.html(html)
  })

  server.get('/reset-password/:id', { onRequest: server.useHtmlCache }, async (request, reply) => {
    const payload = { ...templateData }
    payload.title = 'Reset Password'
    payload.reset_pass_id = request.params.id
    payload.valid = false

    // Check expired request reset password
    if (!payload.valid) {
      const result = await ForgotPassword.findOne({
        where: {
          id: request.params.id,
          status: 0,
          expired_at: {
            [Op.gte]: moment().valueOf()
          }
        }
      }).catch(err => {
        payload.valid = false
        payload.message = err.message
      })

      if (result) {
        payload.valid = true
        payload.message = ''
      } else {
        payload.valid = false
        payload.message = 'Link to Reset Password already expired.'
      }
    }

    const html = await server.view('reset-password', payload)
    await reply.html(html)
  })

  server.get('/user-activation/:id', { onRequest: server.useHtmlCache }, async (request, reply) => {
    const payload = { ...templateData }
    payload.title = 'User Activation'
    payload.user_id = request.params.id
    payload.valid = false

    // Check expired request activation user
    if (!payload.valid) {
      const result = await ActivationUser.findOne({
        where: {
          id: request.params.id,
          status: 0,
          expired_at: {
            [Op.gte]: moment().valueOf()
          }
        }
      }).catch(err => {
        payload.valid = false
        payload.message = err.message
      })

      if (result) {
        payload.valid = true
        payload.message = ''
      } else {
        payload.valid = false
        payload.message = 'Link Activation User already expired.'
      }
    }

    const html = await server.view('activation-user', payload)
    await reply.html(html)
  })

  server.get('/sso/login/:key', async (request, reply) => {
    const payload = { ...templateData }
    payload.title = 'Single Sign On'
    payload.login_key = request.params.key
    payload.valid = false
    payload.callback_url = ''
    let error = false

    const verified = await DataSSO.findOne({
      where: {
        key: request.params.key,
        status: 1
      }
    }).catch(err => {
      error = true
      console.log(err.message)
      payload.valid = false
      payload.message = 'Something went wrong, please reload this page!'
    })

    if (verified) {
      payload.valid = true
      payload.callback_url = verified.callback_url
    } else {
      payload.valid = false
      if (error === false) {
        payload.message = 'You don\'t have any authorization to use SSO!'
      }
    }

    const html = await server.view('sso-login', payload)
    await reply.html(html)
  })
}

module.exports = pageRoute
