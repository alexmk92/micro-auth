import { Express } from 'express'
import session from 'express-session'
import { __cookieName__, __prod__, __redis__, __secrets__ } from '../constants'


// Required for passportJS to do OAuth2.0 sessions
export const initSession = (app: Express): Express => {
  app.use(
    session({
      name: __cookieName__,
      cookie: {
        maxAge: 1000 * 60 * 2, // 2 minutes
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


