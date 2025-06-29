/**
 * Biometric Authentication Service
 * Handles fingerprint, face recognition, and other biometric authentication methods
 */

import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';

export interface BiometricResult {
  success: boolean;
  error?: string;
  biometryType?: typeof BiometryTypes[keyof typeof BiometryTypes];
}

export interface BiometricCapabilities {
  isAvailable: boolean;
  biometryType?: typeof BiometryTypes[keyof typeof BiometryTypes];
  error?: string;
}

class BiometricService {
  private rnBiometrics: ReactNativeBiometrics;

  constructor() {
    this.rnBiometrics = new ReactNativeBiometrics({
      allowDeviceCredentials: true, // Allow device PIN/password as fallback
    });
  }

  /**
   * Check if biometric authentication is available on the device
   */
  async checkBiometricCapabilities(): Promise<BiometricCapabilities> {
    try {
      const { available, biometryType, error } = await this.rnBiometrics.isSensorAvailable();
      
      return {
        isAvailable: available,
        biometryType: biometryType as typeof BiometryTypes[keyof typeof BiometryTypes],
        error: error || undefined,
      };
    } catch (error) {
      console.error('Error checking biometric capabilities:', error);
      return {
        isAvailable: false,
        error: 'Failed to check biometric capabilities',
      };
    }
  }

  /**
   * Get a user-friendly description of available biometric types
   */
  getBiometricTypeDescription(biometryType?: typeof BiometryTypes[keyof typeof BiometryTypes]): string {
    switch (biometryType) {
      case BiometryTypes.TouchID:
        return 'Touch ID';
      case BiometryTypes.FaceID:
        return 'Face ID';
      case BiometryTypes.Biometrics:
        return 'Fingerprint';
      default:
        return 'Biometric Authentication';
    }
  }

  /**
   * Get appropriate emoji for biometric type
   */
  getBiometricEmoji(biometryType?: typeof BiometryTypes[keyof typeof BiometryTypes]): string {
    switch (biometryType) {
      case BiometryTypes.TouchID:
      case BiometryTypes.Biometrics:
        return '👆';
      case BiometryTypes.FaceID:
        return '👤';
      default:
        return '🔐';
    }
  }

  /**
   * Create biometric keys for the user (one-time setup)
   */
  async createBiometricKeys(userId: string): Promise<BiometricResult> {
    try {
      const { keysExist } = await this.rnBiometrics.biometricKeysExist();
      
      if (!keysExist) {
        const { publicKey } = await this.rnBiometrics.createKeys();
        console.log('Biometric keys created:', publicKey);
      }

      return { success: true };
    } catch (error) {
      console.error('Error creating biometric keys:', error);
      return {
        success: false,
        error: 'Failed to set up biometric authentication',
      };
    }
  }

  /**
   * Authenticate user with biometrics
   */
  async authenticateWithBiometrics(
    promptMessage: string = 'Authenticate to access your health records'
  ): Promise<BiometricResult> {
    try {
      // First check if biometrics are available
      const capabilities = await this.checkBiometricCapabilities();
      if (!capabilities.isAvailable) {
        return {
          success: false,
          error: 'Biometric authentication is not available on this device',
        };
      }

      // Check if keys exist, create them if they don't
      const { keysExist } = await this.rnBiometrics.biometricKeysExist();
      if (!keysExist) {
        const keyResult = await this.createBiometricKeys('user');
        if (!keyResult.success) {
          return keyResult;
        }
      }

      // Create a signature to verify authentication
      const epochTimeSeconds = Math.round((new Date()).getTime() / 1000).toString();
      const payload = `${epochTimeSeconds}_health_login`;

      const { success, signature, error } = await this.rnBiometrics.createSignature({
        promptMessage,
        payload,
        cancelButtonText: 'Cancel',
      });

      if (success && signature) {
        console.log('Biometric authentication successful');
        return {
          success: true,
          biometryType: capabilities.biometryType,
        };
      } else {
        return {
          success: false,
          error: error || 'Biometric authentication failed',
        };
      }
    } catch (error) {
      console.error('Biometric authentication error:', error);
      return {
        success: false,
        error: 'Authentication failed. Please try again.',
      };
    }
  }

  /**
   * Delete biometric keys (for logout or security purposes)
   */
  async deleteBiometricKeys(): Promise<BiometricResult> {
    try {
      const { keysDeleted } = await this.rnBiometrics.deleteKeys();
      return {
        success: keysDeleted,
        error: keysDeleted ? undefined : 'Failed to delete biometric keys',
      };
    } catch (error) {
      console.error('Error deleting biometric keys:', error);
      return {
        success: false,
        error: 'Failed to delete biometric keys',
      };
    }
  }

  /**
   * Simple biometric authentication for quick access
   */
  async simpleAuthenticate(): Promise<BiometricResult> {
    try {
      const { available, biometryType } = await this.rnBiometrics.isSensorAvailable();
      
      if (!available) {
        return {
          success: false,
          error: 'Biometric authentication not available',
        };
      }

      const result = await this.rnBiometrics.simplePrompt({
        promptMessage: 'Access your Afya360 health records',
        cancelButtonText: 'Cancel',
        fallbackPromptMessage: 'Use device passcode',
      });

      return {
        success: result.success,
        error: result.success ? undefined : 'Authentication cancelled or failed',
        biometryType: biometryType as typeof BiometryTypes[keyof typeof BiometryTypes],
      };
    } catch (error) {
      console.error('Simple biometric authentication error:', error);
      return {
        success: false,
        error: 'Authentication failed',
      };
    }
  }
}

// Export singleton instance
export const biometricService = new BiometricService();
export default biometricService;
