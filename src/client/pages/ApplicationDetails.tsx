import type { Application } from '../../models/Application.js'

import type { DegreeCode, DeptCode } from '../../types.js'
import { Calendar, FileUserIcon, GraduationCapIcon, MailIcon, SchoolIcon, UserIcon } from 'lucide-react'
import React from 'react'
import { Link, useParams } from 'react-router'
import useSWR from 'swr'
import { degreeName, deptData } from '../../types.js'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card.js'
import { Separator } from '../components/ui/separator.js'
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
  let yearSuffix = 'th'
  if (application.student?.yearOfStudy === 1)
    yearSuffix = 'st'
  if (application.student?.yearOfStudy === 2)
    yearSuffix = 'nd'
  if (application.student?.yearOfStudy === 3)
    yearSuffix = 'rd'

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
              <MailIcon className="w-5 h-5 text-muted-foreground" />
              <span className="font-semibold">Email:</span>
              <Link to={`mailto:${application.student.user.kerberos}@iitd.ac.in`} className="text-blue-800 hover:underline">
                {application.student.user.kerberos}
                @iitd.ac.in
              </Link>
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
              <span className="font-semibold">Year of study:</span>
              <span>
                {application.student.yearOfStudy}
                {yearSuffix}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <FileUserIcon className="w-5 h-5 text-muted-foreground" />
              <span className="font-semibold">Resume:</span>
              {application.student.resumePath
                ? (
                    <a target="_blank" href={`/static/resume/${application.student?.resumePath}`} className="text-indigo-600 hover:underline text-base">
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
