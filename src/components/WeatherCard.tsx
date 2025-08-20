import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { WeatherData } from '../types/weather';

interface WeatherCardProps {
  weather: WeatherData;
  temperatureUnit: 'celsius' | 'fahrenheit';
}

const WeatherCard: React.FC<WeatherCardProps> = ({ weather, temperatureUnit }) => {
  const convertTemperature = (temp: number) => {
    if (temperatureUnit === 'fahrenheit') {
      return Math.round((temp * 9/5) + 32);
    }
    return temp;
  };

  const unit = temperatureUnit === 'celsius' ? '°C' : '°F';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.location}>{weather.location}</Text>
        <Text style={styles.temperature}>
          {convertTemperature(weather.temperature)}{unit}
        </Text>
      </View>
      
      <View style={styles.details}>
        <Image 
          source={{ uri: `https://openweathermap.org/img/w/${weather.icon}.png` }}
          style={styles.icon}
        />
        <Text style={styles.condition}>{weather.condition}</Text>
        <Text style={styles.description}>{weather.description}</Text>
      </View>
      
      <View style={styles.extraInfo}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Feels like</Text>
          <Text style={styles.infoValue}>
            {convertTemperature(weather.feelsLike)}{unit}
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Humidity</Text>
          <Text style={styles.infoValue}>{weather.humidity}%</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Wind</Text>
          <Text style={styles.infoValue}>{weather.windSpeed} m/s</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#4A90E2',
    borderRadius: 15,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  location: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  temperature: {
    color: 'white',
    fontSize: 36,
    fontWeight: 'bold',
  },
  details: {
    alignItems: 'center',
    marginBottom: 15,
  },
  icon: {
    width: 80,
    height: 80,
  },
  condition: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
    marginTop: 5,
  },
  description: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    textTransform: 'capitalize',
  },
  extraInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  infoItem: {
    alignItems: 'center',
  },
  infoLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginBottom: 4,
  },
  infoValue: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default WeatherCard;