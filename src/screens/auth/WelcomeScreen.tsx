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
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import components
import Button from '../../components/ui/buttons/Button';

// Import styles
import { COLORS } from '../../styles/colors';
import { TEXT_STYLES } from '../../styles/globalStyles';

// Types - simplified to match working screens
type NavigationProp = {
  navigate: (screen: string, params?: any) => void;
  goBack: () => void;
};

type RouteProp = {
  params?: any;
};

interface Props {
  navigation: NavigationProp;
  route?: RouteProp;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  const [autoAdvanceTimer, setAutoAdvanceTimer] = useState<NodeJS.Timeout | null>(null);
  const fadeAnim = new Animated.Value(1); // Start visible
  const slideAnim = new Animated.Value(0); // Start in position
  const scaleAnim = new Animated.Value(1); // Start at full scale

  useEffect(() => {
    console.log('🔍 WelcomeScreen: Starting animations');
    
    // Start with immediate visibility, then animate
    fadeAnim.setValue(1);
    slideAnim.setValue(0);
    scaleAnim.setValue(1);
    
    // Optional subtle animations
    Animated.sequence([
      Animated.delay(100),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ])
    ]).start(() => {
      console.log('🔍 WelcomeScreen: Animations completed');
    });

    // Auto-advance timer (5 seconds - extended for better UX)
    const timer = setTimeout(() => {
      console.log('🔍 WelcomeScreen: Auto-advancing to SignUp');
      handleGetStarted();
    }, 5000);

    setAutoAdvanceTimer(timer);

    // Cleanup
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, []);

  const handleGetStarted = () => {
    console.log('🔍 WelcomeScreen: Get Started pressed');
    if (autoAdvanceTimer) {
      clearTimeout(autoAdvanceTimer);
    }
    // Navigate to SignUp for new users
    navigation.navigate('SignUp');
  };

  const handleSignIn = () => {
    console.log('🔍 WelcomeScreen: Sign In pressed');
    if (autoAdvanceTimer) {
      clearTimeout(autoAdvanceTimer);
    }
    // Navigate to Login for existing users
    navigation.navigate('Login');
  };

  console.log('🔍 WelcomeScreen: Rendering...');

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.secondary600} barStyle="light-content" />
      
      {/* Background Gradient */}
      <LinearGradient
        colors={['#43A047', '#4CAF50', '#81C784']} // Green gradient - Healthcare theme
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      {/* Skip Button */}
      <TouchableOpacity 
        style={styles.skipButton}
        onPress={handleGetStarted}
      >
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Main Content - Fixed Layout */}
      <View style={styles.mainContent}>
        
        {/* Logo Section */}
        <Animated.View 
          style={[
            styles.logoSection,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim }
              ]
            }
          ]}
        >
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoText}>Afya360</Text>
          </View>
          <Text style={styles.tagline}>Your Health, In Your Hands</Text>
        </Animated.View>

        {/* Key Features */}
        <Animated.View 
          style={[
            styles.featuresSection,
            { opacity: fadeAnim }
          ]}
        >
          <View style={styles.featureRow}>
            <View style={styles.featureItem}>
              <Icon name="security" size={24} color={COLORS.white} />
              <Text style={styles.featureText}>Secure</Text>
            </View>
            <View style={styles.featureItem}>
              <Icon name="medical-services" size={24} color={COLORS.white} />
              <Text style={styles.featureText}>Comprehensive</Text>
            </View>
            <View style={styles.featureItem}>
              <Icon name="verified-user" size={24} color={COLORS.white} />
              <Text style={styles.featureText}>Trusted</Text>
            </View>
          </View>
        </Animated.View>

        {/* Description */}
        <Animated.View 
          style={[
            styles.descriptionSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Text style={styles.description}>
            Manage your health records, medications, and appointments all in one secure place. 
            HIPAA-compliant with bank-level encryption.
          </Text>
        </Animated.View>

        {/* Auto-advance indicator */}
        <Animated.View style={[styles.progressSection, { opacity: fadeAnim }]}>
          <View style={styles.dotsContainer}>
            <View style={[styles.dot, styles.activeDot]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
          <Text style={styles.progressText}>Starting automatically in 5 seconds</Text>
        </Animated.View>
      </View>

      {/* Bottom Actions */}
      <Animated.View 
        style={[
          styles.bottomSection,
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

        {/* Trust Badge */}
        <View style={styles.trustBadge}>
          <Icon name="verified" size={14} color={COLORS.white} />
          <Text style={styles.trustText}>HIPAA Compliant</Text>
          <Icon name="security" size={14} color={COLORS.white} />
          <Text style={styles.trustText}>Secure</Text>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#43A047', // Fallback color
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  skipButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
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
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 80 : 60,
    paddingBottom: 140, // Space for bottom section
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 3,
    borderColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoText: {
    ...TEXT_STYLES.h2,
    color: COLORS.white,
    fontWeight: '700',
    letterSpacing: 1,
  },
  appName: {
    ...TEXT_STYLES.h1,
    color: COLORS.white,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  tagline: {
    ...TEXT_STYLES.h3,
    color: COLORS.white,
    fontWeight: '300',
    opacity: 0.9,
    textAlign: 'center',
  },
  featuresSection: {
    marginBottom: 32,
  },
  featureRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: screenWidth * 0.8,
  },
  featureItem: {
    alignItems: 'center',
    flex: 1,
  },
  featureText: {
    ...TEXT_STYLES.caption,
    color: COLORS.white,
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
  },
  descriptionSection: {
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  description: {
    ...TEXT_STYLES.body,
    color: COLORS.white,
    textAlign: 'center',
    opacity: 0.85,
    lineHeight: 22,
    fontSize: 16,
  },
  progressSection: {
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: COLORS.white,
  },
  progressText: {
    ...TEXT_STYLES.caption,
    color: COLORS.white,
    opacity: 0.8,
    textAlign: 'center',
  },
  bottomSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    paddingTop: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  getStartedButton: {
    marginBottom: 16,
    shadowColor: COLORS.primary500,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  signInButton: {
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  signInText: {
    ...TEXT_STYLES.body,
    color: COLORS.white,
    textAlign: 'center',
    opacity: 0.9,
  },
  signInLink: {
    color: COLORS.white,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  trustText: {
    ...TEXT_STYLES.caption,
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
    marginRight: 8,
    opacity: 0.8,
  },
});

export default WelcomeScreen;
