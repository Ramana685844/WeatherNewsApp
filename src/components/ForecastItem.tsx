import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
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

  const unit = temperatureUnit === 'celsius' ? '°C' : '°F';

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.day}>{formatDate(forecast.date)}</Text>
      <Image 
        source={{ uri: `https://openweathermap.org/img/w/${forecast.icon}.png` }}
        style={styles.icon}
      />
      <Text style={styles.condition}>{forecast.condition}</Text>
      <View style={styles.temperatures}>
        <Text style={styles.high}>{convertTemperature(forecast.high)}{unit}</Text>
        <Text style={styles.low}>{convertTemperature(forecast.low)}{unit}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    marginHorizontal: 4,
    minWidth: 80,
  },
  day: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  icon: {
    width: 40,
    height: 40,
    marginBottom: 4,
  },
  condition: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 4,
  },
  temperatures: {
    alignItems: 'center',
  },
  high: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  low: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
  },
});

export default ForecastItem;