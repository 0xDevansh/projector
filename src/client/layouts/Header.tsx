import React, { useContext } from 'react'
import { NavLink } from 'react-router'
import { AuthContext } from '../AuthContext.js'
import { buttonVariants } from '../components/ui/button.js'

export const loginLink = 'https://oauthdevclub.vercel.app/signin?client_id=mHuhtM4zb6YlaY9qxEvNpvmEM4w&redirect_uri=http%3A%2F%2Flocalhost%3A8080%2Fapi%2Foauth-callback'

export function Header() {
  const authCtx = useContext(AuthContext)

  return (
    <header className="flex flex-row justify-around px-8 py-4 border-2 bg-gray-50 drop-shadow-md items-center">
      <h1 className="lexend font-bold h2"><NavLink to="/app">Projects Portal</NavLink></h1>
      <div className="space-x-8 text-lg">
        <NavLink to="/app/about" className="hover-link font-semibold">About</NavLink>
        <NavLink to="/app/projects" className="hover-link font-semibold">Projects</NavLink>
        { authCtx?.isLoggedIn
          ? <a href="/api/logout" className={buttonVariants({ variant: 'destructive' })}>Logout</a>
          : <a href={loginLink} className={buttonVariants({ variant: 'default' })}>Login</a>}
      </div>
    </header>
  )
}
