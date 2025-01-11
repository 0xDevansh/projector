import type {
  DegreeCode,
  DeptCode,
  ProjectDuration,
  ProjectType,
} from '../../types.js'
import axios from 'axios'
import dayjs from 'dayjs'
import { BanknoteIcon, BookCheckIcon, BriefcaseIcon, CalendarIcon, ClockIcon, GraduationCapIcon, SchoolIcon, UserIcon } from 'lucide-react'
import React from 'react'
import { useParams } from 'react-router'
import useSWR from 'swr'
import { degreeName, deptName, projectDuration, projectType,
} from '../../types.js'
import { Badge, BadgeWithTooltip } from '../components/ui/badge.js'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card.js'
import { Separator } from '../components/ui/separator.js'

const fetcher = (url: string) => axios.get(url).then(res => res.data)

export default function ProjectDetails() {
  const { id } = useParams()
  if (!id) {
    return <h1>Project not found</h1>
  }

  const { data, error, isLoading } = useSWR(`/api/project/${id}`, fetcher)
  if (isLoading) {
    return <h1 className="text-lg">Loading...</h1>
  }
  else if (error || !data?.data) {
    return <h1 className="text-lg">There was an error loading this project</h1>
  }
  else {
    const project = data.data
    console.log(project)

    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-4xl font-bold mb-6">{project.title}</h1>
        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Project Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="flex items-center gap-2">
                    <GraduationCapIcon className="w-5 h-5 text-muted-foreground" />
                    <span className="font-semibold">Professor:</span>
                    <span>{`${project.profUser.name} (${deptName[project.profUser.deptCode as DeptCode]})`}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BriefcaseIcon className="w-5 h-5 text-muted-foreground" />
                    <span className="font-semibold">Type:</span>
                    {project.type.map((type: ProjectType) => {
                      const pType = ['disa', 'sura'].includes(type)
                        ? type.toUpperCase()
                        : type[0].toUpperCase() + type.substring(1)

                      return (
                        <BadgeWithTooltip
                          key={type}
                          tooltipText={projectType[type]}
                          variant="outline"
                        >
                          {pType}
                        </BadgeWithTooltip>
                      )
                    })}
                  </div>
                  <div className="flex items-center gap-2">
                    <ClockIcon className="w-5 h-5 text-muted-foreground" />
                    <span className="font-semibold">Duration:</span>
                    {project.duration.map((dur: ProjectDuration) => (
                      <Badge
                        key={dur}
                        variant="outline"
                      >
                        {projectDuration[dur]}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <UserIcon className="w-5 h-5 text-muted-foreground" />
                    <span className="font-semibold">Vacancies:</span>
                    <span>{project.vacancy}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-muted-foreground" />
                    <span className="font-semibold">Last Apply Date:</span>
                    <span>{dayjs(project.lastApplyDate).format('DD MMM YYYY')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BanknoteIcon className="w-5 h-5 text-muted-foreground" />
                    <span className="font-semibold">Stipend:</span>
                    <span>{project.stipendProvided ? `₹${project.stipendAmount}` : 'Not Provided'}</span>
                  </div>
                </div>
                <Separator className="my-6" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Description:</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">{project.description}</p>
                </div>
                <Separator className="my-6" />
                <div className="grid gap-4">
                  <h3 className="text-xl font-semibold mb-2">Eligibility Criteria</h3>
                  {project.minCgpa && (
                    <div className="flex items-center gap-2">
                      <BookCheckIcon className="w-5 h-5 text-muted-foreground" />
                      <span className="font-semibold">Minimum CGPA:</span>
                      <span>{project.minCgpa}</span>
                    </div>
                  )}
                  {project.minYear && (
                    <div className="flex items-center gap-2">
                      <BookCheckIcon className="w-5 h-5 text-muted-foreground" />
                      <span className="font-semibold">Minimum year of study:</span>
                      <span>{project.minYear}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <GraduationCapIcon className="w-5 h-5 text-muted-foreground" />
                    <span className="font-semibold">Eligible degrees:</span>
                    {project.eligibleDegrees?.length > 0
                      ? project.eligibleDegrees.map((ed: DegreeCode) => (
                          <Badge
                            key={ed}
                            variant="outline"
                          >
                            {degreeName[ed]}
                          </Badge>
                        ))
                      : 'All are eligible'}
                  </div>
                  <div className="flex items-center gap-2">
                    <SchoolIcon className="w-5 h-5 text-muted-foreground" />
                    <span className="font-semibold">Eligible departments:</span>
                    {project.eligibleDegrees?.length > 0
                      ? project.eligibleDepartments.map((ed: DeptCode) => (
                          <Badge
                            key={ed}
                            variant="outline"
                          >
                            {deptName[ed]}
                          </Badge>
                        ))
                      : 'All are eligible'}
                  </div>
                  {project.prerequisites && (
                    <div>
                      <Separator className="my-6" />
                      <h3 className="text-xl font-semibold mb-2">Prerequisites</h3>
                      <p className="text-muted-foreground whitespace-pre-wrap">{project.prerequisites}</p>
                    </div>
                  )}
                  {project.selectionProcedure && (
                    <div>
                      <Separator className="my-6" />
                      <h3 className="text-xl font-semibold mb-2">Selection Procedure</h3>
                      <p className="text-muted-foreground whitespace-pre-wrap">{project.selectionProcedure}</p>
                    </div>
                  )}
                  {project.learningOutcomes && (
                    <div>
                      <Separator className="my-6" />
                      <h3 className="text-xl font-semibold mb-2">Learning Outcomes</h3>
                      <p className="text-muted-foreground whitespace-pre-wrap">{project.learningOutcomes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Apply for this Project</CardTitle>
                <CardDescription>Fill out the form below to submit your application</CardDescription>
              </CardHeader>
              <CardContent>
                {/* <ApplicationForm projectId={project.id} /> */}
                Application form coming soon
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }
}
