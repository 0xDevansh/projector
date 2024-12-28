import type { JsonSchemaToTsProvider } from '@fastify/type-provider-json-schema-to-ts'
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import type { IncomingMessage, Server, ServerResponse } from 'node:http'
import { env, exit } from 'node:process'
import helmet from '@fastify/helmet'
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

server.register(helmet, { global: true })

server.get('/', {
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

// Run the server!
server.listen({ port: Number.parseInt(env.PORT || '8080') }, (err, _address) => {
  if (err) {
    server.log.error(err)
    exit(1)
  }
  // Server is now listening on ${address}
})
