import { ObjectType, Field, Int } from 'type-graphql'
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BaseEntity } from 'typeorm'

@ObjectType()
@Entity()
export class User extends BaseEntity {
    @Field(() => String)
    @PrimaryGeneratedColumn('uuid')
    id!: string

    @Field(() => String)
    @Column({ unique: true })
    email!: string;

    @Field(() => String)
    @Column({ unique: true })
    username!: string

    @Column({ nullable: true })
    password!: string

    @Field(() => String)
    @Column({ nullable: true })
    bio: string

    @Field(() => Int)
    @Column({ default: 0, name: 'token_version' })
    tokenVersion: number

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

    @Field(() => String)
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @Field(() => String)
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
