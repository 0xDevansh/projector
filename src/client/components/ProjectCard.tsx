import type { ProjectDuration, ProjectTSType, ProjectType } from '../../types.js'
import { CalendarIcon, UserIcon } from 'lucide-react'
import React from 'react'
import { Link } from 'react-router'
import { projectDuration, projectType } from '../../types.js'
import { Badge, BadgeWithTooltip } from './ui/badge.js'
import { Button } from './ui/button.js'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card.js'

export default function ProjectCard({ project }: { project: ProjectTSType }) {
  return (
    <Card className="inline-flex flex-col max-w-md min-w-sm m-2 self-stretch">
      <CardHeader>
        <CardTitle>{project.title}</CardTitle>
        <CardDescription>
          {`${project.profKerberos}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground mb-4 text-ellipsis overflow-hidden text-nowrap">{project.description}</p>
        <div className="flex flex-wrap gap-2 mb-2">
          {project.projectType.map((type) => {
            const pType = ['disa', 'sura'].includes(type)
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
              <Badge variant="outline" className="flex items-center gap-1">
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
        <div className="text-sm">
          Last Apply Date:
          {' '}
          <span className="font-semibold">{project.lastApplyDate.toString()}</span>
        </div>
        <div className="text-sm">
          Stipend:
          {' '}
          <span className="font-semibold">{project.stipendProvided ? 'Provided' : 'Not Provided'}</span>
        </div>
        <Link to={`/app/project/${project.id}`} className="w-full mt-2">
          <Button className="w-full">View Details</Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
