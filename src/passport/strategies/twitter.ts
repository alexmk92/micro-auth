import { Strategy } from 'passport-twitter'
import { getManager } from 'typeorm'
import { __socialProviders__ } from '../../constants'
import { User } from '../../entities/User'

export const TwitterStrategy = (): Strategy => {
  return new Strategy({
    consumerKey: __socialProviders__.twitter.key,
    consumerSecret: __socialProviders__.twitter.secret,
    callbackURL: '/auth/twitter/callback'
  }, async (_accessToken, _refreshToken, socialAccount, done) => {
    await getManager().transaction(async transactionalEntityManager => {
      // we don't really care about the _accessToken and _refreshToken
      // that passport provides for us, we're already managing our own JWT's
      // all we do here is update the user with the linked account info
      // and then persist to next step of passport (serailizeUser)
      // found in passport/index.ts
      let user = null
      try {
        user = await User.findOneOrFail({ email: socialAccount.displayName })
      } catch (e) {
        user = User.create({ email: socialAccount.displayName, username: socialAccount.username })
      }

      const profile = await user.getProfile()
      profile.twitterId = socialAccount.id
      profile.twitterUsername = socialAccount.username
      await transactionalEntityManager.save(profile)
      done(null, user)
    })
  })
}
