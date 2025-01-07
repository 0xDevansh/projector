import type { DegreeCode, DeptCode, ProjectDuration, ProjectStatus, ProjectType } from '../database.js'
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ default: 'open' })
  status: ProjectStatus

  @Column()
  profKerberos: string

  @Column()
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
}
