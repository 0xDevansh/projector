import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm'
import { User } from './User.js'

@Entity()
export class Professor {
  @PrimaryColumn()
  kerberos: string

  @Column('text', { nullable: true })
  areasOfResearch: string // 'student' | 'prof'

  @OneToOne(() => User)
  @JoinColumn()
  user: User
}
