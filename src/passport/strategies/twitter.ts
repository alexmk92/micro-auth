import { EntityManager } from '@mikro-orm/core'
import { Strategy } from 'passport-twitter'
import { __socialProviders__ } from '../../constants'
import { User } from '../../entities/User'

export const TwitterStrategy = (em: EntityManager): Strategy => {
  return new Strategy({
    consumerKey: __socialProviders__.twitter.key,
    consumerSecret: __socialProviders__.twitter.secret,
    callbackURL: '/auth/twitter/callback'
  }, async (_accessToken, _refreshToken, profile, done) => {
    // we don't really care about the _accessToken and _refreshToken
    // that passport provides for us, we're already managing our own JWT's
    // all we do here is update the user with the linked account info
    // and then persist to next step of passport (serailizeUser)
    // found in passport/index.ts
    let user = null
    try {
      user = await em.findOneOrFail(User, { email: profile.displayName })
      user.twitter_id = profile.id
      user.twitter_username = profile.username
    } catch (e) {
      user = em.create(User, { email: profile.displayName, username: profile.username })
    }

    await em.persistAndFlush(user)
    done(null, user)
  })
}
