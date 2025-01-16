import React, { useContext } from 'react'
import { NavLink } from 'react-router'
import { AuthContext } from '../AuthContext.js'

const loginLink = 'https://oauthdevclub.vercel.app/signin?client_id=mHuhtM4zb6YlaY9qxEvNpvmEM4w&redirect_uri=http%3A%2F%2Flocalhost%3A8080%2Fapi%2Foauth-callback'

export function Header() {
  const authCtx = useContext(AuthContext)

  return (
    <header className="flex flex-row justify-around px-8 py-4">
      <h1 className="text-xl font-bold">The Projector</h1>
      <div className="space-x-8">
        <NavLink to="/app">Home</NavLink>
        <NavLink to="/app/about">About</NavLink>
        <NavLink to="/app/projects">Projects</NavLink>
        { authCtx?.isLoggedIn
          ? <a href="/api/logout">Logout</a>
          : <NavLink to={loginLink}>Login</NavLink>}
      </div>
    </header>
  )
}
