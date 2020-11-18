export const __prod__ = process.env.NODE_ENV === 'production'
export const __port__ = process.env.PORT || 4009
export const __redis__ = {
  host: (process.env.REDIS_HOST || 'localhost') as string,
  port: (process.env.REDIS_PORT || 6379) as number
}
export const __db__ = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'postgrespassword',
  driver: process.env.DB_DRIVER || 'postgresql',
  port: process.env.DB_PORT || 5432,
  name: process.env.DB_NAME || 'postgres',
  debug: !__prod__
}
export const __cookieName__ = process.env.COOKIE_NAME || 'qid'
export const __secrets__ = {
  jwt: process.env.JWT_SECRET || 'some-super-secret-ting',
  refresh: process.env.REFRESH_SECRET || 'some-super-refresh-secret',
  session: process.env.SESSION_SECRET || 'some-super-session-secret'
}

export const __socialProviders__ = {
  facebook: {
    appId: process.env.FACEBOOK_APP_ID || '',
    secret: process.env.FACEBOOK_SECRET || ''
  },
  twitter: {
    key: process.env.TWITTER_CONSUMER_KEY || '',
    secret: process.env.TWITTER_CONSUMER_SECRET || ''
  }
}

export const __emailProvider__ = {
  host: (process.env.EMAIL_HOST || "smtp.ethereal.email") as string,
  port: (process.env.EMAIL_PORT || 587) as number,
  secure: (process.env.EMAIL_SECURE || false) as boolean, // true for 465 (over SSL) false otherwise
  auth: {
    user: (process.env.EMAIL_USER || '') as string,
    password: (process.env.EMAIL_PASSWORD || '') as string
  }
}

export const __cacheRoots__ = {
  forgotPassword: 'forgot-password',
  confirmAccount: 'confirm-account'
}

export const __domain__ = process.env.DOMAIN || 'http://localhost:3003'
