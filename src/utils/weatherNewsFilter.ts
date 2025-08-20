import { NewsArticle } from '../types/news';

const DEPRESSING_KEYWORDS = [
  'death', 'disaster', 'crisis', 'tragedy', 'accident', 'violence', 
  'crime', 'war', 'conflict', 'recession', 'unemployment', 'poverty'
];

const FEAR_KEYWORDS = [
  'danger', 'threat', 'warning', 'alert', 'emergency', 'risk', 
  'hazard', 'terror', 'attack', 'epidemic', 'pandemic', 'outbreak'
];

const POSITIVE_KEYWORDS = [
  'win', 'victory', 'success', 'achievement', 'celebration', 'joy',
  'happiness', 'breakthrough', 'progress', 'innovation', 'award', 'champion'
];

const containsKeywords = (text: string, keywords: string[]): boolean => {
  const lowerText = text.toLowerCase();
  return keywords.some(keyword => lowerText.includes(keyword));
};

const categorizeArticleSentiment = (article: NewsArticle): 'positive' | 'negative' | 'neutral' => {
  const text = `${article.title} ${article.description}`;
  
  if (containsKeywords(text, POSITIVE_KEYWORDS)) {
    return 'positive';
  }
  if (containsKeywords(text, DEPRESSING_KEYWORDS) || containsKeywords(text, FEAR_KEYWORDS)) {
    return 'negative';
  }
  return 'neutral';
};

export const filterNewsByWeather = (
  articles: NewsArticle[],
  temperature: number
): NewsArticle[] => {
  const articlesWithSentiment = articles.map(article => ({
    ...article,
    sentiment: categorizeArticleSentiment(article),
  }));

  // Weather conditions mapping
  const isCold = temperature < 10; // Below 10°C
  const isHot = temperature > 30; // Above 30°C
  const isCool = temperature >= 10 && temperature <= 25; // Between 10-25°C

  if (isCold) {
    // Cold weather: show depressing news
    const depressingNews = articlesWithSentiment.filter(article => 
      containsKeywords(`${article.title} ${article.description}`, DEPRESSING_KEYWORDS)
    );
    return depressingNews.length > 0 ? depressingNews : articlesWithSentiment.slice(0, 10);
  }
  
  if (isHot) {
    // Hot weather: show fear-related news
    const fearNews = articlesWithSentiment.filter(article => 
      containsKeywords(`${article.title} ${article.description}`, FEAR_KEYWORDS)
    );
    return fearNews.length > 0 ? fearNews : articlesWithSentiment.slice(0, 10);
  }
  
  if (isCool) {
    // Cool weather: show positive/winning news
    const positiveNews = articlesWithSentiment.filter(article => 
      article.sentiment === 'positive' || 
      containsKeywords(`${article.title} ${article.description}`, POSITIVE_KEYWORDS)
    );
    return positiveNews.length > 0 ? positiveNews : articlesWithSentiment.slice(0, 10);
  }

  // Default: return all articles
  return articlesWithSentiment.slice(0, 15);
};