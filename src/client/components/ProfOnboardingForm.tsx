// Not implementing an actual form rn, will update later if required

import axios from 'axios'
import React, { useContext, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { AuthContext } from '../AuthContext.js'

export default function ProfOnboardingForm() {
  const navigate = useNavigate()
  const authContext = useContext(AuthContext)
  useEffect(() => {
    if (!authContext || !authContext.user) {
      navigate('/app/login')

      return
    }
    // create prof
    axios.post('/api/user/prof', { kerberos: authContext.user.user.kerberos, areasOfResearch: undefined })
      .then(() => authContext.reloadAuth())
      .then(() => navigate('/app'))
  })
  return (<p>Registering professor...</p>)
}
