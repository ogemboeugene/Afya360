/**
 * OTP VERIFICATION SCREEN
 * 6-digit OTP verification with auto-advance and resend functionality
 * Features: Auto-focus, timer, resend, professional UI
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput as RNTextInput,
  Vibration,
} from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';

// Import components
import Button from '../../components/ui/buttons/Button';
import IconButton from '../../components/ui/buttons/IconButton';
import { CustomIcon } from '../../components/common/CustomIcon';
import { Afya360Logo } from '../../components/common/Afya360Logo';

// Import styles
import { COLORS } from '../../styles/colors';
import { TEXT_STYLES } from '../../styles/globalStyles';

// Import hooks
import { useAuth } from '../../hooks/useAuth';

// Types
import { RootStackParamList } from '../../types';

type OTPVerificationNavigationProp = StackNavigationProp<
  RootStackParamList,
  'OTPVerification'
>;

type OTPVerificationRouteProp = RouteProp<
  RootStackParamList,
  'OTPVerification'
>;

interface Props {
  navigation: OTPVerificationNavigationProp;
  route: OTPVerificationRouteProp;
}

export const OTPVerificationScreen: React.FC<Props> = ({ navigation, route }) => {
  const { verifyOTP, sendOTP, isLoading } = useAuth();
  const { phoneNumber } = route.params;
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(60);
  const [isResending, setIsResending] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const maxAttempts = 3;

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

  // Auto-focus first input on mount
  useEffect(() => {
    setTimeout(() => {
      otpRefs.current[0]?.focus();
    }, 300);
  }, []);

  const handleOtpChange = (value: string, index: number) => {
    // Only allow numeric input
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all digits are entered
    if (newOtp.every(digit => digit !== '') && newOtp.join('').length === 6) {
      setTimeout(() => handleVerifyOTP(newOtp.join('')), 300);
    }
  };

  const handleOtpKeyPress = (key: string, index: number) => {
    if (key === 'Backspace') {
      if (!otp[index] && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        otpRefs.current[index - 1]?.focus();
      } else if (otp[index]) {
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    }
  };

  const handleVerifyOTP = async (otpCode?: string) => {
    const code = otpCode || otp.join('');
    
    if (code.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter the complete 6-digit verification code');
      return;
    }

    try {
      await verifyOTP(phoneNumber, code);
      Vibration.vibrate(100); // Success feedback
      navigation.navigate('ProfileSetup');
    } catch (error) {
      Vibration.vibrate([100, 100, 100]); // Error feedback
      setAttempts(prev => prev + 1);
      
      if (attempts + 1 >= maxAttempts) {
        Alert.alert(
          'Too Many Attempts',
          'You have exceeded the maximum number of attempts. Please request a new code.',
          [
            { text: 'Request New Code', onPress: handleResendOTP },
            { text: 'Go Back', onPress: () => navigation.goBack() },
          ]
        );
        setAttempts(0);
      } else {
        Alert.alert(
          'Invalid Code',
          `The verification code is incorrect. ${maxAttempts - attempts - 1} attempts remaining.`
        );
      }
      
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => {
        otpRefs.current[0]?.focus();
      }, 100);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0 || isResending) return;

    setIsResending(true);
    setAttempts(0); // Reset attempts on resend
    
    try {
      await sendOTP(phoneNumber);
      setCountdown(60);
      setOtp(['', '', '', '', '', '']);
      Alert.alert('Code Sent', 'A new verification code has been sent to your phone');
      setTimeout(() => {
        otpRefs.current[0]?.focus();
      }, 100);
    } catch (error) {
      Alert.alert('Error', 'Failed to send verification code. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const formatPhoneNumber = (phone: string) => {
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, '+254 $1 $2 $3');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.primary50, COLORS.white]}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <IconButton
            icon="arrow-back"
            variant="transparent"
            size="medium"
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          />
          
          <View style={styles.logoContainer}>
            <Afya360Logo 
              variant="icon-only"
              size="medium"
            />
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.titleSection}>
            <CustomIcon
              library="MaterialIcons"
              name="smartphone"
              size={48}
              color={COLORS.primary500}
              style={styles.titleIcon}
            />
            <Text style={styles.title}>Enter Verification Code</Text>
            <Text style={styles.subtitle}>
              We sent a 6-digit code to{'\n'}
              <Text style={styles.phoneText}>{formatPhoneNumber(phoneNumber)}</Text>
            </Text>
          </View>

          {/* OTP Input */}
          <View style={styles.otpSection}>
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
                    attempts > 0 ? styles.otpInputError : null,
                  ]}
                  value={digit}
                  onChangeText={(value) => handleOtpChange(value, index)}
                  onKeyPress={({ nativeEvent }) => handleOtpKeyPress(nativeEvent.key, index)}
                  keyboardType="numeric"
                  maxLength={1}
                  textAlign="center"
                  selectTextOnFocus
                  autoComplete="one-time-code"
                  textContentType="oneTimeCode"
                />
              ))}
            </View>

            {/* Verify Button */}
            <Button
              title="Verify Code"
              onPress={() => handleVerifyOTP()}
              loading={isLoading}
              disabled={otp.join('').length !== 6}
              style={styles.verifyButton}
            />

            {/* Resend Section */}
            <View style={styles.resendSection}>
              {countdown > 0 ? (
                <View style={styles.countdownContainer}>
                  <CustomIcon
                    library="MaterialIcons"
                    name="timer"
                    size={16}
                    color={COLORS.gray500}
                  />
                  <Text style={styles.countdownText}>
                    Resend code in {countdown}s
                  </Text>
                </View>
              ) : (
                <TouchableOpacity 
                  onPress={handleResendOTP}
                  disabled={isResending}
                  style={styles.resendButton}
                >
                  <CustomIcon
                    library="MaterialIcons"
                    name="refresh"
                    size={18}
                    color={COLORS.primary500}
                    style={styles.resendIcon}
                  />
                  <Text style={styles.resendText}>
                    {isResending ? 'Sending...' : 'Resend Code'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.securityIndicator}>
            <CustomIcon
              library="MaterialIcons"
              name="security"
              size={16}
              color={COLORS.success500}
            />
            <Text style={styles.securityText}>
              Your information is encrypted and secure
            </Text>
          </View>
          
          <TouchableOpacity
            onPress={() => navigation.navigate('PhoneVerification', {})}
            style={styles.changeNumberButton}
          >
            <Text style={styles.changeNumberText}>
              Wrong number? Change it here
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 48,
  },
  titleIcon: {
    marginBottom: 16,
  },
  title: {
    ...TEXT_STYLES.h1,
    color: COLORS.gray800,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    ...TEXT_STYLES.body,
    color: COLORS.gray600,
    textAlign: 'center',
    lineHeight: 24,
  },
  phoneText: {
    fontWeight: '600',
    color: COLORS.primary600,
  },
  otpSection: {
    alignItems: 'center',
  },
  otpInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    width: '100%',
    paddingHorizontal: 8,
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
    shadowColor: COLORS.gray300,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  otpInputFilled: {
    borderColor: COLORS.primary500,
    backgroundColor: COLORS.primary50,
  },
  otpInputError: {
    borderColor: COLORS.error500,
    backgroundColor: COLORS.error50,
  },
  verifyButton: {
    width: '100%',
    marginBottom: 24,
  },
  resendSection: {
    alignItems: 'center',
  },
  countdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  countdownText: {
    ...TEXT_STYLES.caption,
    color: COLORS.gray500,
  },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  resendIcon: {
    marginRight: 4,
  },
  resendText: {
    ...TEXT_STYLES.body,
    color: COLORS.primary500,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    alignItems: 'center',
  },
  securityIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  securityText: {
    ...TEXT_STYLES.caption,
    color: COLORS.success500,
    fontWeight: '500',
  },
  changeNumberButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  changeNumberText: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary500,
    textDecorationLine: 'underline',
  },
});

export default OTPVerificationScreen;
