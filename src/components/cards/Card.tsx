/**
 * Card Component for Afya360 Healthcare App
 * 
 * A versatile card component for displaying healthcare information,
 * medical records, appointments, and other data with consistent styling.
 */

import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle, Pressable } from 'react-native';
import { COLORS as colors } from '../../styles/colors';
import { GLOBAL_STYLES as globalStyles } from '../../styles/globalStyles';

// ============================================================================
// INTERFACES
// ============================================================================

export type CardVariant = 'default' | 'elevated' | 'outlined' | 'filled';
export type CardSize = 'small' | 'medium' | 'large';
export type CardStatus = 'default' | 'success' | 'warning' | 'error' | 'info';

export interface CardProps {
  children: ReactNode;
  variant?: CardVariant;
  size?: CardSize;
  status?: CardStatus;
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  
  // Healthcare-specific props
  urgent?: boolean;
  confidential?: boolean;
  
  // Accessibility
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: 'button' | 'none';
}

// ============================================================================
// CARD COMPONENT
// ============================================================================

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  size = 'medium',
  status = 'default',
  onPress,
  disabled = false,
  style,
  contentStyle,
  urgent = false,
  confidential = false,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole,
}) => {
  // ============================================================================
  // STYLE CALCULATIONS
  // ============================================================================

  const getVariantStyles = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: globalStyles.borderRadius.lg,
      backgroundColor: colors.background.primary,
    };

    switch (variant) {
      case 'elevated':
        return {
          ...baseStyle,
          ...globalStyles.shadows.medium,
          elevation: 4,
        };
      
      case 'outlined':
        return {
          ...baseStyle,
          borderWidth: 1,
          borderColor: colors.border.light,
          backgroundColor: colors.background.primary,
        };
      
      case 'filled':
        return {
          ...baseStyle,
          backgroundColor: colors.background.secondary,
        };
      
      case 'default':
      default:
        return {
          ...baseStyle,
          ...globalStyles.shadows.small,
          elevation: 2,
        };
    }
  };

  const getSizeStyles = (): ViewStyle => {
    switch (size) {
      case 'small':
        return {
          padding: globalStyles.spacing.sm,
        };
      
      case 'large':
        return {
          padding: globalStyles.spacing.xl,
        };
      
      case 'medium':
      default:
        return {
          padding: globalStyles.spacing.lg,
        };
    }
  };

  const getStatusStyles = (): ViewStyle => {
    if (status === 'default') return {};

    const statusColors = {
      success: colors.status.success,
      warning: colors.status.warning,
      error: colors.status.error,
      info: colors.primary.main,
    };

    return {
      borderLeftWidth: 4,
      borderLeftColor: statusColors[status as keyof typeof statusColors],
    };
  };

  const getUrgentStyles = (): ViewStyle => {
    if (!urgent) return {};

    return {
      borderWidth: 2,
      borderColor: colors.status.error,
      backgroundColor: colors.status.error + '10',
    };
  };

  const getConfidentialStyles = (): ViewStyle => {
    if (!confidential) return {};

    return {
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: colors.text.tertiary,
    };
  };

  const getDisabledStyles = (): ViewStyle => {
    if (!disabled) return {};

    return {
      opacity: 0.6,
    };
  };

  const getPressableStyles = (): ViewStyle => {
    if (!onPress || disabled) return {};

    return {
      transform: [{ scale: 1 }],
    };
  };

  // ============================================================================
  // COMBINED STYLES
  // ============================================================================

  const cardStyles: ViewStyle = {
    ...getVariantStyles(),
    ...getSizeStyles(),
    ...getStatusStyles(),
    ...getUrgentStyles(),
    ...getConfidentialStyles(),
    ...getDisabledStyles(),
    ...getPressableStyles(),
    ...style,
  };

  const contentStyles: ViewStyle = {
    ...contentStyle,
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  const content = (
    <View style={[styles.container, cardStyles]}>
      <View style={[styles.content, contentStyles]}>
        {children}
      </View>
    </View>
  );

  // If onPress is provided, wrap in Pressable
  if (onPress && !disabled) {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => [
          pressed && styles.pressed,
        ]}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityRole={accessibilityRole || 'button'}
        accessibilityState={{ disabled }}
      >
        {content}
      </Pressable>
    );
  }

  return content;
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    // Base container styles are applied via getVariantStyles
  },
  content: {
    // Content styles can be customized via contentStyle prop
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
});

// ============================================================================
// EXPORT
// ============================================================================

export { Card };
export default Card;
