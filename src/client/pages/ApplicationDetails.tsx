import type { Application } from '../../models/Application.js'

import type { DegreeCode, DeptCode } from '../../types.js'
import { Calendar, FileUserIcon, GraduationCapIcon, SchoolIcon, UserIcon } from 'lucide-react'
import React from 'react'
import { useParams } from 'react-router'
import useSWR from 'swr'
import { degreeName, deptData } from '../../types.js'
import { buttonVariants } from '../components/ui/button.js'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card.js'
import { Separator } from '../components/ui/separator.js'
import { cn } from '../utils.js'
import NotFound from './NotFound.js'

export default function ApplicationDetails() {
  const { projectId, applicationId } = useParams()
  if (!projectId || !applicationId) {
    return <NotFound />
  }
  const { data, error, isLoading } = useSWR(`/api/applications/${applicationId}`)
  if (isLoading) {
    return <h1 className="text-lg">Loading...</h1>
  }
  else if (error || !data?.data) {
    return <NotFound />
  }
  const application = data.data as Application
  return (
    <div className="container mx-auto py-8 px-4 flex-col gap-4">
      <title>Application - Projects Portal</title>
      <h1 className="text-3xl font-bold mb-6">Student Application</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Student details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-muted-foreground" />
              <span className="font-semibold">Name:</span>
              <span>{application.student.user.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <SchoolIcon className="w-5 h-5 text-muted-foreground" />
              <span className="font-semibold">Department:</span>
              <span>{deptData[application.student.user.deptCode as DeptCode].name}</span>
            </div>
            <div className="flex items-center gap-2">
              <GraduationCapIcon className="w-5 h-5 text-muted-foreground" />
              <span className="font-semibold">Degree:</span>
              <span>{degreeName[application.student.degree as DegreeCode]}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <span className="font-semibold">Year of joining:</span>
              <span>{`20${application.student.kerberos.substring(3, 5)}`}</span>
            </div>
            <div className="flex items-center gap-2">
              <FileUserIcon className="w-5 h-5 text-muted-foreground" />
              <span className="font-semibold">Resume:</span>
              {application.student.resumePath
                ? (
                    <a
                      className={cn(buttonVariants({ variant: 'default' }), 'py-4')}
                      href={`/api/user/${application.student.kerberos}/resume`}
                    >
                      View Resume
                    </a>
                  )
                : <span>Not uploaded</span>}
            </div>

            <div>
              <Separator className="my-6" />
              <h3 className="text-xl font-semibold mb-2">Relevant skills and experience</h3>
              <p className="whitespace-pre-wrap">{application.relevantSkills}</p>
            </div>
            <div>
              <Separator className="my-6" />
              <h3 className="text-xl font-semibold mb-2">Satement of Purpose</h3>
              <p className="whitespace-pre-wrap">{application.statementOfPurpose}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
