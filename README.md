# Morgen Tasks for Raycast

A Raycast extension for managing your Morgen tasks directly from Raycast.

## Features

- 📋 **List Tasks** - View all your Morgen tasks with filtering by status
- ➕ **Create Task** - Create new tasks with full field support (title, description, due date, priority, status, notes, tags)
- ✏️ **Update Task** - Edit existing tasks
- ✅ **Toggle Status** - Quickly mark tasks as complete or incomplete
- 🗑️ **Delete Task** - Remove tasks you no longer need
- 🔍 **Search** - Filter tasks by title or description
- 🎨 **Visual Indicators** - Priority colors and status icons for quick reference

## Installation

### Prerequisites

- [Raycast](https://www.raycast.com/) installed on your Mac
- A Morgen account with API access
- Node.js 20.x or later

### Setup

1. Clone this repository or download the source code
2. Install dependencies:
   ```bash
   npm install
   ```

3. Get your Morgen API key:
   - Visit https://platform.morgen.so
   - Generate an API key from your account settings

4. Build and run in development mode:
   ```bash
   npm run dev
   ```

5. In Raycast, configure the extension by entering your Morgen API key when prompted

## Usage

### List Tasks
- Open Raycast and type "List Tasks"
- Browse your tasks with visual indicators for priority and status
- Use the dropdown to filter by status (All, Needs Action, Completed, Cancelled)
- Search tasks by title or description
- Select a task to view details or perform actions:
  - **View Details** - See all task information
  - **Edit Task** - Update task fields
  - **Mark as Complete/Incomplete** - Toggle task status (⌘T)
  - **Delete Task** - Remove the task (⌘D)
  - **Refresh** - Reload the task list (⌘R)

### Create Task
- Open Raycast and type "Create Task"
- Fill in the task details:
  - **Title** (required) - The task name
  - **Description** (optional) - Detailed task description
  - **Due Date** (optional) - When the task is due
  - **Due Time** (optional) - Specific time for the due date
  - **Priority** (optional) - 0-9, where 1 is highest and 9 is lowest
  - **Status** (optional) - Needs Action, Completed, or Cancelled
  - **Notes** (optional) - Additional notes
  - **Tags** (optional) - Comma-separated tags
- Press Enter or click "Create Task" to save

### Update Task
- From the task list, select a task and choose "Edit Task" (⌘E)
- Modify any fields you want to update
- Press Enter or click "Update Task" to save changes

## API Integration

This extension uses the Morgen API v3 to manage tasks. All data is synchronized with your Morgen account in real-time.

### API Endpoints Used
- `GET /v3/tasks/list` - Fetch all tasks
- `GET /v3/tasks/{id}` - Get a specific task
- `POST /v3/tasks` - Create a new task
- `PATCH /v3/tasks/{id}` - Update a task
- `DELETE /v3/tasks/{id}` - Delete a task

### Date Format
The extension automatically handles the Morgen API's required date format (ISO 8601 LocalDateTime: `YYYY-MM-DDTHH:mm:ss`). You can use the native date pickers in the UI.

### Priority Levels
- **0** - None (no priority)
- **1-3** - High priority (🔴)
- **4-6** - Medium priority (🟡)
- **7-9** - Low priority (🟢)

## Security

Your Morgen API key is stored securely using Raycast's built-in preference storage. The key is encrypted and stored locally on your machine, never transmitted to third parties.

## Development

### Commands
- `npm run dev` - Start development mode with hot reload
- `npm run build` - Build the extension for production
- `npm run lint` - Run ESLint to check code quality
- `npm run fix-lint` - Automatically fix linting issues

### Project Structure
```
src/
  ├── api/
  │   └── morgen.ts        # Morgen API client
  ├── create-task.tsx      # Create task command
  ├── list-tasks.tsx       # List tasks command
  ├── update-task.tsx      # Update task component
  ├── types.ts             # TypeScript type definitions
  └── utils.ts             # Utility functions
```

## Troubleshooting

### "Failed to load tasks" error
- Verify your API key is correct
- Check your internet connection
- Ensure you have an active Morgen account

### Date format errors
- The extension handles date formatting automatically
- If you encounter date errors, ensure your system time zone is set correctly

### Tasks not updating
- Try refreshing the task list (⌘R)
- Check the Morgen web app to verify the task exists
- Ensure you have proper permissions for the task

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

MIT

## Links

- [Morgen Website](https://morgen.so)
- [Morgen API Documentation](https://docs.morgen.so/tasks)
- [Raycast Developer Documentation](https://developers.raycast.com)

## Support

For issues with:
- The extension: Open an issue in this repository
- Morgen API: Contact Morgen support at https://morgen.so/support
- Raycast: Visit https://raycast.com/support