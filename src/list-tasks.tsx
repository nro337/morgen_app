import {
  List,
  ActionPanel,
  Action,
  Icon,
  Color,
  getPreferenceValues,
  showToast,
  Toast,
  confirmAlert,
  Alert,
} from "@raycast/api";
import { usePromise } from "@raycast/utils";
import { useState } from "react";
import { MorgenAPI, MorgenAPIError } from "./api/morgen";
import { MorgenTask, MorgenPreferences } from "./types";
import {
  formatTaskSubtitle,
  getStatusIcon,
  getPriorityColor,
  formatDateForDisplay,
  getPriorityLabel,
} from "./utils";
import UpdateTask from "./update-task";

export default function ListTasks() {
  const preferences = getPreferenceValues<MorgenPreferences>();
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const {
    data: tasks,
    isLoading,
    error,
    revalidate,
  } = usePromise(
    async () => {
      const api = new MorgenAPI(preferences.apiKey);
      return await api.listTasks(100);
    },
    [],
    {
      onError: (error) => {
        if (error instanceof MorgenAPIError) {
          showToast({
            style: Toast.Style.Failure,
            title: "Failed to load tasks",
            message: error.message,
          });
        }
      },
    }
  );

  const filteredTasks = tasks?.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchText.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchText.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "needsAction" && task.status === "needsAction") ||
      (statusFilter === "completed" && task.status === "completed") ||
      (statusFilter === "cancelled" && task.status === "cancelled");

    return matchesSearch && matchesStatus;
  });

  async function deleteTask(task: MorgenTask) {
    if (
      await confirmAlert({
        title: "Delete Task",
        message: `Are you sure you want to delete "${task.title}"?`,
        primaryAction: {
          title: "Delete",
          style: Alert.ActionStyle.Destructive,
        },
      })
    ) {
      try {
        const api = new MorgenAPI(preferences.apiKey);
        await api.deleteTask(task.id);
        await showToast({
          style: Toast.Style.Success,
          title: "Task deleted",
        });
        revalidate();
      } catch (error) {
        await showToast({
          style: Toast.Style.Failure,
          title: "Failed to delete task",
          message: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }

  async function toggleTaskStatus(task: MorgenTask) {
    try {
      const api = new MorgenAPI(preferences.apiKey);
      const newStatus = task.status === "completed" ? "needsAction" : "completed";
      await api.updateTask(task.id, { status: newStatus });
      await showToast({
        style: Toast.Style.Success,
        title: newStatus === "completed" ? "Task completed" : "Task reopened",
      });
      revalidate();
    } catch (error) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Failed to update task",
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  if (error) {
    showToast({
      style: Toast.Style.Failure,
      title: "Error loading tasks",
      message: error.message,
    });
  }

  return (
    <List
      isLoading={isLoading}
      searchText={searchText}
      onSearchTextChange={setSearchText}
      searchBarPlaceholder="Search tasks..."
      searchBarAccessory={
        <List.Dropdown
          tooltip="Filter by Status"
          value={statusFilter}
          onChange={setStatusFilter}
        >
          <List.Dropdown.Item title="All Tasks" value="all" />
          <List.Dropdown.Item title="Needs Action" value="needsAction" />
          <List.Dropdown.Item title="Completed" value="completed" />
          <List.Dropdown.Item title="Cancelled" value="cancelled" />
        </List.Dropdown>
      }
    >
      {filteredTasks?.length === 0 ? (
        <List.EmptyView
          title="No tasks found"
          description="Create a new task to get started"
          icon={Icon.CheckCircle}
        />
      ) : (
        filteredTasks?.map((task) => (
          <List.Item
            key={task.id}
            title={task.title}
            subtitle={formatTaskSubtitle(task)}
            icon={{
              source: Icon.Circle,
              tintColor: task.status === "completed" ? Color.Green : Color.Blue,
            }}
            accessories={[
              { text: getPriorityColor(task.priority) },
              { text: getStatusIcon(task.status) },
            ]}
            actions={
              <ActionPanel>
                <ActionPanel.Section>
                  <Action.Push
                    title="View Details"
                    icon={Icon.Eye}
                    target={<TaskDetail task={task} onUpdate={revalidate} />}
                  />
                  <Action.Push
                    title="Edit Task"
                    icon={Icon.Pencil}
                    target={<UpdateTask task={task} onUpdate={revalidate} />}
                    shortcut={{ modifiers: ["cmd"], key: "e" }}
                  />
                  <Action
                    title={task.status === "completed" ? "Mark as Incomplete" : "Mark as Complete"}
                    icon={task.status === "completed" ? Icon.Circle : Icon.CheckCircle}
                    onAction={() => toggleTaskStatus(task)}
                    shortcut={{ modifiers: ["cmd"], key: "t" }}
                  />
                </ActionPanel.Section>
                <ActionPanel.Section>
                  <Action
                    title="Delete Task"
                    icon={Icon.Trash}
                    style={Action.Style.Destructive}
                    onAction={() => deleteTask(task)}
                    shortcut={{ modifiers: ["cmd"], key: "d" }}
                  />
                  <Action
                    title="Refresh"
                    icon={Icon.ArrowClockwise}
                    onAction={revalidate}
                    shortcut={{ modifiers: ["cmd"], key: "r" }}
                  />
                </ActionPanel.Section>
              </ActionPanel>
            }
          />
        ))
      )}
    </List>
  );
}

function TaskDetail({ task, onUpdate }: { task: MorgenTask; onUpdate: () => void }) {
  return (
    <List>
      <List.Item
        title="Title"
        subtitle={task.title}
        icon={Icon.Text}
      />
      {task.description && (
        <List.Item
          title="Description"
          subtitle={task.description}
          icon={Icon.Document}
        />
      )}
      <List.Item
        title="Status"
        subtitle={task.status || "needsAction"}
        icon={Icon.Circle}
        accessories={[{ text: getStatusIcon(task.status) }]}
      />
      {task.due && (
        <List.Item
          title="Due Date"
          subtitle={formatDateForDisplay(task.due)}
          icon={Icon.Calendar}
        />
      )}
      {task.priority !== undefined && task.priority > 0 && (
        <List.Item
          title="Priority"
          subtitle={getPriorityLabel(task.priority)}
          icon={Icon.ExclamationMark}
          accessories={[{ text: getPriorityColor(task.priority) }]}
        />
      )}
      {task.progress !== undefined && task.progress > 0 && (
        <List.Item
          title="Progress"
          subtitle={`${task.progress}%`}
          icon={Icon.BarChart}
        />
      )}
      {task.notes && (
        <List.Item
          title="Notes"
          subtitle={task.notes}
          icon={Icon.BlankDocument}
        />
      )}
      {task.tags && task.tags.length > 0 && (
        <List.Item
          title="Tags"
          subtitle={task.tags.join(", ")}
          icon={Icon.Tag}
        />
      )}
    </List>
  );
}
