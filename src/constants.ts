export const __prod__ = process.env.NODE_ENV === 'production'
export const __port__ = process.env.PORT || 4001
export const __cookieName__ = process.env.COOKIE_NAME || 'qid'
export const __secrets__ = {
  redis: process.env.REDIS_SECRET || 'super-secret-saying-yo',
  jwt: process.env.JWT_SECRET || 'some-super-secret-ting',
  refresh: process.env.REFRESH_SECRET || 'some-super-refresh-secret'
}
