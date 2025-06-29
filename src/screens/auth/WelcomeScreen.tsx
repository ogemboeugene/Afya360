/**
 * WELCOME/SPLASH SCREEN
 * App introduction and value proposition
 * Features: Gradient background, auto-advance, value propositions
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Animated,
  Platform,
} from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import IconFA from 'react-native-vector-icons/FontAwesome5';

// Import components
import { Afya360Logo } from '../../components/common/Afya360Logo';
import Button from '../../components/ui/buttons/Button';

// Import styles
import { COLORS } from '../../styles/colors';
import { TEXT_STYLES } from '../../styles/globalStyles';

// Types
import { RootStackParamList } from '../../types';

type WelcomeScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Welcome'
>;

type WelcomeScreenRouteProp = RouteProp<
  RootStackParamList,
  'Welcome'
>;

interface Props {
  navigation: WelcomeScreenNavigationProp;
  route?: WelcomeScreenRouteProp;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  const [autoAdvanceTimer, setAutoAdvanceTimer] = useState<NodeJS.Timeout | null>(null);
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-advance timer (3 seconds)
    const timer = setTimeout(() => {
      handleGetStarted();
    }, 3000);

    setAutoAdvanceTimer(timer);

    // Cleanup
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, []);

  const handleGetStarted = () => {
    if (autoAdvanceTimer) {
      clearTimeout(autoAdvanceTimer);
    }
    navigation.navigate('SignUp');
  };

  const handleSignIn = () => {
    if (autoAdvanceTimer) {
      clearTimeout(autoAdvanceTimer);
    }
    navigation.navigate('Login');
  };

  const valueProp = [
    {
      icon: 'security',
      iconLib: 'MaterialIcons',
      title: 'Secure Records',
      description: 'Bank-level encryption for your health data'
    },
    {
      icon: 'pills',
      iconLib: 'FontAwesome5',
      title: 'Medication Tracking',
      description: 'Never miss a dose with smart reminders'
    },
    {
      icon: 'location-on',
      iconLib: 'MaterialIcons',
      title: 'Provider Directory',
      description: 'Find healthcare providers near you'
    }
  ];

  const renderValueProp = (item: any, index: number) => (
    <Animated.View
      key={index}
      style={[
        styles.valueCard,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <View style={styles.valueIconContainer}>
        {item.iconLib === 'FontAwesome5' ? (
          <IconFA name={item.icon} size={24} color={COLORS.primary500} />
        ) : (
          <Icon name={item.icon} size={24} color={COLORS.primary500} />
        )}
      </View>
      <View style={styles.valueTextContainer}>
        <Text style={styles.valueTitle}>{item.title}</Text>
        <Text style={styles.valueDescription}>{item.description}</Text>
      </View>
    </Animated.View>
  );

  return (
    <LinearGradient
      colors={['#2E86AB', '#E3F2FD']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar backgroundColor="#2E86AB" barStyle="light-content" />
      <View style={styles.safeArea}>
        <TouchableOpacity 
          style={styles.skipButton}
          onPress={handleGetStarted}
        >
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>

        <View style={styles.content}>
          {/* Logo Section */}
          <Animated.View 
            style={[
              styles.logoSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <Afya360Logo 
              variant="white"
              size="extra-large"
              animated={true}
              style={styles.logo}
            />
            <Text style={styles.tagline}>Your Health, In Your Hands</Text>
          </Animated.View>

          {/* Value Propositions */}
          <View style={styles.valuePropsContainer}>
            {valueProp.map(renderValueProp)}
          </View>

          {/* Auto-advance indicator */}
          <Animated.View style={[styles.autoAdvanceContainer, { opacity: fadeAnim }]}>
            <View style={styles.dotsContainer}>
              <View style={[styles.dot, styles.activeDot]} />
              <View style={styles.dot} />
              <View style={styles.dot} />
            </View>
            <Text style={styles.autoAdvanceText}>Auto-advancing in 3 seconds</Text>
          </Animated.View>
        </View>

        {/* Action Buttons */}
        <Animated.View 
          style={[
            styles.actionContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Button
            title="Get Started"
            onPress={handleGetStarted}
            variant="primary"
            style={styles.getStartedButton}
            iconText="🚀"
            iconPosition="left"
          />

          <TouchableOpacity
            style={styles.signInButton}
            onPress={handleSignIn}
          >
            <Text style={styles.signInText}>
              Already have an account? <Text style={styles.signInLink}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Trusted by healthcare professionals worldwide
          </Text>
          <View style={styles.trustIndicators}>
            <Icon name="verified" size={16} color={COLORS.white} />
            <Text style={styles.trustText}>HIPAA Compliant</Text>
            <Icon name="security" size={16} color={COLORS.white} />
            <Text style={styles.trustText}>Secure</Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  skipButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },
  skipText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logo: {
    marginBottom: 20,
  },
  tagline: {
    ...TEXT_STYLES.h2,
    color: COLORS.white,
    textAlign: 'center',
    fontWeight: '300',
    letterSpacing: 0.5,
  },
  valuePropsContainer: {
    width: '100%',
    marginBottom: 40,
  },
  valueCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  valueIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary50,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  valueTextContainer: {
    flex: 1,
  },
  valueTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.gray900,
    marginBottom: 4,
    fontWeight: '600',
  },
  valueDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.gray600,
    lineHeight: 20,
  },
  autoAdvanceContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  dotsContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: COLORS.white,
  },
  autoAdvanceText: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  actionContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  getStartedButton: {
    marginBottom: 20,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  signInButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  signInText: {
    ...TEXT_STYLES.body,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  signInLink: {
    color: COLORS.white,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  footerText: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 8,
  },
  trustIndicators: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trustText: {
    ...TEXT_STYLES.caption,
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '500',
  },
});

export default WelcomeScreen;
