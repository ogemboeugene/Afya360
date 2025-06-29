/**
 * LOGIN SCREEN
 * Professional entry point for returning users
 * Features: Biometric auth, PIN/Password, Emergency access, Security indicators
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
      } else if (pin.length !== 4) {
        newErrors.pin = 'PIN must be 4 digits';
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
    if (!validateForm()) return;

    try {
      await login({ 
        phoneNumber: phoneNumber.replace(/\D/g, ''), 
        pin: authMethod === 'pin' ? pin : undefined,
        authMethod 
      });
      
      Alert.alert('Welcome Back!', 'Login successful');
    } catch (error) {
      Alert.alert('Login Failed', 'Please check your credentials and try again.');
      console.error('Login failed:', error);
    }
  };

  const handleBiometricAuth = async () => {
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
        
        Alert.alert('Welcome Back!', 'Biometric authentication successful');
      } else {
        if (result.error && !result.error.includes('cancelled')) {
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
        { text: 'Contact Support', onPress: () => console.log('Support') },
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
            <View style={styles.logoBackground}>
              <IconMCI name="medical-bag" size={64} color={COLORS.white} />
            </View>
          </View>
          
          <View style={styles.welcomeContent}>
            <Text style={styles.welcomeText}>Welcome Back</Text>
            <Text style={styles.subtitle}>
              We've missed you. Let's continue your wellness journey.
            </Text>
          </View>
          
          {/* Security Indicator */}
          <View style={styles.securityBadge}>
            <IconMCI name="shield-check" size={18} color={COLORS.white} />
            <Text style={styles.securityBadgeText}>
              Medical-Grade Security
            </Text>
          </View>
        </View>

        {/* Enhanced Login Form Card */}
        <View style={styles.formCard}>
          {/* Phone Number Input */}
          <View style={styles.inputGroup}>
            <View style={styles.inputHeader}>
              <IconMCI name="phone" size={20} color={COLORS.secondary600} />
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
                accessibilityLabel="Sign in with PIN"
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
                <IconMCI name="lock" size={20} color={COLORS.secondary600} />
                <Text style={styles.inputLabel}>4-Digit PIN</Text>
              </View>
              <TextInput
                placeholder="Enter your secure PIN"
                value={pin}
                onChangeText={setPin}
                keyboardType="numeric"
                secureTextEntry={!showPassword}
                maxLength={4}
                errorText={errors.pin}
                leftIcon="lock"
                rightIcon={showPassword ? "visibility" : "visibility-off"}
                onRightIconPress={() => setShowPassword(!showPassword)}
                helperText="Must be 4 digits"
                accessibilityLabel="Enter your 4-digit PIN"
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
            disabled={!phoneNumber || (authMethod === 'pin' && pin.length !== 4)}
            style={styles.loginButton}
            accessibilityLabel="Sign in to your account"
          />

          {/* Support Link */}
          <TouchableOpacity 
            style={styles.supportLink}
            onPress={() => console.log('Contact support')}
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
            <IconMCI name="medical-bag" size={20} color={COLORS.error500} />
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
  
  // Enhanced Header Section
  headerSection: {
    backgroundColor: COLORS.secondary500,
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

  // Form Card
  formCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    marginTop: -20,
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 30,
    elevation: 8,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },

  inputGroup: {
    marginBottom: 24,
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputLabel: {
    ...TEXT_STYLES.body,
    color: COLORS.gray900,
    marginLeft: 8,
    fontWeight: '600',
  },

  authMethodContainer: {
    marginBottom: 24,
  },
  authMethodLabel: {
    ...TEXT_STYLES.body,
    color: COLORS.gray700,
    marginBottom: 12,
    fontWeight: '500',
  },
  authMethods: {
    flexDirection: 'row',
    gap: 12,
  },
  authMethodButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.gray300,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  authMethodButtonActive: {
    borderColor: COLORS.secondary500,
    backgroundColor: COLORS.secondary50,
  },
  authMethodText: {
    ...TEXT_STYLES.buttonText,
    color: COLORS.gray600,
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
    borderColor: COLORS.secondary200,
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
    paddingVertical: 8,
  },
  forgotText: {
    ...TEXT_STYLES.body,
    color: COLORS.secondary600,
    fontWeight: '500',
  },

  loginButton: {
    marginBottom: 20,
    elevation: 4,
    shadowColor: COLORS.secondary500,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },

  supportLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
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
    borderColor: COLORS.secondary200,
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
