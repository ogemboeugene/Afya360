/**
 * FloatingActionButton Component
 * A floating action button (FAB) component for the Afya360 healthcare app
 */

import React from 'react';
import {
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacityProps,
  ViewStyle,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../styles/colors';
import { GLOBAL_STYLES } from '../../../styles/globalStyles';

export type FABVariant = 'primary' | 'secondary' | 'emergency' | 'success';
export type FABSize = 'normal' | 'small' | 'large';
export type FABPosition = 'bottom-right' | 'bottom-left' | 'bottom-center' | 'custom';

export interface FloatingActionButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  icon: keyof typeof Ionicons.glyphMap;
  variant?: FABVariant;
  size?: FABSize;
  position?: FABPosition;
  loading?: boolean;
  disabled?: boolean;
  backgroundColor?: string;
  iconColor?: string;
  style?: ViewStyle;
  onPress: () => void;
  accessibilityLabel?: string;
  // Animation properties
  animated?: boolean;
  scaleAnimation?: Animated.Value;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  icon,
  variant = 'primary',
  size = 'normal',
  position = 'bottom-right',
  loading = false,
  disabled = false,
  backgroundColor,
  iconColor,
  style,
  onPress,
  accessibilityLabel,
  animated = true,
  scaleAnimation,
  ...props
}) => {
  // Default animated value if not provided
  const defaultScale = React.useRef(new Animated.Value(1)).current;
  const animatedValue = scaleAnimation || defaultScale;

  // Determine if button should be disabled
  const isDisabled = disabled || loading;

  // Get variant styles
  const getVariantStyles = () => {
    if (backgroundColor || iconColor) {
      return {
        backgroundColor: backgroundColor || COLORS.primary500,
        iconColor: iconColor || COLORS.white,
      };
    }

    switch (variant) {
      case 'primary':
        return {
          backgroundColor: isDisabled ? COLORS.gray300 : COLORS.primary500,
          iconColor: COLORS.white,
        };

      case 'secondary':
        return {
          backgroundColor: isDisabled ? COLORS.gray300 : COLORS.secondary500,
          iconColor: COLORS.white,
        };

      case 'emergency':
        return {
          backgroundColor: isDisabled ? COLORS.gray300 : COLORS.error500,
          iconColor: COLORS.white,
        };

      case 'success':
        return {
          backgroundColor: isDisabled ? COLORS.gray300 : COLORS.success500,
          iconColor: COLORS.white,
        };

      default:
        return {
          backgroundColor: COLORS.primary500,
          iconColor: COLORS.white,
        };
    }
  };

  // Get size styles
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          containerSize: 40,
          iconSize: 20,
          elevation: 4,
        };

      case 'normal':
        return {
          containerSize: 56,
          iconSize: 24,
          elevation: 6,
        };

      case 'large':
        return {
          containerSize: 72,
          iconSize: 32,
          elevation: 8,
        };

      default:
        return {
          containerSize: 56,
          iconSize: 24,
          elevation: 6,
        };
    }
  };

  // Get position styles
  const getPositionStyles = () => {
    const basePosition = {
      position: 'absolute' as const,
      bottom: 20,
    };

    switch (position) {
      case 'bottom-right':
        return {
          ...basePosition,
          right: 20,
        };

      case 'bottom-left':
        return {
          ...basePosition,
          left: 20,
        };

      case 'bottom-center':
        return {
          ...basePosition,
          alignSelf: 'center' as const,
        };

      case 'custom':
        return {}; // No default positioning for custom

      default:
        return {
          ...basePosition,
          right: 20,
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();
  const positionStyles = getPositionStyles();

  const containerStyle = [
    styles.baseContainer,
    {
      width: sizeStyles.containerSize,
      height: sizeStyles.containerSize,
      backgroundColor: variantStyles.backgroundColor,
      elevation: sizeStyles.elevation,
    },
    positionStyles,
    isDisabled && styles.disabled,
    style,
  ] as ViewStyle[];

  // Handle press with animation
  const handlePress = () => {
    if (isDisabled) return;

    if (animated) {
      // Scale animation on press
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 0.9,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }

    onPress();
  };

  const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

  return (
    <AnimatedTouchableOpacity
      style={[
        containerStyle,
        animated && {
          transform: [{ scale: animatedValue }],
        },
      ]}
      onPress={handlePress}
      disabled={isDisabled}
      activeOpacity={isDisabled ? 1 : 0.8}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || `${icon} floating action button`}
      accessibilityState={{
        disabled: isDisabled,
        busy: loading,
      }}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variantStyles.iconColor}
        />
      ) : (
        <Ionicons
          name={icon}
          size={sizeStyles.iconSize}
          color={variantStyles.iconColor}
        />
      )}
    </AnimatedTouchableOpacity>
  );
};

const styles = StyleSheet.create({
  baseContainer: {
    borderRadius: 28, // Circular
    alignItems: 'center',
    justifyContent: 'center',
    // Shadow for iOS
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  disabled: {
    opacity: 0.6,
    elevation: 2,
    shadowOpacity: 0.1,
  },
});

export default FloatingActionButton;
