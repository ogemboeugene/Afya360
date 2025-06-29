/**
 * AppNavigator
 * Pure React Native navigation solution (no react-navigation dependencies)
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

console.log('🔍 AppNavigator: File loaded - pure React Native navigation');

// Import actual screen components
import { useAuth } from '../hooks/useAuth';
import { COLORS } from '../styles/colors';

// Import actual screen components
import { LoginScreen } from '../screens/auth/LoginScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';
import { WelcomeScreen } from '../screens/auth/WelcomeScreen';
import { PhoneVerificationScreen } from '../screens/auth/PhoneVerificationScreen';
import { ProfileSetupScreen } from '../screens/auth/ProfileSetupScreen';
import { PermissionsScreen } from '../screens/onboarding/PermissionsScreen';
import { HomeScreen } from '../screens/dashboard/HomeScreen';

// Navigation state management
type NavigationState = {
  currentScreen: string;
  params?: any;
};

// Simple Navigator Component
const SimpleNavigator: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return (
    <View style={styles.navigator}>
      {children}
    </View>
  );
};

// Simple Header Component
const SimpleHeader: React.FC<{
  title: string;
  onBack?: () => void;
  showBack?: boolean;
}> = ({ title, onBack, showBack = false }) => {
  return (
    <View style={styles.header}>
      {showBack && (
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Icon name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
      )}
      <Text style={styles.headerTitle}>{title}</Text>
    </View>
  );
};

// Placeholder for screens not yet implemented
const PlaceholderScreen: React.FC<{ 
  screenName: string; 
  onNavigate: (screen: string) => void;
  onBack?: () => void;
}> = ({ screenName, onNavigate, onBack }) => {
  console.log('PlaceholderScreen rendering for:', screenName);
  
  return (
    <View style={styles.navigator}>
      <SimpleHeader 
        title={screenName} 
        onBack={onBack}
        showBack={!!onBack}
      />
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>
          {screenName} Screen
        </Text>
        <Text style={styles.placeholderSubtext}>
          Coming Soon!
        </Text>
        
        {/* Demo navigation buttons */}
        {screenName === 'Home' && (
          <View style={styles.demoButtons}>
            <TouchableOpacity 
              style={styles.demoButton}
              onPress={() => onNavigate('Health')}
            >
              <Text style={styles.demoButtonText}>Health Records</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.demoButton}
              onPress={() => onNavigate('Medications')}
            >
              <Text style={styles.demoButtonText}>Medications</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.demoButton}
              onPress={() => onNavigate('Profile')}
            >
              <Text style={styles.demoButtonText}>Profile</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

console.log('🔍 AppNavigator: Pure navigation components created');

// Main App Navigator Component
const AppNavigator: React.FC = () => {
  console.log('🔍 AppNavigator: Main component function called');
  
  const { user, isLoading } = useAuth();
  const [navigationState, setNavigationState] = useState<NavigationState>({
    currentScreen: user ? 'Home' : 'Welcome' // Start with Welcome for new users
  });
  
  console.log('🔍 AppNavigator rendering - user:', user ? 'authenticated' : 'not authenticated', 'isLoading:', isLoading, 'currentScreen:', navigationState.currentScreen);

  // Listen for authentication state changes and navigate accordingly
  React.useEffect(() => {
    console.log('🔍 AppNavigator: Auth state changed - user:', user ? 'authenticated' : 'not authenticated');
    if (user && navigationState.currentScreen !== 'Home') {
      console.log('🔍 AppNavigator: User authenticated, navigating to Home');
      setNavigationState({ currentScreen: 'Home' });
    } else if (!user && navigationState.currentScreen === 'Home') {
      console.log('🔍 AppNavigator: User logged out, navigating to Welcome');
      setNavigationState({ currentScreen: 'Welcome' });
    }
  }, [user, navigationState.currentScreen]);

  // Navigation function
  const navigate = (screen: string, params?: any) => {
    console.log('🔍 Navigating to:', screen, 'with params:', params);
    setNavigationState({ currentScreen: screen, params });
  };

  // Back navigation function
  const goBack = () => {
    console.log('🔍 Going back from:', navigationState.currentScreen);
    
    // Define proper back navigation flow
    switch (navigationState.currentScreen) {
      case 'SignUp':
        navigate('Welcome');
        break;
      case 'PhoneVerification':
        navigate('SignUp');
        break;
      case 'ProfileSetup':
        navigate('PhoneVerification');
        break;
      case 'Permissions':
        navigate('ProfileSetup');
        break;
      case 'Login':
        navigate('Welcome');
        break;
      default:
        if (user) {
          navigate('Home');
        } else {
          navigate('Welcome');
        }
    }
  };

  if (isLoading) {
    console.log('🔍 AppNavigator: Showing loading screen');
    return (
      <View style={styles.navigator}>
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>Loading...</Text>
        </View>
      </View>
    );
  }

  // Render current screen based on navigation state
  const renderCurrentScreen = () => {
    const { currentScreen } = navigationState;
    
    console.log('🔍 AppNavigator: Rendering screen:', currentScreen);

    switch (currentScreen) {
      case 'Welcome':
        return (
          <SimpleNavigator>
            <WelcomeScreen 
              navigation={{ 
                navigate,
                goBack,
                // Mock navigation object for compatibility
                setOptions: () => {},
                addListener: () => () => {},
                isFocused: () => true,
                canGoBack: () => false,
                getId: () => 'Welcome',
                getParent: () => undefined,
                getState: () => ({ key: 'Welcome', index: 0, routeNames: ['Welcome'], routes: [{ key: 'Welcome', name: 'Welcome' }] }),
                dispatch: () => {},
                reset: () => {},
                setParams: () => {},
                push: navigate,
                pop: goBack,
                popToTop: () => navigate('Welcome'),
                replace: navigate,
              } as any} 
              route={{
                key: 'Welcome',
                name: 'Welcome',
                params: navigationState.params || {}
              } as any}
            />
          </SimpleNavigator>
        );

      case 'Login':
        return (
          <SimpleNavigator>
            <LoginScreen 
              navigation={{ 
                navigate,
                goBack,
                // Mock navigation object for compatibility
                setOptions: () => {},
                addListener: () => () => {},
                isFocused: () => true,
                canGoBack: () => true,
                getId: () => 'Login',
                getParent: () => undefined,
                getState: () => ({ key: 'Login', index: 0, routeNames: ['Login'], routes: [{ key: 'Login', name: 'Login' }] }),
                dispatch: () => {},
                reset: () => {},
                setParams: () => {},
                push: navigate,
                pop: goBack,
                popToTop: () => navigate('Welcome'),
                replace: navigate,
              } as any} 
              route={{
                key: 'Login',
                name: 'Login',
                params: navigationState.params || {}
              } as any}
            />
          </SimpleNavigator>
        );

      case 'SignUp':
        return (
          <SimpleNavigator>
            <SignUpScreen 
              navigation={{ 
                navigate,
                goBack,
                // Mock navigation object for compatibility
                setOptions: () => {},
                addListener: () => () => {},
                isFocused: () => true,
                canGoBack: () => true,
                getId: () => 'SignUp',
                getParent: () => undefined,
                getState: () => ({ key: 'SignUp', index: 0, routeNames: ['SignUp'], routes: [{ key: 'SignUp', name: 'SignUp' }] }),
                dispatch: () => {},
                reset: () => {},
                setParams: () => {},
                push: navigate,
                pop: goBack,
                popToTop: () => navigate('Welcome'),
                replace: navigate,
              } as any} 
              route={{
                key: 'SignUp',
                name: 'SignUp',
                params: navigationState.params || {}
              } as any}
            />
          </SimpleNavigator>
        );

      case 'PhoneVerification':
        return (
          <SimpleNavigator>
            <PhoneVerificationScreen 
              navigation={{ 
                navigate,
                goBack,
                // Mock navigation object for compatibility
                setOptions: () => {},
                addListener: () => () => {},
                isFocused: () => true,
                canGoBack: () => true,
                getId: () => 'PhoneVerification',
                getParent: () => undefined,
                getState: () => ({ key: 'PhoneVerification', index: 0, routeNames: ['PhoneVerification'], routes: [{ key: 'PhoneVerification', name: 'PhoneVerification' }] }),
                dispatch: () => {},
                reset: () => {},
                setParams: () => {},
                push: navigate,
                pop: goBack,
                popToTop: () => navigate('Welcome'),
                replace: navigate,
              } as any} 
              route={{
                key: 'PhoneVerification',
                name: 'PhoneVerification',
                params: navigationState.params || {}
              } as any}
            />
          </SimpleNavigator>
        );

      case 'ProfileSetup':
        return (
          <SimpleNavigator>
            <ProfileSetupScreen 
              navigation={{ 
                navigate,
                goBack,
                // Mock navigation object for compatibility
                setOptions: () => {},
                addListener: () => () => {},
                isFocused: () => true,
                canGoBack: () => true,
                getId: () => 'ProfileSetup',
                getParent: () => undefined,
                getState: () => ({ key: 'ProfileSetup', index: 0, routeNames: ['ProfileSetup'], routes: [{ key: 'ProfileSetup', name: 'ProfileSetup' }] }),
                dispatch: () => {},
                reset: () => {},
                setParams: () => {},
                push: navigate,
                pop: goBack,
                popToTop: () => navigate('Welcome'),
                replace: navigate,
              } as any}
            />
          </SimpleNavigator>
        );

      case 'Permissions':
        return (
          <SimpleNavigator>
            <PermissionsScreen 
              navigation={{ 
                navigate,
                goBack,
                // Mock navigation object for compatibility
                setOptions: () => {},
                addListener: () => () => {},
                isFocused: () => true,
                canGoBack: () => true,
                getId: () => 'Permissions',
                getParent: () => undefined,
                getState: () => ({ key: 'Permissions', index: 0, routeNames: ['Permissions'], routes: [{ key: 'Permissions', name: 'Permissions' }] }),
                dispatch: () => {},
                reset: () => {},
                setParams: () => {},
                push: navigate,
                pop: goBack,
                popToTop: () => navigate('Welcome'),
                replace: navigate,
              } as any}
            />
          </SimpleNavigator>
        );

      case 'Home':
        return (
          <SimpleNavigator>
            <HomeScreen 
              navigation={{ 
                navigate,
                goBack,
                // Mock navigation object for compatibility
                setOptions: () => {},
                addListener: () => () => {},
                isFocused: () => true,
                canGoBack: () => false,
                getId: () => 'Home',
                getParent: () => undefined,
                getState: () => ({ key: 'Home', index: 0, routeNames: ['Home'], routes: [{ key: 'Home', name: 'Home' }] }),
                dispatch: () => {},
                reset: () => {},
                setParams: () => {},
                push: navigate,
                pop: goBack,
                popToTop: () => navigate('Home'),
                replace: navigate,
              } as any}
            />
          </SimpleNavigator>
        );

      case 'Health':
        return (
          <PlaceholderScreen 
            screenName="Health Records" 
            onNavigate={navigate}
            onBack={goBack}
          />
        );

      case 'Medications':
        return (
          <PlaceholderScreen 
            screenName="Medications" 
            onNavigate={navigate}
            onBack={goBack}
          />
        );

      case 'Profile':
        return (
          <PlaceholderScreen 
            screenName="Profile" 
            onNavigate={navigate}
            onBack={goBack}
          />
        );

      default:
        console.log('🔍 Unknown screen:', currentScreen, 'redirecting to Welcome');
        return (
          <PlaceholderScreen 
            screenName="Unknown Screen" 
            onNavigate={navigate}
            onBack={() => navigate('Welcome')}
          />
        );
    }
  };

  return (
    <View style={styles.navigator}>
      {renderCurrentScreen()}
    </View>
  );
};

// Pure React Native styles
const styles = StyleSheet.create({
  navigator: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingTop: Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 0, // Manual safe area
  },
  header: {
    height: 56,
    backgroundColor: COLORS.primary500,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.white,
    flex: 1,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 20,
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.primary500,
    marginBottom: 8,
    textAlign: 'center',
  },
  placeholderSubtext: {
    fontSize: 16,
    color: COLORS.gray600,
    textAlign: 'center',
    marginBottom: 32,
  },
  demoButtons: {
    width: '100%',
    maxWidth: 300,
    gap: 16,
  },
  demoButton: {
    backgroundColor: COLORS.primary500,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  demoButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AppNavigator;
