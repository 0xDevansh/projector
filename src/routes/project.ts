import type { Static } from '@sinclair/typebox'
import type { FastifyInstance, FastifyRequest } from 'fastify'
import type { Project } from '../models/ProfessorProject.js'
import type { ProjectTSType } from '../types.js'
import { Type } from '@sinclair/typebox'
import {
  addOrUpdateApplication,
  addProject,
  getApplications,
  getProjectById,
  getProjects,
  updateProject,
} from '../database.js'
import { PartialDeep, ProjectFilterType, ProjectTypebox } from '../types.js'

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
    await reply.code(200).send({ error: null, data: project })
  })

  server.put('/api/project/:id', {
    schema: {
      params: Type.Object({
        id: Type.String({ minLength: 1 }),
      }),
      body: Type.Partial(ProjectTypebox),
    },
  }, async (request: FastifyRequest<{ Params: { id: string }, Body: Partial<Project> }>, reply) => {
    if (!request.params.id) {
      await reply.code(400).send({ data: null, error: 'id not found' })
      return
    }
    // prof must be same
    const project = await getProjectById(request.params.id)
    if (!project) {
      await reply.code(400).send({ data: null, error: 'project not found' })
      return
    }
    if (request.extendedUser?.type !== 'prof' || request.extendedUser.user?.kerberos !== project.profKerberos) {
      await reply.code(403).send({ error: 'Forbidden', data: null })
      return
    }
    await updateProject(request.params.id, request.body)
    await reply.code(200).send({ error: null, data: 'updated' })
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

  server.post('/api/project/:id/applications', {
    schema: {
      params: Type.Object({
        id: Type.String({ minLength: 1 }),
      }),
      body: Type.Object({
        statementOfPurpose: Type.String(),
        relevantSkills: Type.String(),
      }),
    },
  }, async (request: FastifyRequest<{ Params: { id: string }, Body: { relevantSkills: string, statementOfPurpose: string } }>, reply) => {
    // runs only when user is a student
    if (!request.params.id) {
      await reply.code(400).send({ data: null, error: 'id not found' })
      return
    }
    const kerberos = request.extendedUser?.type === 'student' ? request.extendedUser.student?.kerberos : undefined
    if (!kerberos) {
      await reply.code(403).send({ error: 'Forbidden', data: null })
      return
    }
    // should not have an existing application
    const application = await getApplications(request.params.id, kerberos)
    if (application.length) {
      await reply.code(400).send({ error: 'Already applied', data: null })
    }

    await addOrUpdateApplication({ projectId: request.params.id, studentKerberos: kerberos, ...request.body })
  })

  server.get('/api/project/:id/applications', {
    schema: {
      params: Type.Object({
        id: Type.String({ minLength: 1 }),
      }),
    },
  }, async (request: FastifyRequest<{ Params: { id: string } }>, reply) => {
    // fetches all applications if prof, else only the student's application
    if (!request.params.id) {
      await reply.code(400).send({ data: null, error: 'id not found' })
      return
    }
    if (!request.extendedUser) {
      await reply.code(403).send({ error: 'Forbidden', data: null })
      return
    }
    if (request.extendedUser.type === 'prof') {
      const applications = await getApplications(request.params.id)
      await reply.code(200).send({ error: null, data: applications })
    }
    else if (request.extendedUser.type === 'student') {
      const applications = await getApplications(request.params.id, request.extendedUser.user.kerberos)
      await reply.code(200).send({ error: null, data: applications })
    }
  })
}

export default projectPlugin
