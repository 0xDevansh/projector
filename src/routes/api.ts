import { FastifyInstance, type FastifyReply, type FastifyRequest } from 'fastify';

const api = async (server: FastifyInstance) => {
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
}

export default api