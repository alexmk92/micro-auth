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

export const validateLogin = async (user: User | undefined, password: string) => {
  if (!user) {
    return [{
      field: 'email',
      message: `Could not find user`
    }]
  }
  // If a user signed up with social auth, then they may not have a password,
  // in this scenario say its an invalid password without trying argon
  const userPassword = user.password
  if (!userPassword || !await argon2.verify(userPassword, password)) {
    return [{
      field: 'password',
      message: 'Invalid password'
    }]
  }

  return []
}
