/**
 * PhoneVerificationScreen
 * Step 1 of the onboarding process - Phone number verification with OTP
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
  Dimensions,
} from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

// Import our reusable components
import Button from '../../components/ui/buttons/Button';
import { TextInput } from '../../components/ui/inputs/TextInput';
import { PhoneInput } from '../../components/ui/inputs/PhoneInput';
import { SimpleForm as Form } from '../../components/forms/Form';
import { Afya360Logo } from '../../components/common/Afya360Logo';

// Import styles and constants
import { COLORS } from '../../styles/colors';
import { GLOBAL_STYLES, TEXT_STYLES } from '../../styles/globalStyles';
import VALIDATION_MESSAGES from '../../constants';
import COUNTRIES from '../../constants';
import { validatePhoneNumber, formatPhoneNumber } from '../../utils/validation';

// Import hooks
import { useAuth } from '../../hooks/useAuth';

// Types
import { RootStackParamList } from '../../types';

const { width } = Dimensions.get('window');

type PhoneVerificationScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'PhoneVerification'
>;

type PhoneVerificationScreenRouteProp = RouteProp<
  RootStackParamList,
  'PhoneVerification'
>;

interface Props {
  navigation: PhoneVerificationScreenNavigationProp;
  route: PhoneVerificationScreenRouteProp;
}

interface PhoneFormData {
  phone: string;
  countryCode: string;
}

interface OTPFormData {
  otp: string;
}

export const PhoneVerificationScreen: React.FC<Props> = ({ navigation }) => {
  const { sendOTP, verifyOTP, isLoading } = useAuth();
  
  // State management
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneData, setPhoneData] = useState<PhoneFormData>({
    phone: '',
    countryCode: '+254', // Default to Kenya
  });
  const [otpData, setOTPData] = useState<OTPFormData>({ otp: '' });
  const [resendTimer, setResendTimer] = useState(0);
  const [phoneError, setPhoneError] = useState('');
  const [otpError, setOTPError] = useState('');
  
  // Refs for OTP inputs
  const otpInputRefs = useRef<Array<any>>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Effects
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (resendTimer > 0) {
      timerRef.current = setTimeout(() => {
        setResendTimer(resendTimer - 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [resendTimer]);

  // Phone number validation and submission
  const handlePhoneSubmit = async (data: PhoneFormData) => {
    const fullPhone = data.countryCode + data.phone;
    const validation = validatePhoneNumber(fullPhone);
    
    if (!validation.isValid) {
      setPhoneError(validation.error || 'Invalid phone number');
      return;
    }

    try {
      // Simulate sending OTP (replace with actual API call)
      await sendOTP(fullPhone);
      
      setPhoneData(data);
      setStep('otp');
      setResendTimer(60); // Start 60-second countdown
      setPhoneError('');
      
      Alert.alert(
        'OTP Sent',
        `Verification code has been sent to ${formatPhoneNumber(fullPhone)}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      setPhoneError('Failed to send OTP. Please try again.');
    }
  };

  // OTP verification
  const handleOTPSubmit = async (data: OTPFormData) => {
    if (data.otp.length !== 6) {
      setOTPError('Please enter the complete 6-digit code');
      return;
    }

    try {
      const fullPhone = phoneData.countryCode + phoneData.phone;
      await verifyOTP(fullPhone, data.otp);
      
      setOTPError('');
      
      // Navigate to profile setup
      navigation.navigate('ProfileSetup');
    } catch (error) {
      setOTPError('Invalid verification code. Please try again.');
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    
    try {
      const fullPhone = phoneData.countryCode + phoneData.phone;
      await sendOTP(fullPhone);
      
      setResendTimer(60);
      setOTPError('');
      
      Alert.alert(
        'OTP Resent',
        'A new verification code has been sent to your phone',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to resend OTP. Please try again.');
    }
  };

  // OTP input handling
  const handleOTPChange = (value: string, index: number) => {
    const newOTP = otpData.otp.split('');
    newOTP[index] = value;
    
    const updatedOTP = newOTP.join('');
    setOTPData({ otp: updatedOTP });
    
    // Auto-focus next input
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
    
    // Auto-submit when complete
    if (updatedOTP.length === 6) {
      handleOTPSubmit({ otp: updatedOTP });
    }
  };

  // Back button handling
  const handleBackPress = () => {
    if (step === 'otp') {
      setStep('phone');
      setOTPData({ otp: '' });
      setOTPError('');
    } else {
      navigation.goBack();
    }
  };

  // Render phone input step
  const renderPhoneStep = () => (
    <Form
      onSubmit={handlePhoneSubmit}
      initialValues={phoneData}
      style={styles.form}
    >
      <View style={styles.stepContent}>
        <Text style={styles.stepTitle}>Enter Your Phone Number</Text>
        <Text style={styles.stepDescription}>
          We'll send you a verification code to confirm your phone number
        </Text>

        <View style={styles.inputContainer}>
          <PhoneInput
            label="Phone Number"
            placeholder="712 345 678"
            value={phoneData.phone}
            countryCode={phoneData.countryCode}
            onChangeText={(phone) => setPhoneData({ ...phoneData, phone })}
            onChangeCountryCode={(countryCode) => 
              setPhoneData({ ...phoneData, countryCode })
            }
            errorText={phoneError}
            required
          />
        </View>

        <Button
          title="Send Verification Code"
          onPress={() => handlePhoneSubmit(phoneData)}
          loading={isLoading}
          disabled={!phoneData.phone || phoneData.phone.length < 9}
          style={styles.submitButton}
        />

        <Text style={styles.disclaimerText}>
          By continuing, you agree to receive SMS messages for verification. 
          Message and data rates may apply.
        </Text>
      </View>
    </Form>
  );

  // Render OTP verification step
  const renderOTPStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Enter Verification Code</Text>
      <Text style={styles.stepDescription}>
        Please enter the 6-digit code sent to{'\n'}
        {formatPhoneNumber(phoneData.countryCode + phoneData.phone)}
      </Text>

      <View style={styles.otpContainer}>
        {Array.from({ length: 6 }, (_, index) => (
          <TextInput
            key={index}
            ref={(ref) => {
              otpInputRefs.current[index] = ref;
            }}
            style={styles.otpInput}
            value={otpData.otp[index] || ''}
            onChangeText={(value) => handleOTPChange(value, index)}
            keyboardType="numeric"
            maxLength={1}
            textAlign="center"
            selectTextOnFocus
            errorText={otpError && index === 0 ? otpError : ''}
          />
        ))}
      </View>

      <Button
        title="Verify Code"
        onPress={() => handleOTPSubmit(otpData)}
        loading={isLoading}
        disabled={otpData.otp.length !== 6}
        style={styles.submitButton}
      />

      <View style={styles.resendContainer}>
        {resendTimer > 0 ? (
          <Text style={styles.resendTimerText}>
            Resend code in {resendTimer}s
          </Text>
        ) : (
          <Button
            title="Resend Code"
            variant="link"
            onPress={handleResendOTP}
            style={styles.resendButton}
          />
        )}
      </View>

      <Button
        title="Change Phone Number"
        variant="link"
        onPress={() => setStep('phone')}
        style={styles.changePhoneButton}
      />
    </View>
  );

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
                <View style={[styles.progressFill, { width: '25%' }]} />
              </View>
              <Text style={styles.progressText}>Step 1 of 4</Text>
            </View>
          </View>

          {/* Content */}
          {step === 'phone' ? renderPhoneStep() : renderOTPStep()}
        </ScrollView>

        {/* Back Button */}
        <View style={styles.backButtonContainer}>
          <Button
            title={step === 'otp' ? 'Back to Phone' : 'Back'}
            variant="link"
            onPress={handleBackPress}
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
  form: {
    flex: 1,
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
  inputContainer: {
    marginBottom: 32,
  },
  submitButton: {
    marginBottom: 24,
  },
  disclaimerText: {
    ...TEXT_STYLES.caption,
    color: COLORS.gray500,
    textAlign: 'center',
    lineHeight: 20,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  otpInput: {
    width: (width - 80) / 6,
    height: 56,
    fontSize: 24,
    fontWeight: '600',
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  resendTimerText: {
    ...TEXT_STYLES.body,
    color: COLORS.gray500,
  },
  resendButton: {
    paddingVertical: 8,
  },
  changePhoneButton: {
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

export default PhoneVerificationScreen;
