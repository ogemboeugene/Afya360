/**
 * PasswordInput Component for Afya360 Healthcare App
 * 
 * A specialized text input component for password fields with
 * show/hide functionality, strength indicator, and security features.
 */

import React, { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TextInput, TextInputProps } from './TextInput';
import { COLORS } from '../../../styles/colors';
import { GLOBAL_STYLES } from '../../../styles/globalStyles';
import { validatePassword } from '../../../utils/validation';

// ============================================================================
// INTERFACES
// ============================================================================

export interface PasswordStrength {
  score: number; // 0-5
  label: 'Very Weak' | 'Weak' | 'Fair' | 'Good' | 'Strong' | 'Very Strong';
  color: string;
  suggestions: string[];
}

interface PasswordInputProps extends Omit<TextInputProps, 'secureTextEntry'> {
  showStrengthIndicator?: boolean;
  showRequirements?: boolean;
  minLength?: number;
  requireUppercase?: boolean;
  requireLowercase?: boolean;
  requireNumbers?: boolean;
  requireSpecialChars?: boolean;
  onStrengthChange?: (strength: PasswordStrength) => void;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const calculatePasswordStrength = (
  password: string,
  requirements: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
  }
): PasswordStrength => {
  let score = 0;
  const suggestions: string[] = [];

  // Length check
  if (password.length >= requirements.minLength) {
    score += 1;
  } else {
    suggestions.push(`Use at least ${requirements.minLength} characters`);
  }

  // Uppercase check
  if (requirements.requireUppercase) {
    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      suggestions.push('Include uppercase letters');
    }
  }

  // Lowercase check
  if (requirements.requireLowercase) {
    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      suggestions.push('Include lowercase letters');
    }
  }

  // Numbers check
  if (requirements.requireNumbers) {
    if (/\d/.test(password)) {
      score += 1;
    } else {
      suggestions.push('Include numbers');
    }
  }

  // Special characters check
  if (requirements.requireSpecialChars) {
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\?]/.test(password)) {
      score += 1;
    } else {
      suggestions.push('Include special characters (!@#$%^&*)');
    }
  }

  // Additional strength factors
  if (password.length >= 12) score += 0.5;
  if (password.length >= 16) score += 0.5;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\?]/.test(password) && password.length >= 8) score += 0.5;

  const maxScore = 5;
  const normalizedScore = Math.min(score, maxScore);

  let label: PasswordStrength['label'];
  let color: string;

  if (normalizedScore < 1) {
    label = 'Very Weak';
    color = COLORS.error500;
  } else if (normalizedScore < 2) {
    label = 'Weak';
    color = COLORS.warning500;
  } else if (normalizedScore < 3) {
    label = 'Fair';
    color = COLORS.accent500;
  } else if (normalizedScore < 4) {
    label = 'Good';
    color = COLORS.primary400;
  } else if (normalizedScore < 5) {
    label = 'Strong';
    color = COLORS.success500;
  } else {
    label = 'Very Strong';
    color = COLORS.primary500;
  }

  return {
    score: normalizedScore,
    label,
    color,
    suggestions,
  };
};

// ============================================================================
// PASSWORD INPUT COMPONENT
// ============================================================================

