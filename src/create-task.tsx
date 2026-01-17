import {
  Form,
  ActionPanel,
  Action,
  showToast,
  Toast,
  getPreferenceValues,
  popToRoot,
  Icon,
} from "@raycast/api";
import { useState } from "react";
import { MorgenAPI } from "./api/morgen";
import { MorgenPreferences, CreateTaskRequest } from "./types";
import { formatDateForMorgen } from "./utils";

interface FormValues {
  title: string;
  description: string;
  dueDate: Date | null;
  dueTime: Date | null;
  priority: string;
  status: string;
  notes: string;
  tags: string;
}

export default function CreateTask() {
  const preferences = getPreferenceValues<MorgenPreferences>();
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(values: FormValues) {
    if (!values.title.trim()) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Title is required",
      });
      return;
    }

    setIsLoading(true);
    const toast = await showToast({
      style: Toast.Style.Animated,
      title: "Creating task...",
    });

    try {
      const api = new MorgenAPI(preferences.apiKey);

      // Prepare due date in Morgen format (YYYY-MM-DDTHH:mm:ss)
      let dueDateTime: string | undefined;
      if (values.dueDate) {
        const date = new Date(values.dueDate);
        if (values.dueTime) {
          const time = new Date(values.dueTime);
          date.setHours(time.getHours(), time.getMinutes(), time.getSeconds());
        }
        dueDateTime = formatDateForMorgen(date);
      }

      // Parse tags
      const tags = values.tags
        ? values.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
        : undefined;

      const taskData: CreateTaskRequest = {
        title: values.title.trim(),
        description: values.description?.trim() || undefined,
        due: dueDateTime,
        priority: values.priority ? parseInt(values.priority) : undefined,
        status: values.status as
          | "needsAction"
          | "completed"
          | "cancelled"
          | undefined,
        notes: values.notes?.trim() || undefined,
        tags,
      };

      // Remove undefined fields
      Object.keys(taskData).forEach((key) => {
        if (taskData[key as keyof CreateTaskRequest] === undefined) {
          delete taskData[key as keyof CreateTaskRequest];
        }
      });

      await api.createTask(taskData);

      toast.style = Toast.Style.Success;
      toast.title = "Task created successfully";

      await popToRoot();
    } catch (error) {
      toast.style = Toast.Style.Failure;
      toast.title = "Failed to create task";
      toast.message = error instanceof Error ? error.message : String(error);
      setIsLoading(false);
    }
  }

  return (
    <Form
      isLoading={isLoading}
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Create Task"
            icon={Icon.Plus}
            onSubmit={handleSubmit}
          />
        </ActionPanel>
      }
    >
      <Form.TextField
        id="title"
        title="Title"
        placeholder="Enter task title"
        autoFocus
      />

      <Form.TextArea
        id="description"
        title="Description"
        placeholder="Enter task description (optional)"
      />

      <Form.Separator />

      <Form.DatePicker
        id="dueDate"
        title="Due Date"
        type={Form.DatePicker.Type.Date}
      />

      <Form.DatePicker
        id="dueTime"
        title="Due Time"
        type={Form.DatePicker.Type.DateTime}
      />

      <Form.Separator />

      <Form.Dropdown id="priority" title="Priority" defaultValue="0">
        <Form.Dropdown.Item value="0" title="None" />
        <Form.Dropdown.Item value="1" title="High (1)" />
        <Form.Dropdown.Item value="2" title="High (2)" />
        <Form.Dropdown.Item value="3" title="High (3)" />
        <Form.Dropdown.Item value="4" title="Medium (4)" />
        <Form.Dropdown.Item value="5" title="Medium (5)" />
        <Form.Dropdown.Item value="6" title="Medium (6)" />
        <Form.Dropdown.Item value="7" title="Low (7)" />
        <Form.Dropdown.Item value="8" title="Low (8)" />
        <Form.Dropdown.Item value="9" title="Low (9)" />
      </Form.Dropdown>

      <Form.Dropdown id="status" title="Status" defaultValue="needsAction">
        <Form.Dropdown.Item value="needsAction" title="Needs Action" />
        <Form.Dropdown.Item value="completed" title="Completed" />
        <Form.Dropdown.Item value="cancelled" title="Cancelled" />
      </Form.Dropdown>

      <Form.Separator />

      <Form.TextArea
        id="notes"
        title="Notes"
        placeholder="Additional notes (optional)"
      />

      <Form.TextField
        id="tags"
        title="Tags"
        placeholder="Comma-separated tags (optional)"
      />
    </Form>
  );
}
