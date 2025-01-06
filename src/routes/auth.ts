import { FastifyInstance, type FastifyReply, type FastifyRequest } from 'fastify';
import { TSchema, Type } from '@sinclair/typebox';
import { env } from 'node:process'
import { JWT } from 'node-jsonwebtoken'
import axios from 'axios'
import { OauthUserData } from '../client/AuthContext.js';

// This file holds the routes: /api/oauth-callback, /api/check-auth, /api/logout

type CallbackQuery  = {
  code: string,
  state: string,
}

export const Nullable = (type: TSchema) => {
  return Type.Union([type, Type.Null()])
}

export const ResponseType = (type: TSchema) => {
  return Type.Object({
    error: NullableString,
    data: Type.Union([ Type.Null(), type ])
  })
}

export const NullableString = Type.Union([Type.Null(), Type.String()])

export default async (server: FastifyInstance) => {
  server.get('/api/oauth-callback',
    {
      schema: {
        queryString: Type.Object({
          code: Type.String(),
          state: Type.String(),
        }),
        response: {
          default: Type.Object({
            data: Type.Optional(Type.String()),
            error: NullableString,
          }),
        },
      },
    },
  async (request: FastifyRequest, reply: FastifyReply) => {
    if (!env.JWT_SECRET) {
      throw new Error('JWT secret not found in env')
    }
    const jwtUser = new JWT<OauthUserData>(env.JWT_SECRET)
      const { code, state } = request.query as CallbackQuery
    if (!code || !state) {
        reply.code(400).send({ error: 'code or state is missing' })
    }

    const client_id = env.CLIENT_ID;
    const client_secret = env.CLIENT_SECRET;
    const grant_type = "authorization_code";

    // Ensure environment variables are set
    if (!client_id || !client_secret || !env.JWT_SECRET || !env.JWT_EXPIRES) {
      console.error("Client ID or Client secret or JWT secret not configured.");
      return reply.code(500).send({ error: 'internal server error' });
    }

    try {
      // Make a request to auth server to verify the auth_code and request for resources with the available grant type
      const response = await axios.post("https://iitdoauth.vercel.app/api/auth/resource", {
        client_id,
        client_secret,
        auth_code: code,
        state,
        grant_type,
      })

      if (response.status === 200) {
        const token = await jwtUser.sign({
          email: response.data.user.email,
          name: response.data.user.name,
        }, {
          expiresIn: env.JWT_EXPIRES,
        })

        reply.cookie('token', token)
        reply.redirect('/app', 302)
      }
    } catch (err: any) {
      server.log.error("Error during OAuth callback:", err.message || err);
      return reply.code(500).send({ error: "Internal Server Error." });
    }

  })

  server.get('/api/check-auth', {
    schema: {
      response: {
        default: Type.Object({
          data: Type.Union([Type.Null(), Type.Object({
            email: Type.String(),
            name: Type.String(),
          })]),
          error: NullableString,
        }),
      },
    },
  }, async(request: FastifyRequest, reply: FastifyReply) => {
    if (!env.JWT_SECRET) {
      throw new Error('JWT secret not found in env')
    }
    const jwtUser = new JWT<OauthUserData>(env.JWT_SECRET)
      try {
    if (!request.cookies.token) {
      throw new Error('no cookie!')
    }
      // get data from token
      let data = await jwtUser.verify(request.cookies.token)
        console.log(data)
        reply.code(200).send({ error: null, data })
      } catch (err) {
        reply.code(200).send({ error: 'user not found', data: null });
      }

  })

  server.get('/api/logout', async(request: FastifyRequest, reply: FastifyReply) => {
    // set cookie token with expiry date of now
    reply.cookie('token', '', { expires: new Date() })
    reply.redirect('/app')
  })
};