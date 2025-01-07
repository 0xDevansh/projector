import { DataSource } from 'typeorm'
import { Professor } from './models/Professor.js'
import { Student } from './models/Student.js'
import { User } from './models/User.js'
import 'reflect-metadata'

const AppDataSource = new DataSource({
  type: 'sqlite',
  database: 'projector.db',
  entities: [User, Student, Professor],
  synchronize: true,
})

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

const studentRepo = AppDataSource.getRepository(Student)
const profRepo = AppDataSource.getRepository(Professor)

interface StudentUser { user: User, type: 'student', student?: Student }
interface ProfUser { user: User, type: 'prof', prof?: Professor }
type ExtendedUser = StudentUser | ProfUser

export async function initDatabase() {
  await AppDataSource.initialize()
  console.log('Initialized database')
}

export async function getExtendedUserByKerberos(kerberos: string): Promise<ExtendedUser | null> {
  const user = await AppDataSource.getRepository(User).findOneBy({ email: kerberos })
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

export async function createUser(email: string, name: string, type: UserType, deptCode?: string) {
  if (!email.includes('@'))
    throw new Error('Invalid email')

  await AppDataSource.createQueryBuilder()
    .insert()
    .into(User)
    .values([{
      email,
      name,
      type,
      deptCode,
      kerberos: email.split('@')[0],
    }])
    .execute()
}

export async function addStudent(kerberos: string, degree: DegreeCode, cgpa: string, bio?: string, resumePath?: string) {
  await AppDataSource.createQueryBuilder()
    .insert()
    .into(Student)
    .values([{
      kerberos,
      bio,
      degree,
      cgpa,
      resumePath,
    }])
    .execute()
}

export async function addProf(kerberos: string, areasOfResearch: string) {
  await AppDataSource.createQueryBuilder()
    .insert()
    .into(Professor)
    .values([{
      kerberos,
      areasOfResearch,
    }])
    .execute()
}
