import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import api from '../../services/api';

// ─── Async Thunks ────────────────────────────────────────────────────────────

export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (arg, { rejectWithValue }) => {
    try {
      const boardId = typeof arg === 'object' && arg !== null ? arg.boardId : arg;
      const params = typeof arg === 'object' && arg !== null ? arg.params : {};
      const { data } = await api.get(`/boards/${boardId}/tasks`, { params });
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to fetch tasks.'
      );
    }
  }
);

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (arg, { rejectWithValue }) => {
    try {
      const boardId = arg.boardId || (arg.data && arg.data.board) || arg.board;
      const taskData = arg.data || arg;
      const { data } = await api.post(`/boards/${boardId}/tasks`, taskData);
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to create task.'
      );
    }
  }
);

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ id, data: taskData }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/tasks/${id}`, taskData);
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to update task.'
      );
    }
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/tasks/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to delete task.'
      );
    }
  }
);

export const reorderTask = createAsyncThunk(
  'tasks/reorderTask',
  async ({ id, data: taskData }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/tasks/${id}`, taskData);
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to reorder task.'
      );
    }
  }
);

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState = {
  tasks: [],
  taskSnapshot: [], // used for drag-drop rollback
  loading: false,
  error: null,
  filters: {
    search: '',
    priority: '',
    sort: '', // 'dueDate_asc' | 'dueDate_desc'
  },
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setFilter(state, action) {
      if (action.payload.key !== undefined) {
        state.filters[action.payload.key] = action.payload.value;
      } else {
        state.filters = { ...state.filters, ...action.payload };
      }
    },
    optimisticUpdateTask(state, action) {
      // Save snapshot before optimistic change
      state.taskSnapshot = JSON.parse(JSON.stringify(state.tasks));
      const { id, changes } = action.payload;
      const idx = state.tasks.findIndex((t) => t._id === id);
      if (idx !== -1) {
        state.tasks[idx] = { ...state.tasks[idx], ...changes };
      }
    },
    rollbackTask(state) {
      // Restore snapshot on failure
      state.tasks = state.taskSnapshot;
      state.taskSnapshot = [];
    },
    clearTasksError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // ── fetchTasks ──
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = Array.isArray(action.payload)
          ? action.payload
          : action.payload.data || action.payload.tasks || [];
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ── createTask ──
    builder
      .addCase(createTask.pending, (state) => {
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        const task = action.payload.data || action.payload.task || action.payload;
        state.tasks.push(task);
      })
      .addCase(createTask.rejected, (state, action) => {
        state.error = action.payload;
      });

    // ── updateTask ──
    builder
      .addCase(updateTask.fulfilled, (state, action) => {
        const updated = action.payload.data || action.payload.task || action.payload;
        const idx = state.tasks.findIndex((t) => t._id === updated._id);
        if (idx !== -1) state.tasks[idx] = updated;
        // Clear snapshot on successful sync
        state.taskSnapshot = [];
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.error = action.payload;
        // Rollback optimistic update
        if (state.taskSnapshot.length > 0) {
          state.tasks = state.taskSnapshot;
          state.taskSnapshot = [];
        }
      });

    // ── deleteTask ──
    builder
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter((t) => t._id !== action.payload);
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.error = action.payload;
      });

    // ── reorderTask ──
    builder
      .addCase(reorderTask.fulfilled, (state, action) => {
        const updated = action.payload.task || action.payload;
        const idx = state.tasks.findIndex((t) => t._id === updated._id);
        if (idx !== -1) state.tasks[idx] = updated;
        state.taskSnapshot = [];
      })
      .addCase(reorderTask.rejected, (state, action) => {
        state.error = action.payload;
        if (state.taskSnapshot.length > 0) {
          state.tasks = state.taskSnapshot;
          state.taskSnapshot = [];
        }
      });
  },
});

export const { setFilter, optimisticUpdateTask, rollbackTask, clearTasksError } =
  tasksSlice.actions;

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectTasks = (state) => state.tasks.tasks;
export const selectFilters = (state) => state.tasks.filters;
export const selectTasksLoading = (state) => state.tasks.loading;
export const selectTasksError = (state) => state.tasks.error;

/**
 * Memoized selector that applies search, priority and sort filters client-side.
 */
export const selectFilteredTasks = createSelector(
  [selectTasks, selectFilters],
  (tasks, filters) => {
    let result = [...tasks];

    // Search filter (case-insensitive title match)
    if (filters.search && filters.search.trim()) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (t) =>
          t.title?.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q)
      );
    }

    // Priority filter
    if (filters.priority) {
      result = result.filter(
        (t) => t.priority?.toLowerCase() === filters.priority.toLowerCase()
      );
    }

    // Sort filter
    if (filters.sort === 'dueDate_asc') {
      result.sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      });
    } else if (filters.sort === 'dueDate_desc') {
      result.sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(b.dueDate) - new Date(a.dueDate);
      });
    } else {
      // Default: sort by order field within each status group
      result.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    }

    return result;
  }
);

export default tasksSlice.reducer;
