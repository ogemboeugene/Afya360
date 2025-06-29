import { useState, useEffect, useCallback, useRef } from 'react';
import * as Location from 'expo-location';
import { Alert } from 'react-native';
import { Coordinates, HealthcareFacility } from '../types';
import { CONSTANTS } from '../constants';
import { calculateDistanceKm, formatDistance } from '../utils/healthcare';

export interface LocationData {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
  timestamp: number;
}

export interface UseLocationReturn {
  // State
  currentLocation: LocationData | null;
  isLocationEnabled: boolean;
  isLoading: boolean;
  locationPermission: Location.PermissionStatus | null;
  error: string | null;
  
  // Methods
  getCurrentLocation: () => Promise<LocationData | null>;
  startLocationTracking: () => Promise<boolean>;
  stopLocationTracking: () => void;
  requestLocationPermission: () => Promise<boolean>;
  calculateDistance: (point1: Coordinates, point2: Coordinates) => number;
  findNearbyFacilities: (facilities: HealthcareFacility[], radiusKm?: number) => HealthcareFacility[];
  shareLocation: () => Promise<string | null>;
}

export const useLocation = (): UseLocationReturn => {
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [isLocationEnabled, setIsLocationEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [locationPermission, setLocationPermission] = useState<Location.PermissionStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const watchIdRef = useRef<Location.LocationSubscription | null>(null);

  // Check if location services are enabled
  const checkLocationServices = useCallback(async (): Promise<boolean> => {
    try {
      const enabled = await Location.hasServicesEnabledAsync();
      setIsLocationEnabled(enabled);
      return enabled;
    } catch (err) {
      console.error('Error checking location services:', err);
      setError('Failed to check location services');
      return false;
    }
  }, []);

  // Request location permission
  const requestLocationPermission = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status);

      if (status !== 'granted') {
        setError('Location permission denied');
        Alert.alert(
          'Location Permission Required',
          'This app needs location access to provide location-based healthcare services.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Settings', onPress: () => Location.requestForegroundPermissionsAsync() }
          ]
        );
        return false;
      }

      return true;
    } catch (err) {
      console.error('Error requesting location permission:', err);
      setError('Failed to request location permission');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get current location
  const getCurrentLocation = useCallback(async (): Promise<LocationData | null> => {
    try {
      setIsLoading(true);
      setError(null);

      // Check permissions
      if (locationPermission !== 'granted') {
        const hasPermission = await requestLocationPermission();
        if (!hasPermission) return null;
      }

      // Check if location services are enabled
      const servicesEnabled = await checkLocationServices();
      if (!servicesEnabled) {
        setError('Location services are disabled');
        Alert.alert(
          'Location Services Disabled',
          'Please enable location services to use location features.',
          [{ text: 'OK' }]
        );
        return null;
      }

      // Get location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeInterval: 10000,
        distanceInterval: 10,
      });

      const locationData: LocationData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        altitude: location.coords.altitude || undefined,
        accuracy: location.coords.accuracy || undefined,
        timestamp: location.timestamp,
      };

      setCurrentLocation(locationData);
      return locationData;
    } catch (err) {
      console.error('Error getting current location:', err);
      setError('Failed to get current location');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [locationPermission, requestLocationPermission, checkLocationServices]);

  // Start location tracking
  const startLocationTracking = useCallback(async (): Promise<boolean> => {
    try {
      // Stop existing tracking
      stopLocationTracking();

      // Check permissions
      if (locationPermission !== 'granted') {
        const hasPermission = await requestLocationPermission();
        if (!hasPermission) return false;
      }

      // Start watching location
      watchIdRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 30000, // Update every 30 seconds
          distanceInterval: 50, // Update every 50 meters
        },
        (location) => {
          const locationData: LocationData = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            altitude: location.coords.altitude || undefined,
            accuracy: location.coords.accuracy || undefined,
            timestamp: location.timestamp,
          };
          setCurrentLocation(locationData);
        }
      );

      return true;
    } catch (err) {
      console.error('Error starting location tracking:', err);
      setError('Failed to start location tracking');
      return false;
    }
  }, [locationPermission, requestLocationPermission, stopLocationTracking]);

  // Stop location tracking
  const stopLocationTracking = useCallback((): void => {
    if (watchIdRef.current) {
      watchIdRef.current.remove();
      watchIdRef.current = null;
    }
  }, []);

  // Calculate distance between two points
  const calculateDistance = useCallback((point1: Coordinates, point2: Coordinates): number => {
    return calculateDistanceKm(point1, point2);
  }, []);

  // Find nearby healthcare facilities
  const findNearbyFacilities = useCallback(
    (facilities: HealthcareFacility[], radiusKm: number = 10): HealthcareFacility[] => {
      if (!currentLocation || !facilities.length) return [];

      const currentCoords: Coordinates = {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
      };

      return facilities
        .map(facility => ({
          ...facility,
          distance: calculateDistance(currentCoords, facility.coordinates),
        }))
        .filter(facility => facility.distance <= radiusKm)
        .sort((a, b) => a.distance - b.distance);
    },
    [currentLocation, calculateDistance]
  );

  // Share current location (returns formatted string)
  const shareLocation = useCallback(async (): Promise<string | null> => {
    const location = currentLocation || await getCurrentLocation();
    if (!location) return null;

    const { latitude, longitude } = location;
    const googleMapsUrl = `https://maps.google.com/?q=${latitude},${longitude}`;
    const locationText = `My current location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}\n${googleMapsUrl}`;
    
    return locationText;
  }, [currentLocation, getCurrentLocation]);

  // Initialize location services on mount
  useEffect(() => {
    const initialize = async () => {
      await checkLocationServices();
      const { status } = await Location.getForegroundPermissionsAsync();
      setLocationPermission(status);
    };

    initialize();
  }, [checkLocationServices]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopLocationTracking();
    };
  }, [stopLocationTracking]);

  return {
    // State
    currentLocation,
    isLocationEnabled,
    isLoading,
    locationPermission,
    error,
    
    // Methods
    getCurrentLocation,
    startLocationTracking,
    stopLocationTracking,
    requestLocationPermission,
    calculateDistance,
    findNearbyFacilities,
    shareLocation,
  };
};
