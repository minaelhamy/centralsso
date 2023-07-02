'use strict'

const { db, Sequelize } = require('../lib/connection')

const DataSSO = db.define('data_sso', {
  id: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  name: {
    type: Sequelize.STRING
  },
  username: {
    type: Sequelize.STRING
  },
  key: {
    type: Sequelize.STRING
  },
  callback_url: {
    type: Sequelize.STRING
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
  DataSSO,
  db
}
