/**
 * TextInput Component
 * A versatile, healthcare-focused text input component for the Afya360 app
 */

import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import {
  View,
  TextInput as RNTextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInputProps as RNTextInputProps,
  ViewStyle,
  TextStyle,
  Animated,
} from 'react-native';
import { COLORS } from '../../../styles/colors';
import { GLOBAL_STYLES } from '../../../styles/globalStyles';
import { CustomIcon, IconLibrary } from '../../common/CustomIcon';

export type TextInputVariant = 'default' | 'outlined' | 'filled' | 'underlined';
export type TextInputSize = 'small' | 'medium' | 'large';
export type TextInputStatus = 'default' | 'error' | 'success' | 'warning';

export interface TextInputRef {
  focus: () => void;
  blur: () => void;
  clear: () => void;
  isFocused: () => boolean;
}

export interface TextInputProps extends Omit<RNTextInputProps, 'style'> {
  label?: string;
  helperText?: string;
  errorText?: string;
  successText?: string;
  warningText?: string;
  variant?: TextInputVariant;
  size?: TextInputSize;
  status?: TextInputStatus;
  required?: boolean;
  disabled?: boolean;
  leftIcon?: string;
  leftIconLibrary?: IconLibrary;
  rightIcon?: string;
  rightIconLibrary?: IconLibrary;
  onRightIconPress?: () => void;
  showCharacterCount?: boolean;
  maxCharacters?: number;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  helperTextStyle?: TextStyle;
  animateLabel?: boolean;
  style?: TextStyle;
}

