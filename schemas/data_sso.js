'use strict'

const ssoAdd = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    callback_url: { type: 'string' }
  },
  required: ['name', 'callback_url']
}

const ssoUpdate = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    callback_url: { type: 'string' },
    status: { type: 'number' }
  },
  required: ['id']
}

const ssoDelete = {
  type: 'object',
  properties: {
    id: { type: 'string' }
  },
  required: ['id']
}

const ssoStatus = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    status: { type: 'integer' }
  },
  required: ['id', 'status']
}

module.exports = {
  ssoAdd,
  ssoUpdate,
  ssoDelete,
  ssoStatus
}
