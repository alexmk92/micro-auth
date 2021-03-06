import { User } from '../entities/User'
import { PsContext } from 'src/types'
import { Resolver, Mutation, Query, Arg, Ctx, UseMiddleware } from 'type-graphql'
import argon2 from 'argon2'
import { __cacheRoots__, __domain__, __secrets__ } from '../constants'
import { createAccessToken, createRefreshToken, isAuthenticated, sendRefreshToken } from '../auth'
import { ConfirmEmailResponse, CredentialInput, UserResponse } from '../types.gql'
import { validateLogin, validateRegistration } from '../utils/validate'
import { sendEmail } from '../utils/send-email'
import { v4 } from 'uuid'
import { sendConfirmAccountEmail } from '../utils/confirm-account-email'

@Resolver()
export class UserResolver {
    @Query(() => String)
    @UseMiddleware(isAuthenticated)
    async test(@Ctx() { payload }: PsContext) {
        return `your user id is: ${payload!.userId}`
    }

    @Query(() => UserResponse)
    @UseMiddleware(isAuthenticated)
    async me(@Ctx() { payload }: PsContext): Promise<UserResponse> {
        try {
            const user = await User.findOneOrFail({ id: payload!.userId })
            user.profile = await user.getProfile()

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
        @Ctx() { res, redis }: PsContext
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
        const user = await User.findOne({ id: userId })

        if (!user) {
            return {
                errors: [{
                    field: 'other',
                    message: 'Refresh token expired, please request a new link'
                }]
            }
        }

        const profile = await user.getProfile()
        if (!profile.confirmedEmail) {
            await sendConfirmAccountEmail(user)
            return {
                errors: [{
                    field: 'other',
                    message: 'You need to confirm your email address before you can reset your password!'
                }]
            }
        }

        user.password = await argon2.hash(password)
        await user.save()
        await redis.del(cacheKey)
        // We no longer need to redirect the user to a confirmation if we reset
        await redis.del(`${__cacheRoots__.userResetTokens}:${userId}`)

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
        @Ctx() { redis }: PsContext
    ) {
        const user = await User.findOne({ email })
        if (!user) {
            // Protect against phishing...
            return true
        }

        const profile = await user.getProfile()
        if (!profile.confirmedEmail) {
            await sendConfirmAccountEmail(user)
        }

        const token = v4()
        const expiry = (1000 * 60 * 60 * 24 * 3) // 3 days
        await redis.set(`${__cacheRoots__.forgotPassword}:${token}`, user.id, 'ex', expiry)
        await redis.set(`${__cacheRoots__.userResetTokens}:${user.id}`, token, 'ex', expiry)
        const html = `<a href="${__domain__}/reset-password/${token}">Reset password</a> this link will expire in 3 days!`
        await sendEmail(email, 'Reset your posterspy password', html);

        return true
    }

    @Mutation(() => Boolean)
    async revokeRefreshTokensForUser(
        @Arg('userId', () => String) userId: string
    ): Promise<Boolean> {
        try {
            const user = await User.findOneOrFail({ id: userId })
            user.tokenVersion++;
            const rows = await User.update({ id: userId }, user)

            return rows.affected ? rows.affected > 0 : false
        } catch {
            return false
        }
    }

    @Mutation(() => UserResponse)
    async register(
        @Arg('credentials') credentials: CredentialInput,
        @Ctx() { res }: PsContext
    ): Promise<UserResponse> {
        const { email, password } = credentials
        const errors = validateRegistration(email, password)
        if (errors.length > 0) {
            return { errors }
        }

        try {
            const hashedPassword = await argon2.hash(password)
            const user = await User.create({ email, password: hashedPassword, username: email }).save()

            sendRefreshToken(res, createRefreshToken(user))
            await sendConfirmAccountEmail(user)

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
        sendRefreshToken(res, createRefreshToken(User.guest()))
        return true
    }

    @Mutation(() => ConfirmEmailResponse)
    async confirmEmail(
        @Arg('token') token: String,
        @Ctx() { res, redis }: PsContext
    ): Promise<ConfirmEmailResponse> {
        try {
            const cacheKey = `${__cacheRoots__.confirmAccount}:${token}`
            const userId = await redis.get(cacheKey);
            const user = await User.findOneOrFail(userId)
            const profile = await user.getProfile()
            profile.confirmedEmail = true
            profile.save()
            await redis.del(cacheKey)

            sendRefreshToken(res, createRefreshToken(user))

            return {
                didConfirm: true,
                resetPasswordToken: await redis.get(`${__cacheRoots__.userResetTokens}:${userId}`) || '',
                errors: []
            }
        } catch (e) {
            return {
                didConfirm: false,
                resetPasswordToken: '',
                errors: [
                    { field: 'other', message: 'Failed to confirm your account' }
                ]
            }
        }
    }

    @Mutation(() => UserResponse)
    async login(
        @Arg('credentials') credentials: CredentialInput,
        @Ctx() { res }: PsContext
    ): Promise<UserResponse> {
        const { email, password } = credentials
        const searchCriteria = email.includes('@') ? { email } : { username: email }
        const user = await User.findOne(searchCriteria)
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

