import type { TSchema } from '@sinclair/typebox'
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import type { OauthUserData } from '../authHook.js'
import { env } from 'node:process'
import { Type } from '@sinclair/typebox'
import axios from 'axios'
import { JWT } from 'node-jsonwebtoken'
import { addLoginLog, addLogoutLog, getUser } from '../database.js'
import { ExtendedUserType } from './user.js'

// This file holds the routes: /api/oauth-callback, /api/check-auth, /api/logout

interface CallbackQuery {
  code: string
  state: string
}

export function Nullable(type: TSchema) {
  return Type.Union([type, Type.Null()])
}

export function ResponseType(type: TSchema) {
  return Type.Object({
    error: Nullable(Type.String()),
    data: Nullable(type),
  })
}

export default async (server: FastifyInstance) => {
  server.get('/api/oauth-callback', {
    schema: {
      queryString: Type.Object({
        code: Type.String(),
        state: Type.String(),
      }),
      response: {
        default: ResponseType(Type.String()),
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    if (!env.JWT_SECRET) {
      throw new Error('JWT secret not found in env')
    }
    const jwtUser = new JWT<OauthUserData>(env.JWT_SECRET)
    const { code, state } = request.query as CallbackQuery
    if (!code || !state) {
      reply.code(400).send({ error: 'code or state is missing' })
    }

    const client_id = env.CLIENT_ID
    const client_secret = env.CLIENT_SECRET
    const grant_type = 'authorization_code'

    // Ensure environment variables are set
    if (!client_id || !client_secret || !env.JWT_SECRET) {
      console.error('Client ID or Client secret or JWT secret not configured.')
      return reply.code(500).send({ error: 'internal server error', data: null })
    }

    try {
      // Make a request to auth server to verify the auth_code and request for resources with the available grant type
      const url = 'https://iitdoauth.vercel.app/api/auth/resource'
      const response = await axios.post(url, {
        client_id,
        client_secret,
        auth_code: code,
        state,
        grant_type,
      })
      console.log(response.data)
      if (response.status === 200) {
        // sign the user with JWT and set the cookie
        const token = await jwtUser.sign({
          email: response.data.user.email,
          name: response.data.user.name,
        }, {
          expiresIn: 60 * 60 * 24,
        })
        reply.cookie('token', token)

        // add analytics log
        const kerberos = response.data.user.email.split('@')[0]
        const user = await getUser(kerberos)
        // if user not already in db, it must be a student
        await addLoginLog(kerberos, user ? user.type : 'student')
        reply.redirect('/app', 302)
      }
    }
    catch (err: any) {
      console.error('Error during OAuth callback!')
      console.error(err)
      return reply.code(500).send({ error: 'Internal Server Error.', data: null })
    }
  })

  server.get('/api/check-auth', {
    schema: {
      response: {
        default: ResponseType(ExtendedUserType),
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    reply.code(200).send({ error: null, data: request.extendedUser })
  })

  server.get('/api/logout', async (request: FastifyRequest, reply: FastifyReply) => {
    // set cookie token with expiry date of now
    reply.cookie('token', '', { expires: new Date() })

    // add analytics log
    if (request.extendedUser?.user) {
      await addLogoutLog(request.extendedUser.user.kerberos, request.extendedUser.type)
    }
    reply.redirect('/app')
  })
}
