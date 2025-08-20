import axios from 'axios';
import { NewsArticle } from '../types/news';

const NEWS_API_KEY = '38de93d339014362979b72d3e9db65b4';
const BASE_URL = 'https://newsapi.org/v2';

export const fetchNewsData = async (categories: string[]): Promise<NewsArticle[]> => {
  try {
    const categoryString = categories.join(',');
    const response = await axios.get(
      `${BASE_URL}/top-headlines?category=${categoryString}&apiKey=${NEWS_API_KEY}&pageSize=50`
    );


    
    return response.data.articles.map((article: any, index: number) => ({
      id: `${index}-${Date.now()}`,
      title: article.title,
      description: article.description || '',
      url: article.url,
      urlToImage: article.urlToImage,
      publishedAt: article.publishedAt,
      source: article.source.name,
      category: 'general',
    }));
  } catch (error) {
    throw new Error('Failed to fetch news data');
  }
};