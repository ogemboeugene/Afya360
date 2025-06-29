/**
 * LOGIN SCREEN
 * Professional entry point for returning users
 * Features: Context-aware messaging, biometric auth, PIN/Password, rate limiting, accessibility, support
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  ScrollView,
  Platform,
  StatusBar,
  KeyboardAvoidingView,
  Linking,
  Animated,
  Vibration,
  AccessibilityInfo,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import IconMCI from 'react-native-vector-icons/MaterialCommunityIcons';

// Import components
import { Afya360Logo } from '../../components/common/Afya360Logo';
import Button from '../../components/ui/buttons/Button';
import IconButton from '../../components/ui/buttons/IconButton';
import { TextInput } from '../../components/ui/inputs/TextInput';

// Import styles
import { COLORS } from '../../styles/colors';
import { TEXT_STYLES, GLOBAL_STYLES } from '../../styles/globalStyles';

// Import hooks
import { useAuth } from '../../hooks/useAuth';
import { useBiometric } from '../../hooks/useBiometric';

// Types
import { RootStackParamList } from '../../types';

type NavigationProp = {
  navigate: (screen: string, params?: any) => void;
  goBack: () => void;
};

interface Props {
  navigation: NavigationProp;
  route?: any;
}

const { width: screenWidth } = Dimensions.get('window');

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { login, isLoading } = useAuth();
  const {
    isAvailable: isBiometricAvailable,
    biometricDescription,
    authenticate: authenticateBiometric,
    isLoading: isBiometricLoading,
    error: biometricError,
  } = useBiometric();
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [pin, setPin] = useState('');
  const [authMethod, setAuthMethod] = useState<'pin' | 'biometric'>('pin');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTimeRemaining, setBlockTimeRemaining] = useState(0);
  const [rememberDevice, setRememberDevice] = useState(false);
  const [lastLoginTime, setLastLoginTime] = useState<string | null>(null);
  const [detectedCountry, setDetectedCountry] = useState<'US' | 'Other'>('US');
  const [liveRegionMessage, setLiveRegionMessage] = useState<string>('');
  const [highContrastMode, setHighContrastMode] = useState<boolean>(false);

  // Animation for biometric button
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  // Refs for auto-focus progression
  const pinInputRef = useRef<any>(null);

  // Keyboard navigation support
  const phoneInputRef = useRef<any>(null);
  const loginButtonRef = useRef<any>(null);

  // Focus management for better UX (simplified for React Native compatibility)
  const focusNextField = (currentField: string) => {
    switch (currentField) {
      case 'phone':
        if (authMethod === 'pin' && pinInputRef.current) {
          setTimeout(() => pinInputRef.current?.focus(), 100);
        }
        break;
      case 'pin':
        // PIN is complete, could focus login button or trigger login
        break;
    }
  };

  // Rate limiting - blocks after 3 failed attempts for 30 seconds

  // Haptic Feedback Functions
  const triggerHapticFeedback = {
    light: () => {
      if (Platform.OS === 'ios') {
        // iOS light impact
        Vibration.vibrate(10);
      } else {
        // Android light vibration
        Vibration.vibrate(50);
      }
    },
    medium: () => {
      if (Platform.OS === 'ios') {
        // iOS medium impact
        Vibration.vibrate([0, 100]);
      } else {
        // Android medium vibration
        Vibration.vibrate(100);
      }
    },
    error: () => {
      if (Platform.OS === 'ios') {
        // iOS error pattern
        Vibration.vibrate([0, 100, 50, 100]);
      } else {
        // Android error pattern
        Vibration.vibrate([0, 150, 100, 150]);
      }
    },
    success: () => {
      if (Platform.OS === 'ios') {
        // iOS success pattern
        Vibration.vibrate([0, 50, 25, 25]);
      } else {
        // Android success pattern
        Vibration.vibrate([0, 80, 40, 40]);
      }
    }
  };

  // Rate limiting - blocks after 3 failed attempts for 30 seconds
  useEffect(() => {
    if (failedAttempts >= 3) {
      setIsBlocked(true);
      setBlockTimeRemaining(30);
      
      const timer = setInterval(() => {
        setBlockTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsBlocked(false);
            setFailedAttempts(0);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [failedAttempts]);

  // Check device security features on mount
  useEffect(() => {
    if (biometricError) {
      console.warn('Biometric setup issue:', biometricError);
    }
  }, [biometricError]);

  // Pulse animation for biometric button
  useEffect(() => {
    if (authMethod === 'biometric') {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();
      
      return () => pulseAnimation.stop();
    }
  }, [authMethod, pulseAnim]);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    const previousErrors = { ...errors };

    // Phone number validation with smart country detection
    const cleanedPhone = phoneNumber.replace(/\D/g, '');
    const usPhone = cleanedPhone.startsWith('1') ? cleanedPhone.slice(1) : cleanedPhone;
    
    if (!phoneNumber) {
      newErrors.phoneNumber = 'Phone number is required to access your account';
    } else if (usPhone.length !== 10) {
      newErrors.phoneNumber = `Please enter a complete 10-digit US phone number (${usPhone.length}/10 digits)`;
    } else if (!usPhone.match(/^[2-9]\d{2}[2-9]\d{2}\d{4}$/)) {
      newErrors.phoneNumber = 'Please enter a valid US phone number (area code cannot start with 0 or 1)';
    }

    // PIN validation with helpful guidance
    if (authMethod === 'pin') {
      if (!pin) {
        newErrors.pin = 'Your 4-digit PIN is required for secure access';
      } else if (pin.length < 4) {
        newErrors.pin = `PIN must be 4 digits (entered: ${pin.length}/4)`;
      } else if (!pin.match(/^\d{4}$/)) {
        newErrors.pin = 'PIN must contain only numbers';
      }
    }

    setErrors(newErrors);
    
    // Voice announcements for validation changes
    Object.keys(newErrors).forEach(field => {
      if (!previousErrors[field] || previousErrors[field] !== newErrors[field]) {
        // New error or changed error
        voiceAnnouncements.validationError(field === 'phoneNumber' ? 'Phone number' : 'PIN', newErrors[field]);
      }
    });

    // Announce validation success for fields that were previously invalid but are now valid
    Object.keys(previousErrors).forEach(field => {
      if (previousErrors[field] && !newErrors[field]) {
        voiceAnnouncements.validationSuccess(field === 'phoneNumber' ? 'Phone number' : 'PIN');
      }
    });
    
    // Trigger haptic feedback for validation errors
    if (Object.keys(newErrors).length > 0) {
      triggerHapticFeedback.error();
    }
    
    return Object.keys(newErrors).length === 0;
  };

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    
    // Detect country based on input
    if (cleaned.startsWith('1') && cleaned.length > 10) {
      setDetectedCountry('US');
    } else if (cleaned.length === 10) {
      setDetectedCountry('US');
    } else if (cleaned.length > 10 && !cleaned.startsWith('1')) {
      setDetectedCountry('Other');
    }
    
    // Smart formatting with country detection
    let formatted = '';
    
    if (cleaned.length === 0) {
      formatted = '';
    } else if (cleaned.length <= 3) {
      // First 3 digits
      formatted = cleaned;
    } else if (cleaned.length <= 6) {
      // Area code + first 3 digits: (XXX) XXX
      formatted = `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    } else if (cleaned.length <= 10) {
      // Full US format: (XXX) XXX-XXXX
      formatted = `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
      // US with country code: +1 (XXX) XXX-XXXX
      formatted = `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 11)}`;
    } else {
      // International format or overflow - limit to 10 digits for US
      const usNumber = cleaned.startsWith('1') ? cleaned.slice(1, 11) : cleaned.slice(0, 10);
      if (usNumber.length === 10) {
        formatted = `(${usNumber.slice(0, 3)}) ${usNumber.slice(3, 6)}-${usNumber.slice(6)}`;
      } else {
        formatted = usNumber;
      }
    }
    
    // Auto-focus to PIN field when phone number is complete (10 digits)
    const digitCount = cleaned.replace(/^1/, '').length; // Remove country code if present
    if (digitCount === 10 && authMethod === 'pin' && pinInputRef.current) {
      setTimeout(() => {
        pinInputRef.current?.focus();
        triggerHapticFeedback.light();
      }, 100);
    }
    
    return formatted;
  };

  const handleLogin = async () => {
    if (isBlocked) {
      triggerHapticFeedback.error();
      voiceAnnouncements.accountLocked(blockTimeRemaining);
      Alert.alert(
        'Account Temporarily Locked',
        `Please wait ${blockTimeRemaining} seconds before trying again.`
      );
      return;
    }

    if (!validateForm()) return;

    // Light haptic feedback for button press
    triggerHapticFeedback.light();

    try {
      await login({ 
        phoneNumber: phoneNumber.replace(/\D/g, ''), 
        pin: authMethod === 'pin' ? pin : undefined,
        authMethod 
      });
      
      // Reset failed attempts on successful login
      setFailedAttempts(0);
      triggerHapticFeedback.success();
      voiceAnnouncements.loginSuccess();
      Alert.alert('Welcome Back!', 'Login successful');
    } catch (error) {
      // Increment failed attempts
      setFailedAttempts(prev => prev + 1);
      
      // Error haptic feedback
      triggerHapticFeedback.error();
      
      const errorMessage = 'Please check your credentials and try again.';
      voiceAnnouncements.loginError(errorMessage);
      
      if (failedAttempts >= 2) {
        Alert.alert(
          'Multiple Failed Attempts',
          'Your account will be temporarily locked after one more failed attempt for security reasons.'
        );
      } else {
        Alert.alert('Login Failed', errorMessage);
      }
      console.error('Login failed:', error);
    }
  };

  const handleBiometricAuth = async () => {
    if (isBlocked) {
      triggerHapticFeedback.error();
      voiceAnnouncements.accountLocked(blockTimeRemaining);
      Alert.alert(
        'Account Temporarily Locked',
        `Please wait ${blockTimeRemaining} seconds before trying again.`
      );
      return;
    }

    // Light haptic feedback for button press
    triggerHapticFeedback.light();

    try {
      setErrors({});
      
      if (!phoneNumber) {
        triggerHapticFeedback.error();
        const errorMsg = 'Please enter your phone number first';
        voiceAnnouncements.validationError('Phone number', errorMsg);
        setErrors({ phoneNumber: errorMsg });
        return;
      }

      voiceAnnouncements.biometricPrompt();
      const result = await authenticateBiometric();
      
      if (result.success) {
        await login({ 
          phoneNumber: phoneNumber.replace(/\D/g, ''), 
          authMethod: 'biometric'
        });
        
        setFailedAttempts(0);
        triggerHapticFeedback.success();
        voiceAnnouncements.loginSuccess();
        Alert.alert('Welcome Back!', 'Biometric authentication successful');
      } else {
        if (result.error && !result.error.includes('cancelled')) {
          setFailedAttempts(prev => prev + 1);
          triggerHapticFeedback.error();
          voiceAnnouncements.loginError('Biometric authentication was unsuccessful');
          Alert.alert(
            'Authentication Failed', 
            'Biometric authentication was unsuccessful. Please try using your PIN instead.',
            [
              { text: 'Use PIN', onPress: () => setAuthMethod('pin') },
              { text: 'Try Again', onPress: handleBiometricAuth },
              { text: 'Cancel', style: 'cancel' }
            ]
          );
        }
      }
    } catch (error) {
      triggerHapticFeedback.error();
      voiceAnnouncements.loginError('Something went wrong with biometric authentication');
      console.error('Biometric authentication error:', error);
      Alert.alert(
        'Authentication Error', 
        'Something went wrong with biometric authentication. Please try using your PIN.',
        [
          { text: 'Use PIN', onPress: () => setAuthMethod('pin') },
          { text: 'OK', style: 'cancel' }
        ]
      );
    }
  };

  const handleForgotCredentials = () => {
    Alert.alert(
      'Reset Access',
      'Choose how you want to regain access to your account',
      [
        { text: 'SMS Verification', onPress: () => console.log('SMS reset') },
        { text: 'Email Reset', onPress: () => console.log('Email reset') },
        { text: 'Contact Support', onPress: () => Linking.openURL('https://afya360.com/support') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handleEmergencyAccess = () => {
    Alert.alert(
      '🚨 Emergency Access',
      'This will provide limited access to critical health information. Continue?',
      [
        { 
          text: 'Emergency Access', 
          onPress: () => console.log('Emergency access granted'),
          style: 'destructive'
        },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  // Voice Announcements for Accessibility
  const announceToScreen = (message: string, priority: 'assertive' | 'polite' = 'polite') => {
    if (Platform.OS === 'ios') {
      // iOS announcement
      AccessibilityInfo.announceForAccessibility(message);
    } else {
      // Android announcement - use live region
      setLiveRegionMessage(message);
      // Clear after a short delay to allow for re-announcements
      setTimeout(() => setLiveRegionMessage(''), 100);
    }
  };

  const voiceAnnouncements = {
    validationError: (field: string, error: string) => {
      announceToScreen(`${field} error: ${error}`, 'assertive');
    },
    validationSuccess: (field: string) => {
      announceToScreen(`${field} is now valid`, 'polite');
    },
    loginError: (message: string) => {
      announceToScreen(`Login failed: ${message}`, 'assertive');
    },
    loginSuccess: () => {
      announceToScreen('Login successful. Welcome back!', 'polite');
    },
    accountLocked: (timeRemaining: number) => {
      announceToScreen(`Account temporarily locked. Please wait ${timeRemaining} seconds before trying again.`, 'assertive');
    },
    biometricPrompt: () => {
      announceToScreen('Biometric authentication prompted. Please use your fingerprint or face ID.', 'polite');
    }
  };

  // Keyboard navigation handlers
  const handleKeyPress = (event: any, elementId: string) => {
    if (Platform.OS === 'web') {
      const { key } = event.nativeEvent;
      
      switch (key) {
        case 'Tab':
          event.preventDefault();
          handleTabNavigation(elementId, !event.shiftKey);
          break;
        case 'Enter':
        case ' ':
          event.preventDefault();
          handleElementActivation(elementId);
          break;
        case 'Escape':
          event.preventDefault();
          handleEscape();
          break;
      }
    }
  };

  const handleTabNavigation = (currentElement: string, forward: boolean) => {
    const navigationOrder = [
      'phoneNumber',
      ...(authMethod === 'pin' ? ['pin'] : []),
      'authMethodPin',
      ...(isBiometricAvailable ? ['authMethodBiometric'] : []),
      'rememberDevice',
      ...(authMethod === 'biometric' ? ['biometricAuth'] : ['login']),
      'forgotCredentials',
      'support',
      'emergency',
      'signUp'
    ];

    const currentIndex = navigationOrder.indexOf(currentElement);
    let nextIndex;

    if (forward) {
      nextIndex = (currentIndex + 1) % navigationOrder.length;
    } else {
      nextIndex = currentIndex - 1 < 0 ? navigationOrder.length - 1 : currentIndex - 1;
    }

    const nextElement = navigationOrder[nextIndex];
    setFocusedElement(nextElement);
    focusElement(nextElement);
  };

  const focusElement = (elementId: string) => {
    switch (elementId) {
      case 'phoneNumber':
        phoneInputRef.current?.focus();
        break;
      case 'pin':
        pinInputRef.current?.focus();
        break;
      case 'login':
        loginButtonRef.current?.focus();
        break;
      case 'biometricAuth':
        biometricButtonRef.current?.focus();
        break;
      // Additional elements can be focused programmatically
    }
  };

  const handleElementActivation = (elementId: string) => {
    triggerHapticFeedback.light();
    
    switch (elementId) {
      case 'authMethodPin':
        setAuthMethod('pin');
        break;
      case 'authMethodBiometric':
        setAuthMethod('biometric');
        break;
      case 'rememberDevice':
        setRememberDevice(!rememberDevice);
        break;
      case 'login':
        handleLogin();
        break;
      case 'biometricAuth':
        handleBiometricAuth();
        break;
      case 'forgotCredentials':
        handleForgotCredentials();
        break;
      case 'signUp':
        navigation.navigate('SignUp');
        break;
    }
  };

  const handleEscape = () => {
    setFocusedElement(null);
    // Clear any focused element
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor={COLORS.secondary600} />
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Enhanced Header with Medical Theme */}
        <View style={styles.headerSection}>
          <View style={styles.logoContainer}>
            <Afya360Logo 
              variant="white"
              size="large"
              showText={false}
              containerStyle={styles.logoBackground}
            />
          </View>
          
          <View style={styles.welcomeContent}>
            <Text style={styles.welcomeText}>Welcome back</Text>
            <Text style={styles.subtitle}>
              We've missed you. Let's continue your wellness journey.
            </Text>
            {lastLoginTime && (
              <Text style={styles.lastLoginText}>
                Last login: {lastLoginTime}
              </Text>
            )}
          </View>
          
          {/* Security Indicator */}
          <View style={styles.securityBadge}>
            <Icon name="verified-user" size={18} color={COLORS.white} />
            <Text style={styles.securityBadgeText}>
              Medical-Grade Security
            </Text>
          </View>
        </View>

        {/* Enhanced Login Form Card */}
        <View style={styles.formCard}>
          {/* Accessibility Live Region for Voice Announcements */}
          {liveRegionMessage !== '' && (
            <Text
              style={styles.accessibilityLiveRegion}
              accessibilityLiveRegion="assertive"
              accessibilityRole="alert"
            >
              {liveRegionMessage}
            </Text>
          )}

          {/* Rate Limiting Warning */}
          {isBlocked && (
            <View 
              style={styles.warningBanner}
              accessibilityRole="alert"
              accessibilityLiveRegion="assertive"
            >
              <Icon name="warning" size={20} color={COLORS.warning500} />
              <Text style={styles.warningText}>
                Account temporarily locked. Try again in {blockTimeRemaining}s
              </Text>
            </View>
          )}

          {/* Phone Number Input */}
          <View style={styles.inputGroup}>
            <View style={styles.inputHeader}>
              <Icon name="phone" size={20} color={COLORS.secondary600} />
              <Text style={styles.inputLabel}>Phone Number</Text>
              {detectedCountry === 'US' && phoneNumber.length > 0 && (
                <View style={styles.countryIndicator}>
                  <Text style={styles.countryFlag}>🇺🇸</Text>
                  <Text style={styles.countryCode}>+1</Text>
                </View>
              )}
            </View>
            <TextInput
              placeholder="(555) 123-4567"
              value={phoneNumber}
              onChangeText={(text) => setPhoneNumber(formatPhoneNumber(text))}
              keyboardType="phone-pad"
              maxLength={18}
              errorText={errors.phoneNumber}
              leftIcon="call"
              rightIcon={phoneNumber.replace(/\D/g, '').replace(/^1/, '').length === 10 ? "check-circle" : undefined}
              accessibilityLabel="Enter your registered phone number"
              accessibilityHint="Enter the phone number you used to register your account. US format with automatic formatting"
              ref={phoneInputRef}
              onKeyPress={(event) => handleKeyPress(event, 'phoneNumber')}
            />
          </View>

          {/* Authentication Method Selector */}
          <View style={styles.authMethodContainer}>
            <Text style={styles.authMethodLabel}>Choose your sign-in method:</Text>
            <View style={styles.authMethods}>
              <TouchableOpacity
                style={[
                  styles.authMethodButton,
                  authMethod === 'pin' && styles.authMethodButtonActive
                ]}
                onPress={() => {
                  triggerHapticFeedback.light();
                  setAuthMethod('pin');
                }}
                accessibilityRole="button"
                accessibilityLabel="Sign in with 4-digit PIN"
                accessibilityState={{ selected: authMethod === 'pin' }}
                onKeyPress={(event) => handleKeyPress(event, 'authMethodPin')}
              >
                <Icon name="dialpad" size={16} color={authMethod === 'pin' ? COLORS.secondary600 : COLORS.gray600} style={{ marginRight: 4 }} />
                <Text style={[
                  styles.authMethodText,
                  authMethod === 'pin' && styles.authMethodTextActive
                ]}>PIN</Text>
              </TouchableOpacity>
              
              {isBiometricAvailable && (
                <TouchableOpacity
                  style={[
                    styles.authMethodButton,
                    authMethod === 'biometric' && styles.authMethodButtonActive
                  ]}
                  onPress={() => {
                    triggerHapticFeedback.light();
                    setAuthMethod('biometric');
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`Sign in with ${biometricDescription}`}
                  accessibilityState={{ selected: authMethod === 'biometric' }}
                  onKeyPress={(event) => handleKeyPress(event, 'authMethodBiometric')}
                >
                  <Icon name="fingerprint" size={16} color={authMethod === 'biometric' ? COLORS.secondary600 : COLORS.gray600} style={{ marginRight: 4 }} />
                  <Text style={[
                    styles.authMethodText,
                    authMethod === 'biometric' && styles.authMethodTextActive
                  ]}>{biometricDescription}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* PIN Input */}
          {authMethod === 'pin' && (
            <View style={styles.inputGroup}>
              <View style={styles.inputHeader}>
                <Icon name="lock" size={20} color={COLORS.secondary600} />
                <Text style={styles.inputLabel}>4-Digit PIN</Text>
              </View>
              <TextInput
                ref={pinInputRef}
                placeholder="Enter your secure PIN"
                value={pin}
                onChangeText={setPin}
                keyboardType="numeric"
                secureTextEntry={!showPassword}
                maxLength={6}
                errorText={errors.pin}
                leftIcon="lock"
                rightIcon={pin.length >= 4 ? "check-circle" : showPassword ? "visibility" : "visibility-off"}
                onRightIconPress={() => setShowPassword(!showPassword)}
                helperText="Must be at least 4 digits with a number"
                accessibilityLabel="Enter your 4-digit PIN"
                accessibilityHint="Your secure PIN for authentication"
                onKeyPress={(event) => handleKeyPress(event, 'pin')}
              />
            </View>
          )}

          {/* Biometric Authentication */}
          {authMethod === 'biometric' && (
            <View style={styles.biometricContainer}>
              <Animated.View style={[{ transform: [{ scale: pulseAnim }] }]}>
                <IconButton
                  icon="fingerprint"
                  iconLibrary="MaterialIcons"
                  variant="primary"
                  size="extra-large"
                  onPress={handleBiometricAuth}
                  style={styles.biometricButton}
                  accessibilityLabel={`Use ${biometricDescription} to authenticate`}
                  disabled={isBlocked}
                  ref={biometricButtonRef}
                  onKeyPress={(event) => handleKeyPress(event, 'biometricAuth')}
                />
              </Animated.View>
              <Text style={styles.biometricText}>
                Touch the sensor to authenticate with {biometricDescription}
              </Text>
              {isBiometricLoading && (
                <Text style={styles.biometricLoadingText}>Authenticating...</Text>
              )}
            </View>
          )}

          {/* Forgot Credentials */}
          <TouchableOpacity
            style={styles.forgotButton}
            onPress={() => {
              triggerHapticFeedback.light();
              handleForgotCredentials();
            }}
            accessibilityRole="button"
            accessibilityLabel="Reset your login credentials"
            onKeyPress={(event) => handleKeyPress(event, 'forgotCredentials')}
          >
            <Text style={styles.forgotText}>
              Forgot your credentials? Reset here
            </Text>
          </TouchableOpacity>

          {/* Remember Device Checkbox */}
          <View style={styles.rememberDeviceContainer}>
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => {
                triggerHapticFeedback.light();
                setRememberDevice(!rememberDevice);
              }}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: rememberDevice }}
              accessibilityLabel="Remember this device for faster future logins"
              onKeyPress={(event) => handleKeyPress(event, 'rememberDevice')}
            >
              <View style={[styles.checkbox, rememberDevice && styles.checkboxChecked]}>
                {rememberDevice && <Icon name="check" size={16} color={COLORS.white} />}
              </View>
              <Text style={styles.rememberDeviceText}>
                Remember this device for 30 days
              </Text>
            </TouchableOpacity>
          </View>

          {/* Login Button */}
          <Button
            title={authMethod === 'biometric' ? `Sign In with ${biometricDescription}` : 'Sign In Securely'}
            onPress={authMethod === 'biometric' ? handleBiometricAuth : handleLogin}
            loading={isLoading || (authMethod === 'biometric' && isBiometricLoading)}
            disabled={isBlocked || !phoneNumber || (authMethod === 'pin' && pin.length < 4)}
            style={styles.loginButton}
            accessibilityLabel="Sign in to your account"
            ref={loginButtonRef}
            onKeyPress={(event) => handleKeyPress(event, 'login')}
          />

          {/* Support Link */}
          <TouchableOpacity 
            style={styles.supportLink}
            onPress={() => {
              triggerHapticFeedback.light();
              Linking.openURL('https://afya360.com/support');
            }}
            accessibilityLabel="Get help and support"
            accessibilityRole="button"
          >
            <Icon name="help-outline" size={16} color={COLORS.secondary600} />
            <Text style={styles.supportText}>Need help? Contact Support</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsCard}>
          <Text style={styles.quickActionsTitle}>Quick Access</Text>
          
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => {
              triggerHapticFeedback.medium();
              handleEmergencyAccess();
            }}
            accessibilityLabel="Emergency access to critical health information"
            accessibilityRole="button"
          >
            <Icon name="local-hospital" size={20} color={COLORS.error500} />
            <Text style={styles.quickActionText}>Emergency Access</Text>
            <Icon name="chevron-right" size={20} color={COLORS.gray400} />
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          {/* Sign Up Link */}
          <View style={styles.signUpSection}>
            <Text style={styles.newAccountText}>
              Don't have an account?
            </Text>
            <TouchableOpacity 
              onPress={() => {
                triggerHapticFeedback.light();
                navigation.navigate('SignUp');
              }}
              style={styles.createAccountButton}
              accessibilityLabel="Create a new account"
              accessibilityRole="button"
            >
              <Text style={styles.newAccountLink}>Join Afya360</Text>
            </TouchableOpacity>
          </View>

          {/* Compliance Information */}
          <View style={styles.complianceContainer}>
            <View style={styles.complianceBadges}>
              <View style={styles.complianceBadge}>
                <Text style={styles.complianceText}>HIPAA</Text>
              </View>
              <View style={styles.complianceBadge}>
                <Text style={styles.complianceText}>SOC 2</Text>
              </View>
              <View style={styles.complianceBadge}>
                <Text style={styles.complianceText}>ISO 27001</Text>
              </View>
            </View>
          </View>

          {/* App Info */}
          <View style={styles.appInfo}>
            <Text style={styles.appInfoText}>
              Afya360 Healthcare Platform
            </Text>
            <Text style={styles.versionText}>Version 1.0.0 • Secure • Private</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray50,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  
  // Accessibility
  accessibilityLiveRegion: {
    position: 'absolute',
    left: -10000,
    width: 1,
    height: 1,
    overflow: 'hidden',
  },
  
  // Enhanced Header Section - Medical Green Theme
  headerSection: {
    backgroundColor: COLORS.secondary500, // Medical green
    paddingBottom: 40,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 8,
    shadowColor: COLORS.secondary500,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoBackground: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: 20,
    borderRadius: 32,
    elevation: 4,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  welcomeContent: {
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 30,
  },
  welcomeText: {
    ...TEXT_STYLES.h1,
    color: COLORS.white,
    marginBottom: 8,
    textAlign: 'center',
    fontSize: 32,
    fontWeight: '700',
  },
  subtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
    fontSize: 16,
  },
  lastLoginText: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    fontSize: 12,
    fontStyle: 'italic',
  },
  securityBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  securityBadgeText: {
    ...TEXT_STYLES.caption,
    color: COLORS.white,
    fontWeight: '600',
  },

  // Warning Banner for Rate Limiting
  warningBanner: {
    backgroundColor: COLORS.warning50,
    borderColor: COLORS.warning100,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  warningText: {
    ...TEXT_STYLES.caption,
    color: COLORS.warning700,
    fontWeight: '500',
    flex: 1,
  },

  // Form Card
  formCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    marginTop: -30,
    borderRadius: 24,
    paddingHorizontal: 28,
    paddingVertical: 32,
    elevation: 12,
    shadowColor: COLORS.secondary500,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.1)', // Subtle green border
  },

  inputGroup: {
    marginBottom: 24,
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.secondary100,
  },
  inputLabel: {
    ...TEXT_STYLES.body,
    color: COLORS.secondary700,
    marginLeft: 8,
    fontWeight: '700',
    fontSize: 16,
  },
  countryIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
    backgroundColor: COLORS.secondary50,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.secondary200,
  },
  countryFlag: {
    fontSize: 16,
    marginRight: 4,
  },
  countryCode: {
    ...TEXT_STYLES.caption,
    color: COLORS.secondary600,
    fontWeight: '600',
    fontSize: 12,
  },

  authMethodContainer: {
    marginBottom: 24,
  },
  authMethodLabel: {
    ...TEXT_STYLES.body,
    color: COLORS.gray700,
    marginBottom: 12,
    fontWeight: '500',
    fontSize: 16,
  },
  authMethods: {
    flexDirection: 'row',
    gap: 12,
  },
  authMethodButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.gray300,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    minHeight: 48, // Accessibility touch target
  },
  authMethodButtonActive: {
    borderColor: COLORS.secondary500,
    backgroundColor: COLORS.secondary50,
  },
  authMethodText: {
    ...TEXT_STYLES.buttonText,
    color: COLORS.gray600,
    fontSize: 14,
  },
  authMethodTextActive: {
    color: COLORS.secondary600,
    fontWeight: '600',
  },

  biometricContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    marginBottom: 24,
    backgroundColor: COLORS.secondary50,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.secondary100,
    borderStyle: 'dashed',
  },
  biometricButton: {
    marginBottom: 16,
  },
  biometricText: {
    ...TEXT_STYLES.body,
    color: COLORS.gray600,
    textAlign: 'center',
    marginBottom: 8,
    fontSize: 14,
  },
  biometricLoadingText: {
    ...TEXT_STYLES.caption,
    color: COLORS.secondary500,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  forgotButton: {
    alignSelf: 'center',
    marginBottom: 24,
    paddingVertical: 12,
    paddingHorizontal: 8,
    minHeight: 44, // Accessibility touch target
  },
  forgotText: {
    ...TEXT_STYLES.body,
    color: COLORS.secondary600,
    fontWeight: '500',
    fontSize: 14,
  },

  loginButton: {
    marginBottom: 20,
    elevation: 4,
    shadowColor: COLORS.secondary500,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    minHeight: 48, // Accessibility touch target
  },

  supportLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.secondary50,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.secondary100,
    minHeight: 44, // Accessibility touch target
  },
  supportText: {
    ...TEXT_STYLES.caption,
    color: COLORS.secondary600,
    marginLeft: 6,
    fontWeight: '500',
  },

  // Quick Actions Card
  quickActionsCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  quickActionsTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.gray900,
    marginBottom: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: COLORS.gray50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    minHeight: 56, // Larger touch target
  },
  quickActionText: {
    ...TEXT_STYLES.body,
    color: COLORS.gray700,
    fontWeight: '500',
    flex: 1,
    marginLeft: 12,
  },

  // Footer
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    marginTop: 20,
  },
  signUpSection: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 20,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 20,
  },
  newAccountText: {
    ...TEXT_STYLES.body,
    color: COLORS.gray600,
  },
  createAccountButton: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    minHeight: 44, // Accessibility touch target
  },
  newAccountLink: {
    ...TEXT_STYLES.body,
    color: COLORS.secondary600,
    fontWeight: '600',
  },

  complianceContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  complianceBadges: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  complianceBadge: {
    backgroundColor: COLORS.secondary50,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.secondary100,
  },
  complianceText: {
    ...TEXT_STYLES.caption,
    color: COLORS.secondary700,
    fontWeight: '600',
    fontSize: 10,
  },

  appInfo: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
  },
  appInfoText: {
    ...TEXT_STYLES.body,
    color: COLORS.gray600,
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 4,
  },
  versionText: {
    ...TEXT_STYLES.caption,
    color: COLORS.gray400,
    fontSize: 12,
  },

  // Remember Device Checkbox
  rememberDeviceContainer: {
    marginBottom: 20,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.gray400,
    backgroundColor: COLORS.white,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.secondary500,
    borderColor: COLORS.secondary500,
  },
  rememberDeviceText: {
    ...TEXT_STYLES.body,
    color: COLORS.gray700,
    fontSize: 14,
    flex: 1,
  },
});

export default LoginScreen;
