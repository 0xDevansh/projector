import type { Project } from '../../models/ProfessorProject.js'
import { PlusIcon } from 'lucide-react'
import React, { useContext } from 'react'
import { Link } from 'react-router'
import useSWR from 'swr'
import { AuthContext } from '../AuthContext.js'
import { cn } from '../utils.js'
import ProjectCard from './ProjectCard.js'
import { buttonVariants } from './ui/button.js'

export default function ProfProjects() {
  const projectsCall = useSWR(`/api/projects`)
  const myProjectsCall = useSWR(`/api/my-projects`)
  const authCtx = useContext(AuthContext)

  if (projectsCall.isLoading || myProjectsCall.isLoading) {
    return <h1 className="text-lg">Loading...</h1>
  }
  else if (projectsCall.error || myProjectsCall.error || !projectsCall.data?.data || !myProjectsCall.data?.data) {
    return <h1 className="text-lg">There was an error loading the projects...</h1>
  }
  const projects = projectsCall.data.data as Project[]
  const myProjects = myProjectsCall.data.data as Project[]
  projects.sort((a, b) => a.lastApplyDate > b.lastApplyDate ? -1 : 1)
  myProjects.sort((a, b) => a.lastApplyDate > b.lastApplyDate ? -1 : 1)
  const otherProjects = projects.filter(p => p.profKerberos !== authCtx?.user?.user.kerberos)

  return (
    <div>
      <div className="flex gap-5 lg:gap-10 items-center">
        <h2 className="h3 md:h2">
          Your Projects
        </h2>
        <Link className={cn(buttonVariants({ variant: 'default' }), 'py-0 px-3')} to="/app/projects/create">
          <PlusIcon />
          Add new project
        </Link>

      </div>
      <div className="mx-2 md:mx-7 mt-4">
        <title>Projects - Projects Portal</title>
        {myProjects.length === 0 && <NoProjectsFound />}
        <div className="projects grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {myProjects.map((proj: Project) => (
            <ProjectCard
              project={proj}
              key={proj.id}
              profView
            />
          ))}
        </div>
      </div>
      <h2 className="mb-2 mt-6 h3 md:h2">Other open projects</h2>
      {otherProjects.length === 0 && <NoProjectsFound />}
      <div className="projects grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mx-7">
        {otherProjects.filter(p => p.profKerberos !== authCtx?.user?.user.kerberos).map((proj: Project) => (
          <ProjectCard
            project={proj}
            key={proj.id}
          />
        ))}
      </div>
    </div>

  )
}

export function NoProjectsFound() {
  return (
    <p className="flex justify-center items-center py-10 text-md md:text-lg border-2 border-gray-300 rounded-xl text-muted-foreground mx-7 mt-4">
      No Projects found
    </p>
  )
}
