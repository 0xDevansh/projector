import React from 'react'
import { AuthContext } from '../AuthContext.js'

export function Home() {
  const ctx = React.useContext(AuthContext)
  console.log(ctx)
  return (
    <div className="home">
      <title>Home - Projects Portal</title>
      <h1>Home page</h1>
      <p>
        Is logged in:
        {ctx?.isLoggedIn ? 'Yes' : 'No'}
      </p>
      {ctx?.isLoggedIn
        ? (
            <div className="data">
              <p>
                Name:
                {ctx.user?.user.name}
              </p>
              <p>
                Email:
                {ctx.user?.user.email}
              </p>
            </div>
          )
        : undefined}
    </div>
  )
}
