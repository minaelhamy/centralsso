'use strict'

const { db, Sequelize } = require('../lib/connection')

const LastLogin = db.define('lastlogin', {
  user_id: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  username: {
    type: Sequelize.STRING
  },
  email: {
    type: Sequelize.STRING
  },
  gravatar: {
    type: Sequelize.STRING
  },
  login_at: {
    type: Sequelize.BIGINT,
    get () {
      const value = this.getDataValue('login_at')
      return value === null ? null : parseInt(value)
    }
  }
}, {
  timestamps: false
})

module.exports = {
  LastLogin,
  db
}
