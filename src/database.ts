import type { Static } from '@sinclair/typebox'
import type {
  DegreeCode,
  DeptCode,
  ExtendedUser,
  ProjectDuration,
  ProjectFilterType,
  ProjectTSType,
  ProjectType,
  UserType,
} from './types.js'
import { nanoid } from 'nanoid'
import { DataSource } from 'typeorm'
import { Analytics } from './models/Analytics.js'
import { Application } from './models/Application.js'
import { Professor, Project } from './models/ProfessorProject.js'
import { Student } from './models/Student.js'
import { User } from './models/User.js'
import 'reflect-metadata'

const AppDataSource = new DataSource({
  type: 'sqlite',
  database: 'projector.db',
  entities: [User, Student, Professor, Project, Application, Analytics],
  synchronize: true,
})

const studentRepo = AppDataSource.getRepository(Student)
const profRepo = AppDataSource.getRepository(Professor)
const userRepo = AppDataSource.getRepository(User)
const projectRepo = AppDataSource.getRepository(Project)
const applicationRepo = AppDataSource.getRepository(Application)

export async function initDatabase() {
  await AppDataSource.initialize()
  console.log('Initialized database')
}

export async function getStudent(kerberos: string) {
  return await studentRepo.findOneBy({ kerberos })
}

export function getUser(kerberos: string) {
  return userRepo.findOneBy({ kerberos })
}

export async function getExtendedUserByKerberos(kerberos: string): Promise<ExtendedUser | null> {
  const user = await userRepo.findOneBy({ kerberos })
  if (!user)
    return null

  if (user.type === 'student') {
    // get student
    const student = await studentRepo.findOneBy({ kerberos }) ?? undefined
    return { user, type: 'student', student }
  }
  else {
    // get prof
    const prof = await profRepo.findOneBy({ kerberos }) ?? undefined
    return { user, type: 'prof', prof }
  }
}

const kerberosToDeptCode = {
  am: 'am',
  ch: 'chemical',
  ce: 'civil',
  cs: 'cse',
  dd: 'design',
  ee: 'ee',
  ms: 'mse',
  mt: 'maths',
  me: 'mech',
  ph: 'physics',
  tt: 'textile',
}

export async function createOrUpdateUser(data: { email?: string, name?: string, type?: UserType, deptCode?: string }) {
  if (!data.email?.includes('@'))
    throw new Error('Invalid email')
  const kerberos = data.email?.split('@')[0]

  let dCode = data.deptCode
  const kerberosStarter = kerberos.substring(0, 2)
  if (!dCode && kerberosStarter in kerberosToDeptCode) {
    dCode = kerberosToDeptCode[kerberosStarter as keyof typeof kerberosToDeptCode]
  }

  await AppDataSource.createQueryBuilder()
    .insert()
    .into(User)
    .values([{
      ...data,
      kerberos,
      deptCode: dCode,
    }])
    .orUpdate(['deptCode', 'type'], ['kerberos'])
    .execute()
}

export async function addOrUpdateStudent(kerberos: string, degree: DegreeCode, cgpa: string, yearOfStudy: number, bio?: string, resumePath?: string) {
  const user = await userRepo.findOneBy({ kerberos })
  if (!user)
    return
  await AppDataSource.createQueryBuilder()
    .insert()
    .into(Student)
    .values([{
      kerberos,
      bio,
      degree,
      cgpa,
      resumePath,
      user,
      yearOfStudy,
    }])
    .orUpdate(['bio', 'degree', 'cgpa', 'resumePath', 'yearOfStudy'], ['kerberos'])
    .execute()
}

export async function addOrUpdateProf(data: { kerberos: string, areasOfResearch?: string }) {
  const user = await userRepo.findOneBy({ kerberos: data.kerberos })
  if (!user)
    return
  await AppDataSource.createQueryBuilder()
    .insert()
    .into(Professor)
    .values([{
      kerberos: data.kerberos,
      areasOfResearch: data.areasOfResearch,
      user,
    }])
    .orUpdate(['areasOfResearch'], ['kerberos'])
    .execute()
}

// check if user exists, if not, create one
export async function authUserCheck(email: string, name: string) {
  const user = await getExtendedUserByKerberos(email.split('@')[0])
  if (!user) {
    await createOrUpdateUser({ email, name, type: 'student' })
    return await getExtendedUserByKerberos(email.split('@')[0])
  }
  return user
}

export async function getProjectById(id?: string) {
  return await projectRepo.findOneBy({ id })
}

