'use strict'

const auth = {
  type: 'object',
  properties: {
    'x-token': { type: 'string' }
  },
  required: ['x-token']
}

module.exports = {
  auth
}
