export const __prod__ = process.env.NODE_ENV === 'production'
export const __port__ = process.env.PORT || 4000
export const __redisSecret__ = process.env.REDIS_SECRET || 'super-secret-saying-yo'
export const __cookieName__ = process.env.COOKIE_NAME || 'qid'
export const __jwtSecret__ = process.env.JWT_SECRET || 'some-super-secret-ting'
