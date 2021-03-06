import { EntityManager, IDatabaseDriver, Connection } from "@mikro-orm/core";
import { Request, Response, Router } from 'express'
import { Redis } from "ioredis";

export type PsContext = {
    em: EntityManager<any> & EntityManager<IDatabaseDriver<Connection>>,
    req: Request & { session: Express.Session },
    res: Response,
    redis: Redis.Redis,
    payload?: { userId: string }
}

export type JWTPayload = {
    userId: string
    tokenVersion: number
}

export type RouteBinding = {
    namespace: string,
    router: Router
}

// extends to this list as we add more providers
export type Provider = 'twitter' | 'facebook'
export type Scope = 'profile' | string // dumb logic for now...implement a concrete list

export type ProviderInfo = {
    name: Provider
    scope: Array<Scope> // further enforce this type later.
}

export type HasuraRole = 'guest' | 'admin' | 'user'

export type HasuraPermissions = {
    'x-hasura-user-id': string,
    'x-hasura-default-role': HasuraRole,
    'x-hasura-allowed-roles': Array<HasuraRole>,
    'x-hasura-user-role'?: string
}
