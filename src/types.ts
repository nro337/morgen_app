export interface MorgenTask {
  id: string;
  title: string;
  description?: string;
  due?: string; // ISO 8601 LocalDateTime format: YYYY-MM-DDTHH:mm:ss
  priority?: number; // 0-9, where 0 is undefined, 1 is highest, 9 is lowest
  status?: "needsAction" | "completed" | "cancelled";
  created?: string;
  updated?: string;
  calendarId?: string;
  listId?: string;
  notes?: string;
  estimatedDuration?: string; // ISO 8601 duration format
  progress?: number; // 0-100
  tags?: string[];
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  due?: string;
  priority?: number;
  status?: "needsAction" | "completed" | "cancelled";
  calendarId?: string;
  listId?: string;
  notes?: string;
  estimatedDuration?: string;
  progress?: number;
  tags?: string[];
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  due?: string;
  priority?: number;
  status?: "needsAction" | "completed" | "cancelled";
  calendarId?: string;
  listId?: string;
  notes?: string;
  estimatedDuration?: string;
  progress?: number;
  tags?: string[];
}

export interface ListTasksResponse {
  tasks: MorgenTask[];
  nextCursor?: string;
  labelDefs?: unknown[];
  spaces?: unknown[];
}

export interface ListTasksApiResponse {
  data: ListTasksResponse;
}

export interface MorgenCalendar {
  id: string;
  name: string;
  accountId: string;
}

export interface MorgenPreferences {
  apiKey: string;
}