export const PasswordInput: React.FC<PasswordInputProps> = ({
  value = '',
  onChangeText,
  placeholder = 'Enter password',
  showStrengthIndicator = false,
  showRequirements = false,
  minLength = 8,
  requireUppercase = true,
  requireLowercase = true,
  requireNumbers = true,
  requireSpecialChars = true,
  onStrengthChange,
  style,
  errorText,
  ...props
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const requirements = useMemo(() => ({
    minLength,
    requireUppercase,
    requireLowercase,
    requireNumbers,
    requireSpecialChars,
  }), [minLength, requireUppercase, requireLowercase, requireNumbers, requireSpecialChars]);

  const passwordStrength = useMemo(() => {
    if (!value || !showStrengthIndicator) return null;
    return calculatePasswordStrength(value, requirements);
  }, [value, showStrengthIndicator, requirements]);

  const validationError = useMemo(() => {
    if (!value) return null;
    const validation = validatePassword(value);
    
    // Handle different validation result types
    if (typeof validation === 'string') {
      return validation;
    }
    
    if (validation && typeof validation === 'object' && 'isValid' in validation) {
      return validation.isValid ? null : validation.errors?.[0] || 'Password validation failed';
    }
    
    return null;
  }, [value]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const togglePasswordVisibility = useCallback(() => {
    setIsPasswordVisible(prev => !prev);
  }, []);

  const handleChangeText = useCallback((text: string) => {
    onChangeText?.(text);
    
    if (showStrengthIndicator && onStrengthChange && text) {
      const strength = calculatePasswordStrength(text, requirements);
      onStrengthChange(strength);
    }
  }, [onChangeText, showStrengthIndicator, onStrengthChange, requirements]);

  // ============================================================================
  // RENDER COMPONENTS
  // ============================================================================

  const renderStrengthIndicator = () => {
    if (!showStrengthIndicator || !passwordStrength || !value) return null;

    return (
      <View style={styles.strengthContainer}>
        <View style={styles.strengthHeader}>
          <Text style={styles.strengthLabel}>Password Strength</Text>
          <Text style={[styles.strengthValue, { color: passwordStrength.color }]}>
            {passwordStrength.label}
          </Text>
        </View>
        
        <View style={styles.strengthBar}>
          {[...Array(5)].map((_, index) => (
            <View
              key={index}
              style={[
                styles.strengthSegment,
                {
                  backgroundColor: index < passwordStrength.score
                    ? passwordStrength.color
                    : COLORS.gray200,
                },
              ]}
            />
          ))}
        </View>

        {passwordStrength.suggestions.length > 0 && (
          <View style={styles.suggestionsContainer}>
            {passwordStrength.suggestions.map((suggestion, index) => (
              <Text key={index} style={styles.suggestionText}>
                • {suggestion}
              </Text>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderRequirements = () => {
    if (!showRequirements || !value) return null;

    const checks = [
      {
        label: `At least ${minLength} characters`,
        met: value.length >= minLength,
      },
      {
        label: 'Uppercase letter',
        met: /[A-Z]/.test(value),
        required: requireUppercase,
      },
      {
        label: 'Lowercase letter',
        met: /[a-z]/.test(value),
        required: requireLowercase,
      },
      {
        label: 'Number',
        met: /\d/.test(value),
        required: requireNumbers,
      },
      {
        label: 'Special character',
        met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\?]/.test(value),
        required: requireSpecialChars,
      },
    ].filter(check => check.required !== false);

    return (
      <View style={styles.requirementsContainer}>
        <Text style={styles.requirementsTitle}>Password Requirements</Text>
        {checks.map((check, index) => (
          <View key={index} style={styles.requirementItem}>
            <Ionicons
              name={check.met ? 'checkmark-circle' : 'ellipse-outline'}
              size={16}
              color={check.met ? COLORS.success500 : COLORS.gray400}
            />
            <Text
              style={[
                styles.requirementText,
                { color: check.met ? COLORS.gray900 : COLORS.gray400 },
              ]}
            >
              {check.label}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <View style={[styles.container, style]}>
      <TextInput
        {...props}
        value={value}
        onChangeText={handleChangeText}
        placeholder={placeholder}
        secureTextEntry={!isPasswordVisible}
        autoCapitalize="none"
        autoCorrect={false}
        textContentType="password"
        errorText={errorText || validationError || undefined}
        rightIcon={isPasswordVisible ? 'eye-off' : 'eye'}
        onRightIconPress={togglePasswordVisibility}
      />
      
      {renderStrengthIndicator()}
      {renderRequirements()}
    </View>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  strengthContainer: {
    marginTop: GLOBAL_STYLES.SPACING.sm,
  },
  strengthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: GLOBAL_STYLES.SPACING.xs,
  },
  strengthLabel: {
    ...GLOBAL_STYLES.TEXT_STYLES.caption,
    color: COLORS.gray600,
  },
  strengthValue: {
    ...GLOBAL_STYLES.TEXT_STYLES.caption,
    fontWeight: '600',
  },
  strengthBar: {
    flexDirection: 'row',
    gap: GLOBAL_STYLES.SPACING.xs,
    marginBottom: GLOBAL_STYLES.SPACING.sm,
  },
  strengthSegment: {
    flex: 1,
    height: 4,
    borderRadius: GLOBAL_STYLES.BORDER_RADIUS.xs,
  },
  suggestionsContainer: {
    gap: GLOBAL_STYLES.SPACING.xs,
  },
  suggestionText: {
    ...GLOBAL_STYLES.TEXT_STYLES.caption,
    color: COLORS.gray600,
  },
  requirementsContainer: {
    marginTop: GLOBAL_STYLES.SPACING.sm,
    padding: GLOBAL_STYLES.SPACING.sm,
    backgroundColor: COLORS.gray50,
    borderRadius: GLOBAL_STYLES.BORDER_RADIUS.md,
  },
  requirementsTitle: {
    ...GLOBAL_STYLES.TEXT_STYLES.caption,
    fontWeight: '600',
    color: COLORS.gray900,
    marginBottom: GLOBAL_STYLES.SPACING.xs,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: GLOBAL_STYLES.SPACING.xs,
    marginBottom: GLOBAL_STYLES.SPACING.xs,
  },
  requirementText: {
    ...GLOBAL_STYLES.TEXT_STYLES.caption,
    flex: 1,
  },
});

// ============================================================================
// EXPORT
// ============================================================================

export default PasswordInput;
