import { MikroORM } from '@mikro-orm/core'
import { Router } from 'express'
import passport from 'passport'
import { __domain__ } from '../constants'
import { providers } from '../provider-registry'
import { sendRefreshToken } from '../auth'
import { Response } from 'express'

export default function (_orm: MikroORM): Router {
  const router = Router()

  const flushUnwantedCookies = (res: Response) => {
    res.clearCookie('qid')
    res.clearCookie('connect.sid')
  }

  /**
   * Send the serialized refresh token back to the user in the jid
   * cookie and then rejoice in the fact we can auth with
   * social providers.  Once authed we literally dont care
   * about any of the other info the provider sent back
   * the auth flow is now fully managed by our refresh/access token
   */
  router.get('/success', (req, res) => {
    flushUnwantedCookies(res)

    const token: string = req.user as string
    sendRefreshToken(res, token)

    res.redirect(__domain__)
  })

  router.get('/failure', (_req, res) => {
    flushUnwantedCookies(res)
    // just BS that this was unauthorized for now...
    res.status(401).redirect(__domain__)
  })

  /**
   * Any registered providers will get "smart" loaded here.
   * 
   * Passport will handle the authentication with the OAuth service
   * and will then call back to the passport.serializeUser method
   * which generates a refresh token, that refresh token is
   * then forwarded to the successRedirect method which 
   * currently sends us back to our application.
   * 
   * This success callback sets the jid with the newly
   * created refresh token to allow users to then
   * request and use an access token 
   */
  providers.forEach(provider => {
    const { name, scope } = provider
    router.get(`/${name}`, passport.authenticate(`${name}`, {
      scope: scope,
      session: false,
    }))

    router.get(`/${name}/callback`, passport.authenticate(`${name}`, {
      successRedirect: '/auth/success',
      failureRedirect: '/auth/failure',
    }));
  })




  return router;
}

