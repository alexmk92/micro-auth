import passport from 'passport'
import { __cookieName__, __prod__, __redis__, __secrets__, __socialProviders__ } from '../constants'
import { User } from '../entities/User'
import { Express } from 'express'
import { TwitterStrategy } from './strategies/twitter'
import { createRefreshToken } from '../auth'

/**
 * This implementation of passport auth is completely experimental,
 * use at your own risk.
 * 
 * Flow:
 * 1) Use the passport OAuth provider for whatever service you are integrating with
 * 2) Upon successful authentication in the callback handler of your strategy, resolve
 *    the user in the done() callback
 * 3) 
 */
export default (app: Express): Express => {
  // OAuth 2.0 requires sessions, so we ensure the middleware
  // is set before doing any OAuthy jazz...
  app.use(passport.initialize())
  app.use(passport.session())

  // Now we have a user from the provider, lets create
  // a refresh token so that our client can request an access token
  passport.serializeUser((user: User, done) => {
    done(null, createRefreshToken(user))
  })

  // We know this is infact a refresh token that's being
  // passed, we don't need to unserialize it, lets just
  // return it as long as we have one
  passport.deserializeUser(async (refreshToken: string, done) => {
    if (refreshToken) {
      done(null, refreshToken)
    } else {
      done('Invalid refresh token, please login again', null)
    }
  })

  passport.use(TwitterStrategy())
  // register other strategies here...

  return app
}
