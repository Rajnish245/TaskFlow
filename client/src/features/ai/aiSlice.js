import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// ─── Async Thunks ────────────────────────────────────────────────────────────

export const generateSubtasks = createAsyncThunk(
  'ai/generateSubtasks',
  async (goal, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/ai/breakdown', { goal });
      return data;
    } catch (err) {
      const status = err.response?.status;
      const message =
        status === 429
          ? 'AI is busy, please try again in a minute.'
          : err.response?.data?.message || 'Failed to generate subtasks.';
      return rejectWithValue(message);
    }
  }
);

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState = {
  subtasks: [],
  loading: false,
  error: null,
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    clearAI(state) {
      state.subtasks = [];
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(generateSubtasks.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.subtasks = [];
      })
      .addCase(generateSubtasks.fulfilled, (state, action) => {
        state.loading = false;
        // API may return { subtasks: [...] } or { tasks: [...] } or directly an array
        state.subtasks = Array.isArray(action.payload)
          ? action.payload
          : action.payload.subtasks || action.payload.tasks || [];
      })
      .addCase(generateSubtasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearAI } = aiSlice.actions;

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectSubtasks = (state) => state.ai.subtasks;
export const selectAISubtasks = (state) => state.ai.subtasks;
export const selectAILoading = (state) => state.ai.loading;
export const selectAIError = (state) => state.ai.error;

export default aiSlice.reducer;
