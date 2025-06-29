/**
 * SIGN-UP SCREEN
 * Professional account creation for new users
 * Features: Phone verification, consent management, privacy assurance, accessibility
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
  Linking,
  Platform,
  StatusBar,
  KeyboardAvoidingView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import IconFA from 'react-native-vector-icons/FontAwesome5';
import IconMCI from 'react-native-vector-icons/MaterialCommunityIcons';

// Import components
import { Afya360Logo } from '../../components/common/Afya360Logo';
import Button from '../../components/ui/buttons/Button';
import IconButton from '../../components/ui/buttons/IconButton';
import { TextInput } from '../../components/ui/inputs/TextInput';
import { PhoneInput } from '../../components/ui/inputs/PhoneInput';

// Import styles
import { COLORS } from '../../styles/colors';
import { TEXT_STYLES, GLOBAL_STYLES } from '../../styles/globalStyles';

// Import hooks
import { useAuth } from '../../hooks/useAuth';

// Types
import { RootStackParamList } from '../../types';

type NavigationProp = {
  navigate: (screen: string, params?: any) => void;
  goBack: () => void;
};

type RouteProp = {
  params?: any;
};

interface SignUpScreenProps {
  navigation: NavigationProp;
  route: RouteProp;
}

const { width, height } = Dimensions.get('window');

const SignUpScreen: React.FC<SignUpScreenProps> = ({ navigation }) => {
  // Form state
  const [phoneNumber, setPhoneNumber] = useState('');
  const [fullPhoneNumber, setFullPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+254');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [consentGiven, setConsentGiven] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  
  // Hooks
  const { sendOTP } = useAuth();

  // Real-time validation
  useEffect(() => {
    validateForm();
  }, [phoneNumber, firstName, lastName, email, consentGiven]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Phone validation
    if (phoneNumber && phoneNumber.length < 9) {
      newErrors.phone = 'Phone number must be at least 9 digits';
    } else if (phoneNumber && !/^\d+$/.test(phoneNumber)) {
      newErrors.phone = 'Phone number can only contain digits';
    }

    // Name validation
    if (firstName && firstName.length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }
    if (lastName && lastName.length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }

    // Email validation (optional but if provided, must be valid)
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
  };

  const handleSignUp = async () => {
    if (!phoneNumber || !firstName || !lastName || !consentGiven) {
      Alert.alert(
        'Incomplete Information',
        'Please fill in all required fields and accept the terms of service.'
      );
      return;
    }

    if (Object.keys(errors).length > 0) {
      Alert.alert(
        'Validation Error',
        'Please correct the highlighted errors before continuing.'
      );
      return;
    }

    setIsLoading(true);
    try {
      // Call your sign-up API here - for now we'll use sendOTP
      await sendOTP(fullPhoneNumber);
      
      // Navigate to phone verification
      navigation.navigate('PhoneVerification', { phoneNumber: fullPhoneNumber });
    } catch (error) {
      Alert.alert(
        'Sign Up Failed',
        'Unable to create your account. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrivacyPolicy = () => {
    // Replace with your privacy policy URL
    Linking.openURL('https://afya360.com/privacy');
  };

  const handleTermsOfService = () => {
    // Replace with your terms URL
    Linking.openURL('https://afya360.com/terms');
  };

  const handleHelpToggle = () => {
    setShowHelp(!showHelp);
  };

  const renderTrustBadges = () => (
    <View style={styles.trustBadges}>
      <View style={styles.trustBadge}>
        <View style={styles.trustIconContainer}>
          <Icon name="verified-user" size={24} color={COLORS.white} />
        </View>
        <Text style={styles.trustText}>HIPAA Compliant</Text>
        <Text style={styles.trustSubtext}>Your privacy protected</Text>
      </View>
      <View style={styles.trustBadge}>
        <View style={styles.trustIconContainer}>
          <Icon name="enhanced-encryption" size={24} color={COLORS.white} />
        </View>
        <Text style={styles.trustText}>256-bit Encryption</Text>
        <Text style={styles.trustSubtext}>Bank-level security</Text>
      </View>
      <View style={styles.trustBadge}>
        <View style={styles.trustIconContainer}>
          <Icon name="local-hospital" size={24} color={COLORS.white} />
        </View>
        <Text style={styles.trustText}>Medical Grade</Text>
        <Text style={styles.trustSubtext}>Healthcare certified</Text>
      </View>
    </View>
  );

  const renderHelpTooltip = () => {
    if (!showHelp) return null;
    
    return (
      <View style={styles.helpTooltip}>
        <View style={styles.helpContent}>
          <Text style={styles.helpTitle}>Why do we need your phone number?</Text>
          <Text style={styles.helpText}>
            • Secure account verification via SMS{'\n'}
            • Emergency contact for medical alerts{'\n'}
            • Two-factor authentication for your safety{'\n'}
            • Appointment reminders and health notifications
          </Text>
          <Text style={styles.helpPrivacy}>
            🛡️ Your number is encrypted and never shared with third parties
          </Text>
        </View>
      </View>
    );
  };

  const renderConsentSection = () => (
    <View style={styles.consentSection}>
      <TouchableOpacity
        style={styles.checkboxRow}
        onPress={() => setConsentGiven(!consentGiven)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: consentGiven }}
        accessibilityLabel="Accept terms of service and privacy policy"
      >
        <View style={[styles.checkbox, consentGiven && styles.checkboxChecked]}>
          {consentGiven && <Icon name="check" size={16} color={COLORS.white} />}
        </View>
        <Text style={styles.consentText}>
          I agree to the{' '}
          <Text style={styles.linkText} onPress={handleTermsOfService}>
            Terms of Service
          </Text>
          {' '}and{' '}
          <Text style={styles.linkText} onPress={handlePrivacyPolicy}>
            Privacy Policy
          </Text>
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.checkboxRow}
        onPress={() => setMarketingConsent(!marketingConsent)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: marketingConsent }}
        accessibilityLabel="Receive health tips and updates"
      >
        <View style={[styles.checkbox, marketingConsent && styles.checkboxChecked]}>
          {marketingConsent && <Icon name="check" size={16} color={COLORS.white} />}
        </View>
        <Text style={styles.consentText}>
          I'd like to receive health tips and updates (optional)
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor={COLORS.secondary600} />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Enhanced Header Section with Medical Gradient */}
        <View style={styles.headerSection}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              accessibilityLabel="Go back to previous screen"
              accessibilityRole="button"
            >
              <Icon name="arrow-back" size={24} color={COLORS.white} />
            </TouchableOpacity>
          </View>

          {/* Enhanced Welcome Section */}
          <View style={styles.welcomeSection}>
            <View style={styles.logoContainer}>
              <Afya360Logo 
                variant="white"
                size="large"
                showText={false}
                containerStyle={styles.logoBackground}
              />
            </View>
            
            <View style={styles.welcomeContent}>
              <Text style={styles.title}>Join Afya360</Text>
              <Text style={styles.subtitle}>
                Take control of your health journey
              </Text>
              <Text style={styles.tagline}>
                🏥 Trusted by 100,000+ users worldwide
              </Text>
            </View>
          </View>

          {/* Enhanced Trust Badges */}
          {renderTrustBadges()}
        </View>

        {/* Enhanced Form Section with Card Design */}
        <View style={styles.formCard}>
          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '60%' }]} />
            </View>
            <Text style={styles.progressText}>Step 1 of 2</Text>
          </View>

          {/* Personal Information */}
          <View style={styles.inputGroup}>
            <View style={styles.sectionHeader}>
              <Icon name="account-circle" size={24} color={COLORS.secondary600} />
              <Text style={styles.sectionTitle}>Personal Information</Text>
            </View>
            
            <View style={styles.inputRow}>
              <View style={styles.inputHalf}>
                <TextInput
                  label="First Name"
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="John"
                  leftIcon="person"
                  autoCapitalize="words"
                  textContentType="givenName"
                  autoComplete="given-name"
                  errorText={errors.firstName}
                  required
                  accessibilityLabel="Enter your first name"
                />
              </View>
              <View style={styles.inputHalf}>
                <TextInput
                  label="Last Name"
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Doe"
                  leftIcon="person-outline"
                  autoCapitalize="words"
                  textContentType="familyName"
                  autoComplete="family-name"
                  errorText={errors.lastName}
                  required
                  accessibilityLabel="Enter your last name"
                />
              </View>
            </View>
            
            <TextInput
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              placeholder="john.doe@example.com"
              leftIcon="email"
              keyboardType="email-address"
              autoCapitalize="none"
              textContentType="emailAddress"
              autoComplete="email"
              errorText={errors.email}
              helperText="We'll use this for important account updates"
              accessibilityLabel="Enter your email address for account updates"
            />
          </View>

          {/* Phone Number Section */}
          <View style={styles.inputGroup}>
            <View style={styles.phoneHeader}>
              <View style={styles.sectionHeader}>
                <Icon name="phone" size={24} color={COLORS.secondary600} />
                <Text style={styles.sectionTitle}>Phone Number</Text>
              </View>
              <TouchableOpacity
                style={styles.helpButton}
                onPress={handleHelpToggle}
                accessibilityLabel="Get help with phone number requirements"
                accessibilityRole="button"
              >
                <Icon 
                  name="help-outline" 
                  size={20} 
                  color={COLORS.secondary600} 
                />
              </TouchableOpacity>
            </View>
            
            {renderHelpTooltip()}
            
            <PhoneInput
              label="Phone Number"
              value={phoneNumber}
              onChangeText={(phone, full) => {
                setPhoneNumber(phone);
                setFullPhoneNumber(full);
              }}
              countryCode={countryCode}
              onCountryCodeChange={setCountryCode}
              placeholder="712 345 678"
              textContentType="telephoneNumber"
              autoComplete="tel"
              errorText={errors.phone}
              helperText="Required for account verification and emergency contact"
              required
              accessibilityLabel="Enter your phone number for verification"
            />
            
            <View style={styles.privacyAssurance}>
              <Icon name="verified-user" size={16} color={COLORS.secondary600} />
              <Text style={styles.privacyText}>
                Your phone number is encrypted and protected
              </Text>
            </View>
          </View>

          {/* Enhanced Consent Section */}
          <View style={styles.consentCard}>
            <View style={styles.consentHeader}>
              <Icon name="gavel" size={24} color={COLORS.secondary600} />
              <Text style={styles.consentTitle}>Privacy & Terms</Text>
            </View>
            {renderConsentSection()}
          </View>

          {/* Enhanced Sign Up Button */}
          <View style={styles.actionSection}>
            <Button
              title="Create My Account"
              onPress={handleSignUp}
              loading={isLoading}
              disabled={!phoneNumber || !firstName || !lastName || !consentGiven || Object.keys(errors).length > 0}
              variant="primary"
              size="large"
              fullWidth
              style={styles.signUpButton}
              accessibilityLabel="Create your Afya360 account"
            />

            {/* Additional Options */}
            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.orText}>or continue with</Text>
              <View style={styles.divider} />
            </View>
            
            <Button
              title="Biometric Authentication"
              onPress={() => navigation.navigate('BiometricSetup')}
              variant="outline"
              size="large"
              fullWidth
              iconText="👆"
              iconPosition="left"
              style={styles.biometricButton}
              accessibilityLabel="Set up biometric authentication for faster login"
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

          {/* Login Link */}
          <View style={styles.loginSection}>
            <Text style={styles.loginText}>
              Already have an account?{' '}
              <Text 
                style={styles.loginLink}
                onPress={() => navigation.navigate('Login')}
                accessibilityLabel="Sign in to existing account"
              >
                Sign In
              </Text>
            </Text>
            
            {/* Support Link */}
            <TouchableOpacity 
              style={styles.supportLink}
              onPress={() => Linking.openURL('https://afya360.com/support')}
              accessibilityRole="button"
              accessibilityLabel="Get help or contact support"
            >
              <Icon name="help-outline" size={16} color={COLORS.secondary600} />
              <Text style={styles.supportText}>Need help? Contact Support</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Enhanced Security Footer */}
        <View style={styles.securityFooter}>
          <View style={styles.securityBadge}>
            <Icon name="verified-user" size={20} color={COLORS.secondary600} />
            <View style={styles.securityTextContainer}>
              <Text style={styles.securityTitle}>Bank-Level Security</Text>
              <Text style={styles.securityText}>
                Your data is protected with enterprise-grade encryption
              </Text>
            </View>
          </View>
          
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray50,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  
  // Enhanced Header Section with Medical Gradient
  headerSection: {
    backgroundColor: COLORS.secondary500, // Medical green instead of blue
    paddingBottom: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 8,
    shadowColor: COLORS.secondary500,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 10,
  },
  backButton: {
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 24,
    minWidth: 48,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Enhanced Welcome Section
  welcomeSection: {
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingTop: 20,
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
    marginBottom: 30,
  },
  title: {
    ...TEXT_STYLES.h1,
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: 8,
    fontSize: 32,
    fontWeight: '700',
  },
  subtitle: {
    ...TEXT_STYLES.h3,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '500',
  },
  tagline: {
    ...TEXT_STYLES.body,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // Enhanced Trust Badges
  trustBadges: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 20,
    borderRadius: 16,
    marginTop: 20,
  },
  trustBadge: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 8,
  },
  trustIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 12,
    borderRadius: 20,
    marginBottom: 8,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  trustText: {
    ...TEXT_STYLES.caption,
    color: COLORS.white,
    marginBottom: 2,
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 12,
  },
  trustSubtext: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    fontSize: 10,
  },

  // Form Card Design
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

  // Progress Indicator
  progressContainer: {
    marginBottom: 30,
  },
  progressBar: {
    height: 4,
    backgroundColor: COLORS.gray200,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.secondary500,
    borderRadius: 2,
  },
  progressText: {
    ...TEXT_STYLES.caption,
    color: COLORS.gray600,
    textAlign: 'center',
    fontWeight: '500',
  },

  // Section Headers
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.secondary100,
  },
  sectionTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.secondary700,
    marginLeft: 12,
    fontWeight: '700',
    fontSize: 18,
  },
  
  inputGroup: {
    marginBottom: 28,
  },
  
  // Input Row for Side-by-Side Inputs
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputHalf: {
    flex: 1,
  },

  phoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  helpButton: {
    padding: 8,
    backgroundColor: COLORS.secondary50,
    borderRadius: 16,
  },
  helpTooltip: {
    backgroundColor: COLORS.secondary50,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.secondary500,
  },
  helpContent: {
    flex: 1,
  },
  helpTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    color: COLORS.gray900,
    marginBottom: 10,
  },
  helpText: {
    ...TEXT_STYLES.body,
    color: COLORS.gray600,
    lineHeight: 22,
    marginBottom: 10,
  },
  helpPrivacy: {
    ...TEXT_STYLES.caption,
    color: COLORS.secondary600,
    fontWeight: '600',
  },

  privacyAssurance: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: COLORS.secondary50,
    padding: 12,
    borderRadius: 8,
  },
  privacyText: {
    ...TEXT_STYLES.caption,
    color: COLORS.secondary600,
    marginLeft: 8,
    fontWeight: '500',
  },

  // Enhanced Consent Section
  consentCard: {
    backgroundColor: COLORS.secondary50,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.secondary100,
    elevation: 2,
    shadowColor: COLORS.secondary500,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  consentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.secondary200,
  },
  consentTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.secondary700,
    marginLeft: 12,
    fontWeight: '700',
    fontSize: 16,
  },
  consentSection: {
    // Remove previous styles as they're now handled in consentCard
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.gray300,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: COLORS.secondary500,
    borderColor: COLORS.secondary500,
  },
  consentText: {
    ...TEXT_STYLES.body,
    color: COLORS.gray600,
    flex: 1,
    lineHeight: 22,
  },
  linkText: {
    color: COLORS.secondary600,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },

  // Action Section
  actionSection: {
    marginBottom: 24,
  },
  signUpButton: {
    elevation: 6,
    shadowColor: COLORS.secondary500,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    marginBottom: 20,
  },

  // Enhanced Divider
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.gray300,
  },
  orText: {
    ...TEXT_STYLES.caption,
    color: COLORS.gray600,
    paddingHorizontal: 16,
    backgroundColor: COLORS.white,
    fontWeight: '500',
  },
  biometricButton: {
    elevation: 4,
    shadowColor: COLORS.secondary400,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },

  // Enhanced support link styling
  supportLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: COLORS.secondary50,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.secondary100,
    marginTop: 16,
    elevation: 2,
    shadowColor: COLORS.secondary300,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  supportText: {
    ...TEXT_STYLES.caption,
    color: COLORS.secondary600,
    marginLeft: 8,
    fontWeight: '600',
  },

  loginSection: {
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: COLORS.gray50,
    borderRadius: 12,
    marginTop: 20,
  },
  loginText: {
    ...TEXT_STYLES.body,
    color: COLORS.gray600,
  },
  loginLink: {
    color: COLORS.secondary600,
    fontWeight: '600',
  },

  // Enhanced Security Footer
  securityFooter: {
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
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  securityTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  securityTitle: {
    ...TEXT_STYLES.body,
    color: COLORS.gray900,
    fontWeight: '600',
    marginBottom: 2,
  },
  securityText: {
    ...TEXT_STYLES.caption,
    color: COLORS.gray600,
    lineHeight: 18,
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
});

export default SignUpScreen;
