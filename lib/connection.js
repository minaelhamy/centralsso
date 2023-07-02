'use strict'

const { Sequelize } = require('sequelize')
const config = require('../config')
let db = null
const dbDialect = {
  dialect: config.sequelizeOption.dialect,
  dialectOptions: config.sequelizeOption.options
}

switch (config.sequelizeOption.dialect) {
  case 'sqlite':
    if (config.isProduction) {
      Object.assign(config.sequelizeOption, { logging: false })
    }
    db = new Sequelize(config.sequelizeOption)
    break
  default:
    Object.assign(dbDialect, { host: config.sequelizeOption.options.host })
    if (config.isProduction) {
      Object.assign(dbDialect, { logging: false })
    }
    db = new Sequelize(config.sequelizeOption.dbname, config.sequelizeOption.username, config.sequelizeOption.password, dbDialect)
}

module.exports = {
  db,
  Sequelize
}
