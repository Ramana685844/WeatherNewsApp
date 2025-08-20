import axios from 'axios';
import { WeatherData, ForecastDay } from '../types/weather';
import Config from 'react-native-config';

export const fetchWeatherData = async (lat: number, lon: number): Promise<WeatherData> => {
  try {
    const response = await axios.get(
      `${Config.WEATHER_BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${Config.WEATHER_API_KEY}&units=metric`
    );
    
    console.log('weather response', response)
    const data = response.data;
    return {
      location: data.name,
      temperature: Math.round(data.main.temp),
      condition: data.weather[0].main,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      feelsLike: Math.round(data.main.feels_like),
    };
  } catch (error) {
    throw new Error('Failed to fetch weather data');
  }
};

export const fetchForecastData = async (lat: number, lon: number): Promise<ForecastDay[]> => {
  try {
    const response = await axios.get(
      `${Config.WEATHER_BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${Config.WEATHER_API_KEY}&units=metric`
    );
    
    const forecastList = response.data.list;
    const dailyForecasts: { [key: string]: any[] } = {};
    
    forecastList.forEach((item: any) => {
      const date = item.dt_txt.split(' ')[0];
      if (!dailyForecasts[date]) {
        dailyForecasts[date] = [];
      }
      dailyForecasts[date].push(item);
    });
    
    return Object.keys(dailyForecasts).slice(0, 5).map(date => {
      const dayData = dailyForecasts[date];
      const temps = dayData.map(item => item.main.temp);
      
      return {
        date,
        high: Math.round(Math.max(...temps)),
        low: Math.round(Math.min(...temps)),
        condition: dayData[0].weather[0].main,
        icon: dayData[0].weather[0].icon,
      };
    });
  } catch (error) {
    throw new Error('Failed to fetch forecast data');
  }
};