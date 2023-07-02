'use strict'

const reqToken = {
  type: 'object',
  properties: {
    'access-key': { type: 'string' }
  },
  required: ['access-key']
}

const google = {
  headers: {
    type: 'object',
    properties: {
      'access-token': { type: 'string' }
    },
    required: ['access-token']
  },
  body: {
    type: 'object',
    properties: {
      username: { type: 'string' },
      email: { type: 'string' },
      fullname: { type: 'string' }
    },
    required: ['username', 'email']
  }
}

module.exports = {
  reqToken,
  google
}
