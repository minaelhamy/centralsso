'use strict'

async function testRoute (server, options) {
//   server.post('/api/test/connection-database', async (request, reply) => {
//     try {
//       await mongooseHandler.connect()
//     } catch (err) {
//       return reply.error(err.message)
//     }
//     await reply.success('Database connected!')
//   })

  server.post('/api/test/cache', async (request, reply) => {
    const { User } = require('../models/user')
    const total = await User.count()
    console.log('total: ' + total)
    let cached = await server.cacheman.get('testcache')
    if (cached === null || cached === undefined) {
      console.log('Saved new data into cache')
      await server.cacheman.set('testcache', { name: 'tester', message: 'hello world', total_user: total }, 120)
      // refresh cached data
      cached = await server.cacheman.get('testcache')
    }
    reply.ok('success', cached)
  })
}

module.exports = testRoute
