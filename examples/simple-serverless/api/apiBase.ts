/* This file was generated by https://github.com/schema-driven-rest/plugin-serverless-api-base */
/* tslint:disable */

export abstract class BaseUserController {
  abstract login(model: LoginRequest): Promise<LoginResponse>;

  abstract getUser(model: GetUserRequest): Promise<UserResponse>;

  abstract updateUser(model: UpdateUserRequest): Promise<UserResponse>;
}

/* This file was generated by https://github.com/schema-rest-driven/plugin-models */
export type Maybe<T> = T | null;
type FixDecorator<T> = T; /** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export class UserResponse {
  user!: FixDecorator<UserModel>;
}

export class UserModel {
  email!: Scalars['String'];
  eyeColor!: Scalars['Int'];
}

export class UpdateUserRequest {
  email!: Scalars['String'];
  eyeColor!: Scalars['Int'];
}

export class LoginResponse {
  authorized!: Scalars['Boolean'];
  jwt!: Scalars['String'];
  details!: Maybe<Array<Maybe<Scalars['String']>>>;
}

export class LoginRequest {
  username!: Scalars['String'];
}

export class GetUserRequest {
  userId!: Scalars['String'];
}
