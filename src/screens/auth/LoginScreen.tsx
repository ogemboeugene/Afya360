/**
 * LOGIN SCREEN
 * Professional entry point for returning users
 * Features: Context-aware messaging, biometric auth, PIN/Password, rate limiting, accessibility, support
 */

import React, { useState, useEffect } from 'react';
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

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    // Phone number validation
    const cleanedPhone = phoneNumber.replace(/\D/g, '');
    if (!phoneNumber) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (cleanedPhone.length !== 10) {
      newErrors.phoneNumber = 'Please enter a valid 10-digit phone number';
    }

    // PIN validation
    if (authMethod === 'pin') {
      if (!pin) {
        newErrors.pin = 'PIN is required';
      } else if (pin.length < 4) {
        newErrors.pin = 'PIN must be at least 4 digits';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 10) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3').trim();
    }
    return cleaned.substring(0, 10).replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
  };

  const handleLogin = async () => {
    if (isBlocked) {
      Alert.alert(
        'Account Temporarily Locked',
        `Please wait ${blockTimeRemaining} seconds before trying again.`
      );
      return;
    }

    if (!validateForm()) return;

    try {
      await login({ 
        phoneNumber: phoneNumber.replace(/\D/g, ''), 
        pin: authMethod === 'pin' ? pin : undefined,
        authMethod 
      });
      
      // Reset failed attempts on successful login
      setFailedAttempts(0);
      Alert.alert('Welcome Back!', 'Login successful');
    } catch (error) {
      // Increment failed attempts
      setFailedAttempts(prev => prev + 1);
      
      if (failedAttempts >= 2) {
        Alert.alert(
          'Multiple Failed Attempts',
          'Your account will be temporarily locked after one more failed attempt for security reasons.'
        );
      } else {
        Alert.alert('Login Failed', 'Please check your credentials and try again.');
      }
      console.error('Login failed:', error);
    }
  };

  const handleBiometricAuth = async () => {
    if (isBlocked) {
      Alert.alert(
        'Account Temporarily Locked',
        `Please wait ${blockTimeRemaining} seconds before trying again.`
      );
      return;
    }

    try {
      setErrors({});
      
      if (!phoneNumber) {
        setErrors({ phoneNumber: 'Please enter your phone number first' });
        return;
      }

      const result = await authenticateBiometric();
      
      if (result.success) {
        await login({ 
          phoneNumber: phoneNumber.replace(/\D/g, ''), 
          authMethod: 'biometric'
        });
        
        setFailedAttempts(0);
        Alert.alert('Welcome Back!', 'Biometric authentication successful');
      } else {
        if (result.error && !result.error.includes('cancelled')) {
          setFailedAttempts(prev => prev + 1);
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
          {/* Rate Limiting Warning */}
          {isBlocked && (
            <View style={styles.warningBanner}>
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
            </View>
            <TextInput
              placeholder="0712 345 678"
              value={phoneNumber}
              onChangeText={(text) => setPhoneNumber(formatPhoneNumber(text))}
              keyboardType="phone-pad"
              maxLength={12}
              errorText={errors.phoneNumber}
              leftIcon="call"
              rightIcon={phoneNumber.length >= 10 ? "check-circle" : undefined}
              accessibilityLabel="Enter your registered phone number"
              accessibilityHint="Enter the phone number you used to register your account"
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
                onPress={() => setAuthMethod('pin')}
                accessibilityRole="button"
                accessibilityLabel="Sign in with 4-digit PIN"
                accessibilityState={{ selected: authMethod === 'pin' }}
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
                  onPress={() => setAuthMethod('biometric')}
                  accessibilityRole="button"
                  accessibilityLabel={`Sign in with ${biometricDescription}`}
                  accessibilityState={{ selected: authMethod === 'biometric' }}
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
                placeholder="Enter your secure PIN"
                value={pin}
                onChangeText={setPin}
                keyboardType="numeric"
                secureTextEntry={!showPassword}
                maxLength={6}
                errorText={errors.pin}
                leftIcon="lock"
                rightIcon={showPassword ? "visibility" : "visibility-off"}
                onRightIconPress={() => setShowPassword(!showPassword)}
                helperText="Must be at least 4 digits with a number"
                accessibilityLabel="Enter your 4-digit PIN"
                accessibilityHint="Your secure PIN for authentication"
              />
            </View>
          )}

          {/* Biometric Authentication */}
          {authMethod === 'biometric' && (
            <View style={styles.biometricContainer}>
              <IconButton
                icon="fingerprint"
                iconLibrary="MaterialIcons"
                variant="primary"
                size="extra-large"
                onPress={handleBiometricAuth}
                style={styles.biometricButton}
                accessibilityLabel={`Use ${biometricDescription} to authenticate`}
                disabled={isBlocked}
              />
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
            onPress={handleForgotCredentials}
            accessibilityRole="button"
            accessibilityLabel="Reset your login credentials"
          >
            <Text style={styles.forgotText}>
              Forgot your credentials? Reset here
            </Text>
          </TouchableOpacity>

          {/* Login Button */}
          <Button
            title={authMethod === 'biometric' ? `Sign In with ${biometricDescription}` : 'Sign In Securely'}
            onPress={authMethod === 'biometric' ? handleBiometricAuth : handleLogin}
            loading={isLoading || (authMethod === 'biometric' && isBiometricLoading)}
            disabled={isBlocked || !phoneNumber || (authMethod === 'pin' && pin.length < 4)}
            style={styles.loginButton}
            accessibilityLabel="Sign in to your account"
          />

          {/* Support Link */}
          <TouchableOpacity 
            style={styles.supportLink}
            onPress={() => Linking.openURL('https://afya360.com/support')}
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
            onPress={handleEmergencyAccess}
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
              onPress={() => navigation.navigate('SignUp')}
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
});

export default LoginScreen;
