import axios from 'axios'
import React, { createContext, useState } from 'react'

export interface OauthUserData {
  email: string
  name: string
}

interface AuthCtx {
  isLoggedIn: boolean
  user: OauthUserData | undefined
  reloadAuth: () => void
}

const AuthContext = createContext<AuthCtx | undefined>(undefined)

function AuthProvider({ children, initialIsLoggedIn, initialUser }: { children: any, initialIsLoggedIn: boolean, initialUser?: OauthUserData }) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(initialIsLoggedIn)

  const [user, setUser] = useState<OauthUserData | undefined>(initialUser)

  const reloadAuth = async () => {
    // query auth to check cookie
    const res = await axios.get('http://localhost:8080/api/check-auth')
    if (!res.data) {
      setIsLoggedIn(false)
      setUser(undefined)
    }
    else {
      // fetch user details from database
      setIsLoggedIn(true)
      setUser(res.data.data)
      console.log(res.data.data)
    }
  }

  // await reloadAuth()

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, reloadAuth }}>
      {children}
    </AuthContext.Provider>
  )
}

export { AuthContext, AuthProvider }
