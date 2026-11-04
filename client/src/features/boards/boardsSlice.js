import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// ─── Async Thunks ────────────────────────────────────────────────────────────

export const fetchBoards = createAsyncThunk(
  'boards/fetchBoards',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/boards');
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to fetch boards.'
      );
    }
  }
);

export const createBoard = createAsyncThunk(
  'boards/createBoard',
  async (title, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/boards', { title });
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to create board.'
      );
    }
  }
);

export const updateBoard = createAsyncThunk(
  'boards/updateBoard',
  async ({ id, title }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/boards/${id}`, { title });
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to update board.'
      );
    }
  }
);

export const deleteBoard = createAsyncThunk(
  'boards/deleteBoard',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/boards/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to delete board.'
      );
    }
  }
);

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState = {
  boards: [],
  loading: false,
  error: null,
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const boardsSlice = createSlice({
  name: 'boards',
  initialState,
  reducers: {
    clearBoardsError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // ── fetchBoards ──
    builder
      .addCase(fetchBoards.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBoards.fulfilled, (state, action) => {
        state.loading = false;
        state.boards = Array.isArray(action.payload)
          ? action.payload
          : action.payload.data || action.payload.boards || [];
      })
      .addCase(fetchBoards.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ── createBoard ──
    builder
      .addCase(createBoard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBoard.fulfilled, (state, action) => {
        state.loading = false;
        const board = action.payload.data || action.payload.board || action.payload;
        state.boards.unshift(board);
      })
      .addCase(createBoard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ── updateBoard ──
    builder
      .addCase(updateBoard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBoard.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload.data || action.payload.board || action.payload;
        const idx = state.boards.findIndex((b) => b._id === updated._id);
        if (idx !== -1) state.boards[idx] = updated;
      })
      .addCase(updateBoard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ── deleteBoard ──
    builder
      .addCase(deleteBoard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBoard.fulfilled, (state, action) => {
        state.loading = false;
        state.boards = state.boards.filter((b) => b._id !== action.payload);
      })
      .addCase(deleteBoard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearBoardsError } = boardsSlice.actions;

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectBoards = (state) => state.boards.boards;
export const selectBoardsLoading = (state) => state.boards.loading;
export const selectBoardsError = (state) => state.boards.error;

export default boardsSlice.reducer;
