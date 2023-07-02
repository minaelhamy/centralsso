'use strict'

require('make-promises-safe')
const { readFileSync } = require('fs')
const path = require('path')
const config = require('./config.js')
const cluster = require('cluster')
const numCPUs = require('os').cpus().length
const redis = require('redis')
const htmlMinifier = require('html-minifier-terser')
const server = require('fastify')({
  logger: config.logger,
  maxParamLength: config.maxParamLength
})

const App = async () => {
  // Plugins

  // Cacheman
  server.register(require('fastify-cacheman'), {
    namespace: config.cache.namespace,
    engine: config.cache.engine,
    client: (config.cache.engine === 'redis' ? redis.createClient(config.cache.redisConn) : '')
  })

  // Html Cache
  server.register(require('./plugins/fastify-html-cache'))

  // Data Routes
  server.register(require('./plugins/fastify-data-routes'))

  // Auth
  server.register(require('@fastify/auth'))
  server.register(require('./plugins/fastify-auth-condition'))

  // JWT
  server.register(require('@fastify/jwt'), {
    secret: {
      private: readFileSync(`${path.join(__dirname)}/private.key`, 'utf8'),
      public: readFileSync(`${path.join(__dirname)}/public.key`, 'utf8')
    },
    sign: {
      algorithm: config.jwtAlgorithm,
      expiresIn: config.jwtExpiresIn
    }
  })

  // Cors
  server.register(require('@fastify/cors'), {
    origin: '*',
    methods: 'GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS',
    allowedHeaders: 'Content-Type, Authorization, X-Requested-With, Etag, X-Token'
  })

  // Template Engine
  server.register(require('@fastify/view'), {
    engine: {
      eta: require('eta')
    },
    root: path.join(__dirname, 'views', config.templateDir),
    viewExt: 'html',
    options: {
      production: config.isProduction,
      useHtmlMinifier: htmlMinifier,
      htmlMinifierOptions: (config.useHTMLMinifier ? config.minifierOptions : {})
    }
  })

  // Set everything inside public directory is static file
  server.register(require('@fastify/static'), {
    root: path.join(__dirname, 'public'),
    prefix: '/',
    maxAge: (config.maxAgeStaticCache * 1000),
    immutable: true,
    decorateReply: false
  })

  // Set maxage cache longer for all files inside assets directory
  server.register(require('@fastify/static'), {
    root: path.join(__dirname, 'public', 'assets'),
    prefix: '/assets/',
    maxAge: (config.maxAgeAssetsCache * 1000),
    immutable: true,
    decorateReply: false
  })

  // Mailer
  server.register(require('fastify-nodemailer'), config.nodeMailerTransport)

  // Custom Not Found Handler
  server.register(require('./routes/notfound.js'))

  // Reply Handler
  server.register(require('./plugins/fastify-reply-handler'))

  // Custom Error Handler
  server.setErrorHandler(async function (error, request, reply) {
    server.log.error(error)
    if (error.validation) {
      return await reply.status(422).send(new Error(error.message))
    }
    return await reply.code(500).send({
      message: 'Whoops, Something went wrong!',
      error: error.message,
      statusCode: 500
    })
  })

  // Register routes
  server.register(require('./routes/api.js'))
  server.register(require('./routes/page.js'))
  server.register(require('./routes/user.js'))
  server.register(require('./routes/auth.js'))
  server.register(require('./routes/oauth.js'))
  server.register(require('./routes/menu.js'))
  server.register(require('./routes/data_faq.js'))
  server.register(require('./routes/data_sso.js'))
  server.register(require('./routes/test.js'))
  server.register(require('./routes/page-internal.js'))
  server.register(require('./routes/verify-recaptcha.js'))

  const start = async () => {
    try {
      await server.listen({ host: config.host, port: config.port })
      console.log('Server is listening on ' + config.host + ':' + config.port)
    } catch (err) {
      server.log.error(err)
      process.exit(1)
    }
  }
  start()
}

if (config.useWorker) {
  if (cluster.isMaster) {
    console.log(`Master ${process.pid} is running`)
    for (let i = 0; i < numCPUs; i++) {
      cluster.fork()
    }
    cluster.on('exit', worker => {
      console.log(`Worker ${worker.process.pid} died`)
    })
  } else {
    App()
  }
} else {
  App()
}
