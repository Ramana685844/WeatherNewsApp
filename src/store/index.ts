import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import weatherSlice from './slices/weatherSlice';
import newsSlice from './slices/newsSlice';
import settingsSlice from './slices/settingsSlice';

export const store = configureStore({
  reducer: {
    weather: weatherSlice,
    news: newsSlice,
    settings: settingsSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;