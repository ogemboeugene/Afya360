/**
 * IconButton Component
 * A reusable icon-only button component for the Afya360 healthcare app
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacityProps,
  ViewStyle,
} from 'react-native';
import { COLORS } from '../../../styles/colors';
import { GLOBAL_STYLES } from '../../../styles/globalStyles';
import { CustomIcon, IconLibrary } from '../../common/CustomIcon';

export type IconButtonVariant = 
  | 'primary' 
  | 'secondary' 
  | 'danger' 
  | 'success' 
  | 'warning' 
  | 'info' 
  | 'neutral'
  | 'transparent';

export type IconButtonSize = 'small' | 'medium' | 'large' | 'extra-large';

export interface IconButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  icon: string;
  iconLibrary?: IconLibrary;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  loading?: boolean;
  disabled?: boolean;
  backgroundColor?: string;
  iconColor?: string;
  borderColor?: string;
  style?: ViewStyle;
  onPress: () => void;
  accessibilityLabel?: string;
}

const IconButton: React.FC<IconButtonProps> = ({
  icon,
  iconLibrary = 'MaterialIcons',
  variant = 'neutral',
  size = 'medium',
  loading = false,
  disabled = false,
  backgroundColor,
  iconColor,
  borderColor,
  style,
  onPress,
  accessibilityLabel,
  ...props
}) => {
  // Determine if button should be disabled
  const isDisabled = disabled || loading;

  // Get variant styles
  const getVariantStyles = () => {
    if (backgroundColor || iconColor || borderColor) {
      return {
        backgroundColor: backgroundColor || 'transparent',
        iconColor: iconColor || COLORS.gray600,
        borderColor: borderColor || 'transparent',
      };
    }

    switch (variant) {
      case 'primary':
        return {
          backgroundColor: isDisabled ? COLORS.gray300 : COLORS.primary500,
          iconColor: COLORS.white,
          borderColor: 'transparent',
        };

      case 'secondary':
        return {
          backgroundColor: isDisabled ? COLORS.gray300 : COLORS.secondary500,
          iconColor: COLORS.white,
          borderColor: 'transparent',
        };

      case 'danger':
        return {
          backgroundColor: isDisabled ? COLORS.gray300 : COLORS.error500,
          iconColor: COLORS.white,
          borderColor: 'transparent',
        };

      case 'success':
        return {
          backgroundColor: isDisabled ? COLORS.gray300 : COLORS.success500,
          iconColor: COLORS.white,
          borderColor: 'transparent',
        };

      case 'warning':
        return {
          backgroundColor: isDisabled ? COLORS.gray300 : COLORS.warning500,
          iconColor: COLORS.gray900,
          borderColor: 'transparent',
        };

      case 'info':
        return {
          backgroundColor: isDisabled ? COLORS.gray300 : COLORS.info500,
          iconColor: COLORS.white,
          borderColor: 'transparent',
        };

      case 'neutral':
        return {
          backgroundColor: isDisabled ? COLORS.gray300 : COLORS.gray200,
          iconColor: isDisabled ? COLORS.gray400 : COLORS.gray700,
          borderColor: 'transparent',
        };

      case 'transparent':
        return {
          backgroundColor: 'transparent',
          iconColor: isDisabled ? COLORS.gray400 : COLORS.primary500,
          borderColor: 'transparent',
        };

      default:
        return {
          backgroundColor: COLORS.gray200,
          iconColor: COLORS.gray700,
          borderColor: 'transparent',
        };
    }
  };

  // Get size styles
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          containerSize: 32,
          iconSize: 16,
          borderRadius: 6,
        };

      case 'medium':
        return {
          containerSize: 44,
          iconSize: 20,
          borderRadius: 8,
        };

      case 'large':
        return {
          containerSize: 56,
          iconSize: 24,
          borderRadius: 12,
        };

      case 'extra-large':
        return {
          containerSize: 72,
          iconSize: 32,
          borderRadius: 12,
        };

      default:
        return {
          containerSize: 44,
          iconSize: 20,
          borderRadius: 8,
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  const containerStyle = [
    styles.baseContainer,
    {
      width: sizeStyles.containerSize,
      height: sizeStyles.containerSize,
      backgroundColor: variantStyles.backgroundColor,
      borderRadius: sizeStyles.borderRadius,
      borderColor: variantStyles.borderColor,
      borderWidth: variantStyles.borderColor !== 'transparent' ? 1 : 0,
    },
    isDisabled && styles.disabled,
    style,
  ];

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={isDisabled ? 1 : 0.7}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || `${icon} button`}
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
        <CustomIcon
          name={icon}
          library={iconLibrary}
          size={sizeStyles.iconSize}
          color={variantStyles.iconColor}
        />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  baseContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  disabled: {
    opacity: 0.6,
    shadowOpacity: 0,
    elevation: 0,
  },
});

export default IconButton;
