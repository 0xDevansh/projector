import type { FastifyInstance, FastifyRequest } from 'fastify'
import { Type } from '@sinclair/typebox'
import { getProjectById, getUser } from '../database.js'

async function projectPlugin(server: FastifyInstance) {
  server.get('/api/project/:id', {
    schema: {
      params: Type.Object({
        id: Type.String({ minLength: 1 }),
      }),
    },
  }, async (request: FastifyRequest<{ Params: { id: string } }>, reply) => {
    // fetch project
    if (!request.params.id) {
      await reply.code(400).send({ data: null, error: 'id not found' })
      return
    }
    const project = await getProjectById(request.params.id)
    if (!project)
      return await reply.code(400).send({ data: null, error: null })
    const profUser = await getUser(project.profKerberos)
    await reply.code(200).send({ error: null, data: { ...project, profUser } })
  })
}

export default projectPlugin
