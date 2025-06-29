/**
 * AuthContext - Authentication Context Provider
 * Provides global authentication state management for the Afya360 healthcare app
 */

import React, { 
  createContext, 
  useContext, 
  useReducer, 
  useEffect, 
  ReactNode,
  useCallback 
} from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import { Alert } from 'react-native';
import { User, LoginCredentials, RegisterData, AuthState } from '../types';
import { apiClient } from '../services/api/apiClient';
import { storageService } from '../services/storage/storageService';
import { API_ENDPOINTS, STORAGE_KEYS, ERROR_MESSAGES } from '../constants';

// Auth Actions
type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_TOKENS'; payload: { authToken: string; refreshToken?: string } }
  | { type: 'SET_SESSION_EXPIRY'; payload: Date | null }
  | { type: 'SET_BIOMETRIC_ENABLED'; payload: boolean }
  | { type: 'SET_PIN_ENABLED'; payload: boolean }
  | { type: 'CLEAR_AUTH' }
  | { type: 'SET_ERROR'; payload: string | null };

// Initial Auth State
const initialAuthState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  authToken: null,
  refreshToken: null,
  sessionExpiry: null,
  biometricEnabled: false,
  pinEnabled: false,
  error: null,
};

// Auth Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        error: null,
      };

    case 'SET_TOKENS':
      return {
        ...state,
        authToken: action.payload.authToken,
        refreshToken: action.payload.refreshToken || state.refreshToken,
        isAuthenticated: true,
        error: null,
      };

    case 'SET_SESSION_EXPIRY':
      return { ...state, sessionExpiry: action.payload };

    case 'SET_BIOMETRIC_ENABLED':
      return { ...state, biometricEnabled: action.payload };

    case 'SET_PIN_ENABLED':
      return { ...state, pinEnabled: action.payload };

    case 'CLEAR_AUTH':
      return {
        ...initialAuthState,
        isLoading: false,
      };

    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };

    default:
      return state;
  }
};

// Auth Context Interface
interface AuthContextType extends AuthState {
  // Authentication methods
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  refreshSession: () => Promise<void>;
  
  // Profile management
  updateProfile: (data: Partial<User>) => Promise<void>;
  
  // Biometric authentication
  enableBiometricAuth: () => Promise<void>;
  disableBiometricAuth: () => Promise<void>;
  authenticateWithBiometrics: () => Promise<boolean>;
  
  // PIN authentication
  enablePinAuth: (pin: string) => Promise<void>;
  disablePinAuth: () => Promise<void>;
  authenticateWithPin: (pin: string) => Promise<boolean>;
  
  // Session management
  checkAuthStatus: () => Promise<void>;
  extendSession: () => Promise<void>;
  
  // Utility methods
  clearError: () => void;
  resetPassword: (email: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);

  // Session timeout timer
  let sessionTimeoutTimer: NodeJS.Timeout | null = null;

  /**
   * Initialize authentication state
   */
  useEffect(() => {
    initializeAuth();
    return () => {
      if (sessionTimeoutTimer) {
        clearTimeout(sessionTimeoutTimer);
      }
    };
  }, []);

  /**
   * Monitor session expiry
   */
  useEffect(() => {
    if (state.sessionExpiry) {
      const timeUntilExpiry = state.sessionExpiry.getTime() - Date.now();
      
      if (timeUntilExpiry > 0) {
        sessionTimeoutTimer = setTimeout(() => {
          Alert.alert(
            'Session Expired',
            'Your session has expired. Please login again.',
            [{ text: 'OK', onPress: logout }]
          );
        }, timeUntilExpiry);
      }
    }
  }, [state.sessionExpiry]);

  const initializeAuth = async (): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      // Load stored authentication data
      const [
        storedUser,
        authToken,
        refreshToken,
        sessionExpiry,
        biometricEnabled,
        pinEnabled
      ] = await Promise.all([
        storageService.getItem<User>(STORAGE_KEYS.USER_DATA),
        storageService.getSecureItem(STORAGE_KEYS.SECURE.AUTH_TOKEN),
        storageService.getSecureItem(STORAGE_KEYS.SECURE.REFRESH_TOKEN),
        storageService.getItem<string>(STORAGE_KEYS.SESSION_EXPIRY),
        storageService.getItem<boolean>(STORAGE_KEYS.BIOMETRIC_ENABLED),
        storageService.getItem<boolean>(STORAGE_KEYS.PIN_ENABLED)
      ]);

