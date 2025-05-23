import type { Project } from '../../models/ProfessorProject.js'
import { PlusIcon } from 'lucide-react'
import React, { useContext, useState, useEffect } from 'react'
import { Link } from 'react-router'
import useSWR from 'swr'
import {
  degreeName,
  deptData,
  projectType,
  projectDuration,
} from '../../types.js'
import { AuthContext } from '../AuthContext.js'
import { cn } from '../utils.js'
import ProjectCard from './ProjectCard.js'
import { Button, buttonVariants } from './ui/button.js'
import { Checkbox } from './ui/checkbox.js'
import { Input } from './ui/input.js'
import { Label } from './ui/label.js'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select.js'

export default function ProfProjects() {
  const authCtx = useContext(AuthContext)

  const [selectedProjectType, setSelectedProjectType] = useState<string>('')
  const [selectedDuration, setSelectedDuration] = useState<string>('')
  const [selectedDegrees, setSelectedDegrees] = useState<string[]>([])
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([])
  const [stipendProvidedChecked, setStipendProvidedChecked] = useState<boolean>(false)
  const [minYearValue, setMinYearValue] = useState<string>('')
  const [applyDateNotPassedChecked, setApplyDateNotPassedChecked] = useState<boolean>(true) // Default to true

  const [queryString, setQueryString] = useState<string>('')

  const constructQueryString = () => {
    const params = new URLSearchParams()
    if (selectedProjectType)
      params.append('projectType', selectedProjectType)
    if (selectedDuration)
      params.append('duration', selectedDuration)
    if (selectedDegrees.length > 0)
      params.append('eligibleDegrees', selectedDegrees.join(','))
    if (selectedDepartments.length > 0)
      params.append('eligibleDepartments', selectedDepartments.join(','))
    if (stipendProvidedChecked)
      params.append('stipendProvided', 'true')
    if (minYearValue)
      params.append('minYear', minYearValue)
    if (applyDateNotPassedChecked) // This will filter for projects whose lastApplyDate has not passed
      params.append('applyDateNotPassed', 'true')
    // profKerberos is implicitly handled by /api/my-projects
    return params.toString()
  }

  const handleApplyFilters = () => {
    setQueryString(constructQueryString())
  }

  // Fetch all projects for "Other open projects" section (no filters applied here)
  const allProjectsCall = useSWR(`/api/projects`)
  // Fetch professor's own projects, potentially filtered
  const myProjectsCall = useSWR(queryString ? `/api/my-projects?${queryString}` : '/api/my-projects')

  useEffect(() => {
    // set initial query string with default applyDateNotPassed for "my-projects"
    handleApplyFilters()
  }, []) // Run once on mount to apply default filters to "my-projects"

  if (allProjectsCall.isLoading || myProjectsCall.isLoading) {
    return <h1 className="text-lg">Loading...</h1>
  }
  else if (allProjectsCall.error || myProjectsCall.error || !allProjectsCall.data?.data || !myProjectsCall.data?.data) {
    return <h1 className="text-lg">There was an error loading the projects...</h1>
  }

  const allProjects = allProjectsCall.data.data as Project[]
  let myProjects = myProjectsCall.data.data as Project[]

  // Apply client-side filtering for applyDateNotPassed if the backend doesn't or if the filter is off
  // For /api/my-projects, if applyDateNotPassed=true is in query, backend should handle it.
  // This client-side logic is more of a fallback or if we want to toggle it without re-fetching.
  if (applyDateNotPassedChecked) {
    myProjects = myProjects.filter((p: { lastApplyDate: string }) => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const lastApplyDate = new Date(p.lastApplyDate)
      lastApplyDate.setHours(0, 0, 0, 0)
      return lastApplyDate >= today
    })
  }
  // Sort "My Projects" by creation date (newest first)
  myProjects.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  // Prepare data for "Other open projects" - filter out own projects and sort
  const otherProjects = allProjects.filter(p => p.profKerberos !== authCtx?.user?.user.kerberos)
  otherProjects.sort((a, b) => new Date(b.lastApplyDate).getTime() - new Date(a.lastApplyDate).getTime()) // Example: sort by lastApplyDate

  const allDegreesOptions = Object.entries(degreeName).map(([code, name]) => ({ value: code, label: name }))
  const allProjectTypesOptions = Object.entries(projectType).map(([code, name]) => ({ value: code, label: name }))
  const allDurationsOptions = Object.entries(projectDuration).map(([code, name]) => ({ value: code, label: name }))
  const allDepartmentsOptions = Object.entries(deptData).map(([code, data]) => ({ value: code, label: data.name }))

  const FilterControls = (
    <div className="p-4 my-5 border rounded-md">
      <h3 className="text-lg font-semibold mb-3">Filter Your Projects</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="projectType">Project Type</Label>
          <Select value={selectedProjectType} onValueChange={setSelectedProjectType}>
            <SelectTrigger id="projectType">
              <SelectValue placeholder="Any Project Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any Project Type</SelectItem>
              {allProjectTypesOptions.map(pt => <SelectItem key={pt.value} value={pt.value}>{pt.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="duration">Duration</Label>
          <Select value={selectedDuration} onValueChange={setSelectedDuration}>
            <SelectTrigger id="duration">
              <SelectValue placeholder="Any Duration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any Duration</SelectItem>
              {allDurationsOptions.map(d => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="eligibleDegrees">Eligible Degrees</Label>
          <Select value={selectedDegrees[0] || ''} onValueChange={val => setSelectedDegrees(val ? [val] : [])}>
            <SelectTrigger id="eligibleDegrees">
              <SelectValue placeholder="Any Degree" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any Degree</SelectItem>
              {allDegreesOptions.map(deg => <SelectItem key={deg.value} value={deg.value}>{deg.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="eligibleDepartments">Eligible Departments</Label>
          <Select value={selectedDepartments[0] || ''} onValueChange={val => setSelectedDepartments(val ? [val] : [])}>
            <SelectTrigger id="eligibleDepartments">
              <SelectValue placeholder="Any Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any Department</SelectItem>
              {allDepartmentsOptions.map(dep => <SelectItem key={dep.value} value={dep.value}>{dep.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="minYear">Minimum Year</Label>
          <Input
            id="minYear"
            type="number"
            value={minYearValue}
            onChange={e => setMinYearValue(e.target.value)}
            placeholder="e.g. 1"
          />
        </div>

        <div className="flex items-center space-x-2 mt-4">
          <Checkbox
            id="stipendProvided"
            checked={stipendProvidedChecked}
            onCheckedChange={checked => setStipendProvidedChecked(Boolean(checked))}
          />
          <Label htmlFor="stipendProvided">Stipend Provided</Label>
        </div>

        <div className="flex items-center space-x-2 mt-4">
          <Checkbox
            id="applyDateNotPassed"
            checked={applyDateNotPassedChecked}
            onCheckedChange={checked => setApplyDateNotPassedChecked(Boolean(checked))}
          />
          <Label htmlFor="applyDateNotPassed">Accepting Applications</Label>
        </div>
      </div>
      <Button onClick={handleApplyFilters} className="mt-4">Apply Filters</Button>
    </div>
  )

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
      {FilterControls}
      <div className="mx-2 md:mx-7 mt-4">
        <title>Projects - Projects Portal</title>
        {myProjects.length === 0 && <NoProjectsFound forProf />}
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
        {otherProjects.map((proj: Project) => (
          <ProjectCard
            project={proj}
            key={proj.id}
          />
        ))}
      </div>
    </div>
  )
}

export function NoProjectsFound({ forProf }: { forProf?: boolean }) {
  return (
    <p className="flex justify-center items-center py-10 text-md md:text-lg border-2 border-gray-300 rounded-xl text-muted-foreground mx-7 mt-4">
      {forProf ? 'You have no projects matching the current filters.' : 'There are no open projects right now'}
    </p>
  )
}
