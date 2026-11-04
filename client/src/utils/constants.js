/** Task priority options */
export const PRIORITIES = ['Low', 'Medium', 'High'];

/** Kanban column definitions */
export const STATUSES = [
  { key: 'todo', label: 'To Do' },
  { key: 'in-progress', label: 'In Progress' },
  { key: 'done', label: 'Done' },
];

/** Color mapping for priority badges */
export const PRIORITY_COLORS = {
  Low: '#4caf50',
  Medium: '#ff9800',
  High: '#f44336',
};

/** LocalStorage keys */
export const TOKEN_KEY = 'taskflow_token';
export const USER_KEY = 'taskflow_user';

/** Sort options for the board toolbar */
export const SORT_OPTIONS = [
  { value: '', label: 'Default Order' },
  { value: 'dueDate_asc', label: 'Due Date ↑' },
  { value: 'dueDate_desc', label: 'Due Date ↓' },
];
