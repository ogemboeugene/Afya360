/**
 * Storage Service
 * Handles secure and regular storage operations for the Afya360 healthcare app
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { STORAGE_KEYS } from '../../constants';

export interface StorageOptions {
  requireAuthentication?: boolean;
  accessGroup?: string;
  keychainService?: string;
}

class StorageService {
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000;

  /**
   * Secure Storage Operations (for sensitive data like tokens, credentials)
   */
  async setSecureItem(key: string, value: string, options?: StorageOptions): Promise<void> {
    try {
      await this.retry(async () => {
        await SecureStore.setItemAsync(key, value, {
          requireAuthentication: options?.requireAuthentication || false,
          accessGroup: options?.accessGroup,
          keychainService: options?.keychainService || 'Afya360KeyChain',
        });
      });
    } catch (error) {
      console.error(`Error storing secure item ${key}:`, error);
      throw new Error(`Failed to store secure item: ${key}`);
    }
  }

  async getSecureItem(key: string, options?: StorageOptions): Promise<string | null> {
    try {
      return await this.retry(async () => {
        return await SecureStore.getItemAsync(key, {
          requireAuthentication: options?.requireAuthentication || false,
          accessGroup: options?.accessGroup,
          keychainService: options?.keychainService || 'Afya360KeyChain',
        });
      });
    } catch (error) {
      console.error(`Error retrieving secure item ${key}:`, error);
      return null;
    }
  }

  async removeSecureItem(key: string, options?: StorageOptions): Promise<void> {
    try {
      await this.retry(async () => {
        await SecureStore.deleteItemAsync(key, {
          requireAuthentication: options?.requireAuthentication || false,
          accessGroup: options?.accessGroup,
          keychainService: options?.keychainService || 'Afya360KeyChain',
        });
      });
    } catch (error) {
      console.error(`Error removing secure item ${key}:`, error);
      throw new Error(`Failed to remove secure item: ${key}`);
    }
  }

  /**
   * Regular Storage Operations (for app data, preferences, cache)
   */
  async setItem(key: string, value: any): Promise<void> {
    try {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      await this.retry(async () => {
        await AsyncStorage.setItem(key, stringValue);
      });
    } catch (error) {
      console.error(`Error storing item ${key}:`, error);
      throw new Error(`Failed to store item: ${key}`);
    }
  }

  async getItem<T = any>(key: string): Promise<T | null> {
    try {
      const value = await this.retry(async () => {
        return await AsyncStorage.getItem(key);
      });

      if (value === null) return null;

      try {
        return JSON.parse(value);
      } catch {
        return value as T;
      }
    } catch (error) {
      console.error(`Error retrieving item ${key}:`, error);
      return null;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await this.retry(async () => {
        await AsyncStorage.removeItem(key);
      });
    } catch (error) {
      console.error(`Error removing item ${key}:`, error);
      throw new Error(`Failed to remove item: ${key}`);
    }
  }

  async getAllKeys(): Promise<string[]> {
    try {
      return [...await AsyncStorage.getAllKeys()];
    } catch (error) {
      console.error('Error getting all keys:', error);
      return [];
    }
  }

  async multiGet(keys: string[]): Promise<Array<[string, string | null]>> {
    try {
      return [...await AsyncStorage.multiGet(keys)];
    } catch (error) {
      console.error('Error getting multiple items:', error);
      return [];
    }
  }

  async multiSet(keyValuePairs: Array<[string, string]>): Promise<void> {
    try {
      await AsyncStorage.multiSet(keyValuePairs);
    } catch (error) {
      console.error('Error setting multiple items:', error);
      throw new Error('Failed to set multiple items');
    }
  }

  async multiRemove(keys: string[]): Promise<void> {
    try {
      await AsyncStorage.multiRemove(keys);
    } catch (error) {
      console.error('Error removing multiple items:', error);
      throw new Error('Failed to remove multiple items');
    }
  }

  /**
   * Clear all storage (use with caution)
   */
  async clearStorage(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw new Error('Failed to clear storage');
    }
  }

  async clearSecureStorage(): Promise<void> {
    try {
      // Clear known secure keys
      const secureKeys = [
        STORAGE_KEYS.AUTH_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.BIOMETRIC_ENABLED
      ];
      await Promise.all(
        secureKeys.map(key => this.removeSecureItem(key).catch(() => {}))
      );
    } catch (error) {
      console.error('Error clearing secure storage:', error);
      throw new Error('Failed to clear secure storage');
    }
  }

  /**
   * Cache Management
   */
  async setCacheItem(key: string, data: any, expirationMinutes = 60): Promise<void> {
    const cacheData = {
      data,
      timestamp: Date.now(),
      expiration: Date.now() + (expirationMinutes * 60 * 1000),
    };
    await this.setItem(`cache_${key}`, cacheData);
  }

  async getCacheItem<T = any>(key: string): Promise<T | null> {
    const cacheData = await this.getItem<{
      data: T;
      timestamp: number;
      expiration: number;
    }>(`cache_${key}`);

    if (!cacheData) return null;

    if (Date.now() > cacheData.expiration) {
      await this.removeItem(`cache_${key}`);
      return null;
    }

    return cacheData.data;
  }

  async clearExpiredCache(): Promise<void> {
    try {
      const keys = await this.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('cache_'));
      
      for (const key of cacheKeys) {
        const cacheData = await this.getItem<{
          expiration: number;
        }>(key);
        
        if (cacheData && Date.now() > cacheData.expiration) {
          await this.removeItem(key);
        }
      }
    } catch (error) {
      console.error('Error clearing expired cache:', error);
    }
  }

  /**
   * User-specific storage operations
   */
  async setUserData(userId: string, key: string, data: any): Promise<void> {
    await this.setItem(`user_${userId}_${key}`, data);
  }

  async getUserData<T = any>(userId: string, key: string): Promise<T | null> {
    return await this.getItem<T>(`user_${userId}_${key}`);
  }

  async removeUserData(userId: string, key: string): Promise<void> {
    await this.removeItem(`user_${userId}_${key}`);
  }

  async clearUserData(userId: string): Promise<void> {
    try {
      const keys = await this.getAllKeys();
      const userKeys = keys.filter(key => key.startsWith(`user_${userId}_`));
      await this.multiRemove(userKeys);
    } catch (error) {
      console.error(`Error clearing user data for ${userId}:`, error);
      throw new Error(`Failed to clear user data for ${userId}`);
    }
  }

  /**
   * Storage size and quota management
   */
  async getStorageSize(): Promise<{ used: number; total: number }> {
    try {
      const keys = await this.getAllKeys();
      const keyValuePairs = await this.multiGet(keys);
      
      let usedBytes = 0;
      keyValuePairs.forEach(([key, value]) => {
        if (value) {
          usedBytes += key.length + value.length;
        }
      });

      // AsyncStorage doesn't have a built-in quota check, so we use a reasonable estimate
      const totalBytes = 10 * 1024 * 1024; // 10MB estimated quota

      return {
        used: usedBytes,
        total: totalBytes,
      };
    } catch (error) {
      console.error('Error calculating storage size:', error);
      return { used: 0, total: 0 };
    }
  }

  async isStorageQuotaExceeded(): Promise<boolean> {
    const { used, total } = await this.getStorageSize();
    return used / total > 0.9; // 90% threshold
  }

  /**
   * Utility methods
   */
  private async retry<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        if (attempt < this.maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        }
      }
    }
    
    throw lastError!;
  }

  /**
   * Development and debugging utilities
   */
  async debugStorage(): Promise<void> {
    if (__DEV__) {
      try {
        const keys = await this.getAllKeys();
        const { used, total } = await this.getStorageSize();
        
        console.log('=== Storage Debug Info ===');
        console.log(`Total keys: ${keys.length}`);
        console.log(`Storage used: ${(used / 1024).toFixed(2)} KB`);
        console.log(`Storage quota: ${(total / 1024).toFixed(2)} KB`);
        console.log(`Usage: ${((used / total) * 100).toFixed(1)}%`);
        console.log('Keys:', keys);
        console.log('========================');
      } catch (error) {
        console.error('Error debugging storage:', error);
      }
    }
  }
}

// Export singleton instance
export const storageService = new StorageService();
