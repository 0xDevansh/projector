import type { Evaluate, Static, TIntersect, TObject, TPartial, TProperties, TSchema, TUnion } from '@sinclair/typebox'
import type { Professor } from './models/Professor.js'
import type { Student } from './models/Student.js'
import type { User } from './models/User.js'
import { Type, TypeGuard } from '@sinclair/typebox'

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
  createdAt: Type.String(),
  profKerberos: Type.String(),
  title: Type.String(),
  description: Type.String(),
  projectType: Type.Array(Type.String()),
  duration: Type.Array(Type.String()),
  eligibleDegrees: Nullable(Type.Array(Type.String())),
  eligibleDepartments: Nullable(Type.Array(Type.String())),
  vacancy: Type.Integer(),
  minCgpa: Nullable(Type.String()),
  minYear: Nullable(Type.Integer()),
  prerequisites: Nullable(Type.String()),
  learningOutcomes: Nullable(Type.String()),
  selectionProcedure: Nullable(Type.String()),
  lastApplyDate: Type.String(),
  stipendProvided: Type.Boolean(),
  stipendAmount: Nullable(Type.Integer()),
})

export const ProjectFilterType = Type.Object({
  profKerberos: Type.String(),
  projectType: Type.String(), // comma separated array
  duration: Type.String(), // comma separated array
  eligibleDegrees: Type.String(), // comma separated array
  eligibleDepartments: Type.String(), // comma separated array
  stipendProvided: Type.Boolean(),
  minYear: Type.Integer(),
  // custom filters
  applyDateNotPassed: Type.Boolean(),
})

export type ProjectTSType = Static<typeof ProjectTypebox>

// -------------------------------------------------------------------------------------
// TPartialDeepProperties
// -------------------------------------------------------------------------------------
export type TPartialDeepProperties<T extends TProperties> = {
  [K in keyof T]: TPartialDeep<T[K]>
}
function PartialDeepProperties<T extends TProperties>(properties: T): TPartialDeepProperties<T> {
  return Object.getOwnPropertyNames(properties).reduce((acc, key) => {
    return { ...acc, [key]: PartialDeep(properties[key]) }
  }, {}) as never
}
// -------------------------------------------------------------------------------------
// TPartialDeepRest
// -------------------------------------------------------------------------------------
export type TPartialDeepRest<T extends TSchema[], Acc extends TSchema[] = []> = (
  T extends [infer L extends TSchema, ...infer R extends TSchema[]]
    ? TPartialDeepRest<R, [...Acc, TPartialDeep<L>]>
    : Acc
  )
function PartialDeepRest<T extends TSchema[]>(rest: [...T]): TPartialDeepRest<T> {
  return rest.map(schema => PartialDeep(schema)) as never
}
// -------------------------------------------------------------------------------------
// TPartialDeep
// -------------------------------------------------------------------------------------
export type TPartialDeep<T extends TSchema> =
  T extends TIntersect<infer S> ? TIntersect<TPartialDeepRest<S>> :
    T extends TUnion<infer S> ? TUnion<TPartialDeepRest<S>> :
      T extends TObject<infer S> ? TPartial<TObject<Evaluate<TPartialDeepProperties<S>>>> :
        T
export function PartialDeep<T extends TSchema>(schema: T): TPartialDeep<T> {
  return (
    TypeGuard.IsIntersect(schema)
      ? Type.Intersect(PartialDeepRest(schema.allOf))
      : TypeGuard.IsUnion(schema)
        ? Type.Union(PartialDeepRest(schema.anyOf))
        : TypeGuard.IsObject(schema)
          ? Type.Partial(Type.Object(PartialDeepProperties(schema.properties)))
          : schema
  ) as never
}
