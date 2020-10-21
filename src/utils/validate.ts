import { User } from "src/entities/User";
import argon2 from 'argon2'

export const validateRegistration = (email: string, password: string) => {
  let errors = [];
  if (email.length <= 2) {
    errors.push({
      field: 'email',
      message: 'email must be greater than 2'
    })
  }

  if (password.length <= 3) {
    errors.push({
      field: 'password',
      message: 'password must be greater than 3'
    })
  }

  return errors
}

export const validateLogin = async (user: User | null, password: string) => {
  if (!user) {
    return [{
      field: 'email',
      message: `Could not find user`
    }]
  }

  const valid = await argon2.verify(user.password, password)
  if (!valid) {
    return [{
      field: 'password',
      message: 'Invalid password'
    }]
  }

  return []
}
