import axios from 'axios';
import { NewsArticle } from '../types/news';

const NEWS_API_KEY = '38de93d339014362979b72d3e9db65b4';
const BASE_URL = 'https://newsapi.org/v2';

export const fetchNewsData = async (categories: string[]): Promise<NewsArticle[]> => {
  try {
    let allArticles: NewsArticle[] = [];
    
    try {
      const countryResponse = await axios.get(
        `${BASE_URL}/top-headlines?country=us&apiKey=${NEWS_API_KEY}&pageSize=50`
      );
      
      if (countryResponse.data.articles && countryResponse.data.articles.length > 0) {
        allArticles = countryResponse.data.articles.map((article: any, index: number) => ({
          id: `${index}-${Date.now()}`,
          title: article.title,
          description: article.description || '',
          url: article.url,
          urlToImage: article.urlToImage,
          publishedAt: article.publishedAt,
          source: article.source.name,
          category: 'general',
        }));
        
        return allArticles;
      }
    } catch (countryError) {
      // Try individual categories if country fails
    }
    
    for (const category of categories) {
      try {
        const response = await axios.get(
          `${BASE_URL}/top-headlines?category=${category}&apiKey=${NEWS_API_KEY}&pageSize=20`
        );
        
        if (response.data.articles && response.data.articles.length > 0) {
          const categoryArticles = response.data.articles.map((article: any, index: number) => ({
            id: `${category}-${index}-${Date.now()}`,
            title: article.title,
            description: article.description || '',
            url: article.url,
            urlToImage: article.urlToImage,
            publishedAt: article.publishedAt,
            source: article.source.name,
            category: category,
          }));
          
          allArticles.push(...categoryArticles);
          
          if (allArticles.length >= 15) break;
        }
      } catch (categoryError) {
        continue;
      }
    }
    
    if (allArticles.length === 0) {
      try {
        const generalResponse = await axios.get(
          `${BASE_URL}/everything?q=news OR breaking OR today&language=en&sortBy=publishedAt&apiKey=${NEWS_API_KEY}&pageSize=30`
        );
        
        if (generalResponse.data.articles && generalResponse.data.articles.length > 0) {
          allArticles = generalResponse.data.articles.map((article: any, index: number) => ({
            id: `general-${index}-${Date.now()}`,
            title: article.title,
            description: article.description || '',
            url: article.url,
            urlToImage: article.urlToImage,
            publishedAt: article.publishedAt,
            source: article.source.name,
            category: 'general',
          }));
        }
      } catch (generalError) {
        // Continue to throw error below
      }
    }
    
    if (allArticles.length === 0) {
      throw new Error('No articles found from any endpoint. This might be due to API rate limits or subscription issues.');
    }
    
    return allArticles;
    
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 429) {
        throw new Error('News API rate limit exceeded. Please try again later.');
      } else if (error.response?.status === 401) {
        throw new Error('News API key is invalid or expired.');
      } else if (error.response?.status === 403) {
        throw new Error('News API access forbidden. Check your subscription plan.');
      }
    }
    throw new Error('Failed to fetch news data');
  }
};