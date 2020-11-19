import 'reflect-metadata'
import 'dotenv/config'
import { __db__, __domain__, __port__, __prod__, __redis__, __secrets__ } from './constants'
import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import { buildSchema } from 'type-graphql'
import { UserResolver } from './resolvers/user'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import initPassport from './passport'
import { initSession } from './configure/session'
import routes from './routes'
import { initCache } from './configure/cache'
import { createConnection } from 'typeorm'
import { User } from './entities/User'
import { Profile } from './entities/Profile'
import { SnakeNamingStrategy } from 'typeorm-naming-strategies'

(async () => {
    await createConnection({
        type: 'postgres',
        database: __db__.name,
        host: __db__.host,
        username: __db__.user,
        password: __db__.password,
        logging: true,
        synchronize: !__prod__,
        entities: [User, Profile],
        namingStrategy: new SnakeNamingStrategy()
    })

    const cache = initCache()
    const app = express()

    app.use(cookieParser())
    initSession(app)
    initPassport(app)

    app.use(cors({
        origin: __domain__,
        credentials: true
    }))

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [UserResolver],
            validate: false
        }),
        context: ({ req, res }) => ({
            req,
            res,
            redis: cache
        })
    })

    apolloServer.applyMiddleware({
        app, cors: false
    })

    routes().map(({ namespace, router }) => {
        app.use(`/${namespace}`, router)
    })

    app.get('/', (_req, res) => {
        res.send('hi')
    })

    app.listen(__port__, () => {
        console.info(`Server started and listening on  ${__domain__}:${__port__}`)
    })
})().catch(e => {
    console.error(e)
})
