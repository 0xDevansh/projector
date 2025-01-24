import type { Application } from '../../models/Application.js'
import type { Project } from '../../models/ProfessorProject.js'
import React from 'react'
import useSWR from 'swr'
import ProjectCard from './ProjectCard.js'

export default function StudentProjects() {
  const projectsCall = useSWR(`/api/projects`)
  const applicationsCall = useSWR(`/api/applications/mine`)

  if (projectsCall.isLoading || applicationsCall.isLoading) {
    return <h1 className="text-lg">Loading...</h1>
  }
  else if (projectsCall.error || applicationsCall.error || !projectsCall.data?.data || !applicationsCall.data?.data) {
    return <h1 className="text-lg">There was an error loading the projects...</h1>
  }

  const projects = projectsCall.data.data.filter((p: { lastApplyDate: string }) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const lastApplyDate = new Date(p.lastApplyDate)
    lastApplyDate.setHours(0, 0, 0, 0)
    return lastApplyDate >= today
  }) as Project[]
  projects.sort((a, b) => a.lastApplyDate > b.lastApplyDate ? -1 : 1)

  const applications = applicationsCall.data.data as Application[]
  const appliedProjectIds = applications.map(app => app.projectId)
  return (
    <div>
      <h2 className="h2">Open Projects</h2>
      <div className="projects grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <title>Projects - Projects Portal</title>
        {projects.map((proj: Project) => (
          <ProjectCard
            project={proj}
            key={proj.id}
            applied={appliedProjectIds.includes(proj.id)}
          />
        ))}
        {projects.length === 0 && <h1 className="text-lg">No open projects found</h1>}
      </div>
    </div>

  )

  return (<h1>Hello</h1>)
}
