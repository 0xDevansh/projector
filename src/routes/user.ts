import type { FastifyInstance, FastifyRequest } from 'fastify'
import type { DegreeCode } from '../types.js'
import { dirname, resolve } from 'node:path'
import { env } from 'node:process'
import { fileURLToPath } from 'node:url'
import { Type } from '@sinclair/typebox'
import multer from 'fastify-multer'
import {
  addOrUpdateProf,
  addOrUpdateStudent,
  createOrUpdateUser,
  getExtendedUserByKerberos,
  getStudent,
  updateResumePath,
} from '../database.js'
import { Nullable, ResponseType } from './auth.js'

// handles routes /api/user/ and other stuff

// file uploads handler
const storage = multer.diskStorage({
  filename(req, file, callback) {
    callback(null, `${req.extendedUser?.user?.kerberos}_${Date.now()}.pdf`)
  },
  destination: resolve(dirname(fileURLToPath(import.meta.url)), '../../static/resume'),
})
const uploadConfig = multer({
  storage,
  limits: {
    parts: 1,
    fileSize: 1024 * 1024 * 2, // 2mb
  },
  fileFilter: (req, file, callback) => {
    // user must be logged in
    if (!req.extendedUser?.user) {
      callback(null, false)
    }
    else if (file.mimetype !== 'application/pdf') {
      callback(null, false)
    }
    else {
      callback(null, true)
    }
  },
})

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
  yearOfStudy: Type.Integer(),

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

  server.post('/api/support-message', {
    schema: {
      body: Type.Object({
        message: Type.String(),
        type: Type.String(),
      }),
      response: {
        default: ResponseType(Type.Null()),
      },
    },
  }, async (request: FastifyRequest<{ Body: { message: string, type: string } }>, reply) => {
    const { message, type } = request.body
    if (!message || !type) {
      return reply.code(400).send({ data: null, error: 'Body required' })
    }
    if (!request.extendedUser?.user) {
      return reply.code(401).send({ data: null, error: 'Unauthorized' })
    }
    const user = request.extendedUser.user
    let subject = `🐞 Bug report from ${user.kerberos}`
    if (type === 'feature')
      subject = `🌟 Feature request from ${user.kerberos}`
    if (type === 'other')
      subject = `❓ Query from ${user.kerberos}`

    await request.mailTransporter.sendMail({
      from: `"${env.EMAIL_NAME}" <${env.EMAIL_ID}>`,
      to: env.EMAIL_DESTINATION,
      subject,
      text: `Query type: ${type}\nName: ${user.name}\nUser type: ${user.type}\nEmail: ${user.email}\n\n${message}`,
    })
    await reply.code(200).send({ error: null, data: null })
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
        yearOfStudy: Type.String(),
      }),
      response: {
        default: ResponseType(Type.Null()),
      },
    },
  }, async (request: FastifyRequest<{ Body: { name: string, kerberos: string, yearOfStudy: number, department: string, bio?: string, degree: DegreeCode, cgpa: string, resumePath?: string } }>, reply) => {
    // create student
    const { kerberos, department, bio, degree, cgpa, resumePath, name, yearOfStudy } = request.body
    await addOrUpdateStudent(kerberos, degree, cgpa, yearOfStudy, bio, resumePath)
    await createOrUpdateUser({ deptCode: department, email: `${kerberos}@iitd.ac.in`, type: 'student', name })
    await reply.code(200).send({ error: null, data: null })
  })

  server.post('/api/user/prof', {
    schema: {
      body: Type.Object({
        kerberos: Type.String(),
        areasOfResearch: Type.Optional(Type.String()),
      }),
      response: {
        default: ResponseType(Type.Null()),
      },
    },
  }, async (request: FastifyRequest<{ Body: { kerberos: string, areasOfResearch?: string } }>, reply) => {
    // upsert prof
    const { kerberos, areasOfResearch } = request.body
    await addOrUpdateProf({ kerberos, areasOfResearch })
    await reply.code(200).send({ error: null, data: null })
  })

  server.post('/api/user/resume', {
    preHandler: uploadConfig.single('resume'),
  }, async (request, reply) => {
    if (!request.extendedUser?.user) {
      await reply.code(403).send({ error: 'Forbidden', data: null })
      return
    }
    // @ts-expect-error TS says file.filename doesn't exist but it works when compiled
    await updateResumePath(request.extendedUser.user.kerberos, request.file.filename)
    await reply.code(200).send({ error: null, data: null })
  })

  server.get('/api/user/:kerberos/resume', {
    schema: {
      params: Type.Object({
        kerberos: Type.String({ minLength: 1 }),
      }),
    },
  }, async (request: FastifyRequest<{ Params: { kerberos: string } }>, reply) => {
    // accessible only by prof
    if (!request.extendedUser || request.extendedUser.type !== 'prof') {
      await reply.code(403).send({ error: 'Forbidden', data: null })
      return
    }
    // fetch user
    if (!request.params.kerberos) {
      await reply.code(400).send({ data: null, error: 'kerberos not found' })
      return
    }
    const student = await getStudent(request.params.kerberos)
    if (!student) {
      await reply.code(400).send({ data: null, error: 'student not found' })
      return
    }
    if (!student.resumePath) {
      await reply.code(400).send({ data: null, error: 'resume not found' })
      return
    }
    await reply.redirect(`/static/resume/${student.resumePath}`, 302)
  })
}

export default userPlugin
