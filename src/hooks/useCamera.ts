/**
 * useCamera Hook for Afya360 Healthcare App
 * 
 * Custom hook for managing camera functionality including document scanning,
 * QR code reading, and photo capture for medical records.
 */

import { useState, useCallback, useRef } from 'react';
import { Alert, Platform } from 'react-native';
import * as Camera from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { BarCodeScannedCallback } from 'expo-camera/build/Camera.types';

// ============================================================================
// INTERFACES
// ============================================================================

export interface CameraPermissions {
  camera: boolean;
  mediaLibrary: boolean;
}

export interface PhotoResult {
  uri: string;
  width: number;
  height: number;
  type: 'image';
  fileName?: string;
  fileSize?: number;
}

export interface DocumentResult {
  uri: string;
  name: string;
  size: number;
  mimeType: string;
  type: 'document';
}

export interface QRCodeResult {
  type: string;
  data: string;
}

export interface CameraOptions {
  quality?: number;
  allowsEditing?: boolean;
  aspect?: [number, number];
  mediaTypes?: 'Images' | 'Videos' | 'All';
}

export interface UseCameraReturn {
  // Permissions
  permissions: CameraPermissions;
  requestPermissions: () => Promise<boolean>;
  hasAllPermissions: boolean;
  
  // Camera state
  isCameraReady: boolean;
  cameraRef: React.RefObject<Camera.Camera>;
  
  // Photo capture
  takePhoto: (options?: CameraOptions) => Promise<PhotoResult | null>;
  pickFromGallery: (options?: CameraOptions) => Promise<PhotoResult | null>;
  
  // Document handling
  pickDocument: () => Promise<DocumentResult | null>;
  
  // QR Code scanning
  isScanning: boolean;
  startScanning: () => void;
  stopScanning: () => void;
  onBarCodeScanned: BarCodeScannedCallback;
  
  // Utility
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

// ============================================================================
// CUSTOM HOOK
// ============================================================================

export const useCamera = (): UseCameraReturn => {
  const [permissions, setPermissions] = useState<CameraPermissions>({
    camera: false,
    mediaLibrary: false,
  });
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const cameraRef = useRef<Camera.Camera>(null);

  // ============================================================================
  // PERMISSION MANAGEMENT
  // ============================================================================

  const requestPermissions = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      // Request camera permission
      const cameraPermission = await Camera.requestCameraPermissionsAsync();
      const cameraGranted = cameraPermission.status === 'granted';

      // Request media library permission
      const mediaLibraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      const mediaLibraryGranted = mediaLibraryPermission.status === 'granted';

      const newPermissions = {
        camera: cameraGranted,
        mediaLibrary: mediaLibraryGranted,
      };

      setPermissions(newPermissions);

      if (!cameraGranted || !mediaLibraryGranted) {
        Alert.alert(
          'Permissions Required',
          'Camera and photo library access are required for this feature. Please enable them in your device settings.',
          [{ text: 'OK' }]
        );
        return false;
      }

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to request permissions';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const hasAllPermissions = permissions.camera && permissions.mediaLibrary;

  // ============================================================================
  // PHOTO CAPTURE
  // ============================================================================

  const takePhoto = useCallback(async (options: CameraOptions = {}): Promise<PhotoResult | null> => {
    try {
      setIsLoading(true);
      setError(null);

      if (!hasAllPermissions) {
        const granted = await requestPermissions();
        if (!granted) return null;
      }

      if (!cameraRef.current) {
        throw new Error('Camera not ready');
      }

      const photo = await cameraRef.current.takePictureAsync({
        quality: options.quality || 0.8,
        skipProcessing: false,
        base64: false,
      });

      if (photo) {
        return {
          uri: photo.uri,
          width: photo.width,
          height: photo.height,
          type: 'image',
        };
      }

      return null;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to take photo';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [hasAllPermissions, requestPermissions]);

  const pickFromGallery = useCallback(async (options: CameraOptions = {}): Promise<PhotoResult | null> => {
    try {
      setIsLoading(true);
      setError(null);

      if (!permissions.mediaLibrary) {
        const granted = await requestPermissions();
        if (!granted) return null;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: options.allowsEditing || false,
        aspect: options.aspect,
        quality: options.quality || 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        return {
          uri: asset.uri,
          width: asset.width,
          height: asset.height,
          type: 'image',
          fileName: asset.fileName,
          fileSize: asset.fileSize,
        };
      }

      return null;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to pick image';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [permissions.mediaLibrary, requestPermissions]);

  // ============================================================================
  // DOCUMENT HANDLING
  // ============================================================================

  const pickDocument = useCallback(async (): Promise<DocumentResult | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        return {
          uri: asset.uri,
          name: asset.name,
          size: asset.size || 0,
          mimeType: asset.mimeType || 'application/octet-stream',
          type: 'document',
        };
      }

      return null;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to pick document';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ============================================================================
  // QR CODE SCANNING
  // ============================================================================

  const startScanning = useCallback(() => {
    setIsScanning(true);
    setError(null);
  }, []);

  const stopScanning = useCallback(() => {
    setIsScanning(false);
  }, []);

  const onBarCodeScanned = useCallback<BarCodeScannedCallback>(({ type, data }) => {
    setIsScanning(false);
    
    // Handle different types of QR codes/barcodes
    if (type && data) {
      // You can add specific handling for healthcare-related QR codes here
      // For example: medication barcodes, patient ID codes, etc.
      console.log('Scanned:', { type, data });
      
      // Example: Handle medication barcode
      if (data.startsWith('MED-')) {
        Alert.alert(
          'Medication Scanned',
          `Medication code: ${data}`,
          [
            { text: 'Cancel' },
            { text: 'Add to Records', onPress: () => {
              // Handle adding medication to records
            }},
          ]
        );
      } else {
        Alert.alert(
          'QR Code Scanned',
          `Type: ${type}\nData: ${data}`,
          [{ text: 'OK' }]
        );
      }
    }
  }, []);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    // Permissions
    permissions,
    requestPermissions,
    hasAllPermissions,
    
    // Camera state
    isCameraReady,
    cameraRef,
    
    // Photo capture
    takePhoto,
    pickFromGallery,
    
    // Document handling
    pickDocument,
    
    // QR Code scanning
    isScanning,
    startScanning,
    stopScanning,
    onBarCodeScanned,
    
    // Utility
    isLoading,
    error,
    clearError,
  };
};

// ============================================================================
// EXPORT
// ============================================================================

export default useCamera;
