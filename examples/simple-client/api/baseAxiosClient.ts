import {AxiosRequestConfig} from 'axios';

export class BaseAxiosClient {
  constructor(protected options: ControllerOptions) {}

  async transformOptions<T extends any>(options: AxiosRequestConfig): Promise<AxiosRequestConfig> {
    const headers = options.headers || {};
    headers.Authorization = 'Bearer ';
    options.headers = headers;
    return options;
  }
}

export interface ControllerOptions {
  baseUrl: string;
}
