import { JWTPayload } from "src/types"
import { __secrets__ } from "../constants"
import { Router } from 'express'
import { createAccessToken, createRefreshToken, sendRefreshToken } from "../auth"
import { User } from "../entities/User"
import { verify } from "jsonwebtoken"
import { MikroORM } from "@mikro-orm/core"

export default function (orm: MikroORM): Router {
  const router = Router()

  router.post('/refresh_token', async (req, res) => {
    const token = req.cookies.jid
    if (!token) {
      return res.send({ success: false, accessToken: '' })
    }

    let payload: JWTPayload | null = null

    try {
      payload = verify(token, __secrets__.refresh) as any
      if (payload == null) {
        throw new Error('Invalid token, login again')
      }
    } catch (e) {
      console.error(e)
      return res.send({ success: false, accessToken: '' })
    }

    try {
      const user = await orm.em.findOneOrFail(User, { id: payload!.userId })
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

