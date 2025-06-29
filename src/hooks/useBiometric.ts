/**
 * useBiometric Hook
 * Custom hook for handling biometric authentication in React Native components
 */

import { useState, useEffect } from 'react';
import { Platform, Alert } from 'react-native';
import { biometricService, BiometricCapabilities, BiometricResult } from '../services/biometric';

// Define our own biometry types to avoid import issues
export type BiometryType = 'TouchID' | 'FaceID' | 'Biometrics' | null;

export interface UseBiometricReturn {
  // Capabilities
  isAvailable: boolean;
  biometryType?: BiometryType;
  biometricDescription: string;
  biometricEmoji: string;
  isLoading: boolean;
  
  // Methods
  authenticate: () => Promise<BiometricResult>;
  setupBiometrics: (userId: string) => Promise<BiometricResult>;
  deleteBiometrics: () => Promise<BiometricResult>;
  checkCapabilities: () => Promise<void>;
  
  // States
  error?: string;
  lastAuthResult?: BiometricResult;
}

export const useBiometric = (): UseBiometricReturn => {
  const [capabilities, setCapabilities] = useState<BiometricCapabilities>({
    isAvailable: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [lastAuthResult, setLastAuthResult] = useState<BiometricResult>();

  // Check biometric capabilities on mount
  useEffect(() => {
    checkCapabilities();
  }, []);

  const checkCapabilities = async () => {
    setIsLoading(true);
    setError(undefined);
    
    try {
      const caps = await biometricService.checkBiometricCapabilities();
      setCapabilities(caps);
      
      if (caps.error) {
        setError(caps.error);
      }
    } catch (err) {
      setError('Failed to check biometric capabilities');
      console.error('Biometric capabilities check failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const authenticate = async (): Promise<BiometricResult> => {
    setIsLoading(true);
    setError(undefined);
    
    try {
      // Check if biometrics are available
      if (!capabilities.isAvailable) {
        const result: BiometricResult = {
          success: false,
          error: 'Biometric authentication is not available on this device',
        };
        setLastAuthResult(result);
        setError(result.error);
        return result;
      }

      // Platform-specific messaging
      const promptMessage = Platform.select({
        ios: 'Use Touch ID or Face ID to access your health records',
        android: 'Use your fingerprint or face to access your health records',
        default: 'Authenticate to access your health records',
      });

      const result = await biometricService.authenticateWithBiometrics(promptMessage);
      setLastAuthResult(result);
      
      if (!result.success) {
        setError(result.error);
        
        // Show user-friendly error messages
        if (result.error?.includes('cancelled') || result.error?.includes('canceled')) {
          // User cancelled - don't show error alert
        } else {
          Alert.alert(
            'Authentication Failed',
            result.error || 'Unable to authenticate. Please try again.',
            [{ text: 'OK' }]
          );
        }
      }
      
      return result;
    } catch (err) {
      const result: BiometricResult = {
        success: false,
        error: 'Authentication failed unexpectedly',
      };
      setLastAuthResult(result);
      setError(result.error);
      console.error('Biometric authentication failed:', err);
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const setupBiometrics = async (userId: string): Promise<BiometricResult> => {
    setIsLoading(true);
    setError(undefined);
    
    try {
      const result = await biometricService.createBiometricKeys(userId);
      
      if (!result.success) {
        setError(result.error);
        Alert.alert(
          'Setup Failed',
          result.error || 'Failed to set up biometric authentication',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Biometric Setup Complete',
          'You can now use biometric authentication to access your account',
          [{ text: 'OK' }]
        );
      }
      
      return result;
    } catch (err) {
      const result: BiometricResult = {
        success: false,
        error: 'Failed to set up biometric authentication',
      };
      setError(result.error);
      console.error('Biometric setup failed:', err);
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteBiometrics = async (): Promise<BiometricResult> => {
    setIsLoading(true);
    setError(undefined);
    
    try {
      const result = await biometricService.deleteBiometricKeys();
      
      if (!result.success) {
        setError(result.error);
      }
      
      return result;
    } catch (err) {
      const result: BiometricResult = {
        success: false,
        error: 'Failed to remove biometric authentication',
      };
      setError(result.error);
      console.error('Biometric deletion failed:', err);
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  // Get user-friendly descriptions
  const biometricDescription = biometricService.getBiometricTypeDescription(capabilities.biometryType);
  const biometricEmoji = biometricService.getBiometricEmoji(capabilities.biometryType);

  return {
    // Capabilities
    isAvailable: capabilities.isAvailable,
    biometryType: capabilities.biometryType as BiometryType,
    biometricDescription,
    biometricEmoji,
    isLoading,
    
    // Methods
    authenticate,
    setupBiometrics,
    deleteBiometrics,
    checkCapabilities,
    
    // States
    error,
    lastAuthResult,
  };
};

export default useBiometric;
