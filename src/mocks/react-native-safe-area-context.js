/**
 * Mock for react-native-safe-area-context to prevent RNCSafeAreaProvider errors
 * This replaces the native SafeAreaProvider with a simple View
 */

import React from 'react';
import { View } from 'react-native';

// Mock SafeAreaProvider to just render children
export const SafeAreaProvider = ({ children, ...props }) => {
  return <View {...props}>{children}</View>;
};

// Mock SafeAreaView to use React Native's built-in SafeAreaView
export const SafeAreaView = ({ children, ...props }) => {
  return <View {...props}>{children}</View>;
};

// Mock the hooks to return default values
export const useSafeAreaInsets = () => ({
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
});

export const useSafeAreaFrame = () => ({
  x: 0,
  y: 0,
  width: 0,
  height: 0,
});

// Mock initialWindowMetrics
export const initialWindowMetrics = {
  insets: { top: 0, bottom: 0, left: 0, right: 0 },
  frame: { x: 0, y: 0, width: 0, height: 0 },
};

// Default export
export default {
  SafeAreaProvider,
  SafeAreaView,
  useSafeAreaInsets,
  useSafeAreaFrame,
  initialWindowMetrics,
};
