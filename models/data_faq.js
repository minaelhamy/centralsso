'use strict'

const { db, Sequelize } = require('../lib/connection')

const DataFaq = db.define('data_faq', {
  id: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  question: {
    type: Sequelize.STRING
  },
  answer: {
    type: Sequelize.STRING
  },
  position: {
    type: Sequelize.BIGINT
  },
  status: {
    type: Sequelize.BIGINT
  },
  created_at: {
    type: Sequelize.BIGINT,
    get () {
      const value = this.getDataValue('created_at')
      return value === null ? null : parseInt(value)
    }
  },
  modified_at: {
    type: Sequelize.BIGINT,
    get () {
      const value = this.getDataValue('modified_at')
      return value === null ? null : parseInt(value)
    }
  }
}, {
  timestamps: false
})

module.exports = {
  DataFaq,
  db
}
