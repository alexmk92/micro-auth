import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { ObjectType, Field, Int } from 'type-graphql'

@ObjectType()
@Entity()
export class User {
    @Field(() => String)
    @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
    id!: string

    @Field(() => String)
    @Property({ type: 'text', unique: true })
    email!: string;

    @Field(() => String)
    @Property({ type: 'text', unique: true })
    username!: string

    @Property()
    password!: string

    @Field(() => String)
    @Property({ type: 'text', nullable: true })
    bio: string

    @Field(() => String)
    @Property({ type: 'date' })
    createdAt = new Date()

    @Field(() => String)
    @Property({ type: 'date', onUpdate: () => new Date() })
    updatedAt = new Date()

    @Field(() => Int)
    @Property({ default: 0 })
    tokenVersion: number

    @Field(() => String)
    @Property({ nullable: true })
    twitter_id: String

    @Field(() => String)
    @Property({ nullable: true })
    twitter_username: String

    @Field(() => String)
    @Property({ nullable: true })
    facebook_id: String

    @Field(() => String)
    @Property({ nullable: true })
    facebook_username: String
}
