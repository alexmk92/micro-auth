import { Express } from 'express'
import session from 'express-session'
import connectRedis from 'connect-redis'
import redis from 'redis'
import { __cookieName__, __prod__, __redis__, __secrets__ } from '../constants'

const RedisStore = connectRedis(session)
const client = redis.createClient({ host: __redis__.host })

// Required for passportJS to do OAuth2.0 sessions
export const initSession = (app: Express): Express => {
  app.use(
    session({
      name: __cookieName__,
      store: new RedisStore({ client, disableTouch: true }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
        httpOnly: true,
        sameSite: 'lax', // csrf
        secure: __prod__ // cookie only works in https
      },
      saveUninitialized: false,
      secret: __secrets__.session,
      resave: false
    })
  )

  return app
}


