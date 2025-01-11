import type { Static } from '@sinclair/typebox'
import type { FastifyInstance, FastifyRequest } from 'fastify'
import { Type } from '@sinclair/typebox'
import { getProjectById, getProjects, getUser } from '../database.js'
import { PartialDeep, ProjectFilterType, ProjectTypebox } from '../types.js'
import { ResponseType } from './auth.js'

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

  server.get('/api/projects', {
    schema: {
      querystring: PartialDeep(ProjectFilterType),
      response: {
        default: ResponseType(Type.Array(ProjectTypebox)),
      },
    },
  }, async (request: FastifyRequest<{ Querystring: Partial<Static<typeof ProjectFilterType>> }>, reply) => {
    const projects = await getProjects(request.query)
    await reply.code(200).send({ error: null, data: projects })
  })
}

export default projectPlugin
