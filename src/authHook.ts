import { env } from 'node:process'
import { JWT } from 'node-jsonwebtoken'
import { authUserCheck } from './database.js'

export interface OauthUserData {
  name: string
  email: string
}

export async function getAuthUser(token?: string) {
  if (!env.JWT_SECRET) {
    throw new Error('JWT secret not found in env')
  }
  const jwtUser = new JWT<OauthUserData>(env.JWT_SECRET)
  try {
    if (!token) {
      return null
    }
    // get data from token
    const data = await jwtUser.verify(token)
    // get user details
    const extendedUser = await authUserCheck(data.email, data.name)
    return extendedUser || null
  }
  catch (err: any) {
    // don't low jwt error as it spams the logs
    if (err.message !== 'JWT secret not found in env')
      console.error(err)
    return null
  }
}
