import { CircleUserRoundIcon } from 'lucide-react'
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
    <header className="flex flex-col md:flex-row justify-around px-4 md:px-8 py-2 bg-gray-50 drop-shadow-md items-center space-y-2 sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <h1 className="lexend font-bold h4 md:h2 text-indigo-700"><Link to="/app">Projects Portal</Link></h1>
      <div className="space-x-8 text-md md:text-lg flex justify-between items-center text-gray-700">
        <NavLink to="/app/about" className="font-semibold hover:underline">About</NavLink>
        <NavLink to="/app/projects" className="font-semibold hover:underline">Projects</NavLink>
        { authCtx?.isLoggedIn
          ? (
              // Profile page
              <div>
                <Link to="/app/profile">
                  <CircleUserRoundIcon />
                </Link>
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
