import { __db__ } from './constants'
import { MikroORM } from '@mikro-orm/core'
import path from 'path'
import { User } from './entities/User'

export default {
    entities: [User],
    dbName: __db__.name,
    host: __db__.host,
    debug: __db__.debug,
    type: __db__.driver,
    user: __db__.user,
    password: __db__.password,
    migrations: {
        path: path.join(__dirname, './migrations'),
        pattern: /^[\w-]+\d+\.[tj]s$/
    }
} as Parameters<typeof MikroORM.init>[0]
