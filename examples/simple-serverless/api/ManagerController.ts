import {
  BaseManagerController,
  ManagerGetUserRequest,
  ManagerLoginRequest,
  ManagerLoginResponse,
  ManagerUpdateUserRequest,
  ManagerUserResponse,
} from './apiBase';

export class ManagerController extends BaseManagerController {
  getUser(model: ManagerGetUserRequest): Promise<ManagerUserResponse> {
    return undefined;
  }

  login(model: ManagerLoginRequest): Promise<ManagerLoginResponse> {
    return undefined;
  }

  updateUser(model: ManagerUpdateUserRequest): Promise<ManagerUserResponse> {
    return undefined;
  }
}
