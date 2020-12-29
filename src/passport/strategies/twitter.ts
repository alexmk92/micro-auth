import { Strategy } from 'passport-twitter'
import { Profile } from '../../entities/Profile'
import { getManager } from 'typeorm'
import { __socialProviders__ } from '../../constants'
import { User } from '../../entities/User'

export const TwitterStrategy = (): Strategy => {
  return new Strategy({
    consumerKey: __socialProviders__.twitter.key,
    consumerSecret: __socialProviders__.twitter.secret,
    callbackURL: '/auth/twitter/callback',
    includeEmail: true
  }, async (_accessToken, _refreshToken, socialAccount, done) => {
    await getManager().transaction(async transactionalEntityManager => {
      // we don't really care about the _accessToken and _refreshToken
      // that passport provides for us, we're already managing our own JWT's
      // all we do here is update the user with the linked account info
      // and then persist to next step of passport (serailizeUser)
      // found in passport/index.ts
      const email = socialAccount?.emails?.shift()?.value || null
      if (!email) {
        return done('This social account does not have an associated email address', null)
      }

      let user = null
      let profile = null

      try {
        user = await User.findOneOrFail({ where: { email } })
        profile = await user.getProfile(transactionalEntityManager)
      } catch (e) {
        const photos = socialAccount.photos?.shift() || { value: '' }
        profile = await transactionalEntityManager.save(Profile.create({
          avatarUrl: photos.value,
          twitterId: socialAccount.id,
          twitterUsername: socialAccount.username,
          location: socialAccount._json?.location || null,
          region: socialAccount._json?.region || null,
          bio: socialAccount._json?.description || null,
          user: await User.create({
            username: socialAccount.username,
            email: email
          }).save()
        }))

        user = profile.user
      }

      if (!profile.avatarUrl) {
        profile.avatarUrl = socialAccount.photos?.shift()?.value
        await profile.save()
      }

      done(null, user)
    })
  })
}
