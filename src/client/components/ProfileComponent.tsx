import type { Application } from '../../models/Application.js'
import type { DegreeCode, DeptCode, ExtendedUser } from '../../types.js'

import dayjs from 'dayjs'
import { Building2, FileEdit, FileText, GraduationCap, Mail } from 'lucide-react'
import React from 'react'
import { Link } from 'react-router'
import useSWR from 'swr'
import { degreeName, deptData } from '../../types.js'
import { buttonVariants } from '../components/ui/button.js'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card.js'
import { cn } from '../utils.js'

export default function ProfileComponent({ user, isSelf }: { user: ExtendedUser, isSelf: boolean }) {
  // fetch applications only if student
  let { data, error, isLoading } = { data: { data: [] }, error: undefined, isLoading: false }
  if (user.type === 'student') {
    const applicationCall = useSWR(`/api/applications/mine`)
    data = applicationCall.data
    error = applicationCall.error
    isLoading = applicationCall.isLoading
  }

  let applications: Application[] = []

  if (!error && !isLoading && data.data) {
    applications = data.data as Application[]
  }
  let yearSuffix = 'th'
  if (user.type === 'student' && user.student?.yearOfStudy === 1)
    yearSuffix = 'st'
  if (user.type === 'student' && user.student?.yearOfStudy === 2)
    yearSuffix = 'nd'
  if (user.type === 'student' && user.student?.yearOfStudy === 3)
    yearSuffix = 'rd'
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between">
        <h2 className="h3 md:h2">
          Your Profile
        </h2>
        <div>
          <a href="/api/logout" className={buttonVariants({ variant: 'destructive' })}>Logout</a>
        </div>
      </div>
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-2xl">
              {user.type === 'prof' && 'Prof. '}
              {user.user.name}
            </CardTitle>
            <CardDescription className="text-base">{deptData[user.user.deptCode as DeptCode].name}</CardDescription>
          </div>
          {user.type === 'student' && (
            <Link to="/app/profile/edit" className={cn('gap-2', buttonVariants({ variant: 'outline' }))}>
              <FileEdit className="w-4 h-4" />
              Edit Profile
            </Link>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile Details */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-gray-500" />
                <a className="text-primary hover:underline text-base" href={`mailto:${user.user.kerberos}.iitd.ac.in`}>
                  {user.user.kerberos}
                  @iitd.ac.in
                </a>
              </div>
              {
                user.type === 'student' && (
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="w-4 h-4 text-gray-500" />
                    <span className="text-base">
                      {degreeName[user.student?.degree as DegreeCode]}
                      {
                        user.student?.yearOfStudy ? ` - ${user.student?.yearOfStudy}${yearSuffix} year` : ''
                      }
                    </span>
                  </div>
                )
              }
              {
                user.type === 'student' && (
                  <>
                    <div className="flex items-center gap-2 text-sm">
                      <GraduationCap className="w-4 h-4 text-gray-500" />
                      <span className="text-base">
                        <span className="font-semibold">CGPA: </span>
                        {user.student?.cgpa}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <a target="_blank" href={`/static/resume/${user.student?.resumePath}`} className="text-indigo-600 hover:underline text-base">
                        View Resume
                      </a>
                    </div>
                  </>
                )
              }
            </div>
            {
              user.type === 'student' && (
                <div>
                  <h3 className="mb-2 font-semibold text-base">Bio</h3>
                  <p className="text-sm break-all">
                    {user.student?.bio}
                  </p>
                </div>
              )
            }
          </div>
        </CardContent>
      </Card>

      {/* Applied Projects Section */}
      {user.type === 'student' && isSelf && !isLoading && data && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Applied Projects</CardTitle>
            <CardDescription>Track the status of your project applications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {applications.map(application => (
                <div key={application.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Link to={`/app/project/${application.projectId}`} className="font-medium">{application.project.title}</Link>
                    <p className="text-sm text-gray-500">
                      {application.project.prof.user.name}
                      {' '}
                      • Applied on
                      {' '}
                      {dayjs(application.createdAt).format('DD MMM YYYY')}
                    </p>
                  </div>
                  <Link to={`/app/project/${application.projectId}`} className={buttonVariants({ variant: 'secondary' })}>Go to project</Link>
                </div>
              ))}
              {applications.length === 0 && <span className="text-sm text-red-800">You haven't applied to any projects yet</span>}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
