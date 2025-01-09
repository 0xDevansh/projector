import React from 'react'
import { AuthContext } from '../AuthContext.js'

export function Home() {
  const ctx = React.useContext(AuthContext)
  console.log(ctx)
  return (
    <div className="home p-10">
      <title>Home - Projects Portal</title>
      {ctx?.isLoggedIn
        ? (
            <h1 className="text-lg">
              Welcome back,
              {` ${ctx.user?.type === 'prof' ? 'Prof. ' : ''} ${ctx?.user?.user.name}` || 'Unknown'}
            </h1>
          )
        : <h1 className="text-lg">Please log in</h1>}
    </div>
  )
}
