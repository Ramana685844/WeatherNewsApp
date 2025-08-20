export interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  feelsLike: number;
}

export interface ForecastDay {
  date: string;
  high: number;
  low: number;
  condition: string;
  icon: string;
}

export interface WeatherState {
  current: WeatherData | null;
  forecast: ForecastDay[];
  loading: boolean;
  error: string | null;
}