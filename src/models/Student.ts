import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './User.js';

@Entity()
export class Student {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  email: string

  @Column()
  kerberos: string

  @Column('text')
  bio: string // 'student' | 'prof'

  @Column()
  name: string

  @OneToOne(() => User, (user) => user.student)
  @JoinColumn()
  user: User
}