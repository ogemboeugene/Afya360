/**
 * API Client Service
 * Handles all HTTP requests and API communication for the Afya360 healthcare app
 */

import axios, { 
  AxiosInstance, 
  AxiosRequestConfig, 
  AxiosResponse, 
  AxiosError,
  CancelTokenSource 
} from 'axios';
import NetInfo from '@react-native-community/netinfo';
import { API_ENDPOINTS, API_CONFIG, ERROR_MESSAGES } from '../../constants';
import { storageService } from '../storage/storageService';
import { ApiResponse, User, ApiError } from '../../types';

export interface RequestConfig extends AxiosRequestConfig {
  skipAuth?: boolean;
  skipRetry?: boolean;
  cacheKey?: string;
  cacheDuration?: number; // minutes
}

export interface QueuedRequest {
  id: string;
  config: RequestConfig;
  timestamp: number;
  retryCount: number;
}

class ApiClient {
  private axiosInstance: AxiosInstance;
  private authToken: string | null = null;
  private refreshToken: string | null = null;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }> = [];
  private requestQueue: QueuedRequest[] = [];
  private isOnline = true;
  private cancelTokens = new Map<string, CancelTokenSource>();

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-App-Version': API_CONFIG.APP_VERSION,
        'X-Platform': 'mobile',
      },
    });

    this.setupInterceptors();
    this.setupNetworkMonitoring();
    this.loadStoredTokens();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        // Add auth token if available and not skipped
        if (!config.skipAuth && this.authToken) {
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }

        // Add request ID for tracking
        config.metadata = {
          requestId: this.generateRequestId(),
          startTime: Date.now(),
        };

        // Log request in development
        if (__DEV__) {
          console.log(`🚀 API Request [${config.metadata.requestId}]:`, {
            method: config.method?.toUpperCase(),
            url: config.url,
            headers: config.headers,
            data: config.data,
          });
        }

        return config;
      },
      (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => {
        const duration = Date.now() - response.config.metadata?.startTime;
        
        if (__DEV__) {
          console.log(`✅ API Response [${response.config.metadata?.requestId}]:`, {
            status: response.status,
            duration: `${duration}ms`,
            url: response.config.url,
            data: response.data,
          });
        }

        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as RequestConfig & { _retry?: boolean };
        
        if (__DEV__) {
          console.error(`❌ API Error [${originalRequest?.metadata?.requestId}]:`, {
            status: error.response?.status,
            message: error.message,
            url: originalRequest?.url,
            data: error.response?.data,
          });
        }

        // Handle 401 unauthorized - token refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            return this.queueFailedRequest(originalRequest);
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            await this.refreshAuthToken();
            this.processFailedQueue();
            return this.axiosInstance(originalRequest);
          } catch (refreshError) {
            this.processFailedQueue(refreshError);
            await this.handleAuthenticationError();
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        // Handle network errors for offline support
        if (!this.isOnline && !originalRequest.skipRetry) {
          await this.queueRequest(originalRequest);
          throw new ApiError('Network unavailable. Request queued for retry.', 'NETWORK_ERROR');
        }

        // Handle other errors
        return Promise.reject(this.transformError(error));
      }
    );
  }

  private setupNetworkMonitoring(): void {
    NetInfo.addEventListener(state => {
      const wasOffline = !this.isOnline;
      this.isOnline = state.isConnected ?? false;

      if (wasOffline && this.isOnline) {
        console.log('🌐 Network restored, processing queued requests');
        this.processRequestQueue();
      }
    });
  }

  private async loadStoredTokens(): Promise<void> {
    try {
      this.authToken = await storageService.getSecureItem('auth_token');
      this.refreshToken = await storageService.getSecureItem('refresh_token');
    } catch (error) {
      console.error('Error loading stored tokens:', error);
    }
  }

  private generateRequestId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  /**
   * Authentication methods
   */
  async setAuthToken(token: string, refreshToken?: string): Promise<void> {
    this.authToken = token;
    if (refreshToken) {
      this.refreshToken = refreshToken;
    }

    try {
      await storageService.setSecureItem('auth_token', token);
      if (refreshToken) {
        await storageService.setSecureItem('refresh_token', refreshToken);
      }
    } catch (error) {
      console.error('Error storing auth tokens:', error);
    }
  }

  async removeAuthToken(): Promise<void> {
    this.authToken = null;
    this.refreshToken = null;

    try {
      await storageService.removeSecureItem('auth_token');
      await storageService.removeSecureItem('refresh_token');
    } catch (error) {
      console.error('Error removing auth tokens:', error);
    }
  }

  private async refreshAuthToken(): Promise<void> {
    if (!this.refreshToken) {
      throw new ApiError('No refresh token available', 'AUTH_ERROR');
    }

    try {
      const response = await this.axiosInstance.post(
        API_ENDPOINTS.AUTH.REFRESH_TOKEN,
        { refreshToken: this.refreshToken },
        { skipAuth: true }
      );

      const { accessToken, refreshToken } = response.data;
      await this.setAuthToken(accessToken, refreshToken);
    } catch (error) {
      await this.removeAuthToken();
      throw new ApiError('Token refresh failed', 'AUTH_ERROR');
    }
  }

  private queueFailedRequest(config: RequestConfig): Promise<any> {
    return new Promise((resolve, reject) => {
      this.failedQueue.push({ resolve, reject });
    });
  }

  private processFailedQueue(error?: any): void {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(this.axiosInstance({}));
      }
    });

    this.failedQueue = [];
  }

  private async handleAuthenticationError(): Promise<void> {
    await this.removeAuthToken();
    // You can dispatch a logout action here if using Redux/Context
    console.log('Authentication failed, user needs to login again');
  }

  /**
   * HTTP methods
   */
  async get<T = any>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    try {
      // Check cache first
      if (config?.cacheKey) {
        const cachedData = await storageService.getCacheItem<T>(config.cacheKey);
        if (cachedData) {
          return {
            data: cachedData,
            success: true,
            message: 'Data loaded from cache',
          };
        }
      }

      const response = await this.axiosInstance.get<T>(url, config);
      
      // Cache response if requested
      if (config?.cacheKey && response.data) {
        await storageService.setCacheItem(
          config.cacheKey, 
          response.data, 
          config.cacheDuration || 30
        );
      }

      return {
        data: response.data,
        success: true,
        message: 'Request successful',
      };
    } catch (error) {
      throw this.transformError(error as AxiosError);
    }
  }

  async post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.post<T>(url, data, config);
      return {
        data: response.data,
        success: true,
        message: 'Request successful',
      };
    } catch (error) {
      throw this.transformError(error as AxiosError);
    }
  }

  async put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.put<T>(url, data, config);
      return {
        data: response.data,
        success: true,
        message: 'Request successful',
      };
    } catch (error) {
      throw this.transformError(error as AxiosError);
    }
  }

  async patch<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.patch<T>(url, data, config);
      return {
        data: response.data,
        success: true,
        message: 'Request successful',
      };
    } catch (error) {
      throw this.transformError(error as AxiosError);
    }
  }

  async delete<T = any>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.delete<T>(url, config);
      return {
        data: response.data,
        success: true,
        message: 'Request successful',
      };
    } catch (error) {
      throw this.transformError(error as AxiosError);
    }
  }

  /**
   * File upload methods
   */
  async uploadFile<T = any>(
    url: string, 
    file: {
      uri: string;
      name: string;
      type: string;
    },
    additionalData?: Record<string, any>,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<T>> {
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        name: file.name,
        type: file.type,
      } as any);

      if (additionalData) {
        Object.keys(additionalData).forEach(key => {
          formData.append(key, additionalData[key]);
        });
      }

      const response = await this.axiosInstance.post<T>(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          );
          onProgress?.(progress);
        },
      });

      return {
        data: response.data,
        success: true,
        message: 'File uploaded successfully',
      };
    } catch (error) {
      throw this.transformError(error as AxiosError);
    }
  }

  /**
   * Request cancellation
   */
  createCancelToken(key: string): void {
    const source = axios.CancelToken.source();
    this.cancelTokens.set(key, source);
  }

  cancelRequest(key: string): void {
    const source = this.cancelTokens.get(key);
    if (source) {
      source.cancel('Request cancelled by user');
      this.cancelTokens.delete(key);
    }
  }

  cancelAllRequests(): void {
    this.cancelTokens.forEach(source => {
      source.cancel('All requests cancelled');
    });
    this.cancelTokens.clear();
  }

  /**
   * Offline request queue management
   */
  private async queueRequest(config: RequestConfig): Promise<void> {
    const queuedRequest: QueuedRequest = {
      id: this.generateRequestId(),
      config,
      timestamp: Date.now(),
      retryCount: 0,
    };

    this.requestQueue.push(queuedRequest);
    await storageService.setItem('api_request_queue', this.requestQueue);
  }

  private async processRequestQueue(): Promise<void> {
    if (this.requestQueue.length === 0) return;

    const maxRetries = 3;
    const retryDelay = 1000;

    for (let i = this.requestQueue.length - 1; i >= 0; i--) {
      const queuedRequest = this.requestQueue[i];
      
      try {
        await this.axiosInstance(queuedRequest.config);
        this.requestQueue.splice(i, 1);
        console.log(`✅ Queued request ${queuedRequest.id} processed successfully`);
      } catch (error) {
        queuedRequest.retryCount++;
        
        if (queuedRequest.retryCount >= maxRetries) {
          this.requestQueue.splice(i, 1);
          console.error(`❌ Queued request ${queuedRequest.id} failed after ${maxRetries} retries`);
        } else {
          console.log(`🔄 Retrying queued request ${queuedRequest.id} (attempt ${queuedRequest.retryCount})`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      }
    }

    await storageService.setItem('api_request_queue', this.requestQueue);
  }

  async loadQueueFromStorage(): Promise<void> {
    try {
      const storedQueue = await storageService.getItem<QueuedRequest[]>('api_request_queue');
      if (storedQueue) {
        this.requestQueue = storedQueue;
      }
    } catch (error) {
      console.error('Error loading request queue from storage:', error);
    }
  }

  /**
   * Error handling
   */
  private transformError(error: AxiosError): ApiError {
    if (axios.isCancel(error)) {
      return new ApiError('Request was cancelled', 'CANCELLED');
    }

    if (!error.response) {
      return new ApiError(
        ERROR_MESSAGES.NETWORK_ERROR,
        'NETWORK_ERROR'
      );
    }

    const { status, data } = error.response;
    const message = (data as any)?.message || ERROR_MESSAGES.GENERAL_ERROR;

    switch (status) {
      case 400:
        return new ApiError(message, 'BAD_REQUEST');
      case 401:
        return new ApiError(ERROR_MESSAGES.UNAUTHORIZED, 'UNAUTHORIZED');
      case 403:
        return new ApiError(ERROR_MESSAGES.FORBIDDEN, 'FORBIDDEN');
      case 404:
        return new ApiError(ERROR_MESSAGES.NOT_FOUND, 'NOT_FOUND');
      case 409:
        return new ApiError(message, 'CONFLICT');
      case 422:
        return new ApiError(message, 'VALIDATION_ERROR');
      case 429:
        return new ApiError(ERROR_MESSAGES.RATE_LIMIT, 'RATE_LIMIT');
      case 500:
        return new ApiError(ERROR_MESSAGES.SERVER_ERROR, 'SERVER_ERROR');
      case 503:
        return new ApiError(ERROR_MESSAGES.SERVICE_UNAVAILABLE, 'SERVICE_UNAVAILABLE');
      default:
        return new ApiError(message, 'UNKNOWN_ERROR');
    }
  }

  /**
   * Utility methods
   */
  getAuthToken(): string | null {
    return this.authToken;
  }

  isAuthenticated(): boolean {
    return !!this.authToken;
  }

  getNetworkStatus(): boolean {
    return this.isOnline;
  }

  getQueuedRequestsCount(): number {
    return this.requestQueue.length;
  }

  async clearRequestQueue(): Promise<void> {
    this.requestQueue = [];
    await storageService.removeItem('api_request_queue');
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.get(API_ENDPOINTS.HEALTH_CHECK, {
        skipAuth: true,
        skipRetry: true,
      });
      return response.success;
    } catch (error) {
      return false;
    }
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
