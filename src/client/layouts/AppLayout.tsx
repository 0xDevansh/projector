import React, { useContext, useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router'
import { AuthContext } from '../AuthContext.js'
import { Toaster } from '../components/ui/toaster.js'
import { useToast } from '../hooks/use-toast.js'
import { Header } from './Header.js'

export default function AppLayout() {
  const authCtx = useContext(AuthContext)
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()
  useEffect(() => {
    // if student or prof is not defined, go to onboarding
    if (!authCtx || !authCtx.isLoggedIn || !authCtx.user) {
      return
    }
    const studentExists = !!(authCtx.user.type === 'student' && authCtx.user.student)
    const profExists = !!(authCtx.user.type === 'prof' && authCtx.user.prof)

    if ((!studentExists && !profExists) && location.pathname !== '/app/onboarding') {
      navigate('/app/onboarding')
    }
    // perform a custom action
    if (location.state?.action) {
      switch (location.state.action) {
        case 'clearStorage':
          localStorage.clear()
          location.state.action = undefined
          break
      }
      location.state.action = undefined
    }
    // show a toast
    if (location.state?.toast?.code) {
      switch (location.state.toast.code) {
        case 'projectCreated':
          toast({ title: 'Project created successfully!' })
          break
        case 'projectUpdated':
          toast({ title: 'Project updated successfully!' })
          break
        case 'madePublic':
          toast({ title: 'Made project public' })
          break
        case 'projectClosed':
          toast({ title: 'Closed the project' })
          break
      }
      location.state.toast = undefined
    }
  })

  return (
    <div className="app">
      <Header />
      <div className="app-content py-5 px-10">
        <Outlet />
        <Toaster />
      </div>
    </div>
  )
}
