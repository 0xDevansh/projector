import type { Application } from '../../models/Application.js'
import type { Project } from '../../models/ProfessorProject.js'
import type {
  DegreeCode,
  DeptCode,
  ProjectDuration,
  ProjectType,
} from '../../types.js'
import type { AuthCtx } from '../AuthContext.js'
import axios from 'axios'
import dayjs from 'dayjs'
import {
  BanknoteIcon,
  BookCheckIcon,
  BriefcaseIcon,
  CalendarIcon,
  CircleHelpIcon,
  ClockIcon,
  GraduationCapIcon,
  SchoolIcon,
  UserIcon,
} from 'lucide-react'
import React, { useContext } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import useSWR from 'swr'
import { degreeName, deptData, projectDuration, projectType,
} from '../../types.js'
import { AuthContext } from '../AuthContext.js'
import ProjectApplicationForm from '../components/ProjectApplicationForm.js'
import { Badge, BadgeWithTooltip } from '../components/ui/badge.js'
import { Button, buttonVariants } from '../components/ui/button.js'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card.js'
import { Separator } from '../components/ui/separator.js'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table.js'
import { loginLink } from '../layouts/Header.js'
import { cn } from '../utils.js'
import NotFound from './NotFound.js'

export default function ProjectDetails() {
  const { id } = useParams()
  if (!id) {
    return <NotFound />
  }

  const authCtx = useContext(AuthContext)
  const navigate = useNavigate()
  const { data, error, isLoading, mutate } = useSWR(`/api/project/${id}`)

  if (isLoading) {
    return <h1 className="text-lg">Loading...</h1>
  }
  else if (error || !data?.data) {
    return <NotFound />
  }
  else {
    // need to convert date field to Date()
    const project = { ...data.data, lastApplyDate: new Date(data.data.lastApplyDate) } as Project
    // const { apps, error, isLoading } = useSWR(`/api/project/${id}/applications`)
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
      await axios.put(`/api/project/${project.id}`, { projectStatus: 'open' })
      await mutate()
      navigate(`/app/project/${project.id}`, { state: { toast: { code: 'madePublic' } } })
    }
    const onChangeStatus = async () => {
      if (project.projectStatus === 'open') {
        await axios.put(`/api/project/${project.id}`, { projectStatus: 'closed' })
        await mutate()
        navigate(`/app/project/${project.id}`, { state: { toast: { code: 'projectClosed' } } })
      }
      else {
        await axios.put(`/api/project/${project.id}`, { projectStatus: 'open' })
        await mutate()
        navigate(`/app/project/${project.id}`, { state: { toast: { code: 'madePublic' } } })
      }
    }

    return (
      <div className="container mx-auto py-8 px-4 flex-col gap-4">
        <title>Project Details - Projects Portal</title>
        <h1 className="text-3xl font-bold mb-6">{project.title}</h1>
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Project Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="flex items-center gap-2">
                    <CircleHelpIcon className="w-5 h-5 text-muted-foreground" />
                    <span className="font-semibold">Status:</span>
                    { project.projectStatus === 'open' && <span className="text-green-900">Open to applications</span>}
                    { project.projectStatus === 'closed' && <span className="text-red-800">Closed</span>}
                    { project.projectStatus === 'draft' && <span className="text-gray-700">Draft</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <GraduationCapIcon className="w-5 h-5 text-muted-foreground" />
                    <span className="font-semibold">Professor:</span>
                    <span>{`${project.prof.user.name} (${deptData[project.prof.user.deptCode as DeptCode].name})`}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BriefcaseIcon className="w-5 h-5 text-muted-foreground" />
                    <span className="font-semibold">Type:</span>
                    {project.projectType.map((type: ProjectType) => {
                      const pType = ['disa', 'sura', 'btp', 'mtp'].includes(type)
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
                    {project.eligibleDepartments?.length > 0
                      ? project.eligibleDepartments.map((ed: DeptCode) => (
                          <Badge
                            key={ed}
                            variant="outline"
                          >
                            {deptData[ed].name}
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
          <SideBar onMakePublic={onMakePublic} onChangeStatus={onChangeStatus} authCtx={authCtx} project={project} />
        </div>
        {authCtx?.user?.type === 'prof' && authCtx?.user?.user.kerberos === project.profKerberos && <ApplicationsCard project={project} />}
      </div>
    )
  }
}

function SideBar({ authCtx, project, onMakePublic, onChangeStatus }: { authCtx: AuthCtx | undefined, project: Project, onMakePublic: () => void, onChangeStatus: () => void }) {
  let applications: Application[] = []
  const { data, error, isLoading } = useSWR(`/api/project/${project.id}/applications`)
  if (isLoading) {
    return <h1 className="text-lg">Loading...</h1>
  }
  else if (!error && data?.data) {
    applications = data.data as Application[]
  }
  const acceptingResponses = project.projectStatus === 'open' && project.lastApplyDate >= new Date()
  if (!authCtx?.isLoggedIn) {
    // not logged in
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Something missing?</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            <Link to={loginLink} className="text-blue-700 hover:underline">Log in</Link>
            {' '}
            to find more options
          </p>
        </CardContent>
      </Card>
    )
  }
  else if (authCtx?.user?.user.type === 'student') {
    // user is a student (show application form)
    if (!applications.length) {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Apply for this Project</CardTitle>
            <CardDescription>Fill out the form below to submit your application</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">Please take your time to draft a good application. Once submitted, it cannot be edited.</p>
            <ProjectApplicationForm project={project} authCtx={authCtx} />
          </CardContent>
        </Card>
      )
    }
    else {
      // user already applied
      const app = applications[0]
      return (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl mt-6">You have applied for this project</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-md mb-3">
              <span className="font-semibold">Applied on: </span>
              {dayjs(app.createdAt).format('DD MMM YYYY')}
            </p>
            <Link to={`/app/project/${project.id}/applications/${app.id}`} className={buttonVariants({ variant: 'default' })}>View application</Link>
          </CardContent>
        </Card>
      )
    }
  }
  else if (authCtx?.user?.user.kerberos === project.profKerberos) {
  // if prof is logged in and project is draft
    if (project.projectStatus === 'draft') {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Draft project</CardTitle>
            <CardDescription>This project is currently a draft. You can edit it or make it public</CardDescription>
          </CardHeader>
          <CardContent className="gap-3 flex flex-col">
            <Link className={buttonVariants({ variant: 'outline' })} to={`/app/project/${project.id}`}>Edit Project</Link>
            <Button variant="default" onClick={onMakePublic}>Make Public</Button>
            <p>Edit form coming soon...</p>
          </CardContent>
        </Card>
      )
    }
    else {
      // prof logged in and project not draft
      return (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Professor Options</CardTitle>
          </CardHeader>
          <CardContent className="gap-3 flex flex-col">
            <h1 className="text-lg font-semibold">
              Status:
              <span className="font-normal">
                {' '}
                {new Date() > project.lastApplyDate ? 'Last application date exceeded' : project.projectStatus}
              </span>
            </h1>
            {acceptingResponses
              ? <p>This project is accepting new applications</p>
              : (
                  <p>
                    This project is
                    {' '}
                    <b>not accepting</b>
                    {' '}
                    new applications
                  </p>
                )}
            <Link className={cn(buttonVariants({ variant: 'default' }), 'py-4')} to={`/app/project/${project.id}/edit`}>Edit Project details</Link>
            <Button
              onClick={onChangeStatus}
              variant="destructive"
            >
              {project.projectStatus === 'open' ? 'Close Project' : 'Open for applications'}
            </Button>
            {new Date() > project.lastApplyDate && <p>The last application date has passed, so this project is no longer visible to students. You can update the date to allow more applications.</p>}

          </CardContent>
        </Card>
      )
    }
  }
  return <span className="hidden">Nothing</span>
}

function ApplicationsCard({ project }: { project: Project }) {
  const { data, error, isLoading } = useSWR(`/api/project/${project.id}/applications`)
  if (isLoading) {
    return <h1 className="text-lg">Loading...</h1>
  }
  else if (error || !data?.data) {
    return <h1 className="text-lg">There was an unexpected error</h1>
  }
  const applications = data.data as Application[]
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-2xl">Applications</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="font-semibold">
          Received
          {' '}
          {applications.length}
          {' '}
          applications
        </p>
        {applications.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>CGPA</TableHead>
                <TableHead>Applied on</TableHead>
                <TableHead>More details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map(app => (
                <TableRow key={app.id}>
                  <TableCell className="font-medium">{app.student.user.name}</TableCell>
                  <TableCell>{deptData[app.student.user.deptCode as DeptCode].name}</TableCell>
                  <TableCell>{app.student.cgpa}</TableCell>
                  <TableCell>{dayjs(app.createdAt).format('DD MMM YYYY')}</TableCell>
                  <TableCell>
                    <Link
                      className={cn(buttonVariants({ variant: 'outline' }), 'py-4')}
                      to={`/app/project/${project.id}/applications/${app.id}`}
                    >
                      Show
                      Application
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
