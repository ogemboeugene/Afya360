/**
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
  Linking,
  Platform,
} from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
import * as Camera from 'expo-camera';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { Ionicons } from '@expo/vector-icons';en
 * Step 4 of the onboarding process - Permissions and consent
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
  Linking,
  Platform,
} from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
import * as Camera from 'expo-camera';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { Ionicons } from '@expo/vector-icons';

// Import our reusable components
import Button from '../../components/ui/buttons/Button';
import { Afya360Logo } from '../../components/common/Afya360Logo';

// Import styles and constants
import { COLORS } from '../../styles/colors';
import { TEXT_STYLES } from '../../styles/globalStyles';

// Import hooks
import { useAuth } from '../../hooks/useAuth';

// Types - simplified to match working screens
type NavigationProp = {
  navigate: (screen: string, params?: any) => void;
  goBack: () => void;
};

type RouteProp = {
  params?: any;
};

interface Props {
  navigation: NavigationProp;
  route?: RouteProp;
}

interface PermissionStatus {
  camera: boolean;
  location: boolean;
  notifications: boolean;
}

interface ConsentStatus {
  termsAccepted: boolean;
  privacyAccepted: boolean;
  dataSharing: boolean;
  marketingEmails: boolean;
}

export const PermissionsScreen: React.FC<Props> = ({ navigation }) => {
  const { user, isLoading } = useAuth();
  
  // State management
  const [permissions, setPermissions] = useState<PermissionStatus>({
    camera: false,
    location: false,
    notifications: false,
  });
  
  const [consent, setConsent] = useState<ConsentStatus>({
    termsAccepted: false,
    privacyAccepted: false,
    dataSharing: true,
    marketingEmails: false,
  });

  // Check existing permissions on mount
  useEffect(() => {
    checkExistingPermissions();
  }, []);

  const checkExistingPermissions = async () => {
    try {
      const [cameraStatus, locationStatus, notificationStatus] = await Promise.all([
        Camera.getCameraPermissionsAsync(),
        Location.getForegroundPermissionsAsync(),
        Notifications.getPermissionsAsync(),
      ]);

      setPermissions({
        camera: cameraStatus.status === 'granted',
        location: locationStatus.status === 'granted',
        notifications: notificationStatus.status === 'granted',
      });
    } catch (error) {
      console.warn('Error checking permissions:', error);
    }
  };

  // Request individual permissions
  const requestCameraPermission = async () => {
    try {
      const result = await Camera.requestCameraPermissionsAsync();
      setPermissions({ ...permissions, camera: result.status === 'granted' });
      
      if (result.status !== 'granted') {
        Alert.alert(
          'Camera Permission',
          'Camera access is needed to scan documents and QR codes. You can enable this later in Settings.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to request camera permission');
    }
  };

  const requestLocationPermission = async () => {
    try {
      const result = await Location.requestForegroundPermissionsAsync();
      setPermissions({ ...permissions, location: result.status === 'granted' });
      
      if (result.status !== 'granted') {
        Alert.alert(
          'Location Permission',
          'Location access helps us find nearby healthcare facilities. You can enable this later in Settings.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to request location permission');
    }
  };

  const requestNotificationPermission = async () => {
    try {
      const result = await Notifications.requestPermissionsAsync();
      setPermissions({ ...permissions, notifications: result.status === 'granted' });
      
      if (result.status !== 'granted') {
        Alert.alert(
          'Notification Permission',
          'Notifications help remind you about medications and appointments. You can enable this later in Settings.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to request notification permission');
    }
  };

  // Handle consent toggles
  const handleConsentChange = (key: keyof ConsentStatus, value: boolean) => {
    setConsent({ ...consent, [key]: value });
  };

  // Open external links
  const openTermsAndConditions = () => {
    Linking.openURL('https://afya360.co.ke/terms');
  };

  const openPrivacyPolicy = () => {
    Linking.openURL('https://afya360.co.ke/privacy');
  };

  // Complete onboarding
  const handleCompleteSetup = async () => {
    if (!consent.termsAccepted || !consent.privacyAccepted) {
      Alert.alert(
        'Agreement Required',
        'Please accept the Terms and Conditions and Privacy Policy to continue.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      const onboardingData = {
        permissions,
        consent,
        completedAt: new Date(),
      };

      // For now, just store to local storage or similar
      // await completeOnboarding(onboardingData);
      
      // Navigate to Home after successful onboarding
      navigation.navigate('Home');
    } catch (error) {
      Alert.alert('Error', 'Failed to complete setup. Please try again.');
    }
  };

  // Permission item component
  const PermissionItem = ({ 
    icon, 
    title, 
    description, 
    granted, 
    onRequest 
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    description: string;
    granted: boolean;
    onRequest: () => void;
  }) => (
    <View style={styles.permissionItem}>
      <View style={styles.permissionHeader}>
        <View style={styles.permissionIconContainer}>
          <Ionicons name={icon} size={24} color={granted ? COLORS.success500 : COLORS.gray500} />
        </View>
        <View style={styles.permissionInfo}>
          <Text style={styles.permissionTitle}>{title}</Text>
          <Text style={styles.permissionDescription}>{description}</Text>
        </View>
        <View style={styles.permissionAction}>
          {granted ? (
            <View style={styles.grantedBadge}>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.success500} />
              <Text style={styles.grantedText}>Granted</Text>
            </View>
          ) : (
            <Button
              title="Allow"
              variant="outline"
              size="small"
              onPress={onRequest}
              style={styles.allowButton}
            />
          )}
        </View>
      </View>
    </View>
  );

  // Consent item component
  const ConsentItem = ({ 
    title, 
    description, 
    value, 
    onValueChange, 
    required = false,
    linkText,
    onLinkPress
  }: {
    title: string;
    description: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
    required?: boolean;
    linkText?: string;
    onLinkPress?: () => void;
  }) => (
    <View style={styles.consentItem}>
      <View style={styles.consentHeader}>
        <View style={styles.consentInfo}>
          <View style={styles.consentTitleRow}>
            <Text style={styles.consentTitle}>{title}</Text>
            {required && <Text style={styles.requiredBadge}>Required</Text>}
          </View>
          <Text style={styles.consentDescription}>{description}</Text>
          {linkText && onLinkPress && (
            <Text style={styles.linkText} onPress={onLinkPress}>
              {linkText}
            </Text>
          )}
        </View>
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: COLORS.gray300, true: COLORS.primary200 }}
          thumbColor={value ? COLORS.primary500 : COLORS.gray500}
          disabled={required && value} // Can't disable required items once enabled
        />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Afya360Logo 
            variant="default" 
            size="medium"
            showText
            style={styles.logo}
          />
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '100%' }]} />
            </View>
            <Text style={styles.progressText}>Step 4 of 4</Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title}>Almost Done!</Text>
          <Text style={styles.description}>
            Grant permissions and review our policies to complete your setup
          </Text>

          {/* Permissions Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>App Permissions</Text>
            <Text style={styles.sectionDescription}>
              These permissions help us provide better healthcare services
            </Text>

            <PermissionItem
              icon="camera-outline"
              title="Camera Access"
              description="Scan prescriptions, documents, and QR codes"
              granted={permissions.camera}
              onRequest={requestCameraPermission}
            />

            <PermissionItem
              icon="location-outline"
              title="Location Access"
              description="Find nearby healthcare facilities and pharmacies"
              granted={permissions.location}
              onRequest={requestLocationPermission}
            />

            <PermissionItem
              icon="notifications-outline"
              title="Notifications"
              description="Medication reminders and appointment alerts"
              granted={permissions.notifications}
              onRequest={requestNotificationPermission}
            />
          </View>

          {/* Consent Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Privacy & Consent</Text>
            
            <ConsentItem
              title="Terms and Conditions"
              description="I agree to the Terms and Conditions of using Afya360"
              value={consent.termsAccepted}
              onValueChange={(value) => handleConsentChange('termsAccepted', value)}
              required
              linkText="Read Terms and Conditions"
              onLinkPress={openTermsAndConditions}
            />

            <ConsentItem
              title="Privacy Policy"
              description="I understand and accept the Privacy Policy"
              value={consent.privacyAccepted}
              onValueChange={(value) => handleConsentChange('privacyAccepted', value)}
              required
              linkText="Read Privacy Policy"
              onLinkPress={openPrivacyPolicy}
            />

            <ConsentItem
              title="Data Sharing"
              description="Allow sharing anonymized data to improve healthcare services"
              value={consent.dataSharing}
              onValueChange={(value) => handleConsentChange('dataSharing', value)}
            />

            <ConsentItem
              title="Marketing Communications"
              description="Receive health tips and service updates via email"
              value={consent.marketingEmails}
              onValueChange={(value) => handleConsentChange('marketingEmails', value)}
            />
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <Button
              title="Complete Setup"
              onPress={handleCompleteSetup}
              loading={isLoading}
              disabled={!consent.termsAccepted || !consent.privacyAccepted}
              style={styles.completeButton}
            />
            
            <Text style={styles.finalNote}>
              You can change these preferences anytime in Settings
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Back Button */}
      <View style={styles.backButtonContainer}>
        <Button
          title="Back"
          variant="secondary"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 32,
  },
  logo: {
    marginBottom: 24,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: COLORS.gray200,
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary500,
    borderRadius: 2,
  },
  progressText: {
    ...TEXT_STYLES.caption,
    color: COLORS.gray600,
  },
  content: {
    flex: 1,
  },
  title: {
    ...TEXT_STYLES.h2,
    color: COLORS.gray900,
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    ...TEXT_STYLES.body,
    color: COLORS.gray600,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    ...TEXT_STYLES.h4,
    color: COLORS.gray900,
    marginBottom: 8,
  },
  sectionDescription: {
    ...TEXT_STYLES.caption,
    color: COLORS.gray600,
    marginBottom: 20,
    lineHeight: 20,
  },
  permissionItem: {
    backgroundColor: COLORS.gray50,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  permissionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  permissionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  permissionInfo: {
    flex: 1,
  },
  permissionTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    color: COLORS.gray800,
    marginBottom: 4,
  },
  permissionDescription: {
    ...TEXT_STYLES.caption,
    color: COLORS.gray600,
    lineHeight: 18,
  },
  permissionAction: {
    marginLeft: 12,
  },
  grantedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success50,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  grantedText: {
    ...TEXT_STYLES.caption,
    color: COLORS.success700,
    marginLeft: 4,
    fontWeight: '600',
  },
  allowButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  consentItem: {
    backgroundColor: COLORS.gray50,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  consentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  consentInfo: {
    flex: 1,
    marginRight: 16,
  },
  consentTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  consentTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    color: COLORS.gray800,
    marginRight: 8,
  },
  requiredBadge: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary600,
    backgroundColor: COLORS.primary100,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  consentDescription: {
    ...TEXT_STYLES.caption,
    color: COLORS.gray600,
    lineHeight: 18,
    marginBottom: 8,
  },
  linkText: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary500,
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
  buttonContainer: {
    marginTop: 24,
    marginBottom: 32,
  },
  completeButton: {
    marginBottom: 16,
  },
  finalNote: {
    ...TEXT_STYLES.caption,
    color: COLORS.gray500,
    textAlign: 'center',
    lineHeight: 20,
  },
  backButtonContainer: {
    padding: 24,
    paddingTop: 0,
  },
  backButton: {
    paddingVertical: 12,
  },
});

export default PermissionsScreen;
