import { InputType, Field, ObjectType } from "type-graphql"
import { User } from "./entities/User"

@InputType()
export class CredentialInput {
  @Field()
  email: string

  @Field()
  password: string
}

@ObjectType()
export class FieldError {
  @Field()
  field: string

  @Field()
  message: string
}

export type Provider = 'email' | 'twitter' | 'google'

@ObjectType()
export class Auth {
  @Field()
  accessToken?: string

  @Field()
  provider?: Provider
}

@ObjectType()
export class SessionResponse {
  @Field(() => User, { nullable: true })
  user?: User

  @Field(() => Auth, { nullable: true })
  auth?: Auth
}

@ObjectType()
export class UserResponse extends SessionResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[]
}

@ObjectType()
export class ConfirmEmailResponse {
  @Field()
  didConfirm: boolean

  @Field()
  resetPasswordToken?: string

  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[]
}
