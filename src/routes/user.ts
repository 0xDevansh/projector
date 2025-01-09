import type { FastifyInstance, FastifyRequest } from 'fastify'
import type { DegreeCode, DeptCode } from '../types.js'
import { Type } from '@sinclair/typebox'
import { addOrUpdateStudent, createOrUpdateUser, getExtendedUserByKerberos } from '../database.js'
import { Nullable, ResponseType } from './auth.js'

// handles routes /api/user/:kerberos
export const UserType = Type.Object({
  email: Type.String(),
  name: Type.String(),
  kerberos: Type.String(),
  type: Type.String(),
  deptCode: Nullable(Type.String()),
})
export const StudentType = Type.Object({
  kerberos: Type.String(),
  bio: Nullable(Type.String()),
  degree: Type.String(),
  cgpa: Type.String(),
  resumePath: Nullable(Type.String()),
})
export const ProfType = Type.Object({
  kerberos: Type.String(),
  areasOfResearch: Nullable(Type.String()),
})

export const ExtendedUserType = Type.Object({
  user: UserType,
  type: Type.String(),
  student: Type.Optional(StudentType),
  prof: Type.Optional(ProfType),
})

async function userPlugin(server: FastifyInstance) {
  server.get('/api/user/:kerberos', {
    schema: {
      params: Type.Object({
        kerberos: Type.String({ minLength: 1 }),
      }),
      response: {
        default: ResponseType(Nullable(ExtendedUserType)),
      },
    },
  }, async (request: FastifyRequest<{ Params: { kerberos: string } }>, reply) => {
    // fetch user
    if (!request.params.kerberos) {
      await reply.code(400).send({ data: null, error: 'kerberos not found' })
      return
    }
    const user = await getExtendedUserByKerberos(request.params.kerberos)
    if (!user)
      await reply.code(400).send({ data: null, error: 'user not found' })
    else await reply.code(200).send({ error: null, data: user })
  })

  server.post('/api/user/student', {
    schema: {
      body: Type.Object({
        kerberos: Type.String(),
        department: Type.String(),
        bio: Type.Optional(Type.String()),
        degree: Type.String(),
        cgpa: Type.String(),
        resumePath: Type.Optional(Type.String()),
        name: Type.String(),
      }),
      response: {
        default: ResponseType(Type.Null()),
      },
    },
  }, async (request: FastifyRequest<{ Body: { name: string, kerberos: string, department: DeptCode, bio?: string, degree: DegreeCode, cgpa: string, resumePath?: string } }>, reply) => {
    // create student
    const { kerberos, department, bio, degree, cgpa, resumePath, name } = request.body
    console.log('=========================', request.body)
    await addOrUpdateStudent(kerberos, degree, cgpa, bio, resumePath)
    await createOrUpdateUser({ deptCode: department, email: `${kerberos}@iitd.ac.in`, type: 'student', name })
    await reply.code(200).send({ error: null, data: null })
  })
}

export default userPlugin
