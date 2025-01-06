import { FastifyInstance } from 'fastify';
import authPlugin from './auth.js'
import userPlugin from './user.js'

const apiPlugin = async (server: FastifyInstance) => {
  server.register(authPlugin)
  server.register(userPlugin)
}

export default apiPlugin