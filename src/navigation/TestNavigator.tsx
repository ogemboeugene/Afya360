import React from 'react';
import { View, Text } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';

// Simple test screen
const TestScreen = () => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' }}>
      <Text style={{ fontSize: 24, color: '#000000' }}>Test Screen Working!</Text>
      <Text style={{ fontSize: 16, color: '#666666', marginTop: 10 }}>React Native Screens is linked</Text>
    </View>
  );
};

const Stack = createStackNavigator();

const TestNavigator: React.FC = () => {
  console.log('TestNavigator rendering');
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Test" component={TestScreen} />
    </Stack.Navigator>
  );
};

export default TestNavigator;
