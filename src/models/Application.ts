import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryColumn } from 'typeorm'
import { Project } from './ProfessorProject.js'
import { Student } from './Student.js'

@Entity()
export class Application {
  @PrimaryColumn()
  id: string

  @CreateDateColumn()
  createdAt: Date

  @Column('text')
  studentKerberos: string

  @Column('text')
  projectId: string

  @Column('text')
  relevantSkills: string

  @Column('text')
  statementOfPurpose: string

  @ManyToOne(() => Student, { eager: true })
  student: Student

  @ManyToOne(() => Project, { eager: true })
  project: Project
}
