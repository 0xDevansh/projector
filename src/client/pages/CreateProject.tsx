import React from 'react'
import { AuthContext } from '../AuthContext.js'
import ProjectForm from '../components/ProjectForm.js'
import NotFound from './NotFound.js'

export function CreateProject() {
  const ctx = React.useContext(AuthContext)
  // only accessible by a prof
  if (ctx?.user?.type !== 'prof') {
    return (
      <NotFound />
    )
  }
  return (
    <div className="home">
      <title>Create - Projects Portal</title>
      <h1 className="mt-10 scroll-m-20 pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0 mb-5">Create a new Project</h1>
      <ProjectForm formAction="create" />
    </div>
  )
}
