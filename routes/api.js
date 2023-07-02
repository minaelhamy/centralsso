'use strict'
const config = require('../config')
const schema = require('../schemas/mail')

async function apiRoute (server, options) {
  server.get('/api/routes', { onRequest: server.useHtmlCache }, async (request, reply) => {
    reply.ok('Get data routes success', { data: server.dataRoutes })
  })

  server.post('/api/sendmail', { schema: schema.sendEmail }, async (request, reply) => {
    const senderName = request.body.name
    const senderEmail = request.body.email
    const subject = request.body.subject
    const message = request.body.message
    const tag = (request.body.tag ? request.body.tag : 'Contact Form')
    if (senderName && senderEmail && subject && message) {
      server.nodemailer.sendMail({
        from: '"' + config.siteName + '" <' + config.nodeMailerTransport.auth.user + '>',
        to: config.recipientEmailAddress,
        subject: '[' + tag + '] ' + subject,
        text: 'Sender Name: ' + senderName + '\nSender Email: ' + senderEmail + '\n\n' + message
      }, (err, info) => {
        if (err) {
          return reply.badRequest('Send Message Failed!', { error: err, success: false })
        }
        return reply.ok('Send Message Success!', { success: true, data: info })
      })
      await reply
    } else {
      return reply.badRequest('Send Message Failed!', {
        error: 'Sender name, email address, subject and message is required!',
        success: false
      })
    }
  })
}

module.exports = apiRoute
