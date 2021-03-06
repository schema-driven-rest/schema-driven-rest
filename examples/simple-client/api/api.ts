/* This file was generated by https://github.com/schema-driven-rest/plugin-fetch */
/* tslint:disable */
import {BaseClient, ControllerOptions} from './baseClient';

export class UserClient extends BaseClient {
  constructor(options: ControllerOptions) {
    super(options);
  }

  async login(model: LoginRequest): Promise<LoginResponse> {
    try {
      let url = this.options.baseUrl + '/user/login?';
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      } as RequestInit;

      options.body = JSON.stringify(model);

      const response = await fetch(url, await this.transformOptions(options));

      const status = response.status;
      const headers: any = {};

      if (response.headers && response.headers.forEach) {
        response.headers.forEach((v: any, k: any) => (headers[k] = v));
      }

      const responseText = await response.text();

      if (status === 200) {
        return JSON.parse(responseText);
      } else {
        try {
          const body = JSON.parse(responseText);
          throw body;
        } catch (ex) {
          throw ex;
        }
      }
    } catch (ex) {
      throw ex;
    }
  }

  async getUser(model: GetUserRequest): Promise<UserResponse> {
    try {
      let url = this.options.baseUrl + '/user/user?';
      const options = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      } as RequestInit;

      url += Object.keys(model)
        .filter(key => !!(model as any)[key])
        .map(key => `${key}=${encodeURIComponent((model as any)[key])}`)
        .join('&');

      const response = await fetch(url, await this.transformOptions(options));

      const status = response.status;
      const headers: any = {};

      if (response.headers && response.headers.forEach) {
        response.headers.forEach((v: any, k: any) => (headers[k] = v));
      }

      const responseText = await response.text();

      if (status === 200) {
        return JSON.parse(responseText);
      } else {
        try {
          const body = JSON.parse(responseText);
          throw body;
        } catch (ex) {
          throw ex;
        }
      }
    } catch (ex) {
      throw ex;
    }
  }

  async updateUser(model: UpdateUserRequest): Promise<UserResponse> {
    try {
      let url = this.options.baseUrl + '/user/update-user?';
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      } as RequestInit;

      options.body = JSON.stringify(model);

      const response = await fetch(url, await this.transformOptions(options));

      const status = response.status;
      const headers: any = {};

      if (response.headers && response.headers.forEach) {
        response.headers.forEach((v: any, k: any) => (headers[k] = v));
      }

      const responseText = await response.text();

      if (status === 200) {
        return JSON.parse(responseText);
      } else {
        try {
          const body = JSON.parse(responseText);
          throw body;
        } catch (ex) {
          throw ex;
        }
      }
    } catch (ex) {
      throw ex;
    }
  }
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
