'use strict'

const { db, Sequelize } = require('../lib/connection')

const User = db.define('user', {
  id: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  username: {
    type: Sequelize.STRING
  },
  fullname: {
    type: Sequelize.STRING
  },
  email: {
    type: Sequelize.STRING
  },
  gravatar: {
    type: Sequelize.STRING
  },
  role: {
    type: Sequelize.STRING
  },
  hash: {
    type: Sequelize.STRING
  },
  method: {
    type: Sequelize.STRING
  },
  service: {
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
  created_at_month: {
    type: Sequelize.STRING
  },
  created_at_year: {
    type: Sequelize.BIGINT
  }
}, {
  timestamps: false
}, {
  indexes: [{
    unique: false,
    fields: ['username', 'email']
  }]
})

module.exports = {
  User,
  db
}
