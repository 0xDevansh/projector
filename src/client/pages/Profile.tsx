import React, { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { AuthContext } from '../AuthContext.js'

import ProfileComponent from '../components/ProfileComponent.js'

import { loginLink } from '../layouts/Header.js'

export default function Profile() {
  const authCtx = React.useContext(AuthContext)
  const navigate = useNavigate()
  useEffect(() => {
    if (!authCtx?.user?.user) {
      window.location.href = loginLink
    }
  }, [])
  if (!authCtx?.user?.user)
    return <p>User not found</p>

  return <ProfileComponent isSelf user={authCtx.user} />
}
