import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Linking } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { ExternalLink, Clock, User } from 'lucide-react-native';
import { NewsArticle } from '../types/news';

interface NewsCardProps {
  article: NewsArticle;
}

const NewsCard: React.FC<NewsCardProps> = ({ article }) => {
  const handlePress = () => {
    if (article.url) {
      Linking.openURL(article.url).catch(err => {
        console.error('Failed to open URL:', err);
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      });
    }
  };

  const getSentimentColor = (sentiment?: string): string[] => {
    switch (sentiment) {
      case 'positive':
        return ['#56CCF2', '#2F80ED'];
      case 'negative':
        return ['#FF8A80', '#FF5722'];
      default:
        return ['#A8E6CF', '#56AB2F'];
    }
  };

  const getSentimentIndicator = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive':
        return '😊';
      case 'negative':
        return '😟';
      default:
        return '📰';
    }
  };

  const gradientColors = getSentimentColor(article.sentiment);

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.card}>
        {/* Image Section */}
        {article.urlToImage && (
          <View style={styles.imageContainer}>
            <Image 
              source={{ uri: article.urlToImage }} 
              style={styles.image}
              resizeMode="cover"
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.7)']}
              style={styles.imageOverlay}
            />
            <View style={styles.sentimentIndicator}>
              <Text style={styles.sentimentEmoji}>
                {getSentimentIndicator(article.sentiment)}
              </Text>
            </View>
          </View>
        )}
        
        {/* Content Section */}
        <View style={[styles.content, !article.urlToImage && styles.contentNoImage]}>
          {/* Title */}
          <Text style={styles.title} numberOfLines={3}>
            {article.title}
          </Text>
          
          {/* Description */}
          {article.description && (
            <Text style={styles.description} numberOfLines={2}>
              {article.description}
            </Text>
          )}
          
          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.sourceContainer}>
              <User size={14} color="#7F8C8D" strokeWidth={1.5} />
              <Text style={styles.source} numberOfLines={1}>
                {article.source}
              </Text>
            </View>
            
            <View style={styles.timeContainer}>
              <Clock size={14} color="#7F8C8D" strokeWidth={1.5} />
              <Text style={styles.date}>
                {formatDate(article.publishedAt)}
              </Text>
            </View>
            
            <View style={styles.linkIcon}>
              <ExternalLink size={16} color="#4A90E2" strokeWidth={1.5} />
            </View>
          </View>
        </View>
        
        {/* Category Badge */}
        {article.category && (
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.categoryBadge}
          >
            <Text style={styles.categoryText}>
              {article.category.toUpperCase()}
            </Text>
          </LinearGradient>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 2,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  imageContainer: {
    position: 'relative',
    height: 180,
    width: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  sentimentIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  sentimentEmoji: {
    fontSize: 16,
  },
  content: {
    padding: 20,
  },
  contentNoImage: {
    paddingTop: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 12,
    lineHeight: 24,
  },
  description: {
    fontSize: 15,
    color: '#7F8C8D',
    marginBottom: 16,
    lineHeight: 22,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sourceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  source: {
    fontSize: 13,
    color: '#4A90E2',
    fontWeight: '600',
    marginLeft: 6,
    flex: 1,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  date: {
    fontSize: 13,
    color: '#95A5A6',
    marginLeft: 4,
    fontWeight: '500',
  },
  linkIcon: {
    padding: 4,
  },
  categoryBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  categoryText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});

export default NewsCard;