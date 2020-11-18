import { JWTPayload } from "src/types"
import { __secrets__ } from "../constants"
import { Router, Response } from 'express'
import { createAccessToken, createRefreshToken, sendRefreshToken } from "../auth"
import { User } from "../entities/User"
import { verify } from "jsonwebtoken"

export default function (): Router {
  const router = Router()

  const loginAsGuest = async (res: Response) => {
    let u = new User()
    u.email = ''
    u.id = 'GUEST'
    u.tokenVersion = 0

    console.info('Generating a guest access token')

    sendRefreshToken(res, createRefreshToken(u))

    return res.send({ success: true, accessToken: createAccessToken(u) })
  }

  router.post('/refresh_token', async (req, res) => {
    const token = req.cookies.jid
    if (!token) {
      return loginAsGuest(res)
    }

    let payload: JWTPayload | null = null

    try {
      payload = verify(token, __secrets__.refresh) as any
      if (payload?.userId === 'GUEST') {
        throw new Error('Validated guest token')
      }
      if (payload == null) {
        throw new Error('Invalid token, login again')
      }
    } catch (e) {
      console.error(e)
      //console.error(e)
      return loginAsGuest(res)
    }

    try {
      const user = await User.findOneOrFail({ id: payload!.userId })
      // Ensure that the refresh token version matches that of the JWT
      if (user.tokenVersion !== payload.tokenVersion) {
        throw new Error('Token version mismatch, login again')
      }
      // Ensure that the refresh token is updated so that the user can keep
      // requesting tokens for more than 7d
      sendRefreshToken(res, createRefreshToken(user))
      return res.send({ success: true, accessToken: createAccessToken(user) })
    } catch (e) {
      console.error(e)
      return res.send({ success: false, accessToken: '' })
    }
  })

  return router
}

