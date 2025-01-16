import type { Static } from '@sinclair/typebox'
import type { FastifyInstance, FastifyRequest } from 'fastify'
import type { ProjectTSType } from '../types.js'
import { Type } from '@sinclair/typebox'
import { addProject, getProjectById, getProjects, getUser } from '../database.js'
import { PartialDeep, ProjectFilterType, ProjectTypebox } from '../types.js'
import { ResponseType } from './auth.js'

type CreateProject = Omit<ProjectTSType, 'id' | 'createdAt'>

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

  server.post('/api/project', {
    schema: {
      body: Type.Omit(ProjectTypebox, ['id', 'createdAt']),
    },
  }, async (request: FastifyRequest<{ Body: CreateProject }>, reply) => {
    try {
      // runs only when profKerberos = self kerberos
      if (request.extendedUser?.type !== 'prof' || request.body.profKerberos !== request.extendedUser?.user.kerberos) {
        await reply.code(403).send({ error: 'Forbidden', data: null })
        return
      }
      const id = await addProject(request.body)
      await reply.code(200).send({ error: null, data: id })
    }
    catch (err: any) {
      await reply.code(500).send({ error: err.message, data: null })
    }
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

  server.get('/api/my-projects', {
    schema: {
      querystring: PartialDeep(ProjectFilterType),
    },
  }, async (request: FastifyRequest<{ Querystring: Partial<Static<typeof ProjectFilterType>> }>, reply) => {
    // runs only when user is a prof
    const kerberos = request.extendedUser?.type === 'prof' ? request.extendedUser.prof?.kerberos : undefined
    if (!kerberos) {
      await reply.code(403).send({ error: 'Forbidden', data: null })
      return
    }
    const projects = await getProjects({ profKerberos: kerberos }, true)
    await reply.code(200).send({ error: null, data: projects })
  })
}

export default projectPlugin
