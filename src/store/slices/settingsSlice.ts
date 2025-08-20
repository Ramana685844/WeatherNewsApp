import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SettingsState } from '../../types/settings';

const initialState: SettingsState = {
  temperatureUnit: 'celsius',
  newsCategories: ['general', 'technology', 'health'],
  location: null,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setTemperatureUnit: (state, action: PayloadAction<'celsius' | 'fahrenheit'>) => {
      state.temperatureUnit = action.payload;
    },
    setNewsCategories: (state, action: PayloadAction<string[]>) => {
      state.newsCategories = action.payload;
    },
    setLocation: (state, action: PayloadAction<{ latitude: number; longitude: number }>) => {
      state.location = action.payload;
    },
  },
});

export const { setTemperatureUnit, setNewsCategories, setLocation } = settingsSlice.actions;
export default settingsSlice.reducer;