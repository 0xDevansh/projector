import React from 'react'
import Projects from '../pages/Projects.js'

export default function ProfHomepage() {
  return (
    <div className="prof-homepage">
      <h1 className="text-lg font-semibold pt-3">Your projects</h1>
      <Projects profProjects={true} />
    </div>
  )
}
