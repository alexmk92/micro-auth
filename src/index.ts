import { MikroORM } from '@mikro-orm/core'
import { __cookieName__, __port__, __prod__, __redisSecret__ } from './constants'
import mikroOrmConfig from './mikro-orm.config'
import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import { buildSchema } from 'type-graphql'
import { ProjectResolver } from './resolvers/project'
import { UserResolver } from './resolvers/user'
import redis from 'redis'
import session from 'express-session'
import connectRedis from 'connect-redis'


(async () => {
    const orm = await MikroORM.init(mikroOrmConfig)
    await orm.getMigrator().up()

    const app = express()

    const RedisStore = connectRedis(session)
    const client = redis.createClient()

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
            secret: __redisSecret__,
            resave: false
        })
    )

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [ProjectResolver, UserResolver],
            validate: false
        }),
        context: ({ req, res }) => ({
            em: orm.em,
            req,
            res
        })
    })

    apolloServer.applyMiddleware({ app })

    app.listen(__port__, () => {
        console.info(`Server started and listening on  localhost:${__port__}`)
    })
})().catch(e => {
    console.error(e)
})



