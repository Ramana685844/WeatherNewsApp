import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { NewsState } from '../../types/news';
import { fetchNewsData } from '../../services/newsApi';
import { filterNewsByWeather } from '../../utils/weatherNewsFilter';

const initialState: NewsState = {
  articles: [],
  filteredArticles: [],
  loading: false,
  error: null,
};

export const getNewsData = createAsyncThunk(
  'news/getNewsData',
  async (categories: string[]) => {
    return await fetchNewsData(categories);
  }
);

export const filterNewsBasedOnWeather = createAsyncThunk(
  'news/filterNewsBasedOnWeather',
  async ({ temperature }: { temperature: number }, { getState }) => {
    const state = getState() as any;
    const articles = state.news.articles;
    return filterNewsByWeather(articles, temperature);
  }
);

const newsSlice = createSlice({
  name: 'news',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getNewsData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getNewsData.fulfilled, (state, action) => {
        state.loading = false;
        state.articles = action.payload;
        state.filteredArticles = action.payload;
      })
      .addCase(getNewsData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch news data';
      })
      .addCase(filterNewsBasedOnWeather.fulfilled, (state, action) => {
        state.filteredArticles = action.payload;
      });
  },
});

export const { clearError } = newsSlice.actions;
export default newsSlice.reducer;