import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import boardsReducer from '../features/boards/boardsSlice';
import tasksReducer from '../features/tasks/tasksSlice';
import aiReducer from '../features/ai/aiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    boards: boardsReducer,
    tasks: tasksReducer,
    ai: aiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});
