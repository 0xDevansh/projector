import React from 'react'
import { Link } from 'react-router'
import Projects from '../pages/Projects.js'
import { cn } from '../utils.js'
import { buttonVariants } from './ui/button.js'

export default function ProfHomepage() {
  return (
    <div className="prof-homepage">
      <h1 className="text-lg font-semibold pt-3">Your projects</h1>
      <Link to="/app/projects/create" className={cn(buttonVariants({ variant: 'default' }), 'my-3')}>Add new project</Link>
      <Projects profProjects={true} />
    </div>
  )
}
