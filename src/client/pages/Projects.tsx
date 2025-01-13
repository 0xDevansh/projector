import type { ProjectTSType } from '../../types.js'
import axios from 'axios'
import React from 'react'
import useSWR from 'swr'
import ProjectCard from '../components/ProjectCard.js'

const fetcher = (url: string) => axios.get(url).then(res => res.data)

export default function Projects() {
  const { data, error, isLoading } = useSWR(`/api/projects`, fetcher)
  if (isLoading) {
    return <h1 className="text-lg">Loading...</h1>
  }
  else if (error || !data?.data) {
    return <h1 className="text-lg">There was an error loading this project</h1>
  }
  else {
    const projects = data.data
    return (
      <div className="projects items-stretch">
        {projects.map((proj: ProjectTSType) => <ProjectCard project={proj} key={proj.id} />)}
      </div>
    )
  }
}
