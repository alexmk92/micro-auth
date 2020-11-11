import { __secrets__ } from "./constants";
import { User } from './entities/User';
import { sign, verify } from 'jsonwebtoken'
import { MiddlewareFn } from 'type-graphql'
import { PsContext } from "./types";
import { Response } from 'express'
import { Provider, SessionResponse } from "./types.gql";

export const createAccessToken = (user: User, minutesToLive?: number): string => {
  const ttl = minutesToLive || 15
  const userId = user.id || 'GUEST'
  const additions = user ? { email: user.email } : {}

  const permissions = user.getHasuraPermissions()

  return sign(
    {
      userId,
      ...additions,
      'https://hasura.io/jwt/claims': {
        'x-hasura-user-id': userId,
        'x-hasura-allowed-roles': permissions.allowedRoles,
        'x-hasura-default-role': permissions.defaultRole
      }
    },
    __secrets__.jwt,
    { expiresIn: `${ttl}m` }
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
  const { req, res } = context
  const authorization = req.headers['authorization']

  if (!authorization) {
    res.status(401)
    return next()
  }

  try {
    const token = authorization!.split(' ')[1]
    console.log(token)
    const payload = verify(token, __secrets__.jwt)

    context.payload = payload as any
  } catch (e) {
    console.log(e)
    res.status(401)
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
