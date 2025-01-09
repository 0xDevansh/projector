import type { DegreeCode, ExtendedUser, UserType } from './types.js'
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

const studentRepo = AppDataSource.getRepository(Student)
const profRepo = AppDataSource.getRepository(Professor)
const userRepo = AppDataSource.getRepository(User)

export async function initDatabase() {
  await AppDataSource.initialize()
  console.log('Initialized database')
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

export async function createOrUpdateUser(data: { email?: string, name?: string, type?: UserType, deptCode?: string }) {
  if (!data.email?.includes('@'))
    throw new Error('Invalid email')

  await AppDataSource.createQueryBuilder()
    .insert()
    .into(User)
    .values([{
      ...data,
      kerberos: data.email?.split('@')[0],
    }])
    .orUpdate(['deptCode', 'type'], ['email'])
    .execute()
}

export async function addOrUpdateStudent(kerberos: string, degree: DegreeCode, cgpa: string, bio?: string, resumePath?: string) {
  await AppDataSource.createQueryBuilder()
    .insert()
    .into(Student)
    .values([{
      kerberos,
      bio,
      degree,
      cgpa,
      resumePath,
      user: { kerberos },
    }])
    .orUpdate(['bio', 'degree', 'cgpa', 'resumePath'], ['kerberos'])
    .execute()
}

export async function addOrUpdateProf(data: { kerberos: string, areasOfResearch?: string }) {
  await AppDataSource.createQueryBuilder()
    .insert()
    .into(Professor)
    .values([{
      kerberos: data.kerberos,
      areasOfResearch: data.areasOfResearch,
      user: { kerberos: data.kerberos },
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
