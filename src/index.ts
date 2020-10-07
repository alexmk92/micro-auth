import { MikroORM } from '@mikro-orm/core'
import { __port__, __prod__ } from './constants'
import mikroOrmConfig from './mikro-orm.config'
import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import { buildSchema } from 'type-graphql'
import { ProjectResolver } from './resolvers/project'

(async () => {
    const orm = await MikroORM.init(mikroOrmConfig)
    await orm.getMigrator().up()

    const app = express()

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [ProjectResolver],
            validate: false
        }),
        context: () => ({
            em: orm.em
        })
    })

    apolloServer.applyMiddleware({ app })

    app.listen(__port__, () => {
        console.info(`Server started and listening on  localhost:${__port__}`)
    })
})().catch(e => {
    console.error(e)
})



