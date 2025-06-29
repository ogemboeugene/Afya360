/**
 * BIOMETRIC SETUP SCREEN
 * Screen for setting up biometric authentication
 */

import React, { useState, useEffect } from 'react';
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
import IconButton from '../../components/ui/buttons/IconButton';

// Import styles
import { COLORS } from '../../styles/colors';
import { TEXT_STYLES } from '../../styles/globalStyles';

// Import hooks
import { useBiometric } from '../../hooks/useBiometric';

// Types
import { RootStackParamList } from '../../types';

type BiometricSetupScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'BiometricSetup'
>;

type BiometricSetupScreenRouteProp = RouteProp<
  RootStackParamList,
  'BiometricSetup'
>;

interface Props {
  navigation: BiometricSetupScreenNavigationProp;
  route: BiometricSetupScreenRouteProp;
}

export const BiometricSetupScreen: React.FC<Props> = ({ navigation, route }) => {
  const [isLoading, setIsLoading] = useState(false);
  const {
    isAvailable: isBiometricAvailable,
    biometricDescription,
    authenticate: authenticateBiometric,
    error: biometricError,
  } = useBiometric();

  const handleEnableBiometric = async () => {
    setIsLoading(true);
    try {
      const result = await authenticateBiometric();
      
      if (result.success) {
        Alert.alert(
          'Biometric Setup Complete',
          `${biometricDescription} has been enabled for your account.`,
          [
            { text: 'Continue', onPress: () => navigation.navigate('Main') }
          ]
        );
      } else {
        Alert.alert(
          'Setup Failed',
          result.error || 'Biometric setup was unsuccessful. You can enable it later in settings.',
          [
            { text: 'Retry', onPress: handleEnableBiometric },
            { text: 'Skip', onPress: handleSkip }
          ]
        );
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'Something went wrong during biometric setup.',
        [
          { text: 'Retry', onPress: handleEnableBiometric },
          { text: 'Skip', onPress: handleSkip }
        ]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    Alert.alert(
      'Skip Biometric Setup?',
      'You can always enable biometric authentication later in your security settings.',
      [
        { text: 'Go Back', style: 'cancel' },
        { text: 'Skip', onPress: () => navigation.navigate('Main') }
      ]
    );
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
          Enable {biometricDescription || 'Biometric'} Login
        </Text>
        <Text style={styles.subtitle}>
          Secure and convenient access to your health records
        </Text>
      </View>

      <View style={styles.content}>
        {isBiometricAvailable ? (
          <>
            <View style={styles.biometricContainer}>
              <IconButton
                icon="fingerprint"
                iconLibrary="MaterialIcons"
                variant="primary"
                size="extra-large"
                onPress={handleEnableBiometric}
                style={styles.biometricIcon}
              />
              <Text style={styles.biometricText}>
                Use {biometricDescription} for quick and secure access
              </Text>
            </View>

            <View style={styles.benefits}>
              <Text style={styles.benefitsTitle}>Benefits:</Text>
              
              <View style={styles.benefitItem}>
                <Icon name="speed" size={20} color={COLORS.success700} />
                <Text style={styles.benefitText}>Faster login experience</Text>
              </View>
              
              <View style={styles.benefitItem}>
                <Icon name="security" size={20} color={COLORS.success700} />
                <Text style={styles.benefitText}>Enhanced security</Text>
              </View>
              
              <View style={styles.benefitItem}>
                <Icon name="phone-android" size={20} color={COLORS.success700} />
                <Text style={styles.benefitText}>Device-level protection</Text>
              </View>
            </View>

            <Button
              title={`Enable ${biometricDescription}`}
              onPress={handleEnableBiometric}
              loading={isLoading}
              style={styles.enableButton}
            />
          </>
        ) : (
          <View style={styles.unavailableContainer}>
            <Icon name="warning" size={48} color={COLORS.warning500} />
            <Text style={styles.unavailableTitle}>
              Biometric Authentication Unavailable
            </Text>
            <Text style={styles.unavailableText}>
              {biometricError || 'Your device doesn\'t support biometric authentication or it\'s not set up.'}
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkip}
        >
          <Text style={styles.skipText}>
            {isBiometricAvailable ? 'Skip for now' : 'Continue'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.securityNote}>
          <Icon name="info" size={16} color={COLORS.info700} /> 
          You can always change this setting later in your security preferences
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
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
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 20,
  },
  biometricContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  biometricIcon: {
    marginBottom: 16,
  },
  biometricText: {
    ...TEXT_STYLES.h3,
    color: COLORS.gray700,
    textAlign: 'center',
  },
  benefits: {
    width: '100%',
    marginBottom: 40,
  },
  benefitsTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.gray800,
    marginBottom: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  benefitText: {
    ...TEXT_STYLES.body,
    color: COLORS.gray700,
  },
  enableButton: {
    width: '100%',
    marginBottom: 20,
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  skipText: {
    ...TEXT_STYLES.body,
    color: COLORS.gray600,
    fontWeight: '500',
  },
  unavailableContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  unavailableTitle: {
    ...TEXT_STYLES.h2,
    color: COLORS.gray800,
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  unavailableText: {
    ...TEXT_STYLES.body,
    color: COLORS.gray600,
    textAlign: 'center',
    lineHeight: 24,
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

export default BiometricSetupScreen;
