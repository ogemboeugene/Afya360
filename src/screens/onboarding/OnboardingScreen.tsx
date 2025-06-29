/**
 * ONBOARDING SCREEN
 * Welcome screen with app introduction
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

// Import components
import { Afya360Logo } from '../../components/common/Afya360Logo';
import { CustomIcon } from '../../components/common/CustomIcon';
import Button from '../../components/ui/buttons/Button';

// Import styles
import { COLORS } from '../../styles/colors';
import { TEXT_STYLES } from '../../styles/globalStyles';

// Types
import { RootStackParamList } from '../../types';

type OnboardingScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'OnboardingWelcome'
>;

type OnboardingScreenRouteProp = RouteProp<
  RootStackParamList,
  'OnboardingWelcome'
>;

interface Props {
  navigation: OnboardingScreenNavigationProp;
  route: OnboardingScreenRouteProp;
}

export const OnboardingScreen: React.FC<Props> = ({ navigation }) => {
  const handleGetStarted = () => {
    navigation.navigate('PhoneVerification', {});
  };

  const handleLogin = () => {
    // Navigate to auth stack
    navigation.navigate('Auth');
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo and Title */}
        <View style={styles.header}>
          <Afya360Logo 
            variant="text-only"
            size="large"
            textColor={COLORS.primary500}
          />
          <Text style={styles.tagline}>
            Your Complete Healthcare Companion
          </Text>
        </View>

        {/* Features */}
        <View style={styles.featuresContainer}>
          <View style={styles.feature}>
            <CustomIcon
              library="MaterialIcons"
              name="local-hospital"
              size={48}
              color={COLORS.primary500}
              style={styles.featureIcon}
            />
            <Text style={styles.featureTitle}>Digital Health Records</Text>
            <Text style={styles.featureDescription}>
              Securely store and access your medical history anytime, anywhere
            </Text>
          </View>

          <View style={styles.feature}>
            <CustomIcon
              library="MaterialIcons"
              name="medication"
              size={48}
              color={COLORS.primary500}
              style={styles.featureIcon}
            />
            <Text style={styles.featureTitle}>Medication Management</Text>
            <Text style={styles.featureDescription}>
              Track medications, set reminders, and check drug interactions
            </Text>
          </View>

          <View style={styles.feature}>
            <CustomIcon
              library="MaterialIcons"
              name="location-on"
              size={48}
              color={COLORS.primary500}
              style={styles.featureIcon}
            />
            <Text style={styles.featureTitle}>Find Healthcare Facilities</Text>
            <Text style={styles.featureDescription}>
              Locate hospitals, clinics, and pharmacies near you
            </Text>
          </View>

          <View style={styles.feature}>
            <CustomIcon
              library="MaterialIcons"
              name="emergency"
              size={48}
              color={COLORS.primary500}
              style={styles.featureIcon}
            />
            <Text style={styles.featureTitle}>Emergency Services</Text>
            <Text style={styles.featureDescription}>
              Quick access to emergency contacts and services
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <Button
            title="Get Started"
            onPress={handleGetStarted}
            style={styles.primaryButton}
          />
          
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleLogin}
          >
            <Text style={styles.secondaryButtonText}>
              Already have an account? Sign In
            </Text>
          </TouchableOpacity>
        </View>

        {/* Privacy Notice */}
        <Text style={styles.privacyText}>
          By continuing, you agree to our Terms of Service and Privacy Policy.
          Your health data is encrypted and secure.
        </Text>
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
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  tagline: {
    ...TEXT_STYLES.h4,
    color: COLORS.gray600,
    textAlign: 'center',
    marginTop: 12,
  },
  featuresContainer: {
    flex: 1,
    marginBottom: 40,
  },
  feature: {
    alignItems: 'center',
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  featureIcon: {
    marginBottom: 16,
  },
  featureTitle: {
    ...TEXT_STYLES.h4,
    color: COLORS.gray900,
    textAlign: 'center',
    marginBottom: 8,
  },
  featureDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.gray600,
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonContainer: {
    marginBottom: 24,
  },
  primaryButton: {
    marginBottom: 16,
  },
  secondaryButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    ...TEXT_STYLES.buttonText,
    color: COLORS.primary500,
  },
  privacyText: {
    ...TEXT_STYLES.caption,
    color: COLORS.gray500,
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default OnboardingScreen;
