import { Field } from 'type-graphql'
import { Entity, Column, CreateDateColumn, UpdateDateColumn, BaseEntity, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class Profile extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ type: 'uuid', nullable: false })
  userId: string

  @Column({ nullable: true })
  avatarUrl: string

  @Column({ nullable: true })
  coverPhotoUrl: string

  @Column({ nullable: true })
  bio: string

  @Field(() => String)
  @Column({ nullable: true, name: 'twitter_id' })
  twitterId: String

  @Field(() => String)
  @Column({ nullable: true, name: 'twitter_username' })
  twitterUsername: String

  @Field(() => String)
  @Column({ nullable: true, name: 'facebook_id' })
  facebookId: String

  @Field(() => String)
  @Column({ nullable: true, name: 'facebook_username' })
  facebookUsername: String

  @Field(() => Boolean)
  @Column({ nullable: true, name: 'confirmed_email' })
  confirmedEmail: boolean

  @Field(() => Boolean)
  @Column({ default: false })
  hasSetupAccount: boolean

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
