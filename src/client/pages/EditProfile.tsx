import React, { useContext, useEffect } from 'react'
import { AuthContext } from '../AuthContext.js'
import StudentOnboardingForm from '../components/StudentOnboardingForm.js'
import { loginLink } from '../layouts/Header.js'
import NotFound from './NotFound.js'

export default function EditProfile() {
  const authCtx = useContext(AuthContext)
  useEffect(() => {
    if (!authCtx?.user?.user) {
      window.location.href = loginLink
    }
  }, [])

  if (authCtx?.user?.type !== 'student' || !authCtx.user.student) {
    return <NotFound />
  }
  return <StudentOnboardingForm formAction="edit" student={authCtx.user.student} deptCode={authCtx.user.user.deptCode} />
}
