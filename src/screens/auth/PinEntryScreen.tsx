/**
 * PIN ENTRY SCREEN
 * Screen for entering PIN during authentication
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  StatusBar,
} from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import components
import { Afya360Logo } from '../../components/common/Afya360Logo';
import Button from '../../components/ui/buttons/Button';
import { TextInput } from '../../components/ui/inputs/TextInput';

// Import styles
import { COLORS } from '../../styles/colors';
import { TEXT_STYLES } from '../../styles/globalStyles';

// Types
import { RootStackParamList } from '../../types';

type PinEntryScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'PinEntry'
>;

type PinEntryScreenRouteProp = RouteProp<
  RootStackParamList,
  'PinEntry'
>;

interface Props {
  navigation: PinEntryScreenNavigationProp;
  route: PinEntryScreenRouteProp;
}

export const PinEntryScreen: React.FC<Props> = ({ navigation, route }) => {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const isSetupMode = route.params?.mode === 'setup';

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!pin) {
      newErrors.pin = 'PIN is required';
    } else if (pin.length !== 4) {
      newErrors.pin = 'PIN must be 4 digits';
    }

    if (isSetupMode) {
      if (!confirmPin) {
        newErrors.confirmPin = 'Please confirm your PIN';
      } else if (pin !== confirmPin) {
        newErrors.confirmPin = 'PINs do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Simulate PIN processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (isSetupMode) {
        Alert.alert('Success', 'PIN setup completed successfully');
        navigation.navigate('BiometricSetup');
      } else {
        Alert.alert('Success', 'PIN verification successful');
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={COLORS.gray700} />
        </TouchableOpacity>
        
        <Afya360Logo 
          variant="icon-only"
          size="medium"
          style={styles.logo}
        />
        
        <Text style={styles.title}>
          {isSetupMode ? 'Create Your PIN' : 'Enter Your PIN'}
        </Text>
        <Text style={styles.subtitle}>
          {isSetupMode 
            ? 'Choose a 4-digit PIN to secure your account'
            : 'Enter your 4-digit PIN to continue'
          }
        </Text>
      </View>

      <View style={styles.form}>
        <TextInput
          label="4-Digit PIN"
          placeholder="Enter PIN"
          value={pin}
          onChangeText={setPin}
          keyboardType="numeric"
          secureTextEntry
          maxLength={4}
          errorText={errors.pin}
          leftIcon="lock"
        />

        {isSetupMode && (
          <TextInput
            label="Confirm PIN"
            placeholder="Re-enter PIN"
            value={confirmPin}
            onChangeText={setConfirmPin}
            keyboardType="numeric"
            secureTextEntry
            maxLength={4}
            errorText={errors.confirmPin}
            leftIcon="lock"
          />
        )}

        <Button
          title={isSetupMode ? 'Create PIN' : 'Verify PIN'}
          onPress={handleSubmit}
          loading={isLoading}
          disabled={!pin || (isSetupMode && !confirmPin)}
          style={styles.submitButton}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.securityNote}>
          <Icon name="security" size={16} color={COLORS.info700} /> 
          Your PIN is encrypted and stored securely
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingTop: Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 0, // Manual safe area
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 40,
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 20,
    padding: 8,
  },
  logo: {
    marginBottom: 24,
  },
  title: {
    ...TEXT_STYLES.h1,
    color: COLORS.gray900,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    ...TEXT_STYLES.body,
    color: COLORS.gray600,
    textAlign: 'center',
  },
  form: {
    flex: 1,
    paddingTop: 20,
  },
  submitButton: {
    marginTop: 32,
  },
  footer: {
    paddingBottom: 20,
    alignItems: 'center',
  },
  securityNote: {
    ...TEXT_STYLES.caption,
    color: COLORS.info700,
    textAlign: 'center',
  },
});

export default PinEntryScreen;
