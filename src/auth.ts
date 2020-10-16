import { __secrets__ } from "./constants";
import { User } from './entities/User';
import { sign, verify } from 'jsonwebtoken'
import { MiddlewareFn } from 'type-graphql'
import { PsContext } from "./types";
import { Response } from 'express'
import { Provider, SessionResponse } from "./types.gql";

export const createAccessToken = (user: User, minutesToLive: number = 15): string => {
  const { id, email } = user

  return sign(
    { userId: id, email },
    __secrets__.jwt,
    { expiresIn: `${minutesToLive}m` }
  )
}

export const createRefreshToken = (user: User, daysToLive: number = 7): string => {
  const { id, email, tokenVersion } = user

  return sign(
    {
      userId: id, email, tokenVersion
    },
    __secrets__.refresh,
    { expiresIn: `${daysToLive}d` }
  )
}

export const sendRefreshToken = (res: Response, token: string) => {
  res.cookie('jid', token, {
    httpOnly: true,
    //path: '/refresh_token'
    // domain: '.domain.com' // For prod only!
  })
}

export const isAuthenticated: MiddlewareFn<PsContext> = ({ context }, next) => {
  const { req } = context
  const authorization = req.headers['authorization']

  if (!authorization) {
    throw new Error('Not authenticated')
  }

  try {
    const token = authorization?.split(' ')[1]
    console.log(token)
    const payload = verify(token, __secrets__.jwt)

    context.payload = payload as any
  } catch (e) {
    console.log(e)
    throw new Error('Not authenticated')
  }

  return next()
}

export const initialiseSession = (res: Response, user: User, provider: Provider): SessionResponse => {
  sendRefreshToken(res, createRefreshToken(user))

  return {
    user,
    auth: {
      accessToken: createAccessToken(user),
      provider
    }
  }
}
