import 'dotenv/config'
import { __db__, __port__, __prod__, __redis__, __secrets__ } from './constants'
import express, { Response, Request, NextFunction } from 'express'
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

(async () => {
    await createConnection({
        type: 'postgres',
        database: __db__.name,
        host: __db__.host,
        username: __db__.user,
        password: __db__.password,
        logging: true,
        synchronize: !__prod__,
        entities: [User]
    })

    const cache = initCache()
    const app = express()

    app.use(cookieParser())
    initSession(app)
    initPassport(app)

    /**
     * We never want any of these cookies, just clear them out
     * they're only applied as part of the session middleware
     * for OAuth 2.0
     */
    app.use((_req: Request, res: Response, next: NextFunction) => {
        res.clearCookie('qid')
        res.clearCookie('connect.sid')
        next()
    })

    app.use(cors({
        origin: 'http://localhost:3001',
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

    app.listen(__port__, () => {
        console.info(`Server started and listening on  localhost:${__port__}`)
    })

    routes().map(({ namespace, router }) => {
        app.use(`/${namespace}`, router)
    })
})().catch(e => {
    console.error(e)
})
