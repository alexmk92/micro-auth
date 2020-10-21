import { RouteBinding } from "src/types";
import auth from './social-auth'
import root from './root'

const routes = (): Array<RouteBinding> => [
  { namespace: 'auth', router: auth() },
  { namespace: '', router: root() },
];

export default routes
