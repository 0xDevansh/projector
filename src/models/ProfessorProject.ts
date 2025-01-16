import type { DegreeCode, DeptCode, ProjectDuration, ProjectStatus, ProjectType } from '../types.js'
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryColumn } from 'typeorm'
import { User } from './User.js'

@Entity()
export class Professor {
  @PrimaryColumn('text', { unique: true })
  kerberos: string

  @Column('text', { nullable: true })
  areasOfResearch: string // 'student' | 'prof'

  @OneToOne(() => User, { eager: true })
  @JoinColumn()
  user: User

  @OneToMany(() => Project, project => project.prof)
  projects: Project[]
}

@Entity()
export class Project {
  @PrimaryColumn()
  id: string

  @Column('text', { default: 'draft' })
  projectStatus: ProjectStatus

  @CreateDateColumn()
  createdAt: Date

  @Column('text')
  profKerberos: string

  @Column('text')
  title: string

  @Column('text')
  description: string

  // https://typeorm.io/entities#simple-array-column-type
  @Column('simple-array')
  projectType: ProjectType[]

  @Column('simple-array')
  duration: ProjectDuration[]

  @Column('int')
  vacancy: number

  @Column('text', { nullable: true })
  minCgpa: string

  @Column('simple-array', { nullable: true })
  eligibleDegrees: DegreeCode[]

  @Column('simple-array', { nullable: true })
  eligibleDepartments: DeptCode[]

  @Column('int', { nullable: true })
  minYear: number

  @Column('text', { nullable: true })
  prerequisites: string

  @Column('text', { nullable: true })
  learningOutcomes: string

  @Column('text', { nullable: true })
  selectionProcedure: string

  @Column('date')
  lastApplyDate: Date

  @Column('boolean')
  stipendProvided: boolean

  @Column('int', { nullable: true })
  stipendAmount: number

  @ManyToOne(() => Professor, prof => prof.projects, { eager: true })
  prof: Professor
}
