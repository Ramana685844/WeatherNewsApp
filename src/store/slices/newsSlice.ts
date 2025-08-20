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
  async (categories: string[], { rejectWithValue }) => {
    try {
      const articles = await fetchNewsData(categories);
      return articles;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const filterNewsBasedOnWeather = createAsyncThunk(
  'news/filterNewsBasedOnWeather',
  async ({ temperature }: { temperature: number }, { getState, dispatch }) => {
    const state = getState() as any;
    let articles = state.news.articles;
    
    if (articles.length === 0) {
      const newsResult = await dispatch(getNewsData(['general', 'technology', 'health']));
      if (getNewsData.fulfilled.match(newsResult)) {
        articles = newsResult.payload;
      } else {
        return [];
      }
    }
    
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
        state.error = null;
      })
      .addCase(getNewsData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to fetch news data';
      })
      .addCase(filterNewsBasedOnWeather.fulfilled, (state, action) => {
        state.filteredArticles = action.payload;
      });
  },
});

export const { clearError } = newsSlice.actions;
export default newsSlice.reducer;