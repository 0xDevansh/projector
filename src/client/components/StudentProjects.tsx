import type { Application } from '../../models/Application.js'
import type { Project } from '../../models/ProfessorProject.js'
import React from 'react'
import useSWR from 'swr'
import { NoProjectsFound } from './ProfProjects.js'
import ProjectCard from './ProjectCard.js'

export default function StudentProjects({ isLoggedIn }: { isLoggedIn?: boolean }) {
  const projectsCall = useSWR(`/api/projects`)
  // a hack to keep this hook on the top of the page
  const applicationsCall = useSWR(isLoggedIn ? `/api/applications/mine` : `/api/projects`)

  if (projectsCall.isLoading) {
    return <h1 className="text-lg">Loading...</h1>
  }
  else if (projectsCall.error || !projectsCall.data?.data) {
    return <h1 className="text-lg">There was an error loading the projects...</h1>
  }

  const projects = projectsCall.data.data.filter((p: { lastApplyDate: string }) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const lastApplyDate = new Date(p.lastApplyDate)
    lastApplyDate.setHours(0, 0, 0, 0)
    return lastApplyDate >= today
  }) as Project[]
  projects.sort((a, b) => a.createdAt > b.createdAt ? -1 : 1)

  if (!isLoggedIn) {
    return (
      <div>
        <h2 className="h3 md:h2 md:my-5 font-bold">Open Projects</h2>
        {projects.length === 0 && <NoProjectsFound />}
        <div className="mt-3 mx-2 projects grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <title>Projects - Projects Portal</title>
          {projects.map((proj: Project) => (
            <ProjectCard
              project={proj}
              key={proj.id}
            />
          ))}
        </div>
      </div>

    )
  }

  if (applicationsCall.isLoading) {
    return <h1 className="text-lg">Loading...</h1>
  }
  else if (applicationsCall.error || !applicationsCall.data?.data) {
    return <h1 className="text-lg">There was an error loading the projects...</h1>
  }

  const applications = applicationsCall.data.data as Application[]
  const appliedProjectIds = applications.map(app => app.projectId)
  return (
    <div>
      <h2 className="h2 my-5">Open Projects</h2>
      {projects.length === 0 && <NoProjectsFound />}
      <div className="projects grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <title>Projects - Projects Portal</title>
        {projects.map((proj: Project) => (
          <ProjectCard
            project={proj}
            key={proj.id}
            applied={appliedProjectIds.includes(proj.id)}
            isLoggedIn
          />
        ))}
      </div>
    </div>

  )
}
