import type { DegreeCode } from '../types.js'
import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm'
import { User } from './User.js'

@Entity()
export class Student {
  @PrimaryColumn('text')
  kerberos: string

  @Column('text', { nullable: true })
  bio: string

  @Column('text')
  degree: DegreeCode

  @Column('text', { nullable: true })
  cgpa: string

  @Column('text', { nullable: true })
  resumePath: string

  @Column('int')
  yearOfStudy: number

  @OneToOne(() => User, { eager: true, onUpdate: 'NO ACTION' })
  @JoinColumn()
  user: User
}
