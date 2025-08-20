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
      
      // First try to get high accuracy location
      Geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          console.log('Location obtained:', { latitude, longitude });
          
          // Validate that we're getting reasonable coordinates
          if (latitude === 0 && longitude === 0) {
            console.warn('Invalid coordinates received, retrying...');
            // Retry with different options
            getCurrentLocationWithRetry(resolve, reject, 1);
            return;
          }
          
          resolve({ latitude, longitude });
        },
        error => {
          console.error('Geolocation error (attempt 1):', error);
          // Try again with different options
          getCurrentLocationWithRetry(resolve, reject, 1);
        },
        {
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 5000, // Reduce cache age
          forceRequestLocation: true,
          forceLocationManager: Platform.OS === 'android',
          showLocationDialog: true,
          distanceFilter: 0,
        }
      );
    }).catch(reject);
  });
};

const getCurrentLocationWithRetry = (
  resolve: (location: { latitude: number; longitude: number }) => void,
  reject: (error: Error) => void,
  attempt: number
) => {
  if (attempt > 3) {
    reject(new Error('Unable to get your location after multiple attempts. Please check your GPS settings and try again.'));
    return;
  }

  const options = attempt === 1 
    ? {
        // Second attempt: Lower accuracy but faster
        enableHighAccuracy: false,
        timeout: 15000,
        maximumAge: 10000,
        forceRequestLocation: true,
        forceLocationManager: false,
        showLocationDialog: true,
        distanceFilter: 100,
      }
    : attempt === 2 
    ? {
        // Third attempt: Use network location
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 30000,
        forceRequestLocation: false,
        showLocationDialog: true,
        distanceFilter: 1000,
      }
    : {
        // Final attempt: Most permissive settings
        enableHighAccuracy: false,
        timeout: 8000,
        maximumAge: 60000,
        forceRequestLocation: false,
        showLocationDialog: false,
        distanceFilter: 5000,
      };

  console.log(`Location attempt ${attempt + 1} with options:`, options);

  Geolocation.getCurrentPosition(
    position => {
      const { latitude, longitude } = position.coords;
      console.log(`Location obtained on attempt ${attempt + 1}:`, { latitude, longitude });
      
      // Validate coordinates
      if (latitude === 0 && longitude === 0) {
        console.warn(`Invalid coordinates on attempt ${attempt + 1}, retrying...`);
        getCurrentLocationWithRetry(resolve, reject, attempt + 1);
        return;
      }
      
      resolve({ latitude, longitude });
    },
    error => {
      console.error(`Geolocation error (attempt ${attempt + 1}):`, error);
      
      if (attempt < 3) {
        setTimeout(() => {
          getCurrentLocationWithRetry(resolve, reject, attempt + 1);
        }, 2000); // Wait 2 seconds between attempts
      } else {
        switch (error.code) {
          case 1:
            reject(new Error('Location permission denied'));
            break;
          case 2: 
            reject(new Error('Location unavailable. Please check your GPS settings and ensure you have a good signal.'));
            break;
          case 3: 
            reject(new Error('Location request timed out. Please try again.'));
            break;
          default:
            reject(new Error('Unable to get your location. Please ensure location services are enabled and try again.'));
        }
      }
    },
    options
  );
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
      interval: 300000, // 5 minutes
      fastestInterval: 60000, // 1 minute
    }
  );

  return () => Geolocation.clearWatch(watchId);
};

// Debug function to get location info
export const getLocationInfo = async (): Promise<void> => {
  try {
    const hasPermission = await checkLocationPermission();
    console.log('Has location permission:', hasPermission);
    
    if (hasPermission) {
      const location = await getCurrentLocation();
      console.log('Current location:', location);
      
      // You can use reverse geocoding here if needed
      // to get more location details
    }
  } catch (error) {
    console.error('Location info error:', error);
  }
};