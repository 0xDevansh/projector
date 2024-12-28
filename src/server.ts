import type { JsonSchemaToTsProvider } from '@fastify/type-provider-json-schema-to-ts'
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import type { IncomingMessage, Server, ServerResponse } from 'node:http'
import { resolve } from 'node:path'
import { argv, env, exit } from 'node:process'
import helmet from '@fastify/helmet'
import FastifyVite from '@fastify/vite'
import { config } from 'dotenv'
import { fastify } from 'fastify'
import api from './routes/api.js';

// load env variables
config()

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
  = fastify({ logger: env.ENV === 'dev' ? devLogger : true }).withTypeProvider<JsonSchemaToTsProvider>()

await server.register(helmet, { global: true })
await server.register(FastifyVite, {
  root: resolve(import.meta.dirname, '../'),
  dev: argv.includes('--dev'),
  spa: true,
})

// all /api routes
await server.register(api)

server.get('/app', (req, reply) => {
  return reply.html()
})
server.get('/app/*', (req, reply) => {
  return reply.html()
})

// redirect all other routes to /app
server.get('*', (request: FastifyRequest, reply: FastifyReply) => {
  reply.redirect('/app', 302)
})

await server.vite.ready()

// Run the server!
server.listen({ port: Number.parseInt(env.PORT || '8080') }, (err, _address) => {
  if (err) {
    server.log.error(err)
    exit(1)
  }
  // Server is now listening on ${address}
})
