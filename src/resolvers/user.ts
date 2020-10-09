import { User } from '../entities/User'
import { PsContext } from 'src/types'
import { Resolver, Mutation, Query, Arg, InputType, Field, Ctx, ObjectType } from 'type-graphql'
import argon2 from 'argon2'
import { __secrets__ } from '../constants'
import { createAccessToken, createRefreshToken } from '../auth'

@InputType()
class EmailPasswordInput {
    @Field()
    email: string

    @Field()
    password: string
}

@ObjectType()
class FieldError {
    @Field()
    field: string

    @Field()
    message: string
}

@ObjectType()
class Auth {
    @Field()
    accessToken?: string

    @Field()
    provider?: 'email' | 'twitter' | 'google'
}

@ObjectType()
class UserResponse {
    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[]

    @Field(() => User, { nullable: true })
    user?: User

    @Field(() => Auth, { nullable: true })
    auth?: Auth
}

@Resolver()
export class UserResolver {
    @Query(() => UserResponse)
    async me(@Ctx() { req, em }: PsContext): Promise<UserResponse> {
        if (!req.session.userId) {
            return {
                errors: [{
                    field: '',
                    message: 'Session has no user id'
                }]
            }
        }

        const user = await em.findOne(User, { id: req.session.userId })
        if (!user) {
            return {
                errors: [{
                    field: 'id',
                    message: `Session user was invalid`
                }]
            }
        }

        return { user }
    }

    @Mutation(() => UserResponse)
    async register(
        @Arg('credentials') credentials: EmailPasswordInput,
        @Ctx() { em }: PsContext
    ): Promise<UserResponse> {
        const { email, password } = credentials
        if (email.length <= 2) {
            return {
                errors: [{
                    field: 'email',
                    message: 'email must be greater than 2'
                }]
            }
        }

        if (password.length <= 3) {
            return {
                errors: [{
                    field: 'password',
                    message: 'password must be greater than 3'
                }]
            }
        }

        try {
            const hashedPassword = await argon2.hash(password)
            const user = em.create(User, { email, password: hashedPassword, username: email })
            await em.persistAndFlush(user)

            return { user }
        } catch (e) {
            const message = e.code == 23505 ? 'username already in use' : 'Unknown error'
            const field = e.code == 23505 ? 'username' : ''
            return {
                errors: [{
                    field,
                    message
                }]
            }
        }
    }

    @Mutation(() => UserResponse)
    async login(
        @Arg('credentials') credentials: EmailPasswordInput,
        @Ctx() { em, res }: PsContext
    ): Promise<UserResponse> {
        const { email, password } = credentials
        const user = await em.findOne(User, { email })
        if (!user) {
            return {
                errors: [{
                    field: 'email',
                    message: `Could not find user`
                }]
            }
        }

        const valid = await argon2.verify(user.password, password)
        if (!valid) {
            return {
                errors: [
                    {
                        field: 'password',
                        message: 'Invalid password'
                    }
                ]
            }
        }

        res.cookie('jid', createRefreshToken(user), { httpOnly: true })

        return {
            user,
            auth: {
                accessToken: createAccessToken(user),
                provider: 'email'
            }
        }
    }
}

