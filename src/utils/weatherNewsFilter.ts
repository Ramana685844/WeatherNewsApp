import { NewsArticle } from '../types/news';

const DEPRESSING_KEYWORDS = [
  'death', 'disaster', 'crisis', 'tragedy', 'accident', 'violence', 
  'crime', 'war', 'conflict', 'recession', 'unemployment', 'poverty',
  'collapse', 'failure', 'decline', 'crash', 'loss', 'bankruptcy'
];

const FEAR_KEYWORDS = [
  'danger', 'threat', 'warning', 'alert', 'emergency', 'risk', 
  'hazard', 'terror', 'attack', 'epidemic', 'pandemic', 'outbreak',
  'scary', 'frightening', 'alarming', 'disturbing', 'shocking'
];

const POSITIVE_KEYWORDS = [
  'win', 'victory', 'success', 'achievement', 'celebration', 'joy',
  'happiness', 'breakthrough', 'progress', 'innovation', 'award', 'champion',
  'triumph', 'accomplishment', 'milestone', 'record', 'best', 'excellent',
  'outstanding', 'amazing', 'wonderful', 'fantastic', 'great', 'superb'
];

const containsKeywords = (text: string, keywords: string[]): boolean => {
  const lowerText = text.toLowerCase();
  return keywords.some(keyword => lowerText.includes(keyword));
};

const categorizeArticleSentiment = (article: NewsArticle): 'positive' | 'negative' | 'neutral' => {
  const text = `${article.title} ${article.description}`;
  
  const positiveScore = POSITIVE_KEYWORDS.filter(keyword => 
    text.toLowerCase().includes(keyword)
  ).length;
  
  const negativeScore = [...DEPRESSING_KEYWORDS, ...FEAR_KEYWORDS].filter(keyword => 
    text.toLowerCase().includes(keyword)
  ).length;
  
  if (positiveScore > negativeScore && positiveScore > 0) {
    return 'positive';
  }
  if (negativeScore > positiveScore && negativeScore > 0) {
    return 'negative';
  }
  return 'neutral';
};

export const filterNewsByWeather = (
  articles: NewsArticle[],
  temperature: number
): NewsArticle[] => {
  if (!articles || articles.length === 0) {
    return [];
  }

  const articlesWithSentiment = articles.map(article => ({
    ...article,
    sentiment: categorizeArticleSentiment(article),
  }));

  const isCold = temperature < 10;
  const isHot = temperature > 30;
  const isCool = temperature >= 10 && temperature <= 25;

  let filteredArticles: NewsArticle[] = [];

  if (isCold) {
    filteredArticles = articlesWithSentiment.filter(article => 
      containsKeywords(`${article.title} ${article.description}`, DEPRESSING_KEYWORDS) ||
      article.sentiment === 'negative'
    );
    
    if (filteredArticles.length === 0) {
      filteredArticles = articlesWithSentiment.filter(article => 
        article.sentiment === 'neutral'
      ).slice(0, 10);
    }
  } else if (isHot) {
    filteredArticles = articlesWithSentiment.filter(article => 
      containsKeywords(`${article.title} ${article.description}`, FEAR_KEYWORDS) ||
      (article.sentiment === 'negative' && 
       containsKeywords(`${article.title} ${article.description}`, FEAR_KEYWORDS))
    );
    
    if (filteredArticles.length === 0) {
      filteredArticles = articlesWithSentiment.filter(article => 
        article.sentiment === 'negative'
      ).slice(0, 10);
    }
  } else if (isCool) {
    filteredArticles = articlesWithSentiment.filter(article => 
      article.sentiment === 'positive' || 
      containsKeywords(`${article.title} ${article.description}`, POSITIVE_KEYWORDS)
    );
    
    if (filteredArticles.length === 0) {
      filteredArticles = articlesWithSentiment.filter(article => 
        article.sentiment === 'neutral'
      ).slice(0, 10);
    }
  } else {
    filteredArticles = articlesWithSentiment.slice(0, 15);
  }

  if (filteredArticles.length === 0) {
    filteredArticles = articlesWithSentiment.slice(0, 10);
  }

  return filteredArticles.slice(0, 20);
};