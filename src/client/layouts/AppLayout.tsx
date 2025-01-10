import React, { useContext, useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router'
import { AuthContext } from '../AuthContext.js'
import { Header } from './Header.js'

export default function AppLayout() {
  const authCtx = useContext(AuthContext)
  const navigate = useNavigate()
  const location = useLocation()
  useEffect(() => {
    console.log('AppLayout useEffect called!')
    // if student or prof is not defined, go to onboarding
    if (!authCtx || !authCtx.isLoggedIn || !authCtx.user) {
      return
    }
    const studentExists = !!(authCtx.user.type === 'student' && authCtx.user.student)
    const profExists = !!(authCtx.user.type === 'prof' && authCtx.user.prof)

    if ((!studentExists && !profExists) && location.pathname !== '/app/onboarding') {
      navigate('/app/onboarding')
    }
  })

  return (
    <div className="app">
      <Header />
      <div className="app-content py-5 px-10">
        <Outlet />
      </div>
    </div>
  )
}
