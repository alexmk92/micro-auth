import { User } from '../entities/User'
import { PsContext } from 'src/types'
import { Resolver, Mutation, Query, Arg, Ctx, UseMiddleware } from 'type-graphql'
import argon2 from 'argon2'
import { __secrets__ } from '../constants'
import { createAccessToken, createRefreshToken, isAuthenticated, sendRefreshToken } from '../auth'
import { CredentialInput, UserResponse } from '../types.gql'

@Resolver()
export class UserResolver {
    @Query(() => String)
    @UseMiddleware(isAuthenticated)
    async test(@Ctx() { payload }: PsContext) {
        return `your user id is: ${payload!.userId}`
    }

    @Query(() => UserResponse)
    @UseMiddleware(isAuthenticated)
    async me(@Ctx() { payload, em }: PsContext): Promise<UserResponse> {
        try {
            const user = await em.findOneOrFail(User, { id: payload!.userId })
            return { user }
        } catch {
            return {
                errors: [{
                    field: 'id',
                    message: `Invalid user id passed.`
                }]
            }
        }
    }

    @Mutation(() => Boolean)
    async revokeRefreshTokensForUser(
        @Arg('userId', () => String) userId: string,
        @Ctx() { em }: PsContext
    ): Promise<Boolean> {
        try {
            const user = await em.findOneOrFail(User, { id: userId })
            user.tokenVersion++;
            const rowsAffected = await em.nativeUpdate(User, { id: userId }, user)

            return rowsAffected > 0
        } catch {
            return false
        }
    }

    @Mutation(() => UserResponse)
    async register(
        @Arg('credentials') credentials: CredentialInput,
        @Ctx() { em, res }: PsContext
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

            sendRefreshToken(res, createRefreshToken(user))

            return {
                user,
                auth: {
                    accessToken: createAccessToken(user),
                    provider: 'email'
                }
            }
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

    @Mutation(() => Boolean)
    async logout(@Ctx() { res }: PsContext): Promise<Boolean> {
        sendRefreshToken(res, '')
        return true
    }

    @Mutation(() => UserResponse)
    async login(
        @Arg('credentials') credentials: CredentialInput,
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

        sendRefreshToken(res, createRefreshToken(user))

        return {
            user,
            auth: {
                accessToken: createAccessToken(user),
                provider: 'email'
            }
        }
    }
}

