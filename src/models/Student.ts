import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './User.js';

@Entity()
export class Student {
  @PrimaryColumn()
  @Column({ unique: true })
  kerberos: string

  @Column('text', { nullable: true })
  bio: string

  @Column()
  degree: string

  @Column({ nullable: true })
  cgpa: string

  @Column({ nullable: true })
  resumePath: string

  @OneToOne(() => User)
  @JoinColumn()
  user: User
}