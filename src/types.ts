import type { Professor } from './models/Professor.js'
import type { Student } from './models/Student.js'
import type { User } from './models/User.js'
import { type Static, type TSchema, Type } from '@sinclair/typebox'

export type UserType = 'student' | 'prof'
export const degreeName = {
  btech: 'BTech',
  mtech: 'MTech',
  dual: 'Dual Degree',
  phd: 'PhD',
  msc: 'MSc',
  msr: 'MSR',
  bdes: 'BDes',
  mdes: 'MDes',
}
export type DegreeCode = keyof typeof degreeName
export const deptName = {
  am: 'Applied Mechanics',
  beb: 'Biochemical Engineering and Biotechnology',
  chemical: 'Chemical Engineering',
  chemistry: 'Chemistry',
  civil: 'Civil Engineering',
  cse: 'Computer Science and Engineering',
  design: 'Design',
  ee: 'Electrical Engineering',
  dese: 'Energy Science and Engineering',
  hss: 'Humanities and Social Sciences',
  mse: 'Materials Science and Engineering',
  maths: 'Mathematics',
  mech: 'Mechanical Engineering',
  physics: 'Physics',
  textile: 'Textile and Fibre Engineering',
}
export type DeptCode = keyof typeof deptName
export const projectType = {
  disa: 'Design and Innovation Summer Award',
  sura: 'Summer Undergraduate Research Award',
  major: 'Major Project',
  minor: 'Minor Project',
  design: 'Design Project',
}
export type ProjectType = keyof typeof projectType
export const projectDuration = {
  summer: 'Summer Long',
  winter: 'Winter Long',
  semester: 'Semester Long',
  year: 'Year Long',
  short: 'Short Term',
  long: 'Long Term',
  other: 'Other',
}
export type ProjectDuration = keyof typeof projectDuration
export type ProjectStatus = 'open' | 'closed' | 'ended' | 'draft'

interface StudentUser {
  user: User
  type: 'student'
  student?: Student
}

interface ProfUser {
  user: User
  type: 'prof'
  prof?: Professor
}

export type ExtendedUser = StudentUser | ProfUser

export const Nullable = (type: TSchema) => Type.Union([Type.Null(), type])

export const ProjectTypebox = Type.Object({
  id: Type.String(),
  status: Type.String(),
  createdAt: Type.Date(),
  profKerberos: Type.String(),
  title: Type.String(),
  description: Type.String(),
  type: Type.Array(Type.String()),
  duration: Type.Array(Type.String()),
  eligibleDegrees: Nullable(Type.Array(Type.String())),
  eligibleDepartments: Nullable(Type.Array(Type.String())),
  vacancy: Type.Integer(),
  minCgpa: Nullable(Type.String()),
  minYear: Nullable(Type.Integer()),
  prerequisites: Nullable(Type.String()),
  learningOutcomes: Nullable(Type.String()),
  selectionProcedure: Nullable(Type.String()),
  lastApplyDate: Type.Date(),
  stipendProvided: Type.Boolean(),
  stipendAmount: Nullable(Type.Integer()),
})

export type ProjectTSType = Static<typeof ProjectTypebox>
