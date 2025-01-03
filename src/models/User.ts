import { Column, Entity, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

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
}