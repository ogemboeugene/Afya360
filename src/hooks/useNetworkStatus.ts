/**
 * useNetworkStatus Hook
 * Custom hook for monitoring network connectivity and managing offline capabilities
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import NetInfo, { NetInfoState, NetInfoStateType } from '@react-native-netinfo/netinfo';
import { storageService } from '../services/storage/storageService';
import { STORAGE_KEYS } from '../constants';

export interface NetworkStatus {
  isConnected: boolean;
  connectionType: NetInfoStateType;
  isInternetReachable: boolean | null;
  details: {
    strength?: number;
    ssid?: string;
    bssid?: string;
    frequency?: number;
    ipAddress?: string;
    subnet?: string;
    carrier?: string;
    generation?: string;
  };
}

export interface OfflineOperation {
  id: string;
  type: 'api_call' | 'data_sync' | 'file_upload' | 'custom';
  payload: any;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  metadata?: Record<string, any>;
}

export interface UseNetworkStatusReturn {
  // Network state
  networkStatus: NetworkStatus;
  isConnected: boolean;
  isOffline: boolean;
  connectionType: NetInfoStateType;
  isInternetReachable: boolean | null;
  
  // Connection quality indicators
  connectionQuality: 'excellent' | 'good' | 'fair' | 'poor' | 'unknown';
  signalStrength: number | null;
  
  // Offline operations
  pendingOperations: OfflineOperation[];
  hasPendingOperations: boolean;
  
  // Methods
  addOfflineOperation: (operation: Omit<OfflineOperation, 'id' | 'timestamp' | 'retryCount'>) => Promise<void>;
  removeOfflineOperation: (id: string) => Promise<void>;
  syncPendingOperations: () => Promise<void>;
  clearPendingOperations: () => Promise<void>;
  retryOperation: (id: string) => Promise<void>;
  
  // Network utilities
  checkInternetConnection: () => Promise<boolean>;
  getConnectionDetails: () => NetworkStatus['details'];
  isHighSpeedConnection: () => boolean;
  
  // Offline indicators
  showOfflineIndicator: boolean;
  lastConnectedTime: Date | null;
  timeSinceLastConnection: number | null;
}

const OFFLINE_OPERATIONS_KEY = STORAGE_KEYS.OFFLINE_OPERATIONS;
const CONNECTION_CHECK_INTERVAL = 30000; // 30 seconds
const MAX_RETRY_ATTEMPTS = 3;

export const useNetworkStatus = (): UseNetworkStatusReturn => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isConnected: false,
    connectionType: NetInfoStateType.unknown,
    isInternetReachable: null,
    details: {},
  });

  const [pendingOperations, setPendingOperations] = useState<OfflineOperation[]>([]);
  const [lastConnectedTime, setLastConnectedTime] = useState<Date | null>(null);
  const [timeSinceLastConnection, setTimeSinceLastConnection] = useState<number | null>(null);
  const [showOfflineIndicator, setShowOfflineIndicator] = useState(false);

  const connectionCheckInterval = useRef<NodeJS.Timeout | null>(null);
  const wasOfflineRef = useRef(false);

  // Load pending operations from storage on mount
  useEffect(() => {
    loadPendingOperations();
    startConnectionMonitoring();

    return () => {
      if (connectionCheckInterval.current) {
        clearInterval(connectionCheckInterval.current);
      }
    };
  }, []);

  // Update time since last connection
  useEffect(() => {
    const updateTimeSinceLastConnection = () => {
      if (lastConnectedTime && !networkStatus.isConnected) {
        setTimeSinceLastConnection(Date.now() - lastConnectedTime.getTime());
      } else {
        setTimeSinceLastConnection(null);
      }
    };

    const interval = setInterval(updateTimeSinceLastConnection, 1000);
    return () => clearInterval(interval);
  }, [lastConnectedTime, networkStatus.isConnected]);

  // Show offline indicator logic
  useEffect(() => {
    if (!networkStatus.isConnected && wasOfflineRef.current) {
      setShowOfflineIndicator(true);
    } else if (networkStatus.isConnected) {
      setShowOfflineIndicator(false);
      if (wasOfflineRef.current) {
        // Connection restored, sync pending operations
        syncPendingOperations();
      }
    }
    
    wasOfflineRef.current = !networkStatus.isConnected;
  }, [networkStatus.isConnected]);

  const startConnectionMonitoring = () => {
    // Subscribe to network state changes
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const newNetworkStatus: NetworkStatus = {
        isConnected: state.isConnected ?? false,
        connectionType: state.type,
        isInternetReachable: state.isInternetReachable,
        details: extractConnectionDetails(state),
      };

      setNetworkStatus(newNetworkStatus);

      // Update last connected time
      if (newNetworkStatus.isConnected && !networkStatus.isConnected) {
        setLastConnectedTime(new Date());
      }
    });

    // Periodic connection check
    connectionCheckInterval.current = setInterval(() => {
      checkInternetConnection();
    }, CONNECTION_CHECK_INTERVAL);

    return unsubscribe;
  };

  const extractConnectionDetails = (state: NetInfoState): NetworkStatus['details'] => {
    const details: NetworkStatus['details'] = {};

    if (state.type === 'wifi' && state.details) {
      const wifiDetails = state.details as any;
      details.strength = wifiDetails.strength;
      details.ssid = wifiDetails.ssid;
      details.bssid = wifiDetails.bssid;
      details.frequency = wifiDetails.frequency;
      details.ipAddress = wifiDetails.ipAddress;
      details.subnet = wifiDetails.subnet;
    } else if (state.type === 'cellular' && state.details) {
      const cellularDetails = state.details as any;
      details.carrier = cellularDetails.carrier;
      details.generation = cellularDetails.generation;
    }

    return details;
  };

  const loadPendingOperations = async () => {
    try {
      const operations = await storageService.getItem<OfflineOperation[]>(OFFLINE_OPERATIONS_KEY);
      if (operations) {
        setPendingOperations(operations);
      }
    } catch (error) {
      console.error('Error loading pending operations:', error);
    }
  };

  const savePendingOperations = async (operations: OfflineOperation[]) => {
    try {
      await storageService.setItem(OFFLINE_OPERATIONS_KEY, operations);
    } catch (error) {
      console.error('Error saving pending operations:', error);
    }
  };

  const addOfflineOperation = async (
    operation: Omit<OfflineOperation, 'id' | 'timestamp' | 'retryCount'>
  ): Promise<void> => {
    const newOperation: OfflineOperation = {
      ...operation,
      id: `offline_op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retryCount: 0,
    };

    const updatedOperations = [...pendingOperations, newOperation];
    setPendingOperations(updatedOperations);
    await savePendingOperations(updatedOperations);
  };

  const removeOfflineOperation = async (id: string): Promise<void> => {
    const updatedOperations = pendingOperations.filter(op => op.id !== id);
    setPendingOperations(updatedOperations);
    await savePendingOperations(updatedOperations);
  };

  const retryOperation = async (id: string): Promise<void> => {
    const operation = pendingOperations.find(op => op.id === id);
    if (!operation) return;

    try {
      // Increment retry count
      const updatedOperation = { ...operation, retryCount: operation.retryCount + 1 };
      
      // Execute the operation based on type
      await executeOfflineOperation(updatedOperation);
      
      // Remove successful operation
      await removeOfflineOperation(id);
    } catch (error) {
      // Update retry count if max retries not reached
      if (operation.retryCount < operation.maxRetries) {
        const updatedOperations = pendingOperations.map(op =>
          op.id === id ? { ...op, retryCount: op.retryCount + 1 } : op
        );
        setPendingOperations(updatedOperations);
        await savePendingOperations(updatedOperations);
      } else {
        // Remove operation if max retries reached
        await removeOfflineOperation(id);
        console.error(`Operation ${id} failed after ${operation.maxRetries} retries`);
      }
    }
  };

  const executeOfflineOperation = async (operation: OfflineOperation): Promise<void> => {
    switch (operation.type) {
      case 'api_call':
        // Execute API call from operation payload
        const { method, url, data, config } = operation.payload;
        const { apiClient } = await import('../services/api/apiClient');
        
        switch (method?.toLowerCase()) {
          case 'get':
            await apiClient.get(url, config);
            break;
          case 'post':
            await apiClient.post(url, data, config);
            break;
          case 'put':
            await apiClient.put(url, data, config);
            break;
          case 'delete':
            await apiClient.delete(url, config);
            break;
          case 'patch':
            await apiClient.patch(url, data, config);
            break;
          default:
            throw new Error(`Unsupported HTTP method: ${method}`);
        }
        break;

      case 'data_sync':
        // Handle data synchronization
        console.log('Executing data sync operation:', operation.payload);
        break;

      case 'file_upload':
        // Handle file upload
        console.log('Executing file upload operation:', operation.payload);
        break;

      case 'custom':
        // Handle custom operations
        if (operation.payload.handler && typeof operation.payload.handler === 'function') {
          await operation.payload.handler(operation.payload.data);
        }
        break;

      default:
        console.warn(`Unknown operation type: ${operation.type}`);
    }
  };

  const syncPendingOperations = async (): Promise<void> => {
    if (!networkStatus.isConnected || pendingOperations.length === 0) {
      return;
    }

    console.log(`Syncing ${pendingOperations.length} pending operations`);

    // Sort operations by priority and timestamp
    const sortedOperations = [...pendingOperations].sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return a.timestamp - b.timestamp;
    });

    // Execute operations sequentially to avoid overwhelming the server
    for (const operation of sortedOperations) {
      try {
        await executeOfflineOperation(operation);
        await removeOfflineOperation(operation.id);
        console.log(`Successfully synced operation ${operation.id}`);
      } catch (error) {
        console.error(`Failed to sync operation ${operation.id}:`, error);
        
        // Increment retry count
        const updatedOperations = pendingOperations.map(op =>
          op.id === operation.id ? { ...op, retryCount: op.retryCount + 1 } : op
        );
        
        // Remove if max retries reached
        if (operation.retryCount >= operation.maxRetries) {
          await removeOfflineOperation(operation.id);
        } else {
          setPendingOperations(updatedOperations);
          await savePendingOperations(updatedOperations);
        }
      }
    }
  };

  const clearPendingOperations = async (): Promise<void> => {
    setPendingOperations([]);
    await storageService.removeItem(OFFLINE_OPERATIONS_KEY);
  };

  const checkInternetConnection = useCallback(async (): Promise<boolean> => {
    try {
      const state = await NetInfo.fetch();
      return state.isConnected && state.isInternetReachable === true;
    } catch (error) {
      console.error('Error checking internet connection:', error);
      return false;
    }
  }, []);

  const getConnectionDetails = useCallback((): NetworkStatus['details'] => {
    return networkStatus.details;
  }, [networkStatus.details]);

  const isHighSpeedConnection = useCallback((): boolean => {
    const { connectionType } = networkStatus;
    if (connectionType === 'wifi') return true;
    if (connectionType === 'cellular') {
      const generation = networkStatus.details.generation;
      return generation === '4g' || generation === '5g';
    }
    return false;
  }, [networkStatus]);

  // Calculate connection quality
  const getConnectionQuality = (): 'excellent' | 'good' | 'fair' | 'poor' | 'unknown' => {
    if (!networkStatus.isConnected) return 'poor';
    
    if (networkStatus.connectionType === 'wifi') {
      const strength = networkStatus.details.strength;
      if (strength === undefined) return 'unknown';
      if (strength >= -30) return 'excellent';
      if (strength >= -50) return 'good';
      if (strength >= -70) return 'fair';
      return 'poor';
    }
    
    if (networkStatus.connectionType === 'cellular') {
      const generation = networkStatus.details.generation;
      if (generation === '5g') return 'excellent';
      if (generation === '4g') return 'good';
      if (generation === '3g') return 'fair';
      return 'poor';
    }
    
    return 'unknown';
  };

  const getSignalStrength = (): number | null => {
    if (networkStatus.connectionType === 'wifi') {
      return networkStatus.details.strength ?? null;
    }
    return null;
  };

  return {
    // Network state
    networkStatus,
    isConnected: networkStatus.isConnected,
    isOffline: !networkStatus.isConnected,
    connectionType: networkStatus.connectionType,
    isInternetReachable: networkStatus.isInternetReachable,
    
    // Connection quality
    connectionQuality: getConnectionQuality(),
    signalStrength: getSignalStrength(),
    
    // Offline operations
    pendingOperations,
    hasPendingOperations: pendingOperations.length > 0,
    
    // Methods
    addOfflineOperation,
    removeOfflineOperation,
    syncPendingOperations,
    clearPendingOperations,
    retryOperation,
    
    // Network utilities
    checkInternetConnection,
    getConnectionDetails,
    isHighSpeedConnection,
    
    // Offline indicators
    showOfflineIndicator,
    lastConnectedTime,
    timeSinceLastConnection,
  };
};
