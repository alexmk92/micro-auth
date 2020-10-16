import 'dotenv/config'
import { MikroORM } from '@mikro-orm/core'
import { __port__, __prod__, __redis__, __secrets__ } from './constants'
import mikroOrmConfig from './mikro-orm.config'
import express, { Response, Request, NextFunction } from 'express'
import { ApolloServer } from 'apollo-server-express'
import { buildSchema } from 'type-graphql'
import { UserResolver } from './resolvers/user'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import initPassport from './passport'
import { initSession } from './configure/session'
import routes from './routes'


(async () => {
    const orm = await MikroORM.init(mikroOrmConfig)
    try {
        await orm.getMigrator().up()
    } catch (e) {
        // no worries
    }

    const app = express()

    app.use(cookieParser())
    initSession(app)
    initPassport(app, orm.em)

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
            em: orm.em,
            req,
            res
        })
    })

    apolloServer.applyMiddleware({
        app, cors: false
    })

    app.listen(__port__, () => {
        console.info(`Server started and listening on  localhost:${__port__}`)
    })

    routes(orm).map(({ namespace, router }) => {
        app.use(`/${namespace}`, router)
    })
})().catch(e => {
    console.error(e)
})
