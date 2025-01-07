import React, { useContext } from 'react'
import { NavLink } from 'react-router'
import { AuthContext } from '../AuthContext.js'

export function Header() {
  const login = useContext(AuthContext)

  return (
    <header className="flex flex-row justify-around px-8 py-4">
      <h1 className="text-xl font-bold">The Projector</h1>
      <div className="space-x-8">
        <NavLink to="/app">Home</NavLink>
        <NavLink to="/app/about">About</NavLink>
        { login?.isLoggedIn
          ? <a href="/api/logout">Logout</a>
          : <NavLink to="/app/login">Login</NavLink>}
      </div>
    </header>
  )
}
