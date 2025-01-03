import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './User.js';

@Entity()
export class Professor {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  email: string

  @Column()
  username: string

  @Column('text', { nullable: true })
  areasOfResearch: string // 'student' | 'prof'

  @OneToOne(() => User)
  @JoinColumn()
  user: User
}