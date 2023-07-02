'use strict'

const { db, Sequelize } = require('../lib/connection')

const ActivationUser = db.define('activationuser', {
  id: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  username: {
    type: Sequelize.STRING
  },
  data: {
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
  },
  expired_at: {
    type: Sequelize.BIGINT,
    get () {
      const value = this.getDataValue('expired_at')
      return value === null ? null : parseInt(value)
    }
  }
}, {
  timestamps: false
})

module.exports = {
  ActivationUser,
  db
}
