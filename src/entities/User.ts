import { HasuraPermissions, HasuraRole } from 'src/types';
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

    validUserId = (): Boolean => {
        return this.getId() !== 'GUEST'
    }

    getId = (): string => {
        if (this.id !== null) {
            return this.id
        }

        return 'GUEST'
    }

    getHasuraPermissions = (): HasuraPermissions => {
        const validUserId = this.validUserId()

        const allowedRoles: HasuraRole[] = validUserId
            ? ['guest', 'user']
            : ['guest']

        const defaultRole: HasuraRole = validUserId
            ? 'user'
            : 'guest'

        const userRole = defaultRole // in future make this a property on user

        const permissions: HasuraPermissions = {
            'x-hasura-user-id': this.getId(),
            'x-hasura-allowed-roles': allowedRoles,
            'x-hasura-default-role': defaultRole
        }

        if (userRole) {
            permissions['x-hasura-user-role'] = userRole
        }

        return permissions
    }
}