export async function getProjects(filter: Partial<Static<typeof ProjectFilterType>>, getDrafts = false) {
  let qBuilder = projectRepo.createQueryBuilder('user')
    // .select('*')
    .leftJoinAndSelect('user.prof', 'prof')
    .leftJoinAndSelect('prof.user', 'profUser')

  if (!getDrafts)
    qBuilder = qBuilder.where(`projectStatus = 'open'`)

  if (filter.profKerberos)
    qBuilder = qBuilder.andWhere(`profKerberos = :profKerberos`, { profKerberos: filter.profKerberos })
  if (filter.stipendProvided)
    qBuilder = qBuilder.andWhere(`stipendProvided = :stipendProvided`, { stipendProvided: filter.stipendProvided })
  if (filter.minYear)
    qBuilder = qBuilder.andWhere(`minYear <= :minYear`, { minYear: filter.minYear })
  if (filter.applyDateNotPassed)
    qBuilder = qBuilder.andWhere(`lastApplyDate >= :now`, { now: new Date().toISOString() })

  return (await qBuilder.getMany())
    .filter((p) => {
      const criteria: boolean[] = []
      if (filter.projectType) {
        const types = filter.projectType.split(',')
        criteria.push(types.some(type => p.projectType.includes(type as ProjectType)))
      }
      if (filter.duration) {
        const durations = filter.duration.split(',')
        criteria.push(durations.some(dur => p.duration.includes(dur as ProjectDuration)))
      }
      if (filter.eligibleDegrees && p.eligibleDegrees) {
        const eDegrees = filter.eligibleDegrees.split(',')
        criteria.push(eDegrees.some(deg => p.eligibleDegrees.includes(deg as DegreeCode)))
      }
      if (filter.eligibleDepartments && p.eligibleDepartments) {
        const eDepts = filter.eligibleDepartments.split(',')
        criteria.push(eDepts.some(dept => p.eligibleDepartments.includes(dept as DeptCode)))
      }
      return criteria.every(c => c)
    })
}

export async function addProject(project: Partial<ProjectTSType>) {
  const prof = await profRepo.findOneBy({ kerberos: project.profKerberos })
  if (!prof)
    throw new Error('Professor not found')
  const id = nanoid(8)
  await AppDataSource.createQueryBuilder()
    .insert()
    .into(Project)
    .values([{ ...project, id, prof }])
    .execute()
  return id
}

export async function updateProject(id: string, updates: Partial<Project>) {
  await AppDataSource.createQueryBuilder()
    .update(Project)
    .set(updates)
    .where('id = :id', { id })
    .execute()
}

export async function addOrUpdateApplication(data: { projectId: string, studentKerberos: string, relevantSkills?: string, statementOfPurpose?: string }) {
  const project = await projectRepo.findOneBy({ id: data.projectId })
  if (!project)
    throw new Error('Project not found')
  const student = await studentRepo.findOneBy({ kerberos: data.studentKerberos })
  if (!student)
    throw new Error('Student not found')
  const id = nanoid(8)
  // check if an application already exists
  const existing = await applicationRepo.findOneBy({ projectId: data.projectId, studentKerberos: data.studentKerberos })
  if (!existing)
    await applicationRepo.insert({ id, ...data, project, student })
  else
    await applicationRepo.update({ statementOfPurpose: data.statementOfPurpose, relevantSkills: data.relevantSkills }, { id: existing.id })
}

export async function getApplications(projectId: string, studentKerberos?: string) {
  let qBuilder = applicationRepo.createQueryBuilder('application')
    // .select('*')
    .leftJoinAndSelect('application.student', 'student')
    .leftJoinAndSelect('student.user', 'studentUser')
    .where('projectId = :projectId', { projectId })
  if (studentKerberos)
    qBuilder = qBuilder.andWhere('studentKerberos = :studentKerberos', { studentKerberos })
  return await qBuilder.getMany()
}

export async function getApplicationsForStudent(studentKerberos: string) {
  const qBuilder = applicationRepo.createQueryBuilder('application')
    // .select('*')
    .leftJoinAndSelect('application.student', 'student')
    .leftJoinAndSelect('student.user', 'studentUser')
    .leftJoinAndSelect('application.project', 'project')
    .leftJoinAndSelect('project.prof', 'prof')
    .leftJoinAndSelect('prof.user', 'profUser')
    .where('studentKerberos = :studentKerberos', { studentKerberos })
  return await qBuilder.getMany()
}

export async function getAppliedProjectIds(studentKerberos: string) {
  const qBuilder = applicationRepo.createQueryBuilder('application')
    .select('projectId')
    .from(Application, 'application')
    .where('studentKerberos = :studentKerberos', { studentKerberos })
  return await qBuilder.getMany()
}

export function getApplicationById(id: string) {
  return applicationRepo.findOneBy({ id })
}

export async function updateResumePath(kerberos: string, resumePath: string) {
  await AppDataSource.createQueryBuilder()
    .update(Student)
    .set({ resumePath })
    .where('kerberos = :kerberos', { kerberos })
    .execute()
}

export async function addLoginLog(kerberos: string, userType: string) {
  await AppDataSource.createQueryBuilder()
    .insert()
    .into(Analytics)
    .values([{ kerberos, userType, action: 'login' }])
    .execute()
}

export async function addLogoutLog(kerberos: string, userType: UserType) {
  await AppDataSource.createQueryBuilder()
    .insert()
    .into(Analytics)
    .values([{ kerberos, userType, action: 'logout' }])
    .execute()
}
