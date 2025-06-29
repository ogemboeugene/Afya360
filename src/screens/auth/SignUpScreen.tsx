/**
 * SIGN-UP SCREEN
 * Professional account creation for new users
 * Features: Phone verification, consent management, privacy assurance, accessibility
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
  Linking,
  Platform,
  StatusBar,
  KeyboardAvoidingView,
  Vibration,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(false);
  
  // Emergency PIN state
  const [emergencyPin, setEmergencyPin] = useState('');
  const [confirmEmergencyPin, setConfirmEmergencyPin] = useState('');
  const [enableEmergencyAccess, setEnableEmergencyAccess] = useState(false);
  const [showEmergencyPin, setShowEmergencyPin] = useState(false);
  const [showConfirmEmergencyPin, setShowConfirmEmergencyPin] = useState(false);
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [validationStatus, setValidationStatus] = useState<{ [key: string]: boolean }>({});
  
  // Rate limiting state
  const [attemptCount, setAttemptCount] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTimeRemaining, setLockoutTimeRemaining] = useState(0);
  
  // Security awareness state
  const [lastLoginTime, setLastLoginTime] = useState<string | null>(null);
  
  // Auto-save state
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  
  // Animation states
  const [biometricPulseAnim] = useState(new Animated.Value(1));
  const [validationAnimations] = useState({
    firstName: new Animated.Value(0),
    lastName: new Animated.Value(0),
    email: new Animated.Value(0),
    phone: new Animated.Value(0),
    password: new Animated.Value(0),
    confirmPassword: new Animated.Value(0),
    emergencyPin: new Animated.Value(0),
    confirmEmergencyPin: new Animated.Value(0),
  });
  const [headerGradientAnim] = useState(new Animated.Value(0));
  const [pinModeTransitionAnim] = useState(new Animated.Value(0));
  
  // Smart phone formatting state
  const [detectedCountry, setDetectedCountry] = useState<'US' | 'KE' | 'Other'>('US');
  const [formattedPhone, setFormattedPhone] = useState<string>('');
  const [phoneValidStatus, setPhoneValidStatus] = useState<{ isValid: boolean; message?: string }>({ isValid: false });
  
  // Password strength state
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: '',
    requirements: {
      length: false,
      uppercase: false,
      lowercase: false,
      number: false,
      special: false,
    },
    isVisible: false,
  });
  
  // Hooks
  const { sendOTP } = useAuth();

  // Refs for auto-focus progression
  const firstNameRef = useRef<any>(null);
  const lastNameRef = useRef<any>(null);
  const emailRef = useRef<any>(null);
  const passwordRef = useRef<any>(null);
  const confirmPasswordRef = useRef<any>(null);
  const emergencyPinRef = useRef<any>(null);
  const confirmEmergencyPinRef = useRef<any>(null);
  const phoneRef = useRef<any>(null);

  // Focus management for better UX
  const focusNextField = (currentField: string) => {
    switch (currentField) {
      case 'firstName':
        setTimeout(() => lastNameRef.current?.focus(), 100);
        break;
      case 'lastName':
        setTimeout(() => emailRef.current?.focus(), 100);
        break;
      case 'email':
        setTimeout(() => passwordRef.current?.focus(), 100);
        break;
      case 'password':
        setTimeout(() => confirmPasswordRef.current?.focus(), 100);
        break;
      case 'confirmPassword':
        setTimeout(() => phoneRef.current?.focus(), 100);
        break;
      case 'emergencyPin':
        setTimeout(() => confirmEmergencyPinRef.current?.focus(), 100);
        break;
      case 'confirmEmergencyPin':
        setTimeout(() => phoneRef.current?.focus(), 100);
        break;
      case 'phone':
        // Phone is the last field, could focus the sign up button
        break;
    }
  };

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

  // Real-time validation
  useEffect(() => {
    validateForm();
  }, [phoneNumber, firstName, lastName, email, password, confirmPassword, emergencyPin, confirmEmergencyPin, consentGiven]);

  // Password strength evaluation
  useEffect(() => {
    if (password) {
      evaluatePasswordStrength(password);
    } else {
      setPasswordStrength({
        score: 0,
        feedback: '',
        requirements: {
          length: false,
          uppercase: false,
          lowercase: false,
          number: false,
          special: false,
        },
        isVisible: false,
      });
    }
  }, [password]);

  // Rate limiting countdown timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLocked && lockoutTimeRemaining > 0) {
      interval = setInterval(() => {
        setLockoutTimeRemaining(prev => {
          if (prev <= 1) {
            setIsLocked(false);
            setAttemptCount(0); // Reset attempts after lockout
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLocked, lockoutTimeRemaining]);

  // Load last login timestamp for security awareness
  useEffect(() => {
    loadLastLoginTime();
    loadSavedFormData(); // Load any saved form data on mount
  }, []);

  // Auto-save form data as user types (debounced)
  useEffect(() => {
    const saveTimeout = setTimeout(() => {
      saveFormData();
    }, 1000); // Save after 1 second of inactivity

    return () => clearTimeout(saveTimeout);
  }, [firstName, lastName, email, phoneNumber, countryCode, enableEmergencyAccess]);

  // Auto-save visual feedback timer
  useEffect(() => {
    if (lastSaved) {
      const timer = setTimeout(() => {
        setLastSaved(null);
      }, 3000); // Hide "saved" indicator after 3 seconds
      
      return () => clearTimeout(timer);
    }
  }, [lastSaved]);

  // Animation effects
  useEffect(() => {
    // Start biometric pulse animation
    const startBiometricPulse = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(biometricPulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(biometricPulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
        { iterations: -1 }
      ).start();
    };

    startBiometricPulse();

    // Start header gradient animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(headerGradientAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: false,
        }),
        Animated.timing(headerGradientAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: false,
        }),
      ]),
      { iterations: -1 }
    ).start();
  }, []);

  // PIN mode transition animation
  useEffect(() => {
    Animated.spring(pinModeTransitionAnim, {
      toValue: enableEmergencyAccess ? 1 : 0,
      useNativeDriver: false,
      tension: 100,
      friction: 8,
    }).start();
  }, [enableEmergencyAccess]);

  // Validation feedback animations
  useEffect(() => {
    Object.keys(validationStatus).forEach((field) => {
      const fieldValidation = validationStatus[field as keyof typeof validationStatus];
      const animation = validationAnimations[field as keyof typeof validationAnimations];
      
      if (animation) {
        if (fieldValidation) {
          // Success animation
          Animated.sequence([
            Animated.timing(animation, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.spring(animation, {
              toValue: 0,
              useNativeDriver: true,
              tension: 50,
              friction: 3,
            }),
          ]).start();
        }
      }
    });
  }, [validationStatus]);

  // Password strength evaluation function
  const evaluatePasswordStrength = (password: string) => {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    };

    const metRequirements = Object.values(requirements).filter(Boolean).length;
    let score = 0;
    let feedback = '';

    // Calculate strength score (0-4)
    if (password.length === 0) {
      score = 0;
      feedback = '';
    } else if (password.length < 6) {
      score = 1;
      feedback = 'Too short - use at least 8 characters';
    } else if (metRequirements <= 2) {
      score = 1;
      feedback = 'Weak - try adding more variety';
    } else if (metRequirements === 3) {
      score = 2;
      feedback = 'Fair - could be stronger';
    } else if (metRequirements === 4) {
      score = 3;
      feedback = 'Good - meets security standards';
    } else if (metRequirements === 5 && password.length >= 12) {
      score = 4;
      feedback = 'Excellent - very secure';
    } else {
      score = 3;
      feedback = 'Good - meets security standards';
    }

    // Check for common weak patterns
    const weakPatterns = [
      'password', '123456', 'qwerty', 'admin', 'login',
      'welcome', 'letmein', 'monkey', 'dragon', 'master'
    ];
    
    if (weakPatterns.some(pattern => password.toLowerCase().includes(pattern))) {
      score = Math.max(1, score - 1);
      feedback = 'Avoid common words and patterns';
    }

    // Check for personal info (basic check)
    if (firstName && password.toLowerCase().includes(firstName.toLowerCase())) {
      score = Math.max(1, score - 1);
      feedback = 'Avoid using your name in password';
    }

    setPasswordStrength({
      score,
      feedback,
      requirements,
      isVisible: password.length > 0,
    });
  };

  // Security functions
  const loadLastLoginTime = async () => {
    try {
      // Load last login time
      const lastLogin = await AsyncStorage.getItem('lastLoginTime');
      // Load last signup attempt
      const lastSignup = await AsyncStorage.getItem('lastSignupAttempt');
      
      // Use the most recent activity
      const activities = [lastLogin, lastSignup].filter(Boolean);
      if (activities.length > 0) {
        const latestActivity = new Date(Math.max(...activities.map(a => new Date(a!).getTime())));
        const now = new Date();
        const diffInMinutes = Math.floor((now.getTime() - latestActivity.getTime()) / (1000 * 60));
        
        if (diffInMinutes < 60) {
          setLastLoginTime(`${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`);
        } else if (diffInMinutes < 1440) { // Less than 24 hours
          const hours = Math.floor(diffInMinutes / 60);
          setLastLoginTime(`${hours} hour${hours !== 1 ? 's' : ''} ago`);
        } else {
          const days = Math.floor(diffInMinutes / 1440);
          if (days < 30) {
            setLastLoginTime(`${days} day${days !== 1 ? 's' : ''} ago`);
          } else {
            setLastLoginTime(latestActivity.toLocaleDateString());
          }
        }
      }
    } catch (error) {
      console.warn('Failed to load last login time:', error);
    }
  };

  const updateLastLoginTime = async () => {
    try {
      const currentTime = new Date().toISOString();
      await AsyncStorage.setItem('lastLoginTime', currentTime);
    } catch (error) {
      console.warn('Failed to save last login time:', error);
    }
  };

  const trackSignupAttempt = async () => {
    try {
      const currentTime = new Date().toISOString();
      await AsyncStorage.setItem('lastSignupAttempt', currentTime);
      
      // Track signup attempts count for security
      const attempts = await AsyncStorage.getItem('signupAttempts');
      const attemptCount = attempts ? parseInt(attempts) + 1 : 1;
      await AsyncStorage.setItem('signupAttempts', attemptCount.toString());
    } catch (error) {
      console.warn('Failed to track signup attempt:', error);
    }
  };

  // Auto-save form data functions
  const saveFormData = async () => {
    try {
      // Only save if there's meaningful data to save
      if (!firstName.trim() && !lastName.trim() && !email.trim() && !phoneNumber.trim()) {
        return;
      }

      setIsAutoSaving(true);
      
      const formData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        phoneNumber: phoneNumber.trim(),
        countryCode,
        enableEmergencyAccess,
        timestamp: new Date().toISOString(),
      };

      await AsyncStorage.setItem('signupFormData', JSON.stringify(formData));
      
      // Set visual feedback
      const now = new Date();
      const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setLastSaved(`Saved at ${timeString}`);
      
    } catch (error) {
      console.warn('Failed to save form data:', error);
    } finally {
      setIsAutoSaving(false);
    }
  };

  const loadSavedFormData = async () => {
    try {
      const savedData = await AsyncStorage.getItem('signupFormData');
      if (savedData) {
        const formData = JSON.parse(savedData);
        
        // Check if data is recent (within 24 hours)
        const savedTime = new Date(formData.timestamp);
        const now = new Date();
        const hoursDiff = (now.getTime() - savedTime.getTime()) / (1000 * 60 * 60);
        
        if (hoursDiff < 24) {
          // Restore form data
          setFirstName(formData.firstName || '');
          setLastName(formData.lastName || '');
          setEmail(formData.email || '');
          setPhoneNumber(formData.phoneNumber || '');
          setCountryCode(formData.countryCode || '+254');
          setEnableEmergencyAccess(formData.enableEmergencyAccess || false);
          
          // Show recovery notification
          setTimeout(() => {
            Alert.alert(
              'Form Data Recovered',
              'We\'ve restored your previous form input to help you continue where you left off.',
              [
                {
                  text: 'Clear Data',
                  style: 'destructive',
                  onPress: clearSavedFormData,
                },
                {
                  text: 'Continue',
                  style: 'default',
                },
              ]
            );
          }, 500);
        } else {
          // Clear old data
          await AsyncStorage.removeItem('signupFormData');
        }
      }
    } catch (error) {
      console.warn('Failed to load saved form data:', error);
    }
  };

  const clearSavedFormData = async () => {
    try {
      await AsyncStorage.removeItem('signupFormData');
      // Clear form fields
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhoneNumber('');
      setCountryCode('+254');
      setEnableEmergencyAccess(false);
      setPassword('');
      setConfirmPassword('');
      setEmergencyPin('');
      setConfirmEmergencyPin('');
      // Reset validation
      setValidationStatus({});
      setErrors({});
      // Show feedback
      triggerHapticFeedback.success();
    } catch (error) {
      console.warn('Failed to clear saved form data:', error);
    }
  };

  // Animation helper functions
  const triggerValidationAnimation = (field: string) => {
    const animation = validationAnimations[field as keyof typeof validationAnimations];
    if (animation) {
      Animated.sequence([
        Animated.timing(animation, {
          toValue: 0.3,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(animation, {
          toValue: 0,
          useNativeDriver: true,
          tension: 300,
          friction: 10,
        }),
      ]).start();
    }
  };

  const triggerErrorShake = (field: string) => {
    const animation = validationAnimations[field as keyof typeof validationAnimations];
    if (animation) {
      Animated.sequence([
        Animated.timing(animation, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(animation, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(animation, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(animation, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();
    }
  };

  // Smart Phone Formatting Functions
  const detectCountryFromPhone = (cleanedPhone: string): 'US' | 'KE' | 'Other' => {
    if (cleanedPhone.startsWith('1') && cleanedPhone.length >= 10) {
      return 'US';
    } else if (cleanedPhone.startsWith('254') && cleanedPhone.length >= 9) {
      return 'KE'; // Kenya
    } else if (cleanedPhone.length === 10 && !cleanedPhone.startsWith('0')) {
      return 'US'; // Assume US for 10-digit numbers
    } else if (cleanedPhone.length === 9 && cleanedPhone.startsWith('7')) {
      return 'KE'; // Kenya local format
    }
    return 'Other';
  };

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const country = detectCountryFromPhone(cleaned);
    setDetectedCountry(country);

    let formatted = '';
    let validation = { isValid: false, message: '' };

    switch (country) {
      case 'US':
        formatted = formatUSPhone(cleaned);
        validation = validateUSPhone(cleaned);
        break;
      case 'KE':
        formatted = formatKenyaPhone(cleaned);
        validation = validateKenyaPhone(cleaned);
        break;
      default:
        formatted = formatInternationalPhone(cleaned);
        validation = validateInternationalPhone(cleaned);
    }

    setFormattedPhone(formatted);
    setPhoneValidStatus(validation);
    
    // Auto-focus to next field when phone is complete and valid
    if (validation.isValid && firstNameRef.current) {
      setTimeout(() => {
        firstNameRef.current?.focus();
        triggerHapticFeedback.light();
      }, 100);
    }

    return formatted;
  };

  const formatUSPhone = (cleaned: string): string => {
    if (cleaned.length === 0) return '';
    
    // Handle country code
    const usNumber = cleaned.startsWith('1') ? cleaned.slice(1) : cleaned;
    
    if (usNumber.length <= 3) {
      return usNumber;
    } else if (usNumber.length <= 6) {
      return `(${usNumber.slice(0, 3)}) ${usNumber.slice(3)}`;
    } else if (usNumber.length <= 10) {
      return `(${usNumber.slice(0, 3)}) ${usNumber.slice(3, 6)}-${usNumber.slice(6)}`;
    } else {
      // Limit to 10 digits
      const truncated = usNumber.slice(0, 10);
      return `(${truncated.slice(0, 3)}) ${truncated.slice(3, 6)}-${truncated.slice(6)}`;
    }
  };

  const formatKenyaPhone = (cleaned: string): string => {
    if (cleaned.length === 0) return '';
    
    // Handle international format +254
    if (cleaned.startsWith('254')) {
      const localNumber = cleaned.slice(3);
      if (localNumber.length <= 3) {
        return `+254 ${localNumber}`;
      } else if (localNumber.length <= 6) {
        return `+254 ${localNumber.slice(0, 3)} ${localNumber.slice(3)}`;
      } else if (localNumber.length <= 9) {
        return `+254 ${localNumber.slice(0, 3)} ${localNumber.slice(3, 6)} ${localNumber.slice(6)}`;
      }
    }
    
    // Local format starting with 7
    if (cleaned.startsWith('7') && cleaned.length <= 9) {
      if (cleaned.length <= 3) {
        return cleaned;
      } else if (cleaned.length <= 6) {
        return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
      } else {
        return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
      }
    }
    
    return cleaned;
  };

  const formatInternationalPhone = (cleaned: string): string => {
    // Basic international formatting
    if (cleaned.length > 10) {
      return `+${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
    }
    return cleaned;
  };

  const validateUSPhone = (cleaned: string) => {
    const usNumber = cleaned.startsWith('1') ? cleaned.slice(1) : cleaned;
    
    if (usNumber.length === 0) {
      return { isValid: false, message: '' };
    } else if (usNumber.length < 10) {
      return { isValid: false, message: `Need ${10 - usNumber.length} more digit${10 - usNumber.length !== 1 ? 's' : ''}` };
    } else if (usNumber.length === 10) {
      if (!usNumber.match(/^[2-9]\d{2}[2-9]\d{2}\d{4}$/)) {
        return { isValid: false, message: 'Area code and exchange cannot start with 0 or 1' };
      }
      return { isValid: true, message: 'Valid US phone number' };
    } else {
      return { isValid: false, message: 'Too many digits for US number' };
    }
  };

  const validateKenyaPhone = (cleaned: string) => {
    if (cleaned.startsWith('254')) {
      const localNumber = cleaned.slice(3);
      if (localNumber.length === 9 && localNumber.startsWith('7')) {
        return { isValid: true, message: 'Valid Kenya phone number' };
      } else if (localNumber.length < 9) {
        return { isValid: false, message: `Need ${9 - localNumber.length} more digit${9 - localNumber.length !== 1 ? 's' : ''}` };
      }
      return { isValid: false, message: 'Invalid Kenya phone format' };
    } else if (cleaned.startsWith('7') && cleaned.length <= 9) {
      if (cleaned.length === 9) {
        return { isValid: true, message: 'Valid Kenya local number' };
      }
      return { isValid: false, message: `Need ${9 - cleaned.length} more digit${9 - cleaned.length !== 1 ? 's' : ''}` };
    }
    return { isValid: false, message: 'Invalid Kenya phone format' };
  };

  const validateInternationalPhone = (cleaned: string) => {
    if (cleaned.length >= 7 && cleaned.length <= 15) {
      return { isValid: true, message: 'Valid international number' };
    } else if (cleaned.length < 7) {
      return { isValid: false, message: 'Too short for international number' };
    }
    return { isValid: false, message: 'Too long for phone number' };
  };

  const handleCountrySwitch = (newCountry: 'US' | 'KE' | 'Other') => {
    setDetectedCountry(newCountry);
    
    // Reformat the current phone number for the new country
    if (formattedPhone) {
      const cleaned = formattedPhone.replace(/\D/g, '');
      const reformatted = formatPhoneNumber(cleaned);
      setPhoneNumber(reformatted);
      triggerHapticFeedback.light();
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Enhanced phone validation with smart country detection
    if (phoneNumber) {
      if (!phoneValidStatus.isValid) {
        newErrors.phone = phoneValidStatus.message || 'Please enter a valid phone number';
      }
    } else {
      newErrors.phone = 'Phone number is required for verification';
    }

    // Enhanced name validation with helpful guidance
    if (firstName) {
      if (firstName.length < 2) {
        newErrors.firstName = `First name needs at least 2 characters (${firstName.length}/2)`;
      } else if (!/^[a-zA-Z\s'-]+$/.test(firstName)) {
        newErrors.firstName = 'First name can only contain letters, spaces, hyphens, and apostrophes';
      }
    }
    
    if (lastName) {
      if (lastName.length < 2) {
        newErrors.lastName = `Last name needs at least 2 characters (${lastName.length}/2)`;
      } else if (!/^[a-zA-Z\s'-]+$/.test(lastName)) {
        newErrors.lastName = 'Last name can only contain letters, spaces, hyphens, and apostrophes';
      }
    }

    // Enhanced email validation with better feedback
    if (email) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        newErrors.email = 'Please enter a valid email address (example: name@domain.com)';
      } else if (email.length > 254) {
        newErrors.email = 'Email address is too long';
      }
    }

    // Password validation with strength requirements
    if (password) {
      if (password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters long';
      } else if (passwordStrength.score < 2) {
        newErrors.password = 'Password is too weak - please choose a stronger password';
      }
    } else {
      newErrors.password = 'Password is required to secure your account';
    }

    // Confirm password validation
    if (confirmPassword) {
      if (confirmPassword !== password) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    } else if (password) {
      newErrors.confirmPassword = 'Please confirm your password';
    }

    // Emergency PIN validation (optional feature)
    if (enableEmergencyAccess) {
      if (emergencyPin) {
        if (emergencyPin.length !== 4) {
          newErrors.emergencyPin = 'Emergency PIN must be exactly 4 digits';
        } else if (!/^\d{4}$/.test(emergencyPin)) {
          newErrors.emergencyPin = 'Emergency PIN can only contain numbers';
        } else if (emergencyPin === '0000' || emergencyPin === '1111' || emergencyPin === '1234') {
          newErrors.emergencyPin = 'Please choose a more secure PIN';
        }
      } else {
        newErrors.emergencyPin = 'Emergency PIN is required when emergency access is enabled';
      }

      // Confirm emergency PIN validation
      if (confirmEmergencyPin) {
        if (confirmEmergencyPin !== emergencyPin) {
          newErrors.confirmEmergencyPin = 'Emergency PINs do not match';
        }
      } else if (emergencyPin) {
        newErrors.confirmEmergencyPin = 'Please confirm your emergency PIN';
      }
    }

    setErrors(newErrors);
    
    // Trigger haptic feedback for validation errors
    if (Object.keys(newErrors).length > 0) {
      triggerHapticFeedback.error();
    }
    
    // Update validation status for green checkmarks
    const fieldStatus = {
      phone: phoneValidStatus.isValid,
      firstName: Boolean(firstName && firstName.length >= 2 && !newErrors.firstName),
      lastName: Boolean(lastName && lastName.length >= 2 && !newErrors.lastName),
      email: Boolean(!email || (email && !newErrors.email)), // Email is optional
      password: Boolean(password && passwordStrength.score >= 2 && !newErrors.password),
      confirmPassword: Boolean(confirmPassword && confirmPassword === password && !newErrors.confirmPassword),
      emergencyPin: Boolean(!enableEmergencyAccess || (emergencyPin && emergencyPin.length === 4 && !newErrors.emergencyPin)),
      confirmEmergencyPin: Boolean(!enableEmergencyAccess || (confirmEmergencyPin && confirmEmergencyPin === emergencyPin && !newErrors.confirmEmergencyPin)),
    };
    setValidationStatus(fieldStatus);
    
    // Trigger animations for validation feedback
    Object.keys(newErrors).forEach((field) => {
      triggerErrorShake(field);
    });
    
    // Trigger success animations for valid fields
    Object.keys(fieldStatus).forEach((field) => {
      if (fieldStatus[field as keyof typeof fieldStatus]) {
        triggerValidationAnimation(field);
      }
    });
    
    // Return validation status for each field
    return {
      isValid: Object.keys(newErrors).length === 0,
      fieldStatus
    };
  };

  const handleSignUp = async () => {
    // Check if locked out
    if (isLocked) {
      const minutes = Math.floor(lockoutTimeRemaining / 60);
      const seconds = lockoutTimeRemaining % 60;
      Alert.alert(
        'Too Many Attempts',
        `Please wait ${minutes > 0 ? `${minutes}m ` : ''}${seconds}s before trying again.`
      );
      triggerHapticFeedback.error();
      return;
    }

    if (!phoneNumber || !firstName || !lastName || !password || !confirmPassword || !consentGiven || 
        (enableEmergencyAccess && (!emergencyPin || !confirmEmergencyPin))) {
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
    
    // Track signup attempt for security awareness
    await trackSignupAttempt();
    
    try {
      // Call your sign-up API here - for now we'll use sendOTP
      await sendOTP(fullPhoneNumber);
      
      // Reset attempt count on successful sign up
      setAttemptCount(0);
      
      // Update last login time for security tracking
      await updateLastLoginTime();
      
      // Clear saved form data on successful signup
      await AsyncStorage.removeItem('signupFormData');
      
      triggerHapticFeedback.success();
      
      // Navigate to phone verification
      navigation.navigate('PhoneVerification', { phoneNumber: fullPhoneNumber });
    } catch (error) {
      // Increment attempt count on failure
      const newAttemptCount = attemptCount + 1;
      setAttemptCount(newAttemptCount);
      
      // Check if we need to lock out (after 3 attempts)
      const maxAttempts = 3;
      if (newAttemptCount >= maxAttempts) {
        setIsLocked(true);
        setLockoutTimeRemaining(30); // 30 second lockout, increases with more attempts
        
        Alert.alert(
          'Account Temporarily Locked',
          'Too many failed attempts. Please wait 30 seconds before trying again.'
        );
        triggerHapticFeedback.error();
      } else {
        const attemptsLeft = maxAttempts - newAttemptCount;
        Alert.alert(
          'Sign Up Failed',
          `Unable to create your account. ${attemptsLeft} attempt${attemptsLeft !== 1 ? 's' : ''} remaining.`
        );
        triggerHapticFeedback.error();
      }
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
          
          {/* Auto-save information and controls */}
          <View style={styles.helpDivider} />
          <View style={styles.autoSaveHelpSection}>
            <View style={styles.autoSaveHelpHeader}>
              <IconMCI name="content-save" size={16} color={COLORS.secondary600} />
              <Text style={styles.autoSaveHelpTitle}>Auto-save</Text>
            </View>
            <Text style={styles.autoSaveHelpText}>
              Your form data is automatically saved locally as you type. This helps you continue where you left off if you accidentally close the app.
            </Text>
            <TouchableOpacity
              style={styles.clearDataButton}
              onPress={() => {
                Alert.alert(
                  'Clear Saved Data',
                  'Are you sure you want to clear all saved form data? This action cannot be undone.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Clear', style: 'destructive', onPress: clearSavedFormData },
                  ]
                );
              }}
              accessibilityRole="button"
              accessibilityLabel="Clear all saved form data"
            >
              <Icon name="clear" size={14} color={COLORS.error500} />
              <Text style={styles.clearDataText}>Clear Saved Data</Text>
            </TouchableOpacity>
          </View>
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

      <TouchableOpacity
        style={styles.checkboxRow}
        onPress={() => setRememberDevice(!rememberDevice)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: rememberDevice }}
        accessibilityLabel="Remember this device for faster future logins"
      >
        <View style={[styles.checkbox, rememberDevice && styles.checkboxChecked]}>
          {rememberDevice && <Icon name="check" size={16} color={COLORS.white} />}
        </View>
        <Text style={styles.consentText}>
          Remember this device for 30 days (faster future sign-ins)
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderPasswordStrengthIndicator = () => {
    if (!passwordStrength.isVisible) return null;

    const strengthColors = [
      COLORS.gray400,    // 0 - No password
      COLORS.error500,   // 1 - Very Weak
      COLORS.warning500, // 2 - Fair
      COLORS.accent500,  // 3 - Good
      COLORS.success500, // 4 - Excellent
    ];

    const strengthLabels = ['', 'Very Weak', 'Fair', 'Good', 'Excellent'];

    return (
      <View style={styles.passwordStrengthContainer}>
        {/* Strength Meter */}
        <View style={styles.strengthMeter}>
          <View style={styles.strengthBars}>
            {[1, 2, 3, 4].map((level) => (
              <View
                key={level}
                style={[
                  styles.strengthBar,
                  {
                    backgroundColor: passwordStrength.score >= level 
                      ? strengthColors[passwordStrength.score] 
                      : COLORS.gray200
                  }
                ]}
              />
            ))}
          </View>
          <View style={styles.strengthInfo}>
            <Text 
              style={[
                styles.strengthLabel,
                { color: strengthColors[passwordStrength.score] }
              ]}
            >
              {strengthLabels[passwordStrength.score]}
            </Text>
            <Text style={styles.strengthFeedback}>
              {passwordStrength.feedback}
            </Text>
          </View>
        </View>

        {/* Requirements Checklist */}
        <View style={styles.requirementsContainer}>
          <Text style={styles.requirementsTitle}>Password Requirements:</Text>
          <View style={styles.requirementsList}>
            <View style={styles.requirementRow}>
              <Icon 
                name={passwordStrength.requirements.length ? "check-circle" : "radio-button-unchecked"} 
                size={16} 
                color={passwordStrength.requirements.length ? COLORS.success500 : COLORS.gray400}
              />
              <Text style={[
                styles.requirementText,
                passwordStrength.requirements.length && styles.requirementMet
              ]}>
                At least 8 characters
              </Text>
            </View>
            <View style={styles.requirementRow}>
              <Icon 
                name={passwordStrength.requirements.uppercase ? "check-circle" : "radio-button-unchecked"} 
                size={16} 
                color={passwordStrength.requirements.uppercase ? COLORS.success500 : COLORS.gray400}
              />
              <Text style={[
                styles.requirementText,
                passwordStrength.requirements.uppercase && styles.requirementMet
              ]}>
                One uppercase letter (A-Z)
              </Text>
            </View>
            <View style={styles.requirementRow}>
              <Icon 
                name={passwordStrength.requirements.lowercase ? "check-circle" : "radio-button-unchecked"} 
                size={16} 
                color={passwordStrength.requirements.lowercase ? COLORS.success500 : COLORS.gray400}
              />
              <Text style={[
                styles.requirementText,
                passwordStrength.requirements.lowercase && styles.requirementMet
              ]}>
                One lowercase letter (a-z)
              </Text>
            </View>
            <View style={styles.requirementRow}>
              <Icon 
                name={passwordStrength.requirements.number ? "check-circle" : "radio-button-unchecked"} 
                size={16} 
                color={passwordStrength.requirements.number ? COLORS.success500 : COLORS.gray400}
              />
              <Text style={[
                styles.requirementText,
                passwordStrength.requirements.number && styles.requirementMet
              ]}>
                One number (0-9)
              </Text>
            </View>
            <View style={styles.requirementRow}>
              <Icon 
                name={passwordStrength.requirements.special ? "check-circle" : "radio-button-unchecked"} 
                size={16} 
                color={passwordStrength.requirements.special ? COLORS.success500 : COLORS.gray400}
              />
              <Text style={[
                styles.requirementText,
                passwordStrength.requirements.special && styles.requirementMet
              ]}>
                One special character (!@#$%^&*)
              </Text>
            </View>
          </View>
        </View>

        {/* Security Tips */}
        <View style={styles.securityTips}>
          <Icon name="security" size={14} color={COLORS.secondary600} />
          <Text style={styles.securityTipsText}>
            💡 Tip: Use a unique password you haven't used elsewhere
          </Text>
        </View>
      </View>
    );
  };

  const renderEmergencyPinSection = () => (
    <View style={styles.emergencyPinCard}>
      <View style={styles.emergencyPinHeader}>
        <Icon name="emergency" size={24} color={COLORS.error500} />
        <Text style={styles.emergencyPinTitle}>Emergency Access PIN</Text>
        <View style={styles.optionalBadge}>
          <Text style={styles.optionalText}>Optional</Text>
        </View>
      </View>
      
      <TouchableOpacity
        style={styles.emergencyToggleRow}
        onPress={() => {
          setEnableEmergencyAccess(!enableEmergencyAccess);
          if (!enableEmergencyAccess) {
            // Clear PIN fields when disabling
            setEmergencyPin('');
            setConfirmEmergencyPin('');
          }
          triggerHapticFeedback.light();
        }}
        accessibilityRole="switch"
        accessibilityState={{ checked: enableEmergencyAccess }}
        accessibilityLabel="Enable emergency access PIN for medical emergencies"
      >
        <View style={styles.emergencyToggleContent}>
          <View style={styles.emergencyIconContainer}>
            <Icon name="medical-services" size={20} color={COLORS.error500} />
          </View>
          <View style={styles.emergencyToggleText}>
            <Text style={styles.emergencyToggleTitle}>
              Enable Emergency Access
            </Text>
            <Text style={styles.emergencyToggleSubtitle}>
              Quick access to your medical info in emergencies
            </Text>
          </View>
        </View>
        <View style={[styles.toggle, enableEmergencyAccess && styles.toggleActive]}>
          <View style={[styles.toggleThumb, enableEmergencyAccess && styles.toggleThumbActive]} />
        </View>
      </TouchableOpacity>

      {enableEmergencyAccess && (
        <Animated.View 
          style={[
            styles.emergencyPinFields,
            {
              opacity: pinModeTransitionAnim,
              transform: [{
                translateY: pinModeTransitionAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-20, 0],
                }),
              }],
            }
          ]}
        >
          <View style={styles.emergencyInfoBox}>
            <Icon name="info" size={16} color={COLORS.accent500} />
            <Text style={styles.emergencyInfoText}>
              This PIN allows emergency responders to quickly access your critical medical information 
              like allergies, medications, and emergency contacts.
            </Text>
          </View>

          <View style={styles.pinInputRow}>
            <View style={styles.pinInputHalf}>
              <TextInput
                label="Emergency PIN"
                value={emergencyPin}
                onChangeText={(text) => {
                  // Only allow 4 digits
                  const filtered = text.replace(/[^0-9]/g, '').slice(0, 4);
                  setEmergencyPin(filtered);
                  
                  // Auto-focus to confirm PIN when 4 digits entered
                  if (filtered.length === 4) {
                    setTimeout(() => confirmEmergencyPinRef.current?.focus(), 100);
                    triggerHapticFeedback.light();
                  }
                }}
                placeholder="1234"
                leftIcon="pin"
                rightIcon={validationStatus.emergencyPin ? "check-circle" : (showEmergencyPin ? "visibility-off" : "visibility")}
                onRightIconPress={() => !validationStatus.emergencyPin && setShowEmergencyPin(!showEmergencyPin)}
                secureTextEntry={!showEmergencyPin}
                keyboardType="numeric"
                maxLength={4}
                textContentType="password"
                errorText={errors.emergencyPin}
                required
                accessibilityLabel="Enter 4-digit emergency PIN"
                ref={emergencyPinRef}
                onSubmitEditing={() => focusNextField('emergencyPin')}
              />
            </View>
            <View style={styles.pinInputHalf}>
              <TextInput
                label="Confirm PIN"
                value={confirmEmergencyPin}
                onChangeText={(text) => {
                  // Only allow 4 digits
                  const filtered = text.replace(/[^0-9]/g, '').slice(0, 4);
                  setConfirmEmergencyPin(filtered);
                  
                  // Auto-focus to next field when 4 digits entered and matches
                  if (filtered.length === 4 && filtered === emergencyPin) {
                    setTimeout(() => phoneRef.current?.focus(), 100);
                    triggerHapticFeedback.success();
                  }
                }}
                placeholder="1234"
                leftIcon="pin"
                rightIcon={validationStatus.confirmEmergencyPin ? "check-circle" : (showConfirmEmergencyPin ? "visibility-off" : "visibility")}
                onRightIconPress={() => !validationStatus.confirmEmergencyPin && setShowConfirmEmergencyPin(!showConfirmEmergencyPin)}
                secureTextEntry={!showConfirmEmergencyPin}
                keyboardType="numeric"
                maxLength={4}
                textContentType="password"
                errorText={errors.confirmEmergencyPin}
                required
                accessibilityLabel="Confirm your 4-digit emergency PIN"
                ref={confirmEmergencyPinRef}
                onSubmitEditing={() => focusNextField('confirmEmergencyPin')}
              />
            </View>
          </View>

          <View style={styles.emergencySecurityTips}>
            <Icon name="security" size={14} color={COLORS.error500} />
            <View style={styles.emergencySecurityContent}>
              <Text style={styles.emergencySecurityText}>
                🚨 <Text style={styles.boldText}>Important:</Text> This PIN will be accessible during medical emergencies.
                Choose something memorable but not easily guessed.
              </Text>
              <Text style={styles.emergencySecuritySubtext}>
                • Avoid obvious combinations (0000, 1234, birth year)
                • Make it easy for you to remember under stress
                • Consider using a significant date (MMDD format)
              </Text>
            </View>
          </View>

          <View style={styles.emergencyFeaturesList}>
            <Text style={styles.emergencyFeaturesTitle}>Emergency Access includes:</Text>
            <View style={styles.emergencyFeature}>
              <Icon name="local-pharmacy" size={16} color={COLORS.error500} />
              <Text style={styles.emergencyFeatureText}>Current medications & dosages</Text>
            </View>
            <View style={styles.emergencyFeature}>
              <Icon name="warning" size={16} color={COLORS.error500} />
              <Text style={styles.emergencyFeatureText}>Allergies & medical conditions</Text>
            </View>
            <View style={styles.emergencyFeature}>
              <Icon name="contact-phone" size={16} color={COLORS.error500} />
              <Text style={styles.emergencyFeatureText}>Emergency contacts</Text>
            </View>
            <View style={styles.emergencyFeature}>
              <Icon name="local-hospital" size={16} color={COLORS.error500} />
              <Text style={styles.emergencyFeatureText}>Blood type & medical ID</Text>
            </View>
          </View>
        </Animated.View>
      )}
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
              {lastLoginTime && (
                <View style={styles.securityAwarenessContainer}>
                  <Icon name="security" size={14} color="rgba(255, 255, 255, 0.8)" />
                  <Text style={styles.lastActivityText}>
                    Last activity: {lastLoginTime}
                  </Text>
                </View>
              )}
              
              {/* Auto-save indicator */}
              {(isAutoSaving || lastSaved) && (
                <View style={styles.autoSaveIndicator}>
                  {isAutoSaving ? (
                    <>
                      <IconMCI name="content-save" size={12} color="rgba(255, 255, 255, 0.7)" />
                      <Text style={styles.autoSaveText}>Saving...</Text>
                    </>
                  ) : (
                    <>
                      <Icon name="check-circle" size={12} color="rgba(76, 175, 80, 0.9)" />
                      <Text style={styles.autoSaveText}>{lastSaved}</Text>
                    </>
                  )}
                </View>
              )}
            </View>
          </View>

          {/* Enhanced Trust Badges */}
          {renderTrustBadges()}
        </View>

        {/* Enhanced Form Section with Card Design */}
        <View style={styles.formCard}>
          {/* Security Awareness Notice */}
          {lastLoginTime && (
            <View style={styles.securityNotice}>
              <Icon name="verified-user" size={18} color={COLORS.secondary600} />
              <View style={styles.securityNoticeContent}>
                <Text style={styles.securityNoticeTitle}>Returning User Detected</Text>
                <Text style={styles.securityNoticeText}>
                  Previous login activity found. For security, you may want to sign in instead.
                </Text>
                <TouchableOpacity 
                  style={styles.securityActionButton}
                  onPress={() => navigation.navigate('Login')}
                  accessibilityRole="button"
                  accessibilityLabel="Go to login page instead"
                >
                  <Text style={styles.securityActionText}>Sign In Instead</Text>
                  <Icon name="arrow-forward" size={14} color={COLORS.secondary600} />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '40%' }]} />
            </View>
            <Text style={styles.progressText}>Step 1 of 4</Text>
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
                  rightIcon={validationStatus.firstName ? "check-circle" : undefined}
                  autoCapitalize="words"
                  textContentType="givenName"
                  autoComplete="given-name"
                  errorText={errors.firstName}
                  required
                  accessibilityLabel="Enter your first name"
                  ref={firstNameRef}
                  onSubmitEditing={() => focusNextField('firstName')}
                />
              </View>
              <View style={styles.inputHalf}>
                <TextInput
                  label="Last Name"
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Doe"
                  leftIcon="person-outline"
                  rightIcon={validationStatus.lastName ? "check-circle" : undefined}
                  autoCapitalize="words"
                  textContentType="familyName"
                  autoComplete="family-name"
                  errorText={errors.lastName}
                  required
                  accessibilityLabel="Enter your last name"
                  ref={lastNameRef}
                  onSubmitEditing={() => focusNextField('lastName')}
                />
              </View>
            </View>
            
            <TextInput
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              placeholder="john.doe@example.com"
              leftIcon="email"
              rightIcon={validationStatus.email && email ? "check-circle" : undefined}
              keyboardType="email-address"
              autoCapitalize="none"
              textContentType="emailAddress"
              autoComplete="email"
              errorText={errors.email}
              helperText="We'll use this for important account updates"
              accessibilityLabel="Enter your email address for account updates"
              ref={emailRef}
              onSubmitEditing={() => focusNextField('email')}
            />
          </View>

          {/* Password Section */}
          <View style={styles.inputGroup}>
            <View style={styles.sectionHeader}>
              <Icon name="lock" size={24} color={COLORS.secondary600} />
              <Text style={styles.sectionTitle}>Secure Password</Text>
            </View>
            
            <View style={styles.privacyAssurance}>
              <Icon name="security" size={16} color={COLORS.secondary600} />
              <Text style={styles.privacyText}>
                Your password is encrypted and securely stored
              </Text>
            </View>
            
            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Enter a strong password"
              leftIcon="lock"
              rightIcon={validationStatus.password ? "check-circle" : (showPassword ? "visibility-off" : "visibility")}
              onRightIconPress={() => !validationStatus.password && setShowPassword(!showPassword)}
              secureTextEntry={!showPassword}
              textContentType="newPassword"
              autoComplete="new-password"
              errorText={errors.password}
              required
              accessibilityLabel="Enter your password"
              ref={passwordRef}
              onSubmitEditing={() => focusNextField('password')}
            />
            
            {/* Password Strength Indicator */}
            {renderPasswordStrengthIndicator()}
            
            <TextInput
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Re-enter your password"
              leftIcon="lock-outline"
              rightIcon={validationStatus.confirmPassword ? "check-circle" : (showConfirmPassword ? "visibility-off" : "visibility")}
              onRightIconPress={() => !validationStatus.confirmPassword && setShowConfirmPassword(!showConfirmPassword)}
              secureTextEntry={!showConfirmPassword}
              textContentType="newPassword"
              autoComplete="new-password"
              errorText={errors.confirmPassword}
              required
              accessibilityLabel="Confirm your password by entering it again"
              ref={confirmPasswordRef}
              onSubmitEditing={() => focusNextField('confirmPassword')}
            />
          </View>

          {/* Emergency PIN Section */}
          {renderEmergencyPinSection()}

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
            
            {/* Enhanced Phone Input with Smart Country Detection */}
            <View style={styles.phoneInputContainer}>
              <View style={styles.phoneHeader}>
                <Icon name="phone" size={20} color={COLORS.secondary600} />
                <Text style={styles.phoneLabel}>Phone Number</Text>
                
                {/* Country Detection Indicator */}
                <View style={styles.countryDetectionContainer}>
                  {detectedCountry === 'US' && (
                    <TouchableOpacity 
                      style={styles.countryBadge}
                      onPress={() => handleCountrySwitch('KE')}
                      accessibilityRole="button"
                      accessibilityLabel="Currently set to US format. Tap to change to Kenya format"
                    >
                      <Text style={styles.countryFlag}>🇺🇸</Text>
                      <Text style={styles.countryCode}>+1</Text>
                    </TouchableOpacity>
                  )}
                  {detectedCountry === 'KE' && (
                    <TouchableOpacity 
                      style={styles.countryBadge}
                      onPress={() => handleCountrySwitch('US')}
                      accessibilityRole="button"
                      accessibilityLabel="Currently set to Kenya format. Tap to change to US format"
                    >
                      <Text style={styles.countryFlag}>🇰🇪</Text>
                      <Text style={styles.countryCode}>+254</Text>
                    </TouchableOpacity>
                  )}
                  {detectedCountry === 'Other' && formattedPhone.length > 0 && (
                    <TouchableOpacity 
                      style={styles.countryBadge}
                      onPress={() => handleCountrySwitch('US')}
                      accessibilityRole="button"
                      accessibilityLabel="International format detected. Tap to change to US format"
                    >
                      <Text style={styles.countryFlag}>🌍</Text>
                      <Text style={styles.countryCode}>INTL</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              <PhoneInput
                label=""
                value={formattedPhone}
                onChangeText={(phone, full) => {
                  const formatted = formatPhoneNumber(phone);
                  setPhoneNumber(formatted);
                  setFullPhoneNumber(full || formatted);
                }}
                countryCode={countryCode}
                onCountryCodeChange={setCountryCode}
                placeholder={
                  detectedCountry === 'US' ? "(555) 123-4567" :
                  detectedCountry === 'KE' ? "712 345 678" :
                  "Enter phone number"
                }
                textContentType="telephoneNumber"
                autoComplete="tel"
                errorText={errors.phone}
                rightIcon={
                  phoneValidStatus.isValid ? "check-circle" : 
                  formattedPhone.length > 0 ? "info" : undefined
                }
                helperText={
                  phoneValidStatus.message || 
                  "Required for account verification and emergency contact"
                }
                required
                accessibilityLabel={`Enter your phone number. Currently detected as ${detectedCountry === 'US' ? 'US' : detectedCountry === 'KE' ? 'Kenya' : 'International'} format`}
                onSubmitEditing={() => focusNextField('phone')}
                maxLength={detectedCountry === 'US' ? 14 : detectedCountry === 'KE' ? 15 : 20}
              />
              
              {/* Smart Formatting Tips */}
              {formattedPhone.length > 0 && !phoneValidStatus.isValid && (
                <View style={styles.formattingTips}>
                  <Icon name="lightbulb-outline" size={14} color={COLORS.accent500} />
                  <Text style={styles.formattingTipsText}>
                    {detectedCountry === 'US' && "US format: (555) 123-4567"}
                    {detectedCountry === 'KE' && "Kenya format: +254 712 345 678 or 712 345 678"}
                    {detectedCountry === 'Other' && "International format detected"}
                  </Text>
                </View>
              )}
            </View>
            
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
            {/* Rate Limiting Warning */}
            {attemptCount > 0 && !isLocked && (
              <View style={styles.attemptWarning}>
                <Icon name="warning" size={16} color={COLORS.warning500} />
                <Text style={styles.attemptWarningText}>
                  {3 - attemptCount} attempt{3 - attemptCount !== 1 ? 's' : ''} remaining
                </Text>
              </View>
            )}

            {/* Lockout Countdown */}
            {isLocked && (
              <View style={styles.lockoutContainer}>
                <Icon name="lock" size={20} color={COLORS.error500} />
                <Text style={styles.lockoutText}>
                  Account locked for {Math.floor(lockoutTimeRemaining / 60)}:
                  {String(lockoutTimeRemaining % 60).padStart(2, '0')}
                </Text>
                <View style={styles.lockoutProgress}>
                  <View 
                    style={[
                      styles.lockoutProgressFill,
                      { width: `${((30 - lockoutTimeRemaining) / 30) * 100}%` }
                    ]} 
                  />
                </View>
              </View>
            )}

            <Button
              title={isLocked ? "Account Locked" : "Create My Account"}
              onPress={handleSignUp}
              loading={isLoading}
              disabled={isLocked || !phoneNumber || !firstName || !lastName || !password || !confirmPassword || !consentGiven || Object.keys(errors).length > 0}
              variant="primary"
              size="large"
              fullWidth
              style={{
                ...styles.signUpButton,
                ...(isLocked && styles.signUpButtonLocked)
              }}
              accessibilityLabel={isLocked ? "Account temporarily locked due to too many attempts" : "Create your Afya360 account"}
            />

            {/* Additional Options */}
            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.orText}>or continue with</Text>
              <View style={styles.divider} />
            </View>
            
            <Animated.View style={{ transform: [{ scale: biometricPulseAnim }] }}>
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
            </Animated.View>

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

  // Security Awareness Styles
  securityAwarenessContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  lastActivityText: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 6,
    fontSize: 11,
    fontWeight: '500',
  },

  // Auto-save indicator styles
  autoSaveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  autoSaveText: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255, 255, 255, 0.7)',
    marginLeft: 4,
    fontSize: 10,
    fontWeight: '500',
  },

  // Security Notice Styles
  securityNotice: {
    backgroundColor: COLORS.secondary50,
    borderWidth: 1,
    borderColor: COLORS.secondary200,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  securityNoticeContent: {
    flex: 1,
    marginLeft: 12,
  },
  securityNoticeTitle: {
    ...TEXT_STYLES.body,
    color: COLORS.secondary700,
    fontWeight: '600',
    marginBottom: 4,
  },
  securityNoticeText: {
    ...TEXT_STYLES.caption,
    color: COLORS.secondary600,
    lineHeight: 18,
    marginBottom: 8,
  },
  securityActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: COLORS.secondary100,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  securityActionText: {
    ...TEXT_STYLES.caption,
    color: COLORS.secondary600,
    fontWeight: '600',
    marginRight: 4,
  },

  // Smart Phone Input Styles
  phoneInputContainer: {
    marginBottom: 24,
  },
  countryDetectionContainer: {
    marginLeft: 'auto',
  },
  countryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary50,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.secondary200,
  },
  countryFlag: {
    fontSize: 14,
    marginRight: 4,
  },
  countryCode: {
    ...TEXT_STYLES.caption,
    color: COLORS.secondary600,
    fontWeight: '600',
    fontSize: 11,
  },
  formattingTips: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: COLORS.accent50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.accent100,
  },
  formattingTipsText: {
    ...TEXT_STYLES.caption,
    color: COLORS.accent700,
    marginLeft: 6,
    fontSize: 12,
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
  phoneLabel: {
    ...TEXT_STYLES.body,
    color: COLORS.secondary700,
    marginLeft: 8,
    fontWeight: '700',
    fontSize: 16,
    flex: 1,
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

  // Auto-save help styles
  helpDivider: {
    height: 1,
    backgroundColor: COLORS.secondary200,
    marginVertical: 16,
  },
  autoSaveHelpSection: {
    marginTop: 8,
  },
  autoSaveHelpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  autoSaveHelpTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    color: COLORS.gray900,
    marginLeft: 8,
  },
  autoSaveHelpText: {
    ...TEXT_STYLES.caption,
    color: COLORS.gray600,
    lineHeight: 18,
    marginBottom: 12,
  },
  clearDataButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: COLORS.error50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.error100,
    alignSelf: 'flex-start',
  },
  clearDataText: {
    ...TEXT_STYLES.caption,
    color: COLORS.error500,
    fontWeight: '600',
    marginLeft: 6,
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
  signUpButtonLocked: {
    opacity: 0.6,
    shadowColor: COLORS.error500,
  },

  // Rate Limiting Styles
  attemptWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warning50,
    borderWidth: 1,
    borderColor: COLORS.warning100,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  attemptWarningText: {
    ...TEXT_STYLES.caption,
    color: COLORS.warning700,
    marginLeft: 8,
    fontWeight: '600',
  },
  lockoutContainer: {
    backgroundColor: COLORS.error50,
    borderWidth: 1,
    borderColor: COLORS.error100,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  lockoutText: {
    ...TEXT_STYLES.body,
    color: COLORS.error700,
    marginTop: 8,
    fontWeight: '600',
    textAlign: 'center',
  },
  lockoutProgress: {
    width: '100%',
    height: 4,
    backgroundColor: COLORS.error100,
    borderRadius: 2,
    marginTop: 12,
    overflow: 'hidden',
  },
  lockoutProgressFill: {
    height: '100%',
    backgroundColor: COLORS.error500,
    borderRadius: 2,
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

  // Password Strength Indicator Styles
  passwordStrengthContainer: {
    marginTop: 16,
    marginBottom: 16,
    backgroundColor: COLORS.secondary50,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.secondary100,
  },
  strengthMeter: {
    marginBottom: 16,
  },
  strengthBars: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 8,
  },
  strengthBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.gray200,
  },
  strengthInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  strengthLabel: {
    ...TEXT_STYLES.caption,
    fontWeight: '700',
    fontSize: 12,
  },
  strengthFeedback: {
    ...TEXT_STYLES.caption,
    color: COLORS.gray600,
    fontSize: 11,
    fontStyle: 'italic',
  },
  requirementsContainer: {
    marginBottom: 12,
  },
  requirementsTitle: {
    ...TEXT_STYLES.caption,
    color: COLORS.secondary700,
    fontWeight: '600',
    marginBottom: 8,
    fontSize: 12,
  },
  requirementsList: {
    gap: 6,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
  },
  requirementText: {
    ...TEXT_STYLES.caption,
    color: COLORS.gray600,
    marginLeft: 8,
    fontSize: 11,
  },
  requirementMet: {
    color: COLORS.success500,
    fontWeight: '600',
  },
  securityTips: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.secondary100,
  },
  securityTipsText: {
    ...TEXT_STYLES.caption,
    color: COLORS.secondary600,
    marginLeft: 8,
    fontSize: 11,
    fontStyle: 'italic',
  },

  // Emergency PIN Styles
  emergencyPinCard: {
    backgroundColor: COLORS.error50,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.error100,
    elevation: 2,
    shadowColor: COLORS.error500,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  emergencyPinHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.error100,
  },
  emergencyPinTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.error700,
    marginLeft: 12,
    fontWeight: '700',
    fontSize: 16,
    flex: 1,
  },
  optionalBadge: {
    backgroundColor: COLORS.accent100,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.accent200,
  },
  optionalText: {
    ...TEXT_STYLES.caption,
    color: COLORS.accent600,
    fontWeight: '600',
    fontSize: 10,
  },
  emergencyToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.error100,
  },
  emergencyToggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  emergencyIconContainer: {
    backgroundColor: COLORS.error100,
    padding: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  emergencyToggleText: {
    flex: 1,
  },
  emergencyToggleTitle: {
    ...TEXT_STYLES.body,
    color: COLORS.error700,
    fontWeight: '600',
    marginBottom: 2,
  },
  emergencyToggleSubtitle: {
    ...TEXT_STYLES.caption,
    color: COLORS.error700,
    fontSize: 12,
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.gray300,
    padding: 2,
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: COLORS.error500,
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  toggleThumbActive: {
    transform: [{ translateX: 22 }],
  },
  emergencyPinFields: {
    marginTop: 16,
  },
  emergencyInfoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.accent50,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.accent100,
  },
  emergencyInfoText: {
    ...TEXT_STYLES.caption,
    color: COLORS.accent700,
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
  pinInputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  pinInputHalf: {
    flex: 1,
  },
  emergencySecurityTips: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.error100,
  },
  emergencySecurityContent: {
    marginLeft: 8,
    flex: 1,
  },
  emergencySecurityText: {
    ...TEXT_STYLES.caption,
    color: COLORS.error700,
    marginBottom: 8,
    fontSize: 11,
    lineHeight: 16,
  },
  emergencySecuritySubtext: {
    ...TEXT_STYLES.caption,
    color: COLORS.error700,
    fontSize: 10,
    lineHeight: 14,
  },
  boldText: {
    fontWeight: '700',
  },
  emergencyFeaturesList: {
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.error100,
  },
  emergencyFeaturesTitle: {
    ...TEXT_STYLES.caption,
    color: COLORS.error700,
    fontWeight: '600',
    marginBottom: 8,
    fontSize: 12,
  },
  emergencyFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  emergencyFeatureText: {
    ...TEXT_STYLES.caption,
    color: COLORS.error700,
    marginLeft: 8,
    fontSize: 11,
  },
});

export default SignUpScreen;
