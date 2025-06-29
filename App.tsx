/**
 * Afya360 Health App
 * Main application entry point - Pure React Native (no react-navigation)
 *
 * @format
 */

import React from 'react';
import { StatusBar, useColorScheme, View, Platform } from 'react-native';
import { AuthProvider } from './src/context/AuthContextSimple';
import AppNavigator from './src/navigation/AppNavigator';
import { COLORS } from './src/styles/colors';

console.log('🔍 App.tsx: File loaded - pure React Native app (no react-navigation)');

function App(): React.JSX.Element {
  console.log('🔍 App: Function component called');
  
  const isDarkMode = useColorScheme() === 'dark';

  console.log('🔍 App component rendering, isDarkMode:', isDarkMode);

  console.log('🔍 App: About to render pure React Native navigation');

  return (
    <View style={{ 
      flex: 1, 
      backgroundColor: COLORS.white,
    }}>
      <AuthProvider>
        <StatusBar 
          barStyle={isDarkMode ? 'light-content' : 'dark-content'} 
          backgroundColor={COLORS.primary500}
        />
        <AppNavigator />
      </AuthProvider>
    </View>
  );
}

export default App;
