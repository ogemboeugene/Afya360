/**
 * LOGIN SCREEN
 * Entry point for returning users
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

// Import components
import { Afya360Logo } from '../../components/common/Afya360Logo';
import Button from '../../components/ui/buttons/Button';
import { TextInput } from '../../components/ui/inputs/TextInput';

// Import styles
import { COLORS } from '../../styles/colors';
import { TEXT_STYLES } from '../../styles/globalStyles';

// Import hooks
import { useAuth } from '../../hooks/useAuth';

// Types
import { RootStackParamList } from '../../types';

type LoginScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Login'
>;

type LoginScreenRouteProp = RouteProp<
  RootStackParamList,
  'Login'
>;

interface Props {
  navigation?: LoginScreenNavigationProp;
  route?: LoginScreenRouteProp;
}

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
} from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

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

// Types
import { RootStackParamList } from '../../types';

type LoginScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Login'
>;

type LoginScreenRouteProp = RouteProp<
  RootStackParamList,
  'Login'
>;

interface Props {
  navigation?: LoginScreenNavigationProp;
  route?: LoginScreenRouteProp;
}

const { width: screenWidth } = Dimensions.get('window');

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { login, isLoading } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [pin, setPin] = useState('');
  const [authMethod, setAuthMethod] = useState<'pin' | 'biometric' | 'password'>('pin');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSecureDevice, setIsSecureDevice] = useState(true);

  // Check device security features on mount
  useEffect(() => {
    checkDeviceCapabilities();
  }, []);

  const checkDeviceCapabilities = async () => {
    // Simulate checking for biometric availability
    // In a real app, you'd use expo-local-authentication or similar
    console.log('Checking device security capabilities...');
    setIsSecureDevice(true);
  };

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
      
      // Success feedback
      Alert.alert('Welcome Back!', 'Login successful');
    } catch (error) {
      Alert.alert('Login Failed', 'Please check your credentials and try again.');
      console.error('Login failed:', error);
    }
  };

  const handleBiometricAuth = async () => {
    try {
      // Simulate biometric authentication
      Alert.alert('Biometric Auth', 'Place your finger on the sensor or look at the camera');
      setAuthMethod('biometric');
      // In real app, would trigger actual biometric authentication
    } catch (error) {
      Alert.alert('Authentication Failed', 'Biometric authentication was unsuccessful');
    }
  };

  const handleSignUp = () => {
    if (navigation) {
      navigation.navigate('PhoneVerification', {});
    } else {
      console.log('Would navigate to PhoneVerification');
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
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Logo */}
        <View style={styles.header}>
          <Afya360Logo 
            variant="default"
            size="large"
            showText={true}
            animated={true}
            style={styles.logo}
          />
          <Text style={styles.welcomeText}>Welcome Back</Text>
          <Text style={styles.subtitle}>
            Secure access to your health records
          </Text>
          
          {/* Security Indicator */}
          <View style={styles.securityBadge}>
            <Text style={styles.securityText}>
              🔒 Bank-level Security
            </Text>
          </View>
        </View>

        {/* Login Form */}
        <View style={styles.form}>
          {/* Phone Number Input */}
          <TextInput
            label="Phone Number"
            placeholder="0712 345 678"
            value={phoneNumber}
            onChangeText={(text) => setPhoneNumber(formatPhoneNumber(text))}
            keyboardType="phone-pad"
            maxLength={12}
            error={errors.phoneNumber}
            leftIcon="call"
            autoComplete="tel"
          />

          {/* Authentication Method Selector */}
          <View style={styles.authMethodContainer}>
            <Text style={styles.authMethodLabel}>Sign in with:</Text>
            <View style={styles.authMethods}>
              <TouchableOpacity
                style={[
                  styles.authMethodButton,
                  authMethod === 'pin' && styles.authMethodButtonActive
                ]}
                onPress={() => setAuthMethod('pin')}
              >
                <Text style={[
                  styles.authMethodText,
                  authMethod === 'pin' && styles.authMethodTextActive
                ]}>PIN</Text>
              </TouchableOpacity>
              
              {isSecureDevice && (
                <TouchableOpacity
                  style={[
                    styles.authMethodButton,
                    authMethod === 'biometric' && styles.authMethodButtonActive
                  ]}
                  onPress={() => setAuthMethod('biometric')}
                >
                  <Text style={[
                    styles.authMethodText,
                    authMethod === 'biometric' && styles.authMethodTextActive
                  ]}>👆 Biometric</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* PIN Input */}
          {authMethod === 'pin' && (
            <TextInput
              label="4-Digit PIN"
              placeholder="Enter your secure PIN"
              value={pin}
              onChangeText={setPin}
              keyboardType="numeric"
              secureTextEntry={!showPassword}
              maxLength={4}
              error={errors.pin}
              rightIcon={
                <IconButton
                  icon={showPassword ? "eye-off" : "eye"}
                  variant="transparent"
                  size="small"
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
            />
          )}

          {/* Biometric Authentication */}
          {authMethod === 'biometric' && (
            <View style={styles.biometricContainer}>
              <IconButton
                icon="finger-print"
                variant="primary"
                size="extra-large"
                onPress={handleBiometricAuth}
                style={styles.biometricButton}
              />
              <Text style={styles.biometricText}>
                Touch sensor or use face recognition
              </Text>
            </View>
          )}

          {/* Forgot Credentials */}
          <TouchableOpacity
            style={styles.forgotButton}
            onPress={handleForgotCredentials}
          >
            <Text style={styles.forgotText}>
              Forgot {authMethod === 'pin' ? 'PIN' : 'access'}? Reset here
            </Text>
          </TouchableOpacity>

          {/* Login Button */}
          <Button
            title={authMethod === 'biometric' ? 'Authenticate' : 'Sign In'}
            onPress={authMethod === 'biometric' ? handleBiometricAuth : handleLogin}
            loading={isLoading}
            disabled={!phoneNumber || (authMethod === 'pin' && pin.length !== 4)}
            style={styles.loginButton}
            leftIcon={authMethod === 'biometric' ? 'finger-print' : 'log-in'}
          />

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => console.log('Quick health check')}
            >
              <Text style={styles.quickActionText}>📊 Quick Health Check</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => console.log('Find nearby facilities')}
            >
              <Text style={styles.quickActionText}>🏥 Nearby Facilities</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer Actions */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.signUpButton}
            onPress={handleSignUp}
          >
            <Text style={styles.signUpText}>
              New to Afya360? <Text style={styles.signUpLink}>Create Account</Text>
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.emergencyButton}
            onPress={handleEmergencyAccess}
          >
            <Text style={styles.emergencyText}>🚨 Emergency Access</Text>
          </TouchableOpacity>

          {/* App Info */}
          <View style={styles.appInfo}>
            <Text style={styles.appInfoText}>
              Afya360 Healthcare • Secure • Private
            </Text>
            <Text style={styles.versionText}>Version 1.0.0</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  welcomeText: {
    ...TEXT_STYLES.h2,
    color: COLORS.gray900,
    marginTop: 24,
    marginBottom: 8,
  },
  subtitle: {
    ...TEXT_STYLES.body,
    color: COLORS.gray600,
    textAlign: 'center',
  },
  form: {
    flex: 1,
  },
  forgotPinButton: {
    alignSelf: 'flex-end',
    marginTop: 8,
    marginBottom: 32,
  },
  forgotPinText: {
    ...TEXT_STYLES.buttonText,
    color: COLORS.primary500,
  },
  loginButton: {
    marginBottom: 24,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  signUpButton: {
    marginBottom: 24,
  },
  signUpText: {
    ...TEXT_STYLES.body,
    color: COLORS.gray600,
  },
  signUpLink: {
    color: COLORS.primary500,
    fontWeight: '600',
  },
  emergencyButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: COLORS.error50,
    borderRadius: 8,
  },
  emergencyText: {
    ...TEXT_STYLES.buttonText,
    color: COLORS.error500,
  },
});

export default LoginScreen;
