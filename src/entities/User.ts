import { HasuraPermissions, HasuraRole } from 'src/types';
import { ObjectType, Field, Int } from 'type-graphql'
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BaseEntity, getManager, OneToOne, JoinColumn } from 'typeorm'
import { Profile } from './Profile';

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

    @Field(() => Int)
    @Column({ default: 0, name: 'token_version' })
    tokenVersion: number

    @Field(() => String)
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @Field(() => String)
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @OneToOne(_type => Profile, { onDelete: 'CASCADE' })
    @JoinColumn()
    profile: Profile

    validUserId = (): Boolean => {
        return this.getId() !== 'GUEST'
    }

    getId = (): string => {
        if (this.id !== null) {
            return this.id
        }

        return 'GUEST'
    }

    getProfile = async (): Promise<Profile> => {
        const userId = this.getId()

        let profile = await getManager()
            .findOne(Profile, { where: { userId } })

        if (!profile || !profile.id) {
            profile = new Profile()
            profile.userId = userId
            profile = await profile.save()
        }

        return profile
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
