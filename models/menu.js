'use strict'

const { db, Sequelize } = require('../lib/connection')

const Menu = db.define('menu', {
  id: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  name: {
    type: Sequelize.STRING
  },
  url: {
    type: Sequelize.STRING
  },
  role: {
    type: Sequelize.STRING
  },
  position: {
    type: Sequelize.BIGINT
  },
  icon: {
    type: Sequelize.STRING
  },
  child: {
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
  group: {
    type: Sequelize.STRING
  }
}, {
  timestamps: false
})

module.exports = {
  Menu,
  db
}
