import 'reflect-metadata'
import { DataSource } from 'typeorm';
import { User } from './models/User.js';
import { Student } from './models/Student.js';
import { Professor } from './models/Professor.js';

const AppDataSource = new DataSource({
  type: 'sqlite',
  database: 'projector.db',
  entities: [User],
  synchronize: true
})

const studentRepo = AppDataSource.getRepository(Student)
const profRepo = AppDataSource.getRepository(Professor)

type StudentUser = { user: User, type: 'student', student?: Student }
type ProfUser = { user: User, type: 'prof', prof?: Professor }
type ExtendedUser = StudentUser | ProfUser

export async function initDatabase() {
  await AppDataSource.initialize()
  console.log('Initialized database');
}

export async function getExtendedUserByKerberos(kerberos: string): Promise<ExtendedUser|null> {
  const user = await AppDataSource.getRepository(User).findOneBy({ email: kerberos })
  if (!user) return null

  if (user.type == 'student') {
    // get student
    const student = await studentRepo.findOneBy({ kerberos }) ?? undefined
    return { user, type: 'student', student }
  } else {
    // get prof
    const prof = await profRepo.findOneBy({ kerberos }) ?? undefined
    return { user, type: 'prof', prof }
  }
}