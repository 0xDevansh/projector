import type { JsonSchemaToTsProvider } from '@fastify/type-provider-json-schema-to-ts'
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import type { IncomingMessage, Server, ServerResponse } from 'node:http'
import { resolve } from 'node:path'
import { argv, env, exit } from 'node:process'
import helmet from '@fastify/helmet'
import FastifyVite from '@fastify/vite'
import { config } from 'dotenv'
import { fastify } from 'fastify'

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

server.get('/app', (req, reply) => {
  return reply.html()
})

server.get('/api', {
  schema: {
    response: {
      default: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
            default: null,
          },
          data: {
            type: 'string',
            default: null,
          },
        },
      },
    },
  },
}, (request: FastifyRequest, reply: FastifyReply) => {
  reply.code(200).send({ data: 'Hello World!', error: null })
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
