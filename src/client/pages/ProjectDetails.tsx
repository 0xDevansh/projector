import type { Project } from '../../models/ProfessorProject.js'
import type {
  DegreeCode,
  DeptCode,
  ProjectDuration,
  ProjectType,
} from '../../types.js'
import axios from 'axios'
import dayjs from 'dayjs'
import { BanknoteIcon, BookCheckIcon, BriefcaseIcon, CalendarIcon, ClockIcon, GraduationCapIcon, SchoolIcon, UserIcon } from 'lucide-react'
import React, { useContext } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import useSWR from 'swr'
import { degreeName, deptName, projectDuration, projectType,
} from '../../types.js'
import { AuthContext } from '../AuthContext.js'
import { Badge, BadgeWithTooltip } from '../components/ui/badge.js'
import { Button, buttonVariants } from '../components/ui/button.js'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card.js'
import { Separator } from '../components/ui/separator.js'
import NotFound from './NotFound.js'

const fetcher = (url: string) => axios.get(url).then(res => res.data)

export default function ProjectDetails() {
  const { id } = useParams()
  if (!id) {
    return <NotFound />
  }

  const authCtx = useContext(AuthContext)
  const navigate = useNavigate()
  const { data, error, isLoading } = useSWR(`/api/project/${id}`, fetcher)
  if (isLoading) {
    return <h1 className="text-lg">Loading...</h1>
  }
  else if (error || !data?.data) {
    return <NotFound />
  }
  else {
    const project = data.data as Project
    // if project is not open, only prof can view it
    if (project.projectStatus !== 'open') {
      if (!authCtx?.isLoggedIn) {
        return <h1>Please log in to view this project</h1>
      }
      else if (authCtx?.user?.user.kerberos !== project.profKerberos) {
        return <NotFound />
      }
    }

    const onMakePublic = async () => {
      await axios.put(`/api/project/${id}`, { projectStatus: 'open' })
      navigate(`/app/project/${id}`, { state: { toast: { code: 'madePublic' } } })
    }

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
                    <span>{`${project.prof.user.name} (${deptName[project.prof.user.deptCode as DeptCode]})`}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BriefcaseIcon className="w-5 h-5 text-muted-foreground" />
                    <span className="font-semibold">Type:</span>
                    {project.projectType.map((type: ProjectType) => {
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
                    <span className="font-semibold">Last Application Date:</span>
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
            {authCtx?.user?.user.type === 'student' && (
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
            )}
            {authCtx?.user?.user.kerberos === project.profKerberos && project.projectStatus === 'draft'
            && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Draft project</CardTitle>
                  <CardDescription>This project is currently a draft. You can edit it or make it public</CardDescription>
                </CardHeader>
                <CardContent className="gap-3 flex flex-wrap">
                  <Link className={buttonVariants({ variant: 'default' })} to={`/app/project/${project.id}/edit`}>Edit Project</Link>
                  <Button variant="default" onClick={onMakePublic}>Make Public</Button>
                  <p>Both of these options have not been implemented</p>
                </CardContent>
              </Card>
            ) }
          </div>
        </div>
      </div>
    )
  }
}
