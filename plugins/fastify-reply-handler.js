/**
 * Fastify Reply Handler Plugin
 * This plugin will help you to standardize the output response
 */
'use strict'

const fp = require('fastify-plugin')

function custom (msg, code, obj) {
  const data = {
    message: msg,
    statusCode: code
  }
  Object.assign(data, obj)
  return data
}

async function replyHandlerPlugin (app) {
  /**
   * Reply OK (200)
   * @param {string} message      this is the message
   * @param {object} obj          this is the additional data [Optional]
   */
  if (!app.hasReplyDecorator('ok')) {
    app.decorateReply('ok', function (message, obj) {
      return this.code(200).send(custom(message, 200, obj))
    })
  }

  /**
   * Reply Created (201)
   * @param {string} message      this is the message
   * @param {object} obj          this is the additional data [Optional]
   */
  if (!app.hasReplyDecorator('created')) {
    app.decorateReply('created', function (message, obj) {
      return this.code(201).send(custom(message, 201, obj))
    })
  }

  /**
   * Reply Bad Request (400)
   * @param {string} message      this is the message
   * @param {object} obj          this is the additional data [Optional]
   */
  if (!app.hasReplyDecorator('badRequest')) {
    app.decorateReply('badRequest', function (message, obj) {
      const newdata = {
        error: 'Bad Request'
      }
      Object.assign(newdata, obj)
      return this.code(400).send(custom(message, 400, newdata))
    })
  }

  /**
   * Reply Unauthorized (401)
   * @param {string} message      this is the message
   * @param {object} obj          this is the additional data [Optional]
   */
  if (!app.hasReplyDecorator('unauthorized')) {
    app.decorateReply('unauthorized', function (message, obj) {
      const newdata = {
        error: 'Unauthorized'
      }
      Object.assign(newdata, obj)
      return this.code(401).send(custom(message, 401, newdata))
    })
  }

  /**
   * Reply Forbidden (403)
   * @param {string} message      this is the message
   * @param {object} obj          this is the additional data [Optional]
   */
  if (!app.hasReplyDecorator('forbidden')) {
    app.decorateReply('forbidden', function (message, obj) {
      const newdata = {
        error: 'Forbidden'
      }
      Object.assign(newdata, obj)
      return this.code(403).send(custom(message, 403, newdata))
    })
  }

  /**
   * Reply Not Found (404)
   * @param {string} message      this is the message
   * @param {object} obj          this is the additional data [Optional]
   */
  if (!app.hasReplyDecorator('notFound')) {
    app.decorateReply('notFound', function (message, obj) {
      const newdata = {
        error: 'Not Found'
      }
      Object.assign(newdata, obj)
      return this.code(404).send(custom(message, 404, newdata))
    })
  }

  /**
   * Reply Error (500)
   * @param {string} message      this is the message
   * @param {object} obj          this is the additional data [Optional]
   */
  if (!app.hasReplyDecorator('error')) {
    app.decorateReply('error', function (message, obj) {
      const newdata = {
        error: 'Internal Server Error'
      }
      Object.assign(newdata, obj)
      return this.code(500).send(custom(message, 500, newdata))
    })
  }

  /**
   * Reply Sequelize Error (400)
   * @param {sequelizeError} sequelizeError      this is the object from SequelizeError
   */
  if (!app.hasReplyDecorator('sequelizeError')) {
    app.decorateReply('sequelizeError', function (sequelizeError) {
      return this.code(400).send(sequelizeError)
    })
  }

  /**
   * Reply HTML
   * @param {string} html       this is the html
   * @param {object} code       this is the http/status code. Default is 200
   */
  if (!app.hasReplyDecorator('html')) {
    app.decorateReply('html', function (html, code = 200) {
      return this.code(code).header('Content-Type', 'text/html; charset=utf-8').send(html)
    })
  }

  /**
   * Reply XML
   * @param {string} xml        this is the xml
   * @param {object} code       this is the http/status code. Default is 200
   */
  if (!app.hasReplyDecorator('xml')) {
    app.decorateReply('xml', function (xml, code = 200) {
      return this.code(code).header('Content-Type', 'text/xml').send(xml)
    })
  }

  /**
   * Reply TXT
   * @param {string} txt        this is the txt
   * @param {object} code       this is the http/status code. Default is 200
   */
  if (!app.hasReplyDecorator('txt')) {
    app.decorateReply('txt', function (txt, code = 200) {
      return this.code(code).header('Content-Type', 'text/plain').send(txt)
    })
  }
}

module.exports = fp(replyHandlerPlugin)
