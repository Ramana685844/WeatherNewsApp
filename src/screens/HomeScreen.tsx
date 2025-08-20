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

  const getWeatherCategoryColor = (temperature: number): string => {
    if (temperature < 10) return '#4A90E2';
    if (temperature > 30) return '#FF6B6B';
    if (temperature >= 10 && temperature <= 25) return '#4ECDC4';
    return '#95A5A6';
  };

  const loadData = useCallback(async () => {
    try {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        Alert.alert(
          'Location Required',
          'This app needs location access to provide weather information and relevant news.'
        );
        return;
      }

      const currentLocation = await getCurrentLocation();
      dispatch(setLocation(currentLocation));

      const weatherLocation = {
        lat: currentLocation.latitude,
        lon: currentLocation.longitude,
      };

      const weatherResult = await dispatch(getWeatherData(weatherLocation));
      const newsResult = await dispatch(getNewsData(newsCategories));
      
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
          errorMessage = 'Unable to get your location. Please check your GPS settings.';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Location request timed out. Please try again.';
        }
      }
      
      Alert.alert('Error', errorMessage);
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
    const categoryColor = getWeatherCategoryColor(weather.temperature);

    return (
      <View style={[styles.weatherHeader, { backgroundColor: categoryColor }]}>
        <View style={styles.weatherHeaderContent}>
          <View style={styles.locationContainer}>
            <MapPin size={16} color="white" />
            <Text style={styles.locationText}>{weather.location}</Text>
          </View>
          
          <View style={styles.mainWeatherInfo}>
            <WeatherIcon size={60} color="white" />
            <View style={styles.temperatureContainer}>
              <Text style={styles.mainTemperature}>
                {temperatureUnit === 'celsius' 
                  ? `${weather.temperature}°C` 
                  : `${Math.round((weather.temperature * 9/5) + 32)}°F`}
              </Text>
              <Text style={styles.weatherCondition}>{weather.description}</Text>
            </View>
          </View>

          <View style={styles.weatherDetails}>
            <View style={styles.weatherDetailItem}>
              <Thermometer size={16} color="rgba(255,255,255,0.8)" />
              <Text style={styles.weatherDetailText}>
                Feels {temperatureUnit === 'celsius' 
                  ? `${weather.feelsLike}°C` 
                  : `${Math.round((weather.feelsLike * 9/5) + 32)}°F`}
              </Text>
            </View>
            <View style={styles.weatherDetailItem}>
              <Droplets size={16} color="rgba(255,255,255,0.8)" />
              <Text style={styles.weatherDetailText}>{weather.humidity}%</Text>
            </View>
            <View style={styles.weatherDetailItem}>
              <Wind size={16} color="rgba(255,255,255,0.8)" />
              <Text style={styles.weatherDetailText}>{weather.windSpeed} m/s</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderForecast = () => {
    if (forecast.length === 0) return null;

    return (
      <View style={styles.forecastSection}>
        <View style={styles.sectionHeader}>
          <Calendar size={20} color="#333" />
          <Text style={styles.sectionTitle}>5-Day Forecast</Text>
        </View>
        <FlatList
          data={forecast}
          renderItem={({ item }) => (
            <ForecastItem forecast={item} temperatureUnit={temperatureUnit} />
          )}
          keyExtractor={(item) => item.date}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.forecastList}
        />
      </View>
    );
  };

  const renderNewsSection = () => {
    const hasNews = filteredArticles.length > 0;
    const weatherCategory = weather ? getWeatherCategory(weather.temperature) : '';
    const categoryColor = weather ? getWeatherCategoryColor(weather.temperature) : '#4A90E2';

    return (
      <View style={styles.newsSection}>
        <View style={styles.sectionHeader}>
          <Newspaper size={20} color="#333" />
          <Text style={styles.sectionTitle}>
            Weather-Based News
            {weather && (
              <Text style={[styles.weatherCategoryTag, { color: categoryColor }]}>
                {` (${weatherCategory})`}
              </Text>
            )}
          </Text>
        </View>

        {newsError && (
          <View style={styles.errorContainer}>
            <AlertCircle size={24} color="#FF6B6B" />
            <Text style={styles.errorText}>
              Unable to load news. {newsError}
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadData}>
              <RefreshCw size={16} color="#4A90E2" />
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
              />
            ) : (
              <View style={styles.noNewsContainer}>
                <Newspaper size={48} color="#CCC" />
                <Text style={styles.noNewsTitle}>No News Available</Text>
                <Text style={styles.noNewsText}>
                  No news articles are currently available. This might be due to API limitations or network issues.
                </Text>
                <TouchableOpacity style={styles.retryButton} onPress={loadData}>
                  <RefreshCw size={16} color="#4A90E2" />
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
        <LoadingSpinner />
        <Text style={styles.loadingText}>Getting your location and weather...</Text>
      </SafeAreaView>
    );
  }

  if (weatherError && !weather) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <AlertCircle size={48} color="#FF6B6B" />
        <Text style={styles.errorTitle}>Weather Unavailable</Text>
        <Text style={styles.errorText}>{weatherError}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadData}>
          <RefreshCw size={16} color="#4A90E2" />
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
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
      >
        {renderWeatherHeader()}
        {renderForecast()}
        {renderNewsSection()}
        
        {lastUpdated && (
          <View style={styles.lastUpdatedContainer}>
            <RefreshCw size={12} color="#999" />
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
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  weatherHeader: {
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingBottom: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  weatherHeaderContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  locationText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 6,
  },
  mainWeatherInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  temperatureContainer: {
    alignItems: 'flex-end',
  },
  mainTemperature: {
    color: 'white',
    fontSize: 48,
    fontWeight: 'bold',
  },
  weatherCondition: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    textTransform: 'capitalize',
    marginTop: -8,
  },
  weatherDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    paddingVertical: 12,
  },
  weatherDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weatherDetailText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  forecastSection: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  weatherCategoryTag: {
    fontSize: 14,
    fontWeight: '600',
  },
  forecastList: {
    paddingHorizontal: 8,
  },
  newsSection: {
    marginHorizontal: 16,
  },
  newsLoadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F8FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#4A90E2',
  },
  retryText: {
    color: '#4A90E2',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  noNewsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  noNewsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  noNewsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  lastUpdatedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 16,
  },
  lastUpdatedText: {
    fontSize: 12,
    color: '#999',
    marginLeft: 6,
  },
});

export default HomeScreen;