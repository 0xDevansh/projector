import type { Application } from '../../models/Application.js'
import type { Project } from '../../models/ProfessorProject.js'
import React, { useState, useEffect } from 'react'
import useSWR from 'swr'
import {
  degreeName,
  deptData,
  projectType,
  projectDuration,
  type ProjectType,
  type ProjectDuration as ProjectDurationType,
  type DegreeCode,
  type DeptCode,
} from '../../types.js'
import { Button } from './ui/button.js'
import { Checkbox } from './ui/checkbox.js'
import { Input } from './ui/input.js'
import { Label } from './ui/label.js'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select.js'
import { NoProjectsFound } from './ProfProjects.js'
import ProjectCard from './ProjectCard.js'

export default function StudentProjects({ isLoggedIn }: { isLoggedIn?: boolean }) {
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
    if (applyDateNotPassedChecked)
      params.append('applyDateNotPassed', 'true')
    return params.toString()
  }

  const handleApplyFilters = () => {
    setQueryString(constructQueryString())
  }

  // Initial fetch or when queryString changes
  const projectsCall = useSWR(queryString ? `/api/projects?${queryString}` : '/api/projects')
  // a hack to keep this hook on the top of the page
  const applicationsCall = useSWR(isLoggedIn ? `/api/applications/mine` : null) // only fetch if logged in

  useEffect(() => {
    // set initial query string with default applyDateNotPassed
    handleApplyFilters()
  }, []) // Run once on mount

  if (projectsCall.isLoading) {
    return <h1 className="text-lg">Loading...</h1>
  }
  else if (projectsCall.error || !projectsCall.data?.data) {
    return <h1 className="text-lg">There was an error loading the projects...</h1>
  }

  let projects = projectsCall.data.data as Project[]
  // client side filtering for applyDateNotPassed if not handled by backend or if filter is off
  if (applyDateNotPassedChecked) {
    projects = projects.filter((p: { lastApplyDate: string }) => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const lastApplyDate = new Date(p.lastApplyDate)
      lastApplyDate.setHours(0, 0, 0, 0)
      return lastApplyDate >= today
    })
  }
  projects.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const allDegrees = Object.entries(degreeName).map(([code, name]) => ({ value: code, label: name }))
  const allProjectTypes = Object.entries(projectType).map(([code, name]) => ({ value: code, label: name }))
  const allDurations = Object.entries(projectDuration).map(([code, name]) => ({ value: code, label: name }))
  const allDepartments = Object.entries(deptData).map(([code, data]) => ({ value: code, label: data.name }))


  const FilterControls = (
    <div className="p-4 my-5 border rounded-md">
      <h3 className="text-lg font-semibold mb-3">Filter Projects</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="projectType">Project Type</Label>
          <Select value={selectedProjectType} onValueChange={setSelectedProjectType}>
            <SelectTrigger id="projectType">
              <SelectValue placeholder="Any Project Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any Project Type</SelectItem>
              {allProjectTypes.map(pt => <SelectItem key={pt.value} value={pt.value}>{pt.label}</SelectItem>)}
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
              {allDurations.map(d => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="eligibleDegrees">Eligible Degrees</Label>
          {/* For multi-select, we'd need a different component or multiple single selects.
              Keeping it single for now as per instructions if multi-select is complex.
              To implement multi-select for degrees:
              1. Change selectedDegrees state to string[]
              2. Use a multi-select component here.
              3. Update constructQueryString to join array with commas.
              For simplicity, using a single select for now.
              If you have a MultiSelect component, it can be used like:
              <MultiSelect
                options={allDegrees}
                selectedValues={selectedDegrees}
                onChange={setSelectedDegrees}
                placeholder="Any Degree"
              />
              Since MultiSelect is not standard, using single for now.
          */}
          <Select value={selectedDegrees[0] || ''} onValueChange={val => setSelectedDegrees(val ? [val] : [])}>
            <SelectTrigger id="eligibleDegrees">
              <SelectValue placeholder="Any Degree" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any Degree</SelectItem>
              {allDegrees.map(deg => <SelectItem key={deg.value} value={deg.value}>{deg.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="eligibleDepartments">Eligible Departments</Label>
           {/* Similar to degrees, using single select for departments for now.
              To implement multi-select for departments:
              1. Change selectedDepartments state to string[]
              2. Use a multi-select component here.
              3. Update constructQueryString to join array with commas.
          */}
          <Select value={selectedDepartments[0] || ''} onValueChange={val => setSelectedDepartments(val ? [val] : [])}>
            <SelectTrigger id="eligibleDepartments">
              <SelectValue placeholder="Any Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any Department</SelectItem>
              {allDepartments.map(dep => <SelectItem key={dep.value} value={dep.value}>{dep.label}</SelectItem>)}
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

  if (!isLoggedIn) {
    return (
      <div>
        <h2 className="h3 md:h2 md:my-5 font-bold">Open Projects</h2>
        {FilterControls}
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
      {FilterControls}
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
