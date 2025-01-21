import type { Project } from '../../models/ProfessorProject.js'
import React from 'react'
import { useParams } from 'react-router'
import useSWR from 'swr'
import { AuthContext } from '../AuthContext.js'
import ProjectForm from '../components/ProjectForm.js'
import NotFound from './NotFound.js'

export function EditProject() {
  const { id } = useParams()
  if (!id) {
    return <NotFound />
  }
  const authCtx = React.useContext(AuthContext)
  // only accessible by a prof
  if (authCtx?.user?.type !== 'prof') {
    return (
      <NotFound />
    )
  }
  const { data, error, isLoading } = useSWR(`/api/project/${id}`)

  if (isLoading) {
    return <h1 className="text-lg">Loading...</h1>
  }
  else if (error || !data?.data) {
    return <NotFound />
  }
  const project = data.data as Project

  return (
    <div className="home p-10">
      <title>Edit - Projects Portal</title>
      <h1 className="mt-10 scroll-m-20 pb-2 text-2xl font-semibold tracking-tight transition-colors first:mt-0">Editing Project</h1>
      <h1 className="font-semibold text-2xl">{project.title}</h1>
      <ProjectForm formAction="edit" project={project} />
    </div>
  )
}
