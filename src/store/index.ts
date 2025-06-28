
import { configureStore } from '@reduxjs/toolkit';
import pollSlice from './pollSlice';

export const store = configureStore({
  reducer: {
    poll: pollSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
