import { HasuraPermissions, HasuraRole } from 'src/types';
import { ObjectType, Field, Int } from 'type-graphql'
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BaseEntity } from 'typeorm'
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

    @Field(() => Profile)
    profile: Profile

    validUserId = (): Boolean => {
        return this.getId() !== 'GUEST'
    }

    static guest = () => {
        return User.create({ id: 'GUEST', email: '', tokenVersion: 0 })
    }

    getId = (): string => {
        if (this.id !== null) {
            return this.id
        }

        return 'GUEST'
    }

    getProfile = async (entityManager?: any): Promise<Profile> => {
        const userId = this.getId()

        let profile = await Profile.findOne({ where: { userId } })

        if (!profile || !profile.id) {
            profile = new Profile()
            profile.userId = userId
            if (entityManager) {
                profile = await entityManager.save(profile) as Profile
            } else {
                profile = await profile.save()
            }
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
