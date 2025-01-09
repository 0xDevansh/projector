import React, { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { AuthContext } from '../AuthContext.js'
import StudentOnboardingForm from '../components/StudentOnboardingForm.js'
import ProfOnboardingForm from '../components/ui/ProfOnboardingForm.js'

export default function Onboarding() {
  // redirect to home if user already exists
  const navigate = useNavigate()

  const authCtx = React.useContext(AuthContext)
  const studentExists = !!(authCtx?.user?.type === 'student' && authCtx?.user?.student)
  const profExists = !!(authCtx?.user?.type === 'prof' && authCtx?.user?.prof)

  useEffect(() => {
    if (studentExists || profExists || !authCtx?.isLoggedIn) {
      navigate('/app')
    }
  })
  // else render a form to fill student or prof details based on user.type
  return (
    <div className="onboarding p-10">
      <title>Onboarding - Projects Portal</title>
      <h1 className="text-2xl">Please enter your details</h1>
      {authCtx?.user?.type === 'student'
        ? <StudentOnboardingForm />
        : <ProfOnboardingForm />}
    </div>
  )
}
