import { __prod__ } from './constants'
import { Project } from './entities/Project'
import { MikroORM } from '@mikro-orm/core'
import path from 'path'
import { User } from './entities/User'

export default {
    entities: [Project, User],
    dbName: 'public',
    debug: !__prod__,
    type: 'postgresql',
    user: 'postgres',
    password: 'postgrespassword',
    migrations: {
        path: path.join(__dirname, './migrations'),
        pattern: /^[\w-]+\d+\.[tj]s$/
    }
} as Parameters<typeof MikroORM.init>[0]
