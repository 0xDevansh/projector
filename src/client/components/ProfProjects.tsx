import type { Project } from '../../models/ProfessorProject.js'
import React, { useContext } from 'react'
import { Link } from 'react-router'
import useSWR from 'swr'
import { AuthContext } from '../AuthContext.js'
import { cn } from '../utils'
import ProjectCard from './ProjectCard.js'
import { buttonVariants } from './ui/button'

export default function ProfProjects() {
  const { data, isLoading, error } = useSWR(`/api/projects`)
  const authCtx = useContext(AuthContext)

  if (isLoading) {
    return <h1 className="text-lg">Loading...</h1>
  }
  else if (error || !data?.data) {
    return <h1 className="text-lg">There was an error loading the projects...</h1>
  }
  const projects = data.data as Project[]
  projects.sort((a, b) => a.lastApplyDate > b.lastApplyDate ? -1 : 1)
  const myProjects = projects.filter(p => p.profKerberos === authCtx?.user?.user.kerberos)
  const otherProjects = projects.filter(p => p.profKerberos !== authCtx?.user?.user.kerberos)

  console.log(projects)
  return (
    <div>
      <h2 className="h2 my-5">Your Projects</h2>
      <Link className={cn(buttonVariants({ variant: 'default' }), 'py-4')} to="/app/projects/create">Add new project</Link>
      <div className="projects grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <title>Projects - Projects Portal</title>
        {myProjects.map((proj: Project) => (
          <ProjectCard
            project={proj}
            key={proj.id}
            profView
          />
        ))}
        {myProjects.length === 0 && <h1 className="text-lg  mx-5">No projects found</h1>}
      </div>
      <h2 className="h2 mb-2 mt-6">Other open projects</h2>
      <div className="projects grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {otherProjects.filter(p => p.profKerberos !== authCtx?.user?.user.kerberos).map((proj: Project) => (
          <ProjectCard
            project={proj}
            key={proj.id}
          />
        ))}
        {otherProjects.length === 0 && <h1 className="text-lg mx-5">No projects found</h1>}
      </div>
    </div>

  )
}
