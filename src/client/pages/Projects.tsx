import React, { useContext } from 'react'
import { AuthContext } from '../AuthContext.js'
import ProfProjects from '../components/ProfProjects.js'
import StudentProjects from '../components/StudentProjects.js'

export default function Projects() {
  const authCtx = useContext(AuthContext)

  if (authCtx?.user?.type === 'student') {
    return (
      <div className="projects">
        <title>Projects - Projects Portal</title>
        <StudentProjects />
      </div>
    )
  }
  return (
    <div className="projects">
      <title>Projects - Projects Portal</title>
      <ProfProjects />
    </div>
  )
}
