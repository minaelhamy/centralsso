'use strict'

const faqAdd = {
  type: 'object',
  properties: {
    question: { type: 'string' },
    answer: { type: 'string' },
    position: { type: 'number' }
  },
  required: ['question', 'answer', 'position']
}

const faqUpdate = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    question: { type: 'string' },
    answer: { type: 'string' },
    position: { type: 'number' },
    status: { type: 'number' }
  },
  required: ['id']
}

const faqDelete = {
  type: 'object',
  properties: {
    id: { type: 'string' }
  },
  required: ['id']
}

const faqStatus = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    status: { type: 'integer' }
  },
  required: ['id', 'status']
}

module.exports = {
  faqAdd,
  faqUpdate,
  faqDelete,
  faqStatus
}
