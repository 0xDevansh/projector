import type { FastifyInstance, FastifyRequest } from 'fastify'
import { Type } from '@sinclair/typebox'
import { getExtendedUserByKerberos } from '../database.js'
import { Nullable, ResponseType } from './auth.js'

// handles routes /api/user/:noun
// user noun is the part before @ in email
const UserType = Type.Object({
  email: Type.String(),
  name: Type.String(),
})
const StudentType = Type.Object({
  kerberos: Type.String(),
  bio: Type.String(),
  degree: Type.String(),
  cgpa: Type.String(),
  resumePath: Type.String(),
})
const ProfType = Type.Object({
  kerberos: Type.String(),
  areasOfResearch: Type.String(),
})

const ExtendedUserType = Type.Object({
  user: UserType,
  student: Type.Optional(StudentType),
  prof: Type.Optional(ProfType),
})

// making this a post req to disallow accessing from the browser
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
      await reply.code(400).send({ data: null, error: 'noun not found' })
      return
    }
    const user = await getExtendedUserByKerberos(request.params.kerberos)
    if (!user)
      await reply.code(400).send({ data: null, error: 'noun not found' })
    else await reply.code(200).send({ error: null, data: user })
  })

  server.post('/api/user', {
    schema: {
      body: Type.Object({
        kerberos: Type.String({ minLength: 1 }),
      }),
      response: {
        default: ResponseType(Nullable(ExtendedUserType)),
      },
    },
  }, async (request: FastifyRequest<{ Params: { kerberos: string } }>, reply) => {
    // fetch user
    if (!request.params.kerberos) {
      await reply.code(400).send({ data: null, error: 'noun not found' })
      return
    }
    const user = await getExtendedUserByKerberos(request.params.kerberos)
    if (!user)
      await reply.code(400).send({ data: null, error: 'noun not found' })
    else await reply.code(200).send({ error: null, data: user })
  })
}

export default userPlugin
