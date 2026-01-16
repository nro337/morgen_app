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
import { useState, useEffect } from "react";
import { MorgenAPI } from "./api/morgen";
import { MorgenPreferences, UpdateTaskRequest, MorgenTask } from "./types";
import { formatDateForMorgen, parseMorgenDate } from "./utils";

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

interface UpdateTaskProps {
  task: MorgenTask;
  onUpdate: () => void;
}

export default function UpdateTask({ task, onUpdate }: UpdateTaskProps) {
  const preferences = getPreferenceValues<MorgenPreferences>();
  const [isLoading, setIsLoading] = useState(false);

  // Parse initial values from task
  const initialDueDate = task.due ? parseMorgenDate(task.due) : null;
  const initialTags = task.tags ? task.tags.join(", ") : "";

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
      title: "Updating task...",
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
        ? values.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
        : undefined;

      const updates: UpdateTaskRequest = {
        title: values.title.trim(),
        description: values.description?.trim() || undefined,
        due: dueDateTime,
        priority: values.priority ? parseInt(values.priority) : undefined,
        status: values.status as "needsAction" | "completed" | "cancelled" | undefined,
        notes: values.notes?.trim() || undefined,
        tags,
      };

      // Remove undefined fields
      Object.keys(updates).forEach((key) => {
        if (updates[key as keyof UpdateTaskRequest] === undefined) {
          delete updates[key as keyof UpdateTaskRequest];
        }
      });

      await api.updateTask(task.id, updates);

      toast.style = Toast.Style.Success;
      toast.title = "Task updated successfully";

      onUpdate();
      await popToRoot();
    } catch (error) {
      toast.style = Toast.Style.Failure;
      toast.title = "Failed to update task";
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
            title="Update Task"
            icon={Icon.Check}
            onSubmit={handleSubmit}
          />
        </ActionPanel>
      }
    >
      <Form.TextField
        id="title"
        title="Title"
        placeholder="Enter task title"
        defaultValue={task.title}
        autoFocus
      />

      <Form.TextArea
        id="description"
        title="Description"
        placeholder="Enter task description (optional)"
        defaultValue={task.description || ""}
      />

      <Form.Separator />

      <Form.DatePicker
        id="dueDate"
        title="Due Date"
        type={Form.DatePicker.Type.Date}
        defaultValue={initialDueDate}
      />

      <Form.DatePicker
        id="dueTime"
        title="Due Time"
        type={Form.DatePicker.Type.DateTime}
        defaultValue={initialDueDate}
      />

      <Form.Separator />

      <Form.Dropdown
        id="priority"
        title="Priority"
        defaultValue={task.priority?.toString() || "0"}
      >
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

      <Form.Dropdown
        id="status"
        title="Status"
        defaultValue={task.status || "needsAction"}
      >
        <Form.Dropdown.Item value="needsAction" title="Needs Action" />
        <Form.Dropdown.Item value="completed" title="Completed" />
        <Form.Dropdown.Item value="cancelled" title="Cancelled" />
      </Form.Dropdown>

      <Form.Separator />

      <Form.TextArea
        id="notes"
        title="Notes"
        placeholder="Additional notes (optional)"
        defaultValue={task.notes || ""}
      />

      <Form.TextField
        id="tags"
        title="Tags"
        placeholder="Comma-separated tags (optional)"
        defaultValue={initialTags}
      />
    </Form>
  );
}
