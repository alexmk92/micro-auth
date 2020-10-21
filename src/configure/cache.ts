import Redis from 'ioredis'
import { __redis__ } from '../constants'

let _cache: Redis.Redis | null = null

export const initCache = (): Redis.Redis => {
  if (!_cache) {
    _cache = new Redis({
      host: __redis__.host,
      port: __redis__.port
    })

    if (process.env.NODE_ENV !== 'production') {
      _cache.set('dev-alive', new Date().toISOString(), 'ex', (1000 * 60))
      console.log('Redis is now connected')
    }
  }

  return _cache!
}

export const getCache = (): Redis.Redis => {
  if (!_cache) {
    return initCache()
  }

  return _cache!;
}
