export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  source: string;
  category: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
}

export interface NewsState {
  articles: NewsArticle[];
  filteredArticles: NewsArticle[];
  loading: boolean;
  error: string | null;
}