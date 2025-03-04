import React, { useContext } from 'react'
import { Link, NavLink } from 'react-router'
import { AuthContext } from '../AuthContext.js'
import { buttonVariants } from '../components/ui/button.js'
import { cn } from '../utils.js'

export const prodLoginLink = 'https://oauthdevclub.vercel.app/signin?client_id=mHuhtM4zb6YlaY9qxEvNpvmEM4w&redirect_uri=https%3A%2F%2Fprojects.apps.iitd.ac.in%2Fapi%2Foauth-callback'
export const devLoginLink = 'https://oauthdevclub.vercel.app/signin?client_id=mHuhtM4zb6YlaY9qxEvNpvmEM4w&redirect_uri=http%3A%2F%2Flocalhost%3A8080%2Fapi%2Foauth-callback'
export const loginLink = window.location.hostname === 'localhost' ? devLoginLink : prodLoginLink

export function Header() {
  const authCtx = useContext(AuthContext)

  return (
    <header className="flex flex-col md:flex-row justify-around px-4 md:px-8 py-2 border-2 bg-gray-50 drop-shadow-md items-center space-y-2">
      <h1 className="lexend font-bold h4 md:h2 text-indigo-700"><Link to="/app">Projects Portal</Link></h1>
      <div className="space-x-8 text-md md:text-lg flex justify-between">
        <NavLink to="/app/about" className="hover-link font-semibold">About</NavLink>
        <NavLink to="/app/projects" className="hover-link font-semibold">Projects</NavLink>
        { authCtx?.isLoggedIn
          ? (
              // Logout button
              <div>
                <a href="/api/logout" className={cn(buttonVariants({ variant: 'destructive' }), 'hidden md:inline')}>Logout</a>
                <a href="/api/logout" className="md:hidden font-semibold text-red-800">Logout</a>
              </div>
            )
          : (
              <div>
                <a href={loginLink} className={cn(buttonVariants({ variant: 'default' }), 'hidden md:inline')}>Login</a>
                <a href={loginLink} className="md:hidden font-semibold text-primary">Login</a>
              </div>
            )}
      </div>
    </header>
  )
}
