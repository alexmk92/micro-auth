import { RouteBinding } from "src/types";
import { MikroORM } from "@mikro-orm/core";
import auth from './social-auth'
import root from './root'

const routes = (orm: MikroORM): Array<RouteBinding> => [
  { namespace: 'auth', router: auth(orm) },
  { namespace: '', router: root(orm) },
];

export default routes