      // Check if session is still valid
      const expiry = sessionExpiry ? new Date(sessionExpiry) : null;
      const isSessionValid = expiry && expiry.getTime() > Date.now();

      if (storedUser && authToken && isSessionValid) {
        // Set API client token
        await apiClient.setAuthToken(authToken, refreshToken || undefined);
        
        // Restore authentication state
        dispatch({ type: 'SET_USER', payload: storedUser });
        dispatch({ type: 'SET_TOKENS', payload: { authToken, refreshToken: refreshToken || undefined } });
        dispatch({ type: 'SET_SESSION_EXPIRY', payload: expiry });
        dispatch({ type: 'SET_BIOMETRIC_ENABLED', payload: biometricEnabled || false });
        dispatch({ type: 'SET_PIN_ENABLED', payload: pinEnabled || false });
        
        // Verify token with server
        try {
          await refreshSession();
        } catch (error) {
          console.warn('Token verification failed, logging out');
          await logout();
        }
      } else {
        // Clear invalid session
        await clearStoredAuth();
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to initialize authentication' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
      
      if (response.success && response.data) {
        const { user, authToken, refreshToken, expiresIn } = response.data;
        
        // Calculate session expiry
        const sessionExpiry = new Date(Date.now() + (expiresIn * 1000));
        
        // Store authentication data
        await Promise.all([
          storageService.setItem(STORAGE_KEYS.USER_DATA, user),
          storageService.setItem(STORAGE_KEYS.SESSION_EXPIRY, sessionExpiry.toISOString()),
          apiClient.setAuthToken(authToken, refreshToken)
        ]);

        // Update state
        dispatch({ type: 'SET_USER', payload: user });
        dispatch({ type: 'SET_TOKENS', payload: { authToken, refreshToken } });
        dispatch({ type: 'SET_SESSION_EXPIRY', payload: sessionExpiry });
      }
    } catch (error: any) {
      const message = error.message || ERROR_MESSAGES.LOGIN_FAILED;
      dispatch({ type: 'SET_ERROR', payload: message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const register = async (userData: RegisterData): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const response = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, userData);
      
      if (response.success && response.data) {
        const { user, authToken, refreshToken, expiresIn } = response.data;
        
        // Calculate session expiry
        const sessionExpiry = new Date(Date.now() + (expiresIn * 1000));
        
        // Store authentication data
        await Promise.all([
          storageService.setItem(STORAGE_KEYS.USER_DATA, user),
          storageService.setItem(STORAGE_KEYS.SESSION_EXPIRY, sessionExpiry.toISOString()),
          apiClient.setAuthToken(authToken, refreshToken)
        ]);

        // Update state
        dispatch({ type: 'SET_USER', payload: user });
        dispatch({ type: 'SET_TOKENS', payload: { authToken, refreshToken } });
        dispatch({ type: 'SET_SESSION_EXPIRY', payload: sessionExpiry });
      }
    } catch (error: any) {
      const message = error.message || ERROR_MESSAGES.REGISTRATION_FAILED;
      dispatch({ type: 'SET_ERROR', payload: message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const logout = async (): Promise<void> => {
    try {
      // Call logout API if authenticated
      if (state.authToken) {
        try {
          await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
        } catch (error) {
          console.warn('Logout API call failed:', error);
        }
      }

      // Clear stored data
      await clearStoredAuth();
      
      // Clear API client token
      await apiClient.removeAuthToken();
      
      // Clear state
      dispatch({ type: 'CLEAR_AUTH' });
    } catch (error) {
      console.error('Error during logout:', error);
      // Force clear state even if cleanup fails
      dispatch({ type: 'CLEAR_AUTH' });
    }
  };

  const refreshSession = async (): Promise<void> => {
    try {
      if (!state.refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await apiClient.post(API_ENDPOINTS.AUTH.REFRESH_TOKEN, {
        refreshToken: state.refreshToken
      });

      if (response.success && response.data) {
        const { authToken, refreshToken, expiresIn } = response.data;
        
        // Calculate new session expiry
        const sessionExpiry = new Date(Date.now() + (expiresIn * 1000));
        
        // Update stored tokens
        await Promise.all([
          storageService.setItem(STORAGE_KEYS.SESSION_EXPIRY, sessionExpiry.toISOString()),
          apiClient.setAuthToken(authToken, refreshToken)
        ]);

        // Update state
        dispatch({ type: 'SET_TOKENS', payload: { authToken, refreshToken } });
        dispatch({ type: 'SET_SESSION_EXPIRY', payload: sessionExpiry });
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      await logout();
      throw error;
    }
  };

  const updateProfile = async (data: Partial<User>): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const response = await apiClient.put(API_ENDPOINTS.USER.PROFILE, data);

      if (response.success && response.data) {
        const updatedUser = { ...state.user, ...response.data };
        
        // Update stored user data
        await storageService.setItem(STORAGE_KEYS.USER_DATA, updatedUser);
        
        // Update state
        dispatch({ type: 'SET_USER', payload: updatedUser });
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Biometric Authentication
  const enableBiometricAuth = async (): Promise<void> => {
    try {
      const isAvailable = await LocalAuthentication.hasHardwareAsync();
      if (!isAvailable) {
        throw new Error('Biometric authentication is not available on this device');
      }

      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!isEnrolled) {
        throw new Error('No biometric credentials are enrolled on this device');
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Enable biometric authentication for Afya360',
        fallbackLabel: 'Use PIN',
      });

      if (result.success) {
        await storageService.setItem(STORAGE_KEYS.BIOMETRIC_ENABLED, true);
        dispatch({ type: 'SET_BIOMETRIC_ENABLED', payload: true });
      } else {
        throw new Error('Biometric authentication failed');
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const disableBiometricAuth = async (): Promise<void> => {
    await storageService.setItem(STORAGE_KEYS.BIOMETRIC_ENABLED, false);
    dispatch({ type: 'SET_BIOMETRIC_ENABLED', payload: false });
  };

  const authenticateWithBiometrics = async (): Promise<boolean> => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate with biometrics to access Afya360',
        fallbackLabel: 'Use PIN',
      });

      return result.success;
    } catch (error) {
      console.error('Biometric authentication error:', error);
      return false;
    }
  };

  // PIN Authentication
  const enablePinAuth = async (pin: string): Promise<void> => {
    try {
      // Store encrypted PIN
      await storageService.setSecureItem(STORAGE_KEYS.SECURE.USER_PIN, pin);
      await storageService.setItem(STORAGE_KEYS.PIN_ENABLED, true);
      dispatch({ type: 'SET_PIN_ENABLED', payload: true });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const disablePinAuth = async (): Promise<void> => {
    await storageService.removeSecureItem(STORAGE_KEYS.SECURE.USER_PIN);
    await storageService.setItem(STORAGE_KEYS.PIN_ENABLED, false);
    dispatch({ type: 'SET_PIN_ENABLED', payload: false });
  };

  const authenticateWithPin = async (pin: string): Promise<boolean> => {
    try {
      const storedPin = await storageService.getSecureItem(STORAGE_KEYS.SECURE.USER_PIN);
      return storedPin === pin;
    } catch (error) {
      console.error('PIN authentication error:', error);
      return false;
    }
  };

  const checkAuthStatus = async (): Promise<void> => {
    if (state.sessionExpiry && state.sessionExpiry.getTime() <= Date.now()) {
      await logout();
    }
  };

  const extendSession = async (): Promise<void> => {
    try {
      await refreshSession();
    } catch (error) {
      console.error('Failed to extend session:', error);
    }
  };

  const clearError = (): void => {
    dispatch({ type: 'SET_ERROR', payload: null });
  };

  const resetPassword = async (email: string): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      await apiClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, { email });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      await apiClient.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
        currentPassword,
        newPassword
      });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Helper functions
  const clearStoredAuth = async (): Promise<void> => {
    await Promise.all([
      storageService.removeItem(STORAGE_KEYS.USER_DATA),
      storageService.removeItem(STORAGE_KEYS.SESSION_EXPIRY),
      storageService.removeSecureItem(STORAGE_KEYS.SECURE.AUTH_TOKEN),
      storageService.removeSecureItem(STORAGE_KEYS.SECURE.REFRESH_TOKEN)
    ]);
  };

  const contextValue: AuthContextType = {
    ...state,
    login,
    logout,
    register,
    refreshSession,
    updateProfile,
    enableBiometricAuth,
    disableBiometricAuth,
    authenticateWithBiometrics,
    enablePinAuth,
    disablePinAuth,
    authenticateWithPin,
    checkAuthStatus,
    extendSession,
    clearError,
    resetPassword,
    changePassword,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

// Alias for convenience
export const useAuth = useAuthContext;
