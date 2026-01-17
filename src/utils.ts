import { MorgenTask } from "./types";

/**
 * Formats a date to ISO 8601 LocalDateTime format (YYYY-MM-DDTHH:mm:ss)
 * This is exactly 19 characters as required by Morgen API
 */
export function formatDateForMorgen(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

/**
 * Parses a Morgen date string to a JavaScript Date object
 */
export function parseMorgenDate(dateString: string): Date {
  // Handle ISO 8601 LocalDateTime format (YYYY-MM-DDTHH:mm:ss)
  // We treat it as local time
  return new Date(dateString);
}

/**
 * Formats a date for display in the UI
 */
export function formatDateForDisplay(dateString?: string): string {
  if (!dateString) return "No due date";

  const date = parseMorgenDate(dateString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const taskDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );

  const diffTime = taskDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const timeStr = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  if (diffDays === 0) {
    return `Today at ${timeStr}`;
  } else if (diffDays === 1) {
    return `Tomorrow at ${timeStr}`;
  } else if (diffDays === -1) {
    return `Yesterday at ${timeStr}`;
  } else if (diffDays > 1 && diffDays <= 7) {
    return `${date.toLocaleDateString("en-US", { weekday: "long" })} at ${timeStr}`;
  } else {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }
}

/**
 * Gets the priority label for display
 */
export function getPriorityLabel(priority?: number): string {
  if (!priority || priority === 0) return "None";
  if (priority >= 1 && priority <= 3) return "High";
  if (priority >= 4 && priority <= 6) return "Medium";
  if (priority >= 7 && priority <= 9) return "Low";
  return "None";
}

/**
 * Gets the priority color for display
 */
export function getPriorityColor(priority?: number): string {
  if (!priority || priority === 0) return "";
  if (priority >= 1 && priority <= 3) return "🔴";
  if (priority >= 4 && priority <= 6) return "🟡";
  if (priority >= 7 && priority <= 9) return "🟢";
  return "";
}

/**
 * Gets the status icon for display
 */
export function getStatusIcon(status?: string): string {
  switch (status) {
    case "completed":
      return "✅";
    case "cancelled":
      return "❌";
    case "needsAction":
    default:
      return "⭕";
  }
}

/**
 * Formats task subtitle for list view
 */
export function formatTaskSubtitle(task: MorgenTask): string {
  const parts: string[] = [];

  if (task.due) {
    parts.push(formatDateForDisplay(task.due));
  }

  if (task.priority && task.priority > 0) {
    parts.push(`Priority: ${getPriorityLabel(task.priority)}`);
  }

  return parts.join(" • ") || "No due date";
}

/**
 * Validates that a date string is in the correct Morgen format
 */
export function validateMorgenDateFormat(dateString: string): boolean {
  // Must be exactly 19 characters: YYYY-MM-DDTHH:mm:ss
  if (dateString.length !== 19) return false;

  // Check format with regex
  const regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/;
  if (!regex.test(dateString)) return false;

  // Try to parse it
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}
