import type { Evaluate, TIntersect, TObject, TPartial, TProperties, TSchema, TUnion } from '@sinclair/typebox'
import type { Professor } from './models/ProfessorProject.js'
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
// export const deptName = {
//   am: 'Applied Mechanics',
//   beb: 'Biochemical Engineering and Biotechnology',
//   chemical: 'Chemical Engineering',
//   chemistry: 'Chemistry',
//   civil: 'Civil Engineering',
//   cse: 'Computer Science and Engineering',
//   design: 'Design',
//   ee: 'Electrical Engineering',
//   dese: 'Energy Science and Engineering',
//   hss: 'Humanities and Social Sciences',
//   mse: 'Materials Science and Engineering',
//   maths: 'Mathematics',
//   mech: 'Mechanical Engineering',
//   physics: 'Physics',
//   textile: 'Textile and Fibre Engineering',
// }
export const deptData = {
  // departments
  am: { name: 'Applied Mechanics', type: 'department' },
  beb: { name: 'Biochemical Engineering and Biotechnology', type: 'department' },
  chemical: { name: 'Chemical Engineering', type: 'department' },
  chemistry: { name: 'Chemistry', type: 'department' },
  civil: { name: 'Civil Engineering', type: 'department' },
  cse: { name: 'Computer Science and Engineering', type: 'department' },
  design: { name: 'Design', type: 'department' },
  ee: { name: 'Electrical Engineering', type: 'department' },
  dese: { name: 'Energy Science and Engineering', type: 'department' },
  hss: { name: 'Humanities and Social Sciences', type: 'department' },
  mse: { name: 'Materials Science and Engineering', type: 'department' },
  maths: { name: 'Mathematics', type: 'department' },
  mech: { name: 'Mechanical Engineering', type: 'department' },
  physics: { name: 'Physics', type: 'department' },
  textile: { name: 'Textile and Fibre Engineering', type: 'department' },
  // centres
  care: { name: 'Centre for Applied Research in Electronics', type: 'centre' },
  cas: { name: 'Centre for Atmospheric Sciences', type: 'centre' },
  cart: { name: 'Centre for Automotive Research and Tribology', type: 'centre' },
  cbme: { name: 'Centre for Biomedical Engineering', type: 'centre' },
  csc: { name: 'Computer Services Centre', type: 'centre' },
  etsc: { name: 'Educational Technology Services Centre', type: 'centre' },
  tripc: { name: 'Transport Research and Injury Prevention Centre', type: 'centre' },
  crdt: { name: 'Centre for Rural Development and Technology', type: 'centre' },
  sense: { name: 'Centre for Sensors, Instrumentation and Cyber-Physical Systems Engineering (SeNSE)', type: 'centre' },
  opc: { name: 'Optics and Photonics Centre', type: 'centre' },
  // schools
  bioschool: { name: 'Kusuma School of Biological Sciences', type: 'school' },
  sit: { name: 'Amar Nath and Shashi Khosla School of Information Technology', type: 'school' },
  sire: { name: 'School of Interdisciplinary Research', type: 'school' },
  spp: { name: 'School of Public Policy', type: 'school' },
  bhartischool: { name: 'Bharti School of Telecommunication Technology and Management', type: 'school' },
  scai: { name: 'Yardi School of Artificial Intelligence', type: 'school' },
}
export type DeptCode = keyof typeof deptData
export const deptNames = Object.fromEntries(Object.entries(deptData)
  .filter(([_code, data]) => data.type === 'department')
  .map(([code, data]) => [code, data.name]),
) as Record<DeptCode, string>

export const centreNames = Object.fromEntries(Object.entries(deptData)
  .filter(([_code, data]) => data.type === 'centre')
  .map(([code, data]) => [code, data.name]),
) as Record<DeptCode, string>

export const schoolNames = Object.fromEntries(Object.entries(deptData)
  .filter(([_code, data]) => data.type === 'school')
  .map(([code, data]) => [code, data.name]),
) as Record<DeptCode, string>

export const projectType = {
  disa: 'Design and Innovation Summer Award',
  sura: 'Summer Undergraduate Research Award',
  major: 'Major Project',
  minor: 'Minor Project',
  design: 'Design Project',
  btp: 'B.Tech Project',
  mtp: 'M.Tech Project',
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
  projectStatus: Type.String(),
  createdAt: Type.String(),
  profKerberos: Type.String(),
  title: Type.String(),
  description: Type.String(),
  projectType: Type.Array(Type.String()),
  duration: Type.Array(Type.String()),
  eligibleDegrees: Type.Optional(Nullable(Type.Array(Type.String()))),
  eligibleDepartments: Type.Optional(Nullable(Type.Array(Type.String()))),
  vacancy: Type.Integer(),
  minCgpa: Type.Optional(Nullable(Type.String())),
  minYear: Type.Optional(Nullable(Type.Integer())),
  prerequisites: Type.Optional(Nullable(Type.String())),
  learningOutcomes: Type.Optional(Nullable(Type.String())),
  selectionProcedure: Type.Optional(Nullable(Type.String())),
  lastApplyDate: Type.String(),
  stipendProvided: Type.Boolean(),
  stipendAmount: Type.Optional(Nullable(Type.Integer())),
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

export interface ProjectTSType {
  id: string
  projectStatus: ProjectStatus
  createdAt: Date
  profKerberos: string
  title: string
  description: string
  projectType: ProjectType[]
  duration: ProjectDuration[]
  eligibleDegrees?: DegreeCode[]
  eligibleDepartments?: DeptCode[]
  vacancy: number
  minCgpa?: string
  minYear?: number
  prerequisites?: string
  learningOutcomes?: string
  selectionProcedure?: string
  lastApplyDate: Date
  stipendProvided: boolean
  stipendAmount?: number
}

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
