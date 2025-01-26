import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import type { IncomingMessage, Server, ServerResponse } from 'node:http'
import type { ExtendedUser } from './types.js'
import { dirname, resolve } from 'node:path'
import { argv, env, exit } from 'node:process'
import { fileURLToPath } from 'node:url'
import cookie from '@fastify/cookie'
import helmet from '@fastify/helmet'
import multipart from '@fastify/multipart'
import fastifyStatic from '@fastify/static'
import FastifyVite from '@fastify/vite'
import { config } from 'dotenv'
import { fastify } from 'fastify'
import { getAuthUser } from './authHook.js'
import { initDatabase } from './database.js'
import apiPlugin from './routes/api.js'
import 'reflect-metadata'
// required for extendedUser
declare module 'fastify' {
  interface FastifyRequest {
    extendedUser: ExtendedUser | null
  }
}

// load env variables
config()

// set up TypeORM
await initDatabase()

const devLogger = {
  transport: {
    target: 'pino-pretty',
    options: {
      translateTime: 'HH:MM:ss Z',
      ignore: 'pid,hostname',
    },
  },
}

// setup server, add middleware
const server: FastifyInstance<Server, IncomingMessage, ServerResponse>
  = fastify({ logger: env.ENV === 'dev' ? devLogger : false }).withTypeProvider<TypeBoxTypeProvider>()

await server.register(multipart)
// await server.register(multer.contentParser)
await server.register(helmet, { global: true, contentSecurityPolicy: false })
await server.register(cookie, {
  secret: env.COOKIE_SECRET,
  parseOptions: {
    httpOnly: true,
  },
})
await server.register(fastifyStatic, {
  root: resolve(dirname(fileURLToPath(import.meta.url)), '../static'),
  prefix: '/static/',
})
server.decorateRequest('extendedUser', null)
server.addHook('preHandler', (request, _reply, done) => {
  // request.extendedUser = await
  getAuthUser(request.cookies.token).then((user) => {
    request.extendedUser = user
    done(undefined)
  })
})
await server.register(FastifyVite, {
  root: resolve(import.meta.dirname, '../'),
  dev: argv.includes('--dev'),
  spa: true,
})

server.setErrorHandler((error, request, reply) => {
  server.log.error(error)
  reply.code(500).send({ error: `internal server error: ${error.message}`, data: null })
})

// all /api routes
await server.register(apiPlugin)

server.get('/app', (request, reply) => {
  return reply.html()
})
server.get('/app/*', (request, reply) => {
  return reply.html()
})

// redirect all other routes to /app
server.get('*', (request: FastifyRequest, reply: FastifyReply) => {
  reply.redirect('/app', 302)
})

await server.vite.ready()

// Run the server!
server.listen({ port: Number.parseInt(env.PORT || '8080'), host: '127.0.0.1' }, (err, _address) => {
  if (err) {
    server.log.error(err)
    exit(1)
  }
  // Server is now listening on ${address}
})
