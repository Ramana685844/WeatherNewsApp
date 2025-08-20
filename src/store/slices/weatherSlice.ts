import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { WeatherState } from '../../types/weather';
import { fetchWeatherData, fetchForecastData } from '../../services/weatherApi';

const initialState: WeatherState = {
  current: null,
  forecast: [],
  loading: false,
  error: null,
};

export const getWeatherData = createAsyncThunk(
  'weather/getWeatherData',
  async ({ lat, lon }: { lat: number; lon: number }) => {
    const [current, forecast] = await Promise.all([
      fetchWeatherData(lat, lon),
      fetchForecastData(lat, lon),
    ]);
    return { current, forecast };
  }
);

const weatherSlice = createSlice({
  name: 'weather',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getWeatherData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getWeatherData.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload.current;
        state.forecast = action.payload.forecast;
      })
      .addCase(getWeatherData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch weather data';
      });
  },
});

export const { clearError } = weatherSlice.actions;
export default weatherSlice.reducer;