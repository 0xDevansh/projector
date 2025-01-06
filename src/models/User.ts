import { Column, Entity, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

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

  @Column()
  deptCode: string
}