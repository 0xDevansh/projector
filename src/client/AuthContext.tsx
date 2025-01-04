import React, { createContext, useState } from 'react';
import axios from 'axios';

export type OauthUserData = {
  email: string
  name: string
}

type AuthCtx = {
  isLoggedIn: boolean,
  user: OauthUserData | undefined,
  reloadAuth: () => void,
}

const AuthContext = createContext<AuthCtx | undefined>(undefined);

const AuthProvider = ({children, initialIsLoggedIn, initialUser}: {children: any, initialIsLoggedIn: boolean, initialUser?: OauthUserData}) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(initialIsLoggedIn)

  const [user, setUser] = useState<OauthUserData|undefined>(initialUser)

  const reloadAuth = async () => {
    // query api to check cookie
    const res = await axios.get('http://localhost:8080/api/check-auth')
    if (!res.data) {
      setIsLoggedIn(false)
      setUser(undefined)
    } else {
      setIsLoggedIn(true)
      setUser(res.data.data)
      console.log(res.data.data);
    }
  }

  // await reloadAuth()

  return <AuthContext.Provider value={{isLoggedIn, user, reloadAuth}}>
    {children}
  </AuthContext.Provider>
}

export { AuthProvider, AuthContext }