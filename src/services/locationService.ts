import Geolocation from 'react-native-geolocation-service';
import {
  PERMISSIONS,
  RESULTS,
  Permission,
  request,
  check,
  openSettings,
} from 'react-native-permissions';
import { Platform, Alert } from 'react-native';

const getLocationPermission = (): Permission => {
  if (Platform.OS === 'ios') {
    return PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;
  }
  return PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
};

export const checkLocationPermission = async (): Promise<boolean> => {
  const permission = getLocationPermission();
  
  try {
    const result = await check(permission);
    return result === RESULTS.GRANTED;
  } catch (error) {
    console.error('Error checking location permission:', error);
    return false;
  }
};

export const requestLocationPermission = async (): Promise<boolean> => {
  const permission = getLocationPermission();
  
  try {
    const currentStatus = await check(permission);
    
    if (currentStatus === RESULTS.GRANTED) {
      return true;
    }
    
    if (currentStatus === RESULTS.BLOCKED || currentStatus === RESULTS.UNAVAILABLE) {
      Alert.alert(
        'Location Permission Required',
        'Location access is needed to show weather information. Please enable it in your device settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => openSettings() },
        ]
      );
      return false;
    }
    
    const result = await request(permission);
    
    switch (result) {
      case RESULTS.GRANTED:
        return true;
      case RESULTS.DENIED:
        Alert.alert(
          'Permission Denied',
          'Location permission was denied. The app needs location access to show weather information.'
        );
        return false;
      case RESULTS.BLOCKED:
        Alert.alert(
          'Permission Blocked',
          'Location permission is blocked. Please enable it in your device settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => openSettings() },
          ]
        );
        return false;
      default:
        return false;
    }
  } catch (error) {
    console.error('Error requesting location permission:', error);
    Alert.alert(
      'Permission Error',
      'An error occurred while requesting location permission. Please try again.'
    );
    return false;
  }
};

export const getCurrentLocation = (): Promise<{ latitude: number; longitude: number }> => {
  return new Promise((resolve, reject) => {
    checkLocationPermission().then(hasPermission => {
      if (!hasPermission) {
        reject(new Error('Location permission not granted'));
        return;
      }
      
      Geolocation.getCurrentPosition(
        position => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        error => {
          console.error('Geolocation error:', error);
          
          switch (error.code) {
            case 1:
              reject(new Error('Location permission denied'));
              break;
            case 2: 
              reject(new Error('Location unavailable. Please check your GPS settings.'));
              break;
            case 3: 
              reject(new Error('Location request timed out. Please try again.'));
              break;
            default:
              reject(new Error('Unable to get your location. Please try again.'));
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
          forceRequestLocation: true,
          forceLocationManager: false,
          showLocationDialog: true,
          distanceFilter: 0,
        }
      );
    }).catch(reject);
  });
};

export const watchLocation = (
  onLocationUpdate: (location: { latitude: number; longitude: number }) => void,
  onError: (error: Error) => void
): (() => void) => {
  const watchId = Geolocation.watchPosition(
    position => {
      onLocationUpdate({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    },
    error => {
      onError(new Error(`Location watch error: ${error.message}`));
    },
    {
      enableHighAccuracy: true,
      distanceFilter: 100, 
      interval: 300000,
      fastestInterval: 60000,
    }
  );

  return () => Geolocation.clearWatch(watchId);
};