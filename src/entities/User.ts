import { ObjectType, Field, Int } from 'type-graphql'
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BaseEntity } from 'typeorm'

@ObjectType()
@Entity()
export class User extends BaseEntity {
    @Field(() => String)
    @PrimaryGeneratedColumn('uuid', { name: 'id' })
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
    @Column({ default: 0 })
    tokenVersion: number

    @Field(() => String)
    @Column({ nullable: true })
    twitter_id: String

    @Field(() => String)
    @Column({ nullable: true })
    twitter_username: String

    @Field(() => String)
    @Column({ nullable: true })
    facebook_id: String

    @Field(() => String)
    @Column({ nullable: true })
    facebook_username: String

    @Field(() => String)
    @Column({ default: false })
    confirmed_email: Boolean

    @Field(() => String)
    @CreateDateColumn()
    createdAt: Date;

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt: Date;
}