const TextInput = forwardRef<TextInputRef, TextInputProps>(({
  label,
  helperText,
  errorText,
  successText,
  warningText,
  variant = 'outlined',
  size = 'medium',
  status = 'default',
  required = false,
  disabled = false,
  leftIcon,
  leftIconLibrary = 'MaterialIcons',
  rightIcon,
  rightIconLibrary = 'MaterialIcons',
  onRightIconPress,
  showCharacterCount = false,
  maxCharacters,
  containerStyle,
  inputStyle,
  labelStyle,
  helperTextStyle,
  animateLabel = true,
  style,
  value,
  onChangeText,
  onFocus,
  onBlur,
  placeholder,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [internalValue, setInternalValue] = useState(value || '');
  const inputRef = useRef<RNTextInput>(null);
  const labelAnimation = useRef(new Animated.Value(value ? 1 : 0)).current;

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    blur: () => inputRef.current?.blur(),
    clear: () => {
      setInternalValue('');
      onChangeText?.('');
    },
    isFocused: () => isFocused,
  }));

  // Handle input focus
  const handleFocus = (e: any) => {
    setIsFocused(true);
    
    if (animateLabel && label) {
      Animated.timing(labelAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
    
    onFocus?.(e);
  };

  // Handle input blur
  const handleBlur = (e: any) => {
    setIsFocused(false);
    
    if (animateLabel && label && !internalValue) {
      Animated.timing(labelAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
    
    onBlur?.(e);
  };

  // Handle text change
  const handleChangeText = (text: string) => {
    setInternalValue(text);
    onChangeText?.(text);
    
    // Animate label if needed
    if (animateLabel && label) {
      Animated.timing(labelAnimation, {
        toValue: text ? 1 : (isFocused ? 1 : 0),
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  };

  // Determine current status
  const getCurrentStatus = (): TextInputStatus => {
    if (errorText) return 'error';
    if (successText) return 'success';
    if (warningText) return 'warning';
    return status;
  };

  const currentStatus = getCurrentStatus();

  // Get variant styles
  const getVariantStyles = () => {
    const baseStyles = {
      container: {} as ViewStyle,
      input: {} as ViewStyle,
    };

    switch (variant) {
      case 'outlined':
        baseStyles.container = {
          borderWidth: 1,
          borderRadius: GLOBAL_STYLES.BORDER_RADIUS.md,
          borderColor: getStatusColor(currentStatus, isFocused),
          backgroundColor: disabled ? COLORS.gray100 : COLORS.white,
        };
        baseStyles.input = {
          paddingLeft: 12,
          paddingRight: 12,
        };
        break;

      case 'filled':
        baseStyles.container = {
          borderWidth: 0,
          borderBottomWidth: 2,
          borderRadius: GLOBAL_STYLES.BORDER_RADIUS.sm,
          borderBottomColor: getStatusColor(currentStatus, isFocused),
          backgroundColor: disabled ? COLORS.gray100 : COLORS.gray50,
        };
        baseStyles.input = {
          paddingLeft: 12,
          paddingRight: 12,
        };
        break;

      case 'underlined':
        baseStyles.container = {
          borderWidth: 0,
          borderBottomWidth: 2,
          borderBottomColor: getStatusColor(currentStatus, isFocused),
          backgroundColor: 'transparent',
        };
        baseStyles.input = {
          paddingLeft: 4,
          paddingRight: 4,
        };
        break;

      case 'default':
        baseStyles.container = {
          borderWidth: 1,
          borderRadius: GLOBAL_STYLES.BORDER_RADIUS.sm,
          borderColor: getStatusColor(currentStatus, isFocused),
          backgroundColor: disabled ? COLORS.gray100 : COLORS.white,
        };
        baseStyles.input = {
          paddingLeft: 8,
          paddingRight: 8,
        };
        break;
    }

    return baseStyles;
  };

  // Get size styles
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          container: { minHeight: 32 },
          input: { fontSize: 14, paddingVertical: 6 },
          icon: 16,
        };

      case 'medium':
        return {
          container: { minHeight: 44 },
          input: { fontSize: 16, paddingVertical: 10 },
          icon: 20,
        };

      case 'large':
        return {
          container: { minHeight: 52 },
          input: { fontSize: 18, paddingVertical: 14 },
          icon: 24,
        };

      default:
        return {
          container: { minHeight: 44 },
          input: { fontSize: 16, paddingVertical: 10 },
          icon: 20,
        };
    }
  };

  // Get status color
  function getStatusColor(status: TextInputStatus, focused: boolean): string {
    if (focused) {
      switch (status) {
        case 'error': return COLORS.error500;
        case 'success': return COLORS.success500;
        case 'warning': return COLORS.warning500;
        default: return COLORS.primary500;
      }
    }

    switch (status) {
      case 'error': return COLORS.error500;
      case 'success': return COLORS.success500;
      case 'warning': return COLORS.warning500;
      default: return COLORS.gray400;
    }
  }

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  // Helper text to display
  const getHelperText = () => {
    if (errorText) return errorText;
    if (successText) return successText;
    if (warningText) return warningText;
    return helperText;
  };

  // Helper text color
  const getHelperTextColor = () => {
    if (errorText) return COLORS.error500;
    if (successText) return COLORS.success500;
    if (warningText) return COLORS.warning500;
    return COLORS.gray600;
  };

  // Character count
  const characterCount = internalValue.length;
  const isOverLimit = maxCharacters ? characterCount > maxCharacters : false;

  // Animated label styles
  const animatedLabelStyle = animateLabel && label ? {
    top: labelAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [sizeStyles.container.minHeight / 2 - 10, -8],
    }),
    fontSize: labelAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [sizeStyles.input.fontSize, 12],
    }),
    color: labelAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [COLORS.gray500, getStatusColor(currentStatus, isFocused)],
    }),
  } : {};

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {/* Static Label (when not animated) */}
      {label && !animateLabel && (
        <Text style={[styles.label, labelStyle]}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}

      {/* Input Container */}
      <View style={[
        styles.container,
        variantStyles.container,
        sizeStyles.container,
        disabled && styles.disabled,
      ]}>
        {/* Animated Label */}
        {label && animateLabel && (
          <Animated.Text
            style={[
              styles.animatedLabel,
              animatedLabelStyle,
              labelStyle,
            ]}
            pointerEvents="none"
          >
            {label}
            {required && <Text style={styles.required}> *</Text>}
          </Animated.Text>
        )}

        {/* Left Icon */}
        {leftIcon && (
          <CustomIcon
            name={leftIcon}
            library={leftIconLibrary}
            size={20}
            color={getStatusColor(currentStatus, isFocused)}
            style={styles.leftIcon}
          />
        )}

        {/* Text Input */}
        <RNTextInput
          ref={inputRef}
          style={[
            styles.input,
            variantStyles.input,
            sizeStyles.input,
            inputStyle,
            style,
            leftIcon && {
              paddingLeft: 48,
              marginLeft: 0,
            },
            rightIcon && styles.inputWithRightIcon,
          ]}
          value={internalValue}
          onChangeText={handleChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={animateLabel ? undefined : placeholder}
          placeholderTextColor={COLORS.gray500}
          editable={!disabled}
          maxLength={maxCharacters}
          {...props}
        />

        {/* Right Icon */}
        {rightIcon && (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={styles.rightIconContainer}
            disabled={!onRightIconPress}
          >
            <CustomIcon
              name={rightIcon}
              library={rightIconLibrary}
              size={20}
              color={getStatusColor(currentStatus, isFocused)}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Helper Text and Character Count */}
      <View style={styles.helperContainer}>
        {getHelperText() && (
          <Text style={[
            styles.helperText,
            { color: getHelperTextColor() },
            helperTextStyle,
          ]}>
            {getHelperText()}
          </Text>
        )}

        {showCharacterCount && maxCharacters && (
          <Text style={[
            styles.characterCount,
            isOverLimit && styles.characterCountError,
          ]}>
            {characterCount}/{maxCharacters}
          </Text>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.gray800,
    marginBottom: 6,
  },
  required: {
    color: COLORS.error500,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  animatedLabel: {
    position: 'absolute',
    left: 48,
    fontWeight: '500',
    backgroundColor: COLORS.white,
    paddingHorizontal: 4,
    zIndex: 1,
  },
  input: {
    flex: 1,
    color: COLORS.gray800,
    includeFontPadding: false,
  },
  inputWithLeftIcon: {
    paddingLeft: 80,
    marginLeft: 0,
  },
  inputWithRightIcon: {
    paddingRight: 40,
  },
  leftIcon: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
    fontSize: 16,
  },
  rightIcon: {
    fontSize: 16,
  },
  rightIconContainer: {
    position: 'absolute',
    right: 12,
    padding: 4,
  },
  disabled: {
    opacity: 0.6,
  },
  helperContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  helperText: {
    fontSize: 12,
    flex: 1,
  },
  characterCount: {
    fontSize: 12,
    color: COLORS.gray500,
    marginLeft: 8,
  },
  characterCountError: {
    color: COLORS.error500,
  },
});

TextInput.displayName = 'TextInput';

export { TextInput };
export default TextInput;
