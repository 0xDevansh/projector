import type { Project } from '../../models/ProfessorProject.js'
import React from 'react'
import useSWR from 'swr'
import ProjectCard from '../components/ProjectCard.js'

export default function Projects({ profProjects }: { profProjects?: boolean }) {
  const { data, error, isLoading } = useSWR(profProjects ? `/api/my-projects` : `/api/projects`)
  if (isLoading) {
    return <h1 className="text-lg">Loading...</h1>
  }
  else if (error || !data?.data) {
    return <h1 className="text-lg">There was an error loading this project</h1>
  }
  else {
    const projects = data.data
    console.log(projects)
    return (
      <div className="projects items-stretch">
        {projects.map((proj: Project) => <ProjectCard project={proj} key={proj.id} />)}
        {projects.length === 0 && <h1 className="text-lg">No open projects found</h1>}
      </div>
    )
  }
}
