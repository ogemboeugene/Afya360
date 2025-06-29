/**
 * Button Component
 * A versatile, reusable button component for the Afya360 healthcare app
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacityProps,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { COLORS } from '../../../styles/colors';
import { GLOBAL_STYLES } from '../../../styles/globalStyles';

export type ButtonVariant = 
  | 'primary' 
  | 'secondary' 
  | 'danger' 
  | 'success' 
  | 'warning' 
  | 'info' 
  | 'outline' 
  | 'ghost' 
  | 'link';

export type ButtonSize = 'small' | 'medium' | 'large' | 'extra-large';

export interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  iconText?: string; // Use emoji or unicode icons instead
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
  textStyle?: TextStyle;
  loadingColor?: string;
  onPress: () => void;
}

const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  fullWidth = false,
  iconText,
  iconPosition = 'left',
  style,
  textStyle,
  loadingColor,
  onPress,
  ...props
}) => {
  // Determine if button should be disabled
  const isDisabled = disabled || loading;

  // Get variant styles
  const getVariantStyles = () => {
    const baseStyles = {
      container: {} as ViewStyle,
      text: {} as TextStyle,
    };

    switch (variant) {
      case 'primary':
        baseStyles.container = {
          backgroundColor: isDisabled ? COLORS.button.disabled : COLORS.button.primary,
          borderWidth: 0,
        };
        baseStyles.text = {
          color: COLORS.white,
          fontWeight: '600' as const,
        };
        break;

      case 'secondary':
        baseStyles.container = {
          backgroundColor: isDisabled ? COLORS.button.disabled : COLORS.button.secondary,
          borderWidth: 0,
        };
        baseStyles.text = {
          color: COLORS.white,
          fontWeight: '600' as const,
        };
        break;

      case 'danger':
        baseStyles.container = {
          backgroundColor: isDisabled ? COLORS.button.disabled : COLORS.button.destructive,
          borderWidth: 0,
        };
        baseStyles.text = {
          color: COLORS.white,
          fontWeight: '600' as const,
        };
        break;

      case 'success':
        baseStyles.container = {
          backgroundColor: isDisabled ? COLORS.button.disabled : COLORS.success500,
          borderWidth: 0,
        };
        baseStyles.text = {
          color: COLORS.white,
          fontWeight: '600' as const,
        };
        break;

      case 'warning':
        baseStyles.container = {
          backgroundColor: isDisabled ? COLORS.button.disabled : COLORS.warning500,
          borderWidth: 0,
        };
        baseStyles.text = {
          color: COLORS.gray900,
          fontWeight: '600' as const,
        };
        break;

      case 'info':
        baseStyles.container = {
          backgroundColor: isDisabled ? COLORS.button.disabled : COLORS.info500,
          borderWidth: 0,
        };
        baseStyles.text = {
          color: COLORS.white,
          fontWeight: '600' as const,
        };
        break;

      case 'outline':
        baseStyles.container = {
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderColor: isDisabled ? COLORS.button.disabled : COLORS.button.primary,
        };
        baseStyles.text = {
          color: isDisabled ? COLORS.text.disabled : COLORS.button.primary,
          fontWeight: '600' as const,
        };
        break;

      case 'ghost':
        baseStyles.container = {
          backgroundColor: isDisabled 
            ? COLORS.gray100 
            : COLORS.primary100,
          borderWidth: 0,
        };
        baseStyles.text = {
          color: isDisabled ? COLORS.text.disabled : COLORS.button.primary,
          fontWeight: '600' as const,
        };
        break;

      case 'link':
        baseStyles.container = {
          backgroundColor: 'transparent',
          borderWidth: 0,
        };
        baseStyles.text = {
          color: isDisabled ? COLORS.text.disabled : COLORS.text.link,
          fontWeight: '500' as const,
          textDecorationLine: 'underline' as const,
        };
        break;
    }

    return baseStyles;
  };

  // Get size styles
  const getSizeStyles = () => {
    const baseStyles = {
      container: {} as ViewStyle,
      text: {} as TextStyle,
      icon: 16,
    };

    switch (size) {
      case 'small':
        baseStyles.container = {
          paddingHorizontal: 12,
          paddingVertical: 8,
          minHeight: 32,
        };
        baseStyles.text = {
          fontSize: 14,
        };
        baseStyles.icon = 14;
        break;

      case 'medium':
        baseStyles.container = {
          paddingHorizontal: 16,
          paddingVertical: 12,
          minHeight: 44,
        };
        baseStyles.text = {
          fontSize: 16,
        };
        baseStyles.icon = 16;
        break;

      case 'large':
        baseStyles.container = {
          paddingHorizontal: 20,
          paddingVertical: 16,
          minHeight: 52,
        };
        baseStyles.text = {
          fontSize: 18,
        };
        baseStyles.icon = 18;
        break;

      case 'extra-large':
        baseStyles.container = {
          paddingHorizontal: 24,
          paddingVertical: 20,
          minHeight: 60,
        };
        baseStyles.text = {
          fontSize: 20,
        };
        baseStyles.icon = 20;
        break;
    }

    return baseStyles;
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  const containerStyle = [
    styles.baseContainer,
    variantStyles.container,
    sizeStyles.container,
    fullWidth && styles.fullWidth,
    isDisabled && styles.disabled,
    style,
  ];

  const textStyleCombined = [
    styles.baseText,
    variantStyles.text,
    sizeStyles.text,
    textStyle,
  ];

  const iconColor = variantStyles.text.color;

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size={size === 'small' ? 'small' : 'small'}
            color={loadingColor || iconColor}
            style={styles.loadingSpinner}
          />
          <Text style={[textStyleCombined, styles.loadingText]}>{title}</Text>
        </View>
      );
    }

    if (iconText) {
      return (
        <View style={styles.contentContainer}>
          {iconPosition === 'left' && (
            <Text style={[styles.iconText, styles.iconLeft]}>
              {iconText}
            </Text>
          )}
          <Text style={textStyleCombined}>{title}</Text>
          {iconPosition === 'right' && (
            <Text style={[styles.iconText, styles.iconRight]}>
              {iconText}
            </Text>
          )}
        </View>
      );
    }

    return <Text style={textStyleCombined}>{title}</Text>;
  };

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={isDisabled ? 1 : 0.7}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{
        disabled: isDisabled,
        busy: loading,
      }}
      {...props}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  baseContainer: {
    borderRadius: GLOBAL_STYLES.BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...GLOBAL_STYLES.SHADOWS.button,
  },
  baseText: {
    textAlign: 'center',
    includeFontPadding: false,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.6,
    shadowOpacity: 0,
    elevation: 0,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingSpinner: {
    marginRight: 8,
  },
  loadingText: {
    opacity: 0.8,
  },
  iconText: {
    fontSize: 16,
    lineHeight: 20,
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});

export default Button;
