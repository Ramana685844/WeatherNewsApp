import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  FlatList,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../store';
import { getWeatherData } from '../store/slices/weatherSlice';
import { getNewsData, filterNewsBasedOnWeather } from '../store/slices/newsSlice';
import { setLocation } from '../store/slices/settingsSlice';
import { getCurrentLocation, requestLocationPermission } from '../services/locationService';
import WeatherCard from '../components/WeatherCard';
import NewsCard from '../components/NewsCard';
import ForecastItem from '../components/ForecastItem';
import LoadingSpinner from '../components/LoadingSpinner';

const HomeScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { current: weather, forecast, loading: weatherLoading } = useAppSelector(state => state.weather);
  const { filteredArticles, loading: newsLoading } = useAppSelector(state => state.news);
  const { temperatureUnit, newsCategories } = useAppSelector(state => state.settings);

  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      // Request location permission first
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        return; // Permission handling is done in the service
      }

      const currentLocation = await getCurrentLocation();
      dispatch(setLocation(currentLocation));

      // Convert to expected format for weather API
      const weatherLocation = {
        lat: currentLocation.latitude,
        lon: currentLocation.longitude,
      };

      // Load weather and news data
      const weatherResult = await dispatch(getWeatherData(weatherLocation));
      await dispatch(getNewsData(newsCategories));

      // Filter news based on weather after weather is loaded
      const weatherPayload = weatherResult.payload as { current?: { temperature: number } };
      if (weatherPayload?.current) {
        dispatch(filterNewsBasedOnWeather({
          temperature: weatherPayload.current.temperature,
        }));
      }
    } catch (error) {
      console.error('Load data error:', error);
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
  },[dispatch, newsCategories]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter news when weather data changes
  useEffect(() => {
    if (weather && filteredArticles.length > 0) {
      dispatch(filterNewsBasedOnWeather({
        temperature: weather.temperature,
      }));
    }
  }, [weather?.temperature, weather, filteredArticles.length, dispatch]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  if (weatherLoading && !weather) {
    return <LoadingSpinner />;
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {weather && (
        <>
          <WeatherCard weather={weather} temperatureUnit={temperatureUnit} />
          
          {forecast.length > 0 && (
            <View style={styles.forecastContainer}>
              <Text style={styles.sectionTitle}>5-Day Forecast</Text>
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
          )}
        </>
      )}

      <View style={styles.newsSection}>
        <Text style={styles.sectionTitle}>
          Weather-Based News {weather && `(${getWeatherCategory(weather.temperature)})`}
        </Text>
        
        {newsLoading ? (
          <LoadingSpinner />
        ) : (
          <FlatList
            data={filteredArticles}
            renderItem={({ item }) => <NewsCard article={item} />}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </ScrollView>
  );
};

const getWeatherCategory = (temperature: number): string => {
  if (temperature < 10) return 'Cold Weather';
  if (temperature > 30) return 'Hot Weather';
  if (temperature >= 10 && temperature <= 25) return 'Cool Weather';
  return 'Moderate Weather';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  forecastContainer: {
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  forecastList: {
    paddingHorizontal: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  newsSection: {
    marginTop: 16,
    paddingBottom: 20,
  },
});

export default HomeScreen;