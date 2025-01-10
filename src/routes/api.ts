import type { FastifyInstance } from 'fastify'
import authPlugin from './auth.js'
import projectPlugin from './project.js'
import userPlugin from './user.js'

async function apiPlugin(server: FastifyInstance) {
  server.register(authPlugin)
  server.register(userPlugin)
  server.register(projectPlugin)
}

export default apiPlugin
