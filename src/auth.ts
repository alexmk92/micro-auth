import { __secrets__ } from "./constants";
import { User } from './entities/User';
import { sign } from 'jsonwebtoken'

export const createAccessToken = (user: User, minutesToLive: number = 15): string => {
  const { id, email } = user

  return sign(
    { userId: id, email },
    __secrets__.jwt,
    { expiresIn: `${minutesToLive}m` }
  )
}

export const createRefreshToken = (user: User, daysToLive: number = 7): string => {
  const { id, email } = user

  return sign(
    { userId: id, email },
    __secrets__.refresh,
    { expiresIn: `${daysToLive}d` }
  )
}
