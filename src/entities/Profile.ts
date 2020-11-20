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

  @Field({ nullable: true, name: 'avatar_url' })
  @Column({ nullable: true })
  avatarUrl?: string

  @Field({ nullable: true, name: 'cover_photo_url' })
  @Column({ nullable: true })
  coverPhotoUrl?: string

  @Field({ nullable: true })
  @Column({ nullable: true })
  bio?: string

  @Field({ nullable: true, name: 'twitter_id' })
  @Column({ nullable: true })
  twitterId?: string

  @Field({ nullable: true, name: 'twitter_username' })
  @Column({ nullable: true })
  twitterUsername?: string

  @Field({ nullable: true, name: 'facebook_id' })
  @Column({ nullable: true })
  facebookId?: string

  @Field({ nullable: true, name: 'facebook_username' })
  @Column({ nullable: true })
  facebookUsername?: string

  @Field({ nullable: true, name: 'confirmed_email' })
  @Column({ nullable: true })
  confirmedEmail?: boolean

  @Field({ nullable: true, name: 'has_setup_account' })
  @Column({ default: false })
  hasSetupAccount?: boolean

  @Field({ nullable: true })
  @Column({ nullable: true })
  location?: string

  @Field({ nullable: true })
  @Column({ nullable: true })
  region?: string

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
