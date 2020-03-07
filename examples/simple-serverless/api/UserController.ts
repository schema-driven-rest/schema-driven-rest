import {
  BaseUserController,
  GetUserRequest,
  LoginRequest,
  LoginResponse,
  UpdateUserRequest,
  UserResponse,
} from './apiBase';

export class UserController extends BaseUserController {
  async login(model: LoginRequest): Promise<LoginResponse> {
    if (model.username === 'shoes') {
      return {
        authorized: true,
        jwt: 'abc',
      };
    }
  }

  async getUser(model: GetUserRequest): Promise<UserResponse> {
    return undefined;
  }

  async updateUser(model: UpdateUserRequest): Promise<UserResponse> {
    return undefined;
  }
}
