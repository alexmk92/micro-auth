import { Field, ObjectType } from 'type-graphql'
import { Entity, Column, CreateDateColumn, UpdateDateColumn, BaseEntity, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm'
import { User } from './User'

@Entity()
@ObjectType()
export class Profile extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Field()
  @Column({ type: 'uuid', nullable: false })
  userId: string

  @Field()
  @Column({ nullable: true })
  avatarUrl: string

  @Field()
  @Column({ nullable: true })
  coverPhotoUrl: string

  @Field()
  @Column({ nullable: true })
  bio: string

  @Field(() => String)
  @Column({ nullable: true })
  twitterId: String

  @Field(() => String)
  @Column({ nullable: true })
  twitterUsername: String

  @Field(() => String)
  @Column({ nullable: true })
  facebookId: String

  @Field(() => String)
  @Column({ nullable: true })
  facebookUsername: String

  @Field(() => Boolean)
  @Column({ nullable: true })
  confirmedEmail: boolean

  @Field(() => Boolean)
  @Column({ default: false })
  hasSetupAccount: boolean

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(_type => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User
}
