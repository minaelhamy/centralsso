'use strict'

const parentAdd = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    url: { type: 'string' },
    role: { type: 'string' },
    icon: { type: 'string' },
    position: { type: 'number' },
    group: { type: 'string' }
  },
  required: ['name', 'url', 'role', 'icon', 'position', 'group']
}

const parentUpdate = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    url: { type: 'string' },
    role: { type: 'string' },
    status: { type: 'integer' },
    icon: { type: 'string' },
    position: { type: 'number' },
    group: { type: 'string' }
  },
  required: ['id', 'name', 'url']
}

const parentDelete = {
  type: 'object',
  properties: {
    id: { type: 'string' }
  },
  required: ['id']
}

const parentStatus = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    status: { type: 'integer' }
  },
  required: ['id', 'status']
}

const parentChild = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    child: { type: 'array' }
  },
  required: ['id', 'child']
}

module.exports = {
  parentAdd,
  parentUpdate,
  parentDelete,
  parentStatus,
  parentChild
}
