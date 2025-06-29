/**
 * Afya360Logo Component
 * Official logo component for the Afya360 healthcare app
 */

import React from 'react';
import { 
  View, 
  Text, 
  Image, 
  ImageProps, 
  StyleSheet, 
  ViewStyle,
  TextStyle,
  Animated,
} from 'react-native';
import { COLORS } from '../../styles/colors';
import { GLOBAL_STYLES, TEXT_STYLES } from '../../styles/globalStyles';

export type LogoVariant = 'default' | 'white' | 'dark' | 'text-only' | 'icon-only';
export type LogoSize = 'small' | 'medium' | 'large' | 'extra-large' | 'custom';

export interface Afya360LogoProps extends Omit<ImageProps, 'source'> {
  variant?: LogoVariant;
  size?: LogoSize;
  width?: number;
  height?: number;
  showText?: boolean;
  textColor?: string;
  containerStyle?: ViewStyle;
  textStyle?: TextStyle;
  animated?: boolean;
  onPress?: () => void;
}

export const Afya360Logo: React.FC<Afya360LogoProps> = ({ 
  variant = 'default',
  size = 'medium',
  width, 
  height, 
  showText = true,
  textColor,
  containerStyle,
  textStyle,
  animated = false,
  onPress,
  style, 
  ...props 
}) => {
  // Animation setup
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const fadeAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    if (animated) {
      const breathingAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.05,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      );
      breathingAnimation.start();

      return () => breathingAnimation.stop();
    }
  }, [animated, scaleAnim]);

  // Get size dimensions
  const getSizeDimensions = () => {
    if (width && height) {
      return { width, height };
    }

    switch (size) {
      case 'small':
        return { width: 32, height: 32 };
      case 'medium':
        return { width: 64, height: 64 };
      case 'large':
        return { width: 120, height: 120 };
      case 'extra-large':
        return { width: 200, height: 200 };
      case 'custom':
        return { width: width || 64, height: height || 64 };
      default:
        return { width: 64, height: 64 };
    }
  };

  // Get text size
  const getTextSize = () => {
    switch (size) {
      case 'small':
        return 12;
      case 'medium':
        return 16;
      case 'large':
        return 24;
      case 'extra-large':
        return 32;
      case 'custom':
        return 16;
      default:
        return 16;
    }
  };

  // Get logo source based on variant
  const getLogoSource = () => {
    // Use the actual PNG logo
    try {
      return require('../../assets/images/afya360.png');
    } catch (error) {
      console.warn('Logo image not found, using placeholder');
      return null; // Fallback to placeholder
    }
  };

  // Get text color based on variant
  const getTextColor = () => {
    if (textColor) return textColor;

    switch (variant) {
      case 'white':
        return COLORS.white;
      case 'dark':
        return COLORS.gray800;
      case 'default':
      default:
        return COLORS.primary500;
    }
  };

  const dimensions = getSizeDimensions();
  const fontSize = getTextSize();
  const logoSource = getLogoSource();
  const finalTextColor = getTextColor();

  const logoStyle = [
    styles.logo,
    dimensions,
    style,
  ];

  const containerStyleCombined = [
    styles.container,
    containerStyle,
  ];

  const textStyleCombined = [
    styles.text,
    {
      fontSize,
      color: finalTextColor,
    },
    textStyle,
  ];

  // Don't render image for text-only variant
  if (variant === 'text-only') {
    return (
      <Animated.View 
        style={[
          containerStyleCombined,
          animated && { transform: [{ scale: scaleAnim }] }
        ]}
      >
        <Text style={textStyleCombined}>Afya360</Text>
      </Animated.View>
    );
  }

  // Render icon only
  if (variant === 'icon-only' || !showText) {
    return (
      <Animated.View 
        style={[
          containerStyleCombined,
          animated && { transform: [{ scale: scaleAnim }] }
        ]}
      >
        {logoSource ? (
          <Image
            source={logoSource}
            style={logoStyle}
            resizeMode="contain"
            accessibilityLabel="Afya360 Logo"
            {...props}
          />
        ) : (
          <View style={[logoStyle, styles.logoPlaceholder]}>
            <Text style={[styles.logoPlaceholderText, { fontSize: dimensions.width * 0.3 }]}>
              360°
            </Text>
          </View>
        )}
      </Animated.View>
    );
  }

  // Render logo with text
  return (
    <Animated.View 
      style={[
        containerStyleCombined,
        animated && { 
          transform: [{ scale: scaleAnim }],
          opacity: fadeAnim,
        }
      ]}
    >
      {logoSource ? (
        <Image
          source={logoSource}
          style={logoStyle}
          resizeMode="contain"
          accessibilityLabel="Afya360 Logo"
          {...props}
        />
      ) : (
        <View style={[logoStyle, styles.logoPlaceholder]}>
          <Text style={[styles.logoPlaceholderText, { fontSize: dimensions.width * 0.3 }]}>
            360°
          </Text>
        </View>
      )}
      {showText && (
        <Text style={textStyleCombined}>Afya360</Text>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    alignSelf: 'center',
  },
  text: {
    marginTop: 8,
    textAlign: 'center',
    letterSpacing: 0.5,
    ...GLOBAL_STYLES.TEXT_STYLES.h2,
  },
  logoPlaceholder: {
    backgroundColor: COLORS.primary500,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoPlaceholderText: {
    color: COLORS.white,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default Afya360Logo;
