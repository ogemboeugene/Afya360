import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

// Pure React Native login screen without ANY navigation dependencies
const PureTestScreen = () => {
  console.log('PureTestScreen rendering - no navigation dependencies');
  
  const handleLogin = () => {
    console.log('🔵 Login button pressed - this should appear in console');
    alert('Login button works! Console: Login pressed');
  };

  const handleSignUp = () => {
    console.log('🟢 Sign up button pressed - this should appear in console');
    alert('Sign up button works! Console: Sign up pressed');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>Afya360</Text>
        <Text style={styles.subtitle}>Your Health, Simplified</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.description}>Sign in to access your health records</Text>
        
        <TouchableOpacity 
          style={styles.loginButton} 
          onPress={handleLogin}
          activeOpacity={0.7}
          onPressIn={() => console.log('🔵 Login button pressed IN')}
          onPressOut={() => console.log('🔵 Login button pressed OUT')}
        >
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.signUpButton} 
          onPress={handleSignUp}
          activeOpacity={0.7}
          onPressIn={() => console.log('🟢 SignUp button pressed IN')}
          onPressOut={() => console.log('🟢 SignUp button pressed OUT')}
        >
          <Text style={styles.signUpText}>Create Account</Text>
        </TouchableOpacity>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>✅ App working without react-native-screens</Text>
          <Text style={styles.footerText}>Ready for proper navigation setup</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 80,
    marginBottom: 60,
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 8,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 32,
  },
  loginButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginBottom: 16,
    minHeight: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  signUpButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2196F3',
    marginBottom: 32,
    minHeight: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpText: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 40,
  },
  footerText: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'center',
    marginBottom: 4,
  },
});

export default PureTestScreen;
