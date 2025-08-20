import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  Cloud,
  Sun,
  CloudRain,
  CloudSnow,
  MapPin,
  Thermometer,
  Droplets,
  Wind,
  Calendar,
  AlertCircle,
  Newspaper,
  RefreshCw,
} from 'lucide-react-native';
import { useAppDispatch, useAppSelector } from '../store';
import { getWeatherData } from '../store/slices/weatherSlice';
import { getNewsData, filterNewsBasedOnWeather } from '../store/slices/newsSlice';
import { setLocation } from '../store/slices/settingsSlice';
import { getCurrentLocation, requestLocationPermission } from '../services/locationService';
import NewsCard from '../components/NewsCard';
import ForecastItem from '../components/ForecastItem';
import LoadingSpinner from '../components/LoadingSpinner';
import { SafeAreaView } from 'react-native-safe-area-context';

const HomeScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { current: weather, forecast, loading: weatherLoading, error: weatherError } = useAppSelector(state => state.weather);
  const { filteredArticles, loading: newsLoading, error: newsError, articles } = useAppSelector(state => state.news);
  const { temperatureUnit, newsCategories } = useAppSelector(state => state.settings);

  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const getWeatherIcon = (condition: string) => {
    const iconMap: { [key: string]: any } = {
      'Clear': Sun,
      'Clouds': Cloud,
      'Rain': CloudRain,
      'Snow': CloudSnow,
      'Drizzle': CloudRain,
      'Thunderstorm': CloudRain,
      'Mist': Cloud,
      'Fog': Cloud,
      'Haze': Cloud,
    };
    return iconMap[condition] || Cloud;
  };

  const getWeatherCategory = (temperature: number): string => {
    if (temperature < 10) return 'Cold Weather';
    if (temperature > 30) return 'Hot Weather';
    if (temperature >= 10 && temperature <= 25) return 'Cool Weather';
    return 'Moderate Weather';
  };

  const getWeatherGradient = (temperature: number): string[] => {
    if (temperature < 10) return ['#667eea', '#764ba2']; // Cold - Purple/Blue
    if (temperature > 30) return ['#f093fb', '#f5576c']; // Hot - Pink/Red
    if (temperature >= 10 && temperature <= 25) return ['#4facfe', '#00f2fe']; // Cool - Blue/Cyan
    return ['#43e97b', '#38f9d7']; // Moderate - Green/Cyan
  };

  const loadData = useCallback(async () => {
    try {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        Alert.alert(
          'Location Required',
          'This app needs location access to provide weather information and relevant news.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Try Again', onPress: loadData }
          ]
        );
        return;
      }

      const currentLocation = await getCurrentLocation();
      dispatch(setLocation(currentLocation));

      const weatherLocation = {
        lat: currentLocation.latitude,
        lon: currentLocation.longitude,
      };

      // Load weather and news data in parallel
      const [weatherResult, newsResult] = await Promise.all([
        dispatch(getWeatherData(weatherLocation)),
        dispatch(getNewsData(newsCategories))
      ]);
      
      // Filter news based on weather after both are loaded
      if (getWeatherData.fulfilled.match(weatherResult) && getNewsData.fulfilled.match(newsResult)) {
        const weatherPayload = weatherResult.payload as { current: { temperature: number } };
        if (weatherPayload?.current) {
          dispatch(filterNewsBasedOnWeather({
            temperature: weatherPayload.current.temperature,
          }));
        }
      } else if (getWeatherData.fulfilled.match(weatherResult)) {
        const weatherPayload = weatherResult.payload as { current: { temperature: number } };
        if (weatherPayload?.current && articles.length > 0) {
          dispatch(filterNewsBasedOnWeather({
            temperature: weatherPayload.current.temperature,
          }));
        }
      }

      setLastUpdated(new Date());
    } catch (error) {
      let errorMessage = 'Failed to load data. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('permission')) {
          errorMessage = 'Location permission is required to show weather information.';
        } else if (error.message.includes('Location unavailable')) {
          errorMessage = 'Unable to get your location. Please check your GPS settings and try again.';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Location request timed out. Please try again.';
        }
      }
      
      Alert.alert('Error', errorMessage, [
        { text: 'OK' },
        { text: 'Retry', onPress: loadData }
      ]);
    }
  }, [dispatch, newsCategories, articles.length]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (weather && articles.length > 0) {
      dispatch(filterNewsBasedOnWeather({
        temperature: weather.temperature,
      }));
    }
  }, [weather?.temperature, articles.length, dispatch, weather]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const renderWeatherHeader = () => {
    if (!weather) return null;

    const WeatherIcon = getWeatherIcon(weather.condition);
    const gradientColors = getWeatherGradient(weather.temperature);
    const weatherCategory = getWeatherCategory(weather.temperature);

    return (
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.weatherHeader}
      >
        <View style={styles.weatherHeaderContent}>
          {/* Location Row */}
          <View style={styles.locationContainer}>
            <MapPin size={18} color="rgba(255,255,255,0.9)" />
            <Text style={styles.locationText}>{weather.location}</Text>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{weatherCategory}</Text>
            </View>
          </View>
          
          {/* Main Weather Display */}
          <View style={styles.mainWeatherInfo}>
            <View style={styles.iconContainer}>
              <WeatherIcon size={80} color="white" strokeWidth={1.5} />
            </View>
            <View style={styles.temperatureContainer}>
              <Text style={styles.mainTemperature}>
                {temperatureUnit === 'celsius' 
                  ? `${weather.temperature}°` 
                  : `${Math.round((weather.temperature * 9/5) + 32)}°`}
              </Text>
              <Text style={styles.temperatureUnit}>
                {temperatureUnit === 'celsius' ? 'C' : 'F'}
              </Text>
            </View>
          </View>

          <Text style={styles.weatherCondition}>{weather.description}</Text>

          {/* Weather Details Grid */}
          <View style={styles.weatherDetailsGrid}>
            <View style={styles.weatherDetailCard}>
              <Thermometer size={18} color="rgba(255,255,255,0.8)" strokeWidth={1.5} />
              <Text style={styles.weatherDetailLabel}>Feels like</Text>
              <Text style={styles.weatherDetailValue}>
                {temperatureUnit === 'celsius' 
                  ? `${weather.feelsLike}°C` 
                  : `${Math.round((weather.feelsLike * 9/5) + 32)}°F`}
              </Text>
            </View>
            
            <View style={styles.weatherDetailCard}>
              <Droplets size={18} color="rgba(255,255,255,0.8)" strokeWidth={1.5} />
              <Text style={styles.weatherDetailLabel}>Humidity</Text>
              <Text style={styles.weatherDetailValue}>{weather.humidity}%</Text>
            </View>
            
            <View style={styles.weatherDetailCard}>
              <Wind size={18} color="rgba(255,255,255,0.8)" strokeWidth={1.5} />
              <Text style={styles.weatherDetailLabel}>Wind</Text>
              <Text style={styles.weatherDetailValue}>{weather.windSpeed} m/s</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    );
  };

  const renderForecast = () => {
    if (forecast.length === 0) return null;

    return (
      <View style={styles.forecastSection}>
        <View style={styles.sectionHeader}>
          <Calendar size={22} color="#2C3E50" strokeWidth={2} />
          <Text style={styles.sectionTitle}>5-Day Forecast</Text>
        </View>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.forecastScrollContainer}
        >
          {forecast.map((item, index) => (
            <View key={`${item.date}-${index}`} style={styles.forecastCard}>
              <ForecastItem forecast={item} temperatureUnit={temperatureUnit} />
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderNewsSection = () => {
    const hasNews = filteredArticles.length > 0;
    const weatherCategory = weather ? getWeatherCategory(weather.temperature) : '';

    return (
      <View style={styles.newsSection}>
        <View style={styles.sectionHeader}>
          <Newspaper size={22} color="#2C3E50" strokeWidth={2} />
          <View style={styles.newsTitleContainer}>
            <Text style={styles.sectionTitle}>Weather-Based News</Text>
            {weather && (
              <View style={styles.newsCategoryBadge}>
                <Text style={styles.newsCategoryText}>{weatherCategory}</Text>
              </View>
            )}
          </View>
        </View>

        {newsError && (
          <View style={styles.errorContainer}>
            <View style={styles.errorIconContainer}>
              <AlertCircle size={32} color="#FF6B6B" strokeWidth={2} />
            </View>
            <Text style={styles.errorTitle}>Unable to load news</Text>
            <Text style={styles.errorText}>
              {newsError}
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadData}>
              <RefreshCw size={16} color="#4A90E2" strokeWidth={2} />
              <Text style={styles.retryText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        )}

        {!newsError && (
          <>
            {newsLoading ? (
              <View style={styles.newsLoadingContainer}>
                <LoadingSpinner />
                <Text style={styles.loadingText}>Loading personalized news...</Text>
              </View>
            ) : hasNews ? (
              <FlatList
                data={filteredArticles}
                renderItem={({ item }) => <NewsCard article={item} />}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
                ItemSeparatorComponent={() => <View style={styles.newsItemSeparator} />}
              />
            ) : (
              <View style={styles.noNewsContainer}>
                <View style={styles.noNewsIconContainer}>
                  <Newspaper size={64} color="#BDC3C7" strokeWidth={1} />
                </View>
                <Text style={styles.noNewsTitle}>No News Available</Text>
                <Text style={styles.noNewsText}>
                  We couldn't find any relevant news articles based on the current weather conditions. Please try refreshing or check your internet connection.
                </Text>
                <TouchableOpacity style={styles.retryButton} onPress={loadData}>
                  <RefreshCw size={16} color="#4A90E2" strokeWidth={2} />
                  <Text style={styles.retryText}>Refresh</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </View>
    );
  };

  if (weatherLoading && !weather) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.loadingGradient}
        >
          <LoadingSpinner />
          <Text style={styles.loadingText}>Getting your location and weather...</Text>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (weatherError && !weather) {
    return (
      <SafeAreaView style={styles.errorScreenContainer}>
        <LinearGradient
          colors={['#f093fb', '#f5576c']}
          style={styles.errorGradient}
        >
          <AlertCircle size={64} color="white" strokeWidth={2} />
          <Text style={styles.errorTitle}>Weather Unavailable</Text>
          <Text style={styles.errorText}>{weatherError}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadData}>
            <RefreshCw size={16} color="#4A90E2" strokeWidth={2} />
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor="#4A90E2"
            colors={['#4A90E2']}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderWeatherHeader()}
        {renderForecast()}
        {renderNewsSection()}
        
        {lastUpdated && (
          <View style={styles.lastUpdatedContainer}>
            <RefreshCw size={14} color="#95A5A6" strokeWidth={2} />
            <Text style={styles.lastUpdatedText}>
              Last updated: {lastUpdated.toLocaleTimeString()}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
  },
  loadingGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    fontWeight: '500',
  },
  weatherHeader: {
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20, // Reduced from 25 to fix spacing
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 15,
  },
  weatherHeaderContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 30,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  locationText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  categoryBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 15,
    marginLeft: 8,
  },
  categoryText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  mainWeatherInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  iconContainer: {
    padding: 10,
  },
  temperatureContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
  },
  mainTemperature: {
    color: 'white',
    fontSize: 72,
    fontWeight: '300',
    lineHeight: 72,
  },
  temperatureUnit: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 24,
    fontWeight: '300',
    marginTop: 8,
    marginLeft: 4,
  },
  weatherCondition: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 18,
    textTransform: 'capitalize',
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '500',
  },
  weatherDetailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weatherDetailCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  weatherDetailLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 8,
    marginBottom: 4,
  },
  weatherDetailValue: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  forecastSection: {
    marginHorizontal: 20,
    marginBottom: 25, // Reduced from 30
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2C3E50',
    marginLeft: 12,
  },
  forecastScrollContainer: {
    paddingHorizontal: 8,
  },
  forecastCard: {
    marginHorizontal: 6,
  },
  newsSection: {
    marginHorizontal: 20,
  },
  newsTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 12,
  },
  newsCategoryBadge: {
    backgroundColor: '#E8F4FD',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 12,
  },
  newsCategoryText: {
    color: '#4A90E2',
    fontSize: 11,
    fontWeight: '600',
  },
  newsLoadingContainer: {
    alignItems: 'center',
    paddingVertical: 50,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 50,
    paddingHorizontal: 30,
  },
  errorScreenContainer: {
    flex: 1,
  },
  errorGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  errorIconContainer: {
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2C3E50',
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF3FD',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: '#4A90E2',
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  retryText: {
    color: '#4A90E2',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  noNewsContainer: {
    alignItems: 'center',
    paddingVertical: 50,
    paddingHorizontal: 30,
  },
  noNewsIconContainer: {
    marginBottom: 20,
  },
  noNewsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 12,
    textAlign: 'center',
  },
  noNewsText: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  newsItemSeparator: {
    height: 12,
  },
  lastUpdatedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
    paddingBottom: 10,
  },
  lastUpdatedText: {
    fontSize: 13,
    color: '#95A5A6',
    marginLeft: 8,
    fontWeight: '500',
  },
});

export default HomeScreen;