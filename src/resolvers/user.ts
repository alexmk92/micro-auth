import { User } from '../entities/User'
import { PsContext } from 'src/types'
import { Resolver, Mutation, Query, Arg, Ctx, UseMiddleware } from 'type-graphql'
import argon2 from 'argon2'
import { __cacheRoots__, __secrets__ } from '../constants'
import { createAccessToken, createRefreshToken, isAuthenticated, sendRefreshToken } from '../auth'
import { CredentialInput, UserResponse } from '../types.gql'
import { validateLogin, validateRegistration } from '../utils/validate'
import { sendEmail } from '../utils/send-email'
import { v4 } from 'uuid'

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

    @Mutation(() => UserResponse)
    async resetPassword(
        @Arg('password') password: string,
        @Arg('token') token: string,
        @Ctx() { res, em, redis }: PsContext
    ) {
        if (password.length <= 2) {
            return {
                errors: [
                    {
                        field: 'newPassword',
                        message: 'Length must be greater than 2'
                    }
                ]
            }
        }

        const cacheKey = `${__cacheRoots__.forgotPassword}:${token}`
        const userId = await redis.get(cacheKey)

        if (!userId) {
            return {
                errors: [{
                    field: 'other',
                    message: 'Refresh token expired, please request a new link'
                }]
            }
        }

        await redis.del(cacheKey)
        const user = await em.findOne(User, { id: userId })
        if (!user) {
            return {
                errors: [{
                    field: 'other',
                    message: 'unknown user'
                }]
            }
        }

        user.password = await argon2.hash(password)
        await em.persistAndFlush(user)

        sendRefreshToken(res, createRefreshToken(user!))

        return {
            user,
            auth: {
                accessToken: createAccessToken(user!),
                provider: 'email'
            }
        }
    }

    @Mutation(() => Boolean)
    async forgotPassword(
        @Arg('email') email: string,
        @Ctx() { em, redis }: PsContext
    ) {
        const user = await em.findOne(User, { email })
        if (!user) {
            // Protect against phishing...
            return true
        }

        const token = v4()
        const expiry = (1000 * 60 * 60 * 24 * 3) // 3 days
        await redis.set(`${__cacheRoots__.forgotPassword}:${token}`, user.id, 'ex', expiry)
        const html = `<a href="http://localhost:3001/reset-password/${token}">Reset password</a> this link will expire in 3 days!`
        await sendEmail(email, 'Reset your posterspy password', html);

        return true
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
        const errors = validateRegistration(email, password)
        if (errors.length > 0) {
            return { errors }
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
            const message = e.code == 23505 ? 'email already in use' : 'Unknown error'
            const field = e.code == 23505 ? 'email' : ''
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
        const searchCriteria = email.includes('@') ? { email } : { username: email }
        const user = await em.findOne(User, searchCriteria)
        const errors = await validateLogin(user, password)
        if (errors.length > 0) {
            return { errors }
        }

        sendRefreshToken(res, createRefreshToken(user!))

        return {
            user: user!,
            auth: {
                accessToken: createAccessToken(user!),
                provider: 'email'
            }
        }
    }
}

