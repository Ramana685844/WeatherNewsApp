export interface SettingsState {
  temperatureUnit: 'celsius' | 'fahrenheit';
  newsCategories: string[];
  location: {
    latitude: number;
    longitude: number;
  } | null;
}