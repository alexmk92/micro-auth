import { EntityManager, IDatabaseDriver, Connection } from "@mikro-orm/core";
import { Request, Response } from 'express'

export type PsContext = {
    em: EntityManager<any> & EntityManager<IDatabaseDriver<Connection>>,
    req: Request & { session: Express.Session },
    res: Response
}
