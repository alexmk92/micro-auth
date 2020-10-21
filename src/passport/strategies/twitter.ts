import { Strategy } from 'passport-twitter'
import { __socialProviders__ } from '../../constants'
import { User } from '../../entities/User'

export const TwitterStrategy = (): Strategy => {
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
      user = await User.findOneOrFail({ email: profile.displayName })
    } catch (e) {
      user = User.create({ email: profile.displayName, username: profile.username })
    }

    user.twitterId = profile.id
    user.twitterUsername = profile.username

    await user.save()
    done(null, user)
  })
}
