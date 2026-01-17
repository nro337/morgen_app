import {
  MorgenTask,
  CreateTaskRequest,
  UpdateTaskRequest,
  ListTasksResponse,
  ListTasksApiResponse,
  MorgenCalendar,
} from "../types";

const BASE_URL = "https://api.morgen.so/v3";

export class MorgenAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public responseBody?: unknown,
  ) {
    super(message);
    this.name = "MorgenAPIError";
  }
}

export class MorgenAPI {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private getHeaders(): Record<string, string> {
    return {
      accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `ApiKey ${this.apiKey}`,
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      let responseBody: unknown;

      try {
        responseBody = await response.json();
        if (
          responseBody &&
          typeof responseBody === "object" &&
          "message" in responseBody
        ) {
          errorMessage = (responseBody as { message: string }).message;
        }
      } catch {
        // If parsing JSON fails, use the status text
      }

      throw new MorgenAPIError(errorMessage, response.status, responseBody);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return (await response.json()) as T;
    }

    // If not JSON, return empty object
    return {} as T;
  }

  async listTasks(
    limit: number = 100,
    updatedAfter?: string,
  ): Promise<MorgenTask[]> {
    const params = new URLSearchParams();
    params.append("limit", limit.toString());
    if (updatedAfter) {
      params.append("updatedAfter", updatedAfter);
    }

    const response = await fetch(
      `${BASE_URL}/tasks/list?${params.toString()}`,
      {
        method: "GET",
        headers: this.getHeaders(),
      },
    );

    const apiResponse = await this.handleResponse<
      ListTasksApiResponse | ListTasksResponse | MorgenTask[]
    >(response);

    // Handle different response formats:
    // 1. { data: { tasks: [...] } } - wrapped response
    // 2. { tasks: [...] } - direct object
    // 3. [...] - direct array
    
    if (Array.isArray(apiResponse)) {
      return apiResponse;
    }

    // Check if it's the wrapped format with data property
    if ('data' in apiResponse && apiResponse.data && typeof apiResponse.data === 'object') {
      const innerData = apiResponse.data as ListTasksResponse;
      return innerData.tasks || [];
    }

    // Direct object format
    if ('tasks' in apiResponse) {
      return (apiResponse as ListTasksResponse).tasks || [];
    }

    return [];
  }

  async getTask(taskId: string): Promise<MorgenTask> {
    const response = await fetch(`${BASE_URL}/tasks/${taskId}`, {
      method: "GET",
      headers: this.getHeaders(),
    });

    return this.handleResponse<MorgenTask>(response);
  }

  async createTask(task: CreateTaskRequest): Promise<MorgenTask> {
    const response = await fetch(`${BASE_URL}/tasks`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(task),
    });

    return this.handleResponse<MorgenTask>(response);
  }

  async updateTask(
    taskId: string,
    updates: UpdateTaskRequest,
  ): Promise<MorgenTask> {
    const response = await fetch(`${BASE_URL}/tasks/${taskId}`, {
      method: "PATCH",
      headers: this.getHeaders(),
      body: JSON.stringify(updates),
    });

    return this.handleResponse<MorgenTask>(response);
  }

  async deleteTask(taskId: string): Promise<void> {
    const response = await fetch(`${BASE_URL}/tasks/${taskId}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });

    await this.handleResponse<void>(response);
  }

  async listCalendars(): Promise<MorgenCalendar[]> {
    const response = await fetch(`${BASE_URL}/calendars`, {
      method: "GET",
      headers: this.getHeaders(),
    });

    const data = await this.handleResponse<{ calendars: MorgenCalendar[] }>(
      response,
    );
    return data.calendars || [];
  }
}
