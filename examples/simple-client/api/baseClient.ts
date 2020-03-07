export class BaseClient {
  constructor(protected options: ControllerOptions) {}

  async transformOptions(options: RequestInit): Promise<RequestInit> {
    const headers = options.headers as any;
    headers.Authorization = 'Bearer ';
    return options;
  }
}

export interface ControllerOptions {
  baseUrl: string;
}
