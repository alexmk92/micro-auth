import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { ObjectType, Field } from 'type-graphql'

@ObjectType()
@Entity()
export class Project {
    @Field(() => String)
    @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_u' })
    id!: string

    @Field(() => String)
    @Property({ type: 'date' })
    createdAt = new Date()

    @Field(() => String)
    @Property({ type: 'date', onUpdate: () => new Date() })
    updatedAt = new Date()

    @Field(() => String)
    @Property({ type: 'text' })
    title!: string

    @Field(() => String)
    @Property({ type: 'text' })
    description!: string
}
