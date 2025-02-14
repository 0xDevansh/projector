import React from 'react'
import { AuthContext } from '../AuthContext.js'
import NotFound from './NotFound.js'

export default function Profile() {
  const authCtx = React.useContext(AuthContext)
  if (!authCtx?.user?.user) {
    return (
      <NotFound />
    )
  }
}
