import { Column, Entity, PrimaryColumn } from 'typeorm'

@Entity()
export class User {
  @PrimaryColumn()
  email: string

  @Column({ unique: true })
  kerberos: string

  @Column()
  type: string // 'student' | 'prof'

  @Column()
  name: string

  @Column({ nullable: true })
  deptCode: string
}
