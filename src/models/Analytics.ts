import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class Analytics {
  @PrimaryGeneratedColumn()
  id: number

  @CreateDateColumn()
  createdAt: Date

  @Column('text')
  kerberos: string

  @Column('text')
  userType: string

  @Column('text')
  action: string

  @Column('text', { nullable: true })
  data: string
}
