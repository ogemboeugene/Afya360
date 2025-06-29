/**
 * PHONE VERIFICATION SCREEN
 * Phone number input and validation
 * Features: Country code selector, phone validation, clean UI
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
  TextInput as RNTextInput,
} from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';

// Import components
import Button from '../../components/ui/buttons/Button';
import IconButton from '../../components/ui/buttons/IconButton';
import { TextInput } from '../../components/ui/inputs/TextInput';
import { CustomIcon } from '../../components/common/CustomIcon';
import { Afya360Logo } from '../../components/common/Afya360Logo';

// Import styles
import { COLORS } from '../../styles/colors';
import { TEXT_STYLES } from '../../styles/globalStyles';

// Import hooks
import { useAuth } from '../../hooks/useAuth';

// Types
import { RootStackParamList } from '../../types';

type PhoneVerificationNavigationProp = StackNavigationProp<
  RootStackParamList,
  'PhoneVerification'
>;

type PhoneVerificationRouteProp = RouteProp<
  RootStackParamList,
  'PhoneVerification'
>;

interface Props {
  navigation: PhoneVerificationNavigationProp;
  route?: PhoneVerificationRouteProp;
}

export const PhoneVerificationScreen: React.FC<Props> = ({ navigation, route }) => {
  const { sendOTP, verifyOTP, isLoading } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState(route?.params?.phoneNumber || '');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [countdown, setCountdown] = useState(0);
  const [isResending, setIsResending] = useState(false);

  // Refs for OTP inputs
  const otpRefs = useRef<Array<RNTextInput | null>>([]);

  // Countdown timer for resend OTP
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const formatPhoneNumber = (value: string) => {
    // Remove all non-numeric characters
    const cleaned = value.replace(/\D/g, '');
    
    // Format as Kenyan phone number
    if (cleaned.length <= 10) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
    }
    return cleaned.substring(0, 10).replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
  };

  const handlePhoneSubmit = async () => {
    const cleanedPhone = phoneNumber.replace(/\D/g, '');
    
    if (cleanedPhone.length !== 10) {
      Alert.alert('Invalid Phone Number', 'Please enter a valid 10-digit phone number');
      return;
    }

    try {
      await sendOTP(cleanedPhone);
      setStep('otp');
      setCountdown(60); // 60 seconds countdown
      Alert.alert('OTP Sent', `Verification code sent to ${phoneNumber}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to send verification code. Please try again.');
    }
  };

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all digits are entered
    if (newOtp.every(digit => digit !== '') && newOtp.join('').length === 6) {
      handleOtpVerify(newOtp.join(''));
    }
  };

  const handleOtpKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpVerify = async (otpCode?: string) => {
    const code = otpCode || otp.join('');
    
    if (code.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter the complete 6-digit verification code');
      return;
    }

    try {
      await verifyOTP(phoneNumber.replace(/\D/g, ''), code);
      navigation.navigate('ProfileSetup');
    } catch (error) {
      Alert.alert('Invalid Code', 'The verification code is incorrect. Please try again.');
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0 || isResending) return;

    setIsResending(true);
    try {
      await sendOTP(phoneNumber.replace(/\D/g, ''));
      setCountdown(60);
      Alert.alert('OTP Resent', 'A new verification code has been sent');
    } catch (error) {
      Alert.alert('Error', 'Failed to resend verification code. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const handleBack = () => {
    if (step === 'otp') {
      setStep('phone');
      setOtp(['', '', '', '', '', '']);
    } else {
      navigation.goBack();
    }
  };

  const renderPhoneStep = () => (
    <>
      <View style={styles.header}>
        <Afya360Logo 
          variant="text-only"
          size="large"
          textColor={COLORS.primary500}
        />
        <Text style={styles.title}>Verify Your Phone Number</Text>
        <Text style={styles.subtitle}>
          Enter your phone number to receive a verification code
        </Text>
      </View>

      <View style={styles.form}>
        <TextInput
          label="Phone Number"
          placeholder="0712 345 678"
          value={phoneNumber}
          onChangeText={(text) => setPhoneNumber(formatPhoneNumber(text))}
          keyboardType="phone-pad"
          maxLength={12}
          autoFocus
        />

        <Button
          title="Send Verification Code"
          onPress={handlePhoneSubmit}
          loading={isLoading}
          disabled={phoneNumber.replace(/\D/g, '').length !== 10}
          style={styles.submitButton}
        />
      </View>
    </>
  );

  const renderOtpStep = () => (
    <>
      <View style={styles.header}>
        <Afya360Logo 
          variant="text-only"
          size="medium"
          textColor={COLORS.primary500}
        />
        <Text style={styles.title}>Enter Verification Code</Text>
        <Text style={styles.subtitle}>
          We sent a 6-digit code to {phoneNumber}
        </Text>
      </View>

      <View style={styles.otpContainer}>
        <View style={styles.otpInputs}>
          {otp.map((digit, index) => (
            <RNTextInput
              key={index}
              ref={(ref) => {
                otpRefs.current[index] = ref;
              }}
              style={[
                styles.otpInput,
                digit ? styles.otpInputFilled : null,
              ]}
              value={digit}
              onChangeText={(value) => handleOtpChange(value, index)}
              onKeyPress={({ nativeEvent }) => handleOtpKeyPress(nativeEvent.key, index)}
              keyboardType="numeric"
              maxLength={1}
              textAlign="center"
              selectTextOnFocus
            />
          ))}
        </View>

        <Button
          title="Verify Code"
          onPress={() => handleOtpVerify()}
          loading={isLoading}
          disabled={otp.join('').length !== 6}
          style={styles.submitButton}
        />

        <View style={styles.resendContainer}>
          {countdown > 0 ? (
            <Text style={styles.countdownText}>
              Resend code in {countdown}s
            </Text>
          ) : (
            <TouchableOpacity 
              onPress={handleResendOTP}
              disabled={isResending}
              style={styles.resendButton}
            >
              <Text style={styles.resendText}>
                {isResending ? 'Sending...' : 'Resend Code'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <IconButton
          icon="arrow-back"
          variant="transparent"
          size="medium"
          onPress={handleBack}
          style={styles.backButton}
        />
      </View>

      <View style={styles.content}>
        {step === 'phone' ? renderPhoneStep() : renderOtpStep()}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </View>
    </SafeAreaView>
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
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 1,
  },
  title: {
    ...TEXT_STYLES.h1,
    color: COLORS.gray800,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    ...TEXT_STYLES.body,
    color: COLORS.gray600,
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    marginTop: 32,
  },
  submitButton: {
    marginTop: 24,
  },
  otpContainer: {
    marginTop: 32,
  },
  otpInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderWidth: 2,
    borderColor: COLORS.gray300,
    borderRadius: 12,
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.gray800,
    backgroundColor: COLORS.white,
  },
  otpInputFilled: {
    borderColor: COLORS.primary500,
    backgroundColor: COLORS.primary50,
  },
  resendContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  countdownText: {
    ...TEXT_STYLES.caption,
    color: COLORS.gray500,
  },
  resendButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  resendText: {
    ...TEXT_STYLES.body,
    color: COLORS.primary500,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  footerText: {
    ...TEXT_STYLES.caption,
    color: COLORS.gray500,
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default PhoneVerificationScreen;
