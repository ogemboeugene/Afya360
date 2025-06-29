/**
 * AppNavigator - SIMPLIFIED FOR TESTING
 * Main navigation configuration for the Afya360 healthcare app
 */

import React from 'react';
import LoginScreen from '../screens/auth/LoginScreen';

// Main App Navigator Component - SIMPLIFIED FOR TESTING
const AppNavigator: React.FC = () => {
  console.log('AppNavigator rendering - simplified mode');
  
  // Direct render of LoginScreen for testing
  return <LoginScreen />;
};

export default AppNavigator;
