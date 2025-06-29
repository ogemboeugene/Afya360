/**
 * SecuritySetupScreen
 * Step 3 of the onboarding process - Security and authentication setup
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Switch,
  Dimensions,
  StatusBar,
} from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import * as LocalAuthentication from 'expo-local-authentication';
import { Ionicons } from '@expo/vector-icons';

// Import our reusable components
import Button from '../../components/ui/buttons/Button';
import { TextInput } from '../../components/ui/inputs/TextInput';
import { Form } from '../../components/forms/Form';
import { Afya360Logo } from '../../components/common/Afya360Logo';

// Import styles and constants
import { COLORS } from '../../styles/colors';
import { TEXT_STYLES } from '../../styles/globalStyles';
import { VALIDATION_MESSAGES } from '../../constants';
import { validateEmail, validatePIN } from '../../utils/validation';

// Import hooks
import { useAuth } from '../../hooks/useAuth';

// Types
import { RootStackParamList } from '../../types';

const { width } = Dimensions.get('window');

type SecuritySetupScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'SecuritySetup'
>;

type SecuritySetupScreenRouteProp = RouteProp<
  RootStackParamList,
  'SecuritySetup'
>;

interface Props {
  navigation: SecuritySetupScreenNavigationProp;
  route: SecuritySetupScreenRouteProp;
}

interface SecurityFormData {
  pin: string;
  confirmPin: string;
  backupEmail: string;
  biometricEnabled: boolean;
}

export const SecuritySetupScreen: React.FC<Props> = ({ navigation }) => {
  const { setupSecurity, isLoading } = useAuth();
  
  // State management
  const [step, setStep] = useState<'pin' | 'biometric' | 'email'>('pin');
  const [formData, setFormData] = useState<SecurityFormData>({
    pin: '',
    confirmPin: '',
    backupEmail: '',
    biometricEnabled: false,
  });
  
  const [errors, setErrors] = useState<Partial<SecurityFormData>>({});
  const [biometricType, setBiometricType] = useState<string>('');
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  
  // Refs for PIN inputs
  const pinInputRefs = useRef<Array<any>>([]);
  const confirmPinInputRefs = useRef<Array<any>>([]);

  // Check biometric availability on mount
  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  const checkBiometricAvailability = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      
      setBiometricAvailable(hasHardware && isEnrolled);
      
      if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        setBiometricType('Face ID');
      } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        setBiometricType('Fingerprint');
      } else {
        setBiometricType('Biometric');
      }
    } catch (error) {
      setBiometricAvailable(false);
    }
  };

  // PIN validation
  const validatePINs = (): boolean => {
    const newErrors: Partial<SecurityFormData> = {};

    if (!formData.pin || formData.pin.length !== 6) {
      newErrors.pin = 'PIN must be exactly 6 digits';
    } else if (!validatePIN(formData.pin)) {
      newErrors.pin = 'PIN should not contain repeated or sequential numbers';
    }

    if (!formData.confirmPin || formData.confirmPin.length !== 6) {
      newErrors.confirmPin = 'Please confirm your PIN';
    } else if (formData.pin !== formData.confirmPin) {
      newErrors.confirmPin = 'PINs do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Email validation
  const validateEmailField = (): boolean => {
    if (formData.backupEmail && !validateEmail(formData.backupEmail)) {
      setErrors({ backupEmail: 'Please enter a valid email address' });
      return false;
    }
    setErrors({});
    return true;
  };

  // Handle PIN input changes
  const handlePINChange = (value: string, index: number, isConfirm: boolean = false) => {
    const field = isConfirm ? 'confirmPin' : 'pin';
    const refs = isConfirm ? confirmPinInputRefs : pinInputRefs;
    const currentPin = isConfirm ? formData.confirmPin : formData.pin;
    
    const newPin = currentPin.split('');
    newPin[index] = value;
    const updatedPin = newPin.join('');
    
    setFormData({ ...formData, [field]: updatedPin });
    
    // Clear errors
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
    
    // Auto-focus next input
    if (value && index < 5) {
      refs.current[index + 1]?.focus();
    }
    
    // Auto-advance when PIN is complete
    if (!isConfirm && updatedPin.length === 6) {
      confirmPinInputRefs.current[0]?.focus();
    }
  };

  // Handle step progression
  const handlePINSubmit = () => {
    if (!validatePINs()) return;
    
    if (biometricAvailable) {
      setStep('biometric');
    } else {
      setStep('email');
    }
  };

  const handleBiometricSetup = async () => {
    if (formData.biometricEnabled) {
      try {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: `Set up ${biometricType} for Afya360`,
          fallbackLabel: 'Use PIN instead',
        });
        
        if (!result.success) {
          setFormData({ ...formData, biometricEnabled: false });
          Alert.alert('Setup Failed', 'Biometric authentication setup was cancelled.');
          return;
        }
      } catch (error) {
        setFormData({ ...formData, biometricEnabled: false });
        Alert.alert('Error', 'Failed to set up biometric authentication.');
        return;
      }
    }
    
    setStep('email');
  };

  const handleFinalSubmit = async () => {
    if (!validateEmailField()) return;
    
    try {
      const securityData = {
        pin: formData.pin,
        biometricEnabled: formData.biometricEnabled,
        backupEmail: formData.backupEmail || undefined,
      };
      
      await setupSecurity(securityData);
      
      // Navigate to permissions screen
      navigation.navigate('PermissionsScreen');
    } catch (error) {
      Alert.alert('Error', 'Failed to save security settings. Please try again.');
    }
  };

  // Render PIN setup step
  const renderPINStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Create Your PIN</Text>
      <Text style={styles.stepDescription}>
        Set up a 6-digit PIN to secure your health information
      </Text>

      <View style={styles.pinSection}>
        <Text style={styles.pinLabel}>Enter PIN</Text>
        <View style={styles.pinContainer}>
          {Array.from({ length: 6 }, (_, index) => (
            <TextInput
              key={index}
              ref={(ref) => (pinInputRefs.current[index] = ref)}
              style={styles.pinInput}
              value={formData.pin[index] || ''}
              onChangeText={(value) => handlePINChange(value, index)}
              keyboardType="numeric"
              maxLength={1}
              textAlign="center"
              secureTextEntry
              selectTextOnFocus
              error={errors.pin && index === 0 ? errors.pin : ''}
            />
          ))}
        </View>
      </View>

      <View style={styles.pinSection}>
        <Text style={styles.pinLabel}>Confirm PIN</Text>
        <View style={styles.pinContainer}>
          {Array.from({ length: 6 }, (_, index) => (
            <TextInput
              key={index}
              ref={(ref) => (confirmPinInputRefs.current[index] = ref)}
              style={styles.pinInput}
              value={formData.confirmPin[index] || ''}
              onChangeText={(value) => handlePINChange(value, index, true)}
              keyboardType="numeric"
              maxLength={1}
              textAlign="center"
              secureTextEntry
              selectTextOnFocus
              error={errors.confirmPin && index === 0 ? errors.confirmPin : ''}
            />
          ))}
        </View>
      </View>

      <View style={styles.pinTips}>
        <Text style={styles.tipsTitle}>PIN Security Tips:</Text>
        <Text style={styles.tipText}>• Avoid repeated numbers (111111)</Text>
        <Text style={styles.tipText}>• Avoid sequential numbers (123456)</Text>
        <Text style={styles.tipText}>• Don't use obvious dates (birthdays)</Text>
      </View>

      <Button
        title="Continue"
        onPress={handlePINSubmit}
        disabled={formData.pin.length !== 6 || formData.confirmPin.length !== 6}
        style={styles.submitButton}
      />
    </View>
  );

  // Render biometric setup step
  const renderBiometricStep = () => (
    <View style={styles.stepContent}>
      <View style={styles.biometricIcon}>
        <Ionicons 
          name={biometricType.includes('Face') ? 'face-id' : 'finger-print'} 
          size={80} 
          color={COLORS.primary500} 
        />
      </View>
      
      <Text style={styles.stepTitle}>Enable {biometricType}</Text>
      <Text style={styles.stepDescription}>
        Use {biometricType.toLowerCase()} for quick and secure access to your health information
      </Text>

      <View style={styles.biometricToggle}>
        <View style={styles.toggleRow}>
          <View style={styles.toggleInfo}>
            <Text style={styles.toggleTitle}>Enable {biometricType}</Text>
            <Text style={styles.toggleDescription}>
              Recommended for enhanced security
            </Text>
          </View>
          <Switch
            value={formData.biometricEnabled}
            onValueChange={(value) => 
              setFormData({ ...formData, biometricEnabled: value })
            }
            trackColor={{ false: COLORS.gray300, true: COLORS.primary200 }}
            thumbColor={formData.biometricEnabled ? COLORS.primary500 : COLORS.gray500}
          />
        </View>
      </View>

      <Button
        title="Continue"
        onPress={handleBiometricSetup}
        style={styles.submitButton}
      />

      <Button
        title="Skip for Now"
        variant="text"
        onPress={() => setStep('email')}
        style={styles.skipButton}
      />
    </View>
  );

  // Render email setup step
  const renderEmailStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Backup Email (Optional)</Text>
      <Text style={styles.stepDescription}>
        Add a backup email for account recovery and important health notifications
      </Text>

      <TextInput
        label="Email Address"
        placeholder="your.email@example.com"
        value={formData.backupEmail}
        onChangeText={(value) => setFormData({ ...formData, backupEmail: value })}
        error={errors.backupEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />

      <Text style={styles.emailNote}>
        We'll only use this email for account recovery and critical health alerts. 
        You can update this later in settings.
      </Text>

      <Button
        title="Complete Setup"
        onPress={handleFinalSubmit}
        loading={isLoading}
        style={styles.submitButton}
      />

      <Button
        title="Skip for Now"
        variant="text"
        onPress={() => handleFinalSubmit()}
        style={styles.skipButton}
      />
    </View>
  );

  const getCurrentStepContent = () => {
    switch (step) {
      case 'pin':
        return renderPINStep();
      case 'biometric':
        return renderBiometricStep();
      case 'email':
        return renderEmailStep();
      default:
        return renderPINStep();
    }
  };

  const getProgressPercentage = () => {
    switch (step) {
      case 'pin':
        return '60%';
      case 'biometric':
        return '70%';
      case 'email':
        return '75%';
      default:
        return '60%';
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Afya360Logo 
              variant="horizontal" 
              size="medium"
              showText
              style={styles.logo}
            />
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: getProgressPercentage() }]} />
              </View>
              <Text style={styles.progressText}>Step 3 of 4</Text>
            </View>
          </View>

          {/* Content */}
          {getCurrentStepContent()}
        </ScrollView>

        {/* Back Button */}
        <View style={styles.backButtonContainer}>
          <Button
            title="Back"
            variant="text"
            onPress={() => {
              if (step === 'pin') {
                navigation.goBack();
              } else if (step === 'biometric') {
                setStep('pin');
              } else {
                setStep(biometricAvailable ? 'biometric' : 'pin');
              }
            }}
            style={styles.backButton}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingTop: Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 0, // Manual safe area
  },
  keyboardAvoid: {
    flex: 1,
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
  stepContent: {
    flex: 1,
    justifyContent: 'center',
    minHeight: 400,
  },
  stepTitle: {
    ...TEXT_STYLES.h2,
    color: COLORS.gray900,
    textAlign: 'center',
    marginBottom: 12,
  },
  stepDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.gray600,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  pinSection: {
    marginBottom: 24,
  },
  pinLabel: {
    ...TEXT_STYLES.bodyBold,
    color: COLORS.gray800,
    marginBottom: 12,
    textAlign: 'center',
  },
  pinContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  pinInput: {
    width: (width - 80) / 6,
    height: 56,
    fontSize: 24,
    fontWeight: '600',
  },
  pinTips: {
    backgroundColor: COLORS.gray50,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  tipsTitle: {
    ...TEXT_STYLES.bodyBold,
    color: COLORS.gray800,
    marginBottom: 8,
  },
  tipText: {
    ...TEXT_STYLES.caption,
    color: COLORS.gray600,
    marginBottom: 4,
  },
  biometricIcon: {
    alignSelf: 'center',
    marginBottom: 24,
  },
  biometricToggle: {
    backgroundColor: COLORS.gray50,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleInfo: {
    flex: 1,
    marginRight: 16,
  },
  toggleTitle: {
    ...TEXT_STYLES.bodyBold,
    color: COLORS.gray800,
    marginBottom: 4,
  },
  toggleDescription: {
    ...TEXT_STYLES.caption,
    color: COLORS.gray600,
  },
  emailNote: {
    ...TEXT_STYLES.caption,
    color: COLORS.gray600,
    marginTop: 12,
    marginBottom: 24,
    lineHeight: 20,
  },
  submitButton: {
    marginBottom: 16,
  },
  skipButton: {
    paddingVertical: 8,
  },
  backButtonContainer: {
    padding: 24,
    paddingTop: 0,
  },
  backButton: {
    paddingVertical: 12,
  },
});

export default SecuritySetupScreen;
