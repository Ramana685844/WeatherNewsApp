import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudDrizzle,
  Zap,
} from 'lucide-react-native';
import { ForecastDay } from '../types/weather';

interface ForecastItemProps {
  forecast: ForecastDay;
  temperatureUnit: 'celsius' | 'fahrenheit';
}

const ForecastItem: React.FC<ForecastItemProps> = ({ forecast, temperatureUnit }) => {
  const convertTemperature = (temp: number) => {
    if (temperatureUnit === 'fahrenheit') {
      return Math.round((temp * 9/5) + 32);
    }
    return temp;
  };


  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    }
    
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const getWeatherIcon = (condition: string) => {
    const iconMap: { [key: string]: any } = {
      'Clear': Sun,
      'Clouds': Cloud,
      'Rain': CloudRain,
      'Snow': CloudSnow,
      'Drizzle': CloudDrizzle,
      'Thunderstorm': Zap,
    };
    return iconMap[condition] || Cloud;
  };

  const getGradientColors = (condition: string): string[] => {
    const gradientMap: { [key: string]: string[] } = {
      'Clear': ['#FFD700', '#FFA500'],
      'Clouds': ['#87CEEB', '#4682B4'],
      'Rain': ['#4A90E2', '#357ABD'],
      'Snow': ['#E6F3FF', '#B3D9FF'],
      'Drizzle': ['#87CEEB', '#4682B4'],
      'Thunderstorm': ['#4A4A4A', '#2C2C2C'],
      'Mist': ['#F0F8FF', '#E0E6FF'],
      'Fog': ['#F0F8FF', '#E0E6FF'],
      'Haze': ['#F0F8FF', '#E0E6FF'],
    };
    return gradientMap[condition] || ['#87CEEB', '#4682B4'];
  };

  const WeatherIcon = getWeatherIcon(forecast.condition);
  const gradientColors = getGradientColors(forecast.condition);

  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.day}>{formatDate(forecast.date)}</Text>
        
        {/* Weather Icon */}
        <View style={styles.iconContainer}>
          <WeatherIcon size={28} color="white" strokeWidth={2} />
        </View>
        
        {/* Condition Text */}
        <Text style={styles.condition} numberOfLines={1}>
          {forecast.condition}
        </Text>
        
        {/* Temperature Display */}
        <View style={styles.temperatures}>
          <Text style={styles.high}>
            {convertTemperature(forecast.high)}°
          </Text>
          <Text style={styles.low}>
            {convertTemperature(forecast.low)}°
          </Text>
        </View>
        
        {/* Fallback: Also show OpenWeatherMap icon if available */}
        {/* {forecast.icon && (
          <Image 
            source={{ uri: `https://openweathermap.org/img/w/${forecast.icon}.png` }}
            style={styles.weatherImage}
            resizeMode="contain"
          />
        )} */}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    minWidth: 90,
    minHeight: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  content: {
    alignItems: 'center',
    padding: 12,
    flex: 1,
    justifyContent: 'space-between',
  },
  day: {
    color: 'white',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  iconContainer: {
    marginVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 32,
  },
  condition: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
    maxWidth: 70,
  },
  temperatures: {
    alignItems: 'center',
  },
  high: {
    color: 'white',
    fontSize: 16,
    fontWeight: '800',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  low: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  weatherImage: {
    width: 30,
    height: 30,
    position: 'absolute',
    top: 8,
    right: 8,
    opacity: 0.6,
  },
});

export default ForecastItem;