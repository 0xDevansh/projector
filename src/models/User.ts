import { Column, Entity, PrimaryColumn } from 'typeorm'

@Entity()
export class User {
  @PrimaryColumn('text')
  email: string

  @Column('text', { unique: true })
  kerberos: string

  @Column('text')
  type: string // 'student' | 'prof'

  @Column('text')
  name: string

  @Column('text', { nullable: true })
  deptCode: string
}
