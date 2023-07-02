'use strict'

const sendEmail = {
  body: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      email: { type: 'string' },
      subject: { type: 'string' },
      message: { type: 'string' },
      tag: { type: 'string' }
    },
    required: ['name', 'email', 'subject', 'message']
  }
}

module.exports = {
  sendEmail
}
