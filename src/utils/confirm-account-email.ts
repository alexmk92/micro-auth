import { getCache } from "../configure/cache";
import { __cacheRoots__, __redis__ } from "../constants";
import { User } from "../entities/User";
import { v4 } from "uuid";
import { sendEmail } from "./send-email";

export const sendConfirmAccountEmail = async (user: User) => {
  const redis = getCache()
  const confirmationToken = v4()
  await redis.set(`${__cacheRoots__.confirmAccount}:${confirmationToken}`, user.id, 'ex', (1000 * 60 * 60 * 24 * 30))
  await sendEmail(user.email, 'Confirm your PosterSpy account', `Please follow this link to <a href="/confirm/${confirmationToken}">confirm your account,</a> if you do not confirm this link in 30 days it will expire`)

  return true
}
