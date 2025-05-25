import type { Project } from '../../models/ProfessorProject.js'
import type { ProjectDuration, ProjectType } from '../../types.js'
import dayjs from 'dayjs'
import { CalendarIcon, CircleCheckIcon, UserIcon } from 'lucide-react'
import React from 'react'
import { Link } from 'react-router'
import { projectDuration, projectType } from '../../types.js'
import { Badge, BadgeWithTooltip } from './ui/badge.js'
import { Button } from './ui/button.js'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card.js'

export default function ProjectCard({ project, applied, profView, isLoggedIn, isOwnProject }: { project: Project, applied?: boolean, profView?: boolean, isLoggedIn?: boolean, isOwnProject?: boolean }) {
  // check lastApplyDate
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const lastApplyDate = new Date(project.lastApplyDate)
  lastApplyDate.setHours(0, 0, 0, 0)
  const lastApplyDatePassed = lastApplyDate < today
  return (
    <Card className="inline-flex flex-col m-2 self-stretch" key={project.id}>
      <CardHeader className="p-4 pb-2 md:p-6 md:pb-2">
        <CardTitle className="text-ellipsis overflow-hidden text-nowrap text-md md:text-lg">{project.title}</CardTitle>
        {profView && project.projectStatus === 'open' && !lastApplyDatePassed && <h3 className="text-green-800 font-semibold">Open</h3>}
        {profView && project.projectStatus === 'open' && lastApplyDatePassed && <h3 className="text-red-800 font-semibold">Application date passed</h3>}
        {profView && project.projectStatus === 'draft' && <h3 className="text-yellow-600 font-semibold">Draft</h3>}
        {profView && project.projectStatus === 'closed' && <h3 className="text-red-800 font-semibold">Closed</h3>}
        {profView && project.projectStatus === 'ended' && <h3 className="text-red-800 font-semibold">Ended</h3>}
        {!profView && (
          <CardDescription className="text-foreground text-sm md:text-md semi">
            {`Prof. ${project.prof?.user?.name}` || project.profKerberos}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex-grow p-4 md:p-6 pt-0 md:pt-0">
        <p className="text-sm mb-4 text-ellipsis overflow-hidden text-nowrap">{project.description}</p>
        <div className="flex flex-wrap gap-2 mb-2">
          {project.projectType.map((type) => {
            const pType = ['disa', 'sura', 'btp', 'mtp'].includes(type)
              ? type.toUpperCase()
              : type[0].toUpperCase() + type.substring(1)

            return (
              <BadgeWithTooltip
                key={type}
                tooltipText={projectType[type as ProjectType]}
              >
                {pType}
              </BadgeWithTooltip>
            )
          })}
          {project.duration.map((duration) => {
            return (
              <Badge variant="outline" className="flex items-center gap-1" key={duration}>
                <CalendarIcon className="w-3 h-3" />
                {projectDuration[duration as ProjectDuration]}
              </Badge>
            )
          })}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <UserIcon className="w-4 h-4" />
          <span>
            {project.vacancy}
            {' '}
            {project.vacancy === 1 ? 'vacancy' : 'vacancies'}
          </span>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-2">
        <div className="text-sm font-semibold">
          Last Application Date:
          {' '}
          <span className={`font-normal${lastApplyDatePassed ? ' text-red-800 font-semibold' : ''}`}>{dayjs(project.lastApplyDate).format('DD MMM YYYY')}</span>
        </div>
        <div className="text-sm font-semibold">
          Stipend:
          {' '}
          <span className="font-normal">{project.stipendProvided ? `₹${project.stipendAmount}` : 'Not Provided'}</span>
        </div>
        {applied && (
          <div className="text-md font-semibold text-green-900 inline-flex gap-1">
            <CircleCheckIcon />
            <span>Applied</span>
          </div>
        )}
        <Link to={`/app/project/${project.id}`} className="w-full mt-2">
          <Button className="w-full">
            { isLoggedIn && !applied && !isOwnProject
              ? 'Apply'
              : isOwnProject ? 'Manage Project' : 'View Details'}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
