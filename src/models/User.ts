import { Column, Entity, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import { Student } from './Student.js';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  email: string

  @Column()
  kind: string // 'student' | 'prof'

  @Column()
  name: string

  @Column()
  deptCode: string

  @OneToOne(() => Student, (student) => student.user)
  student: Student
}