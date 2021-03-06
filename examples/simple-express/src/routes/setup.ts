/* This file was generated by https://github.com/schema-driven-rest/plugin-serverless-api-base */

import {UserController} from './api/UserController';

import {handlerWrapper} from 'undefined';

const UserControllerInstance = new UserController();
export const User_login = handlerWrapper(UserControllerInstance.login);
export const User_getUser = handlerWrapper(UserControllerInstance.getUser);
export const User_updateUser = handlerWrapper(UserControllerInstance.updateUser);
