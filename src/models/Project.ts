import type { DegreeCode, DeptCode, ProjectDuration, ProjectStatus, ProjectType } from '../types.js'
import { nanoid } from 'nanoid'
import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm'
import { Professor } from './Professor.js'

@Entity()
export class Project {
  @PrimaryColumn({ default: nanoid(8) })
  id: string

  @Column('text', { default: 'draft' })
  status: ProjectStatus

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
  type: ProjectType[]

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

  @OneToOne(() => Professor, { eager: false })
  @JoinColumn()
  prof: Professor
}
