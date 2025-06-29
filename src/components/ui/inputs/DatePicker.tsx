/**
 * DatePicker Component for Afya360 Healthcare App
 * 
 * A comprehensive date picker component with healthcare-specific features,
 * accessibility support, and validation for medical dates.
 */

import React, { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, Text, Pressable, Platform, Modal } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { SEMANTIC_COLORS } from '../../../styles/colors';
import { GLOBAL_STYLES } from '../../../styles/globalStyles';
import { formatDate, formatDateForDisplay } from '../../../utils';

// ============================================================================
// INTERFACES
// ============================================================================

export interface DatePickerProps {
  value?: Date;
  onDateChange: (date: Date) => void;
  mode?: 'date' | 'time' | 'datetime';
  placeholder?: string;
  label?: string;
  error?: string | null;
  disabled?: boolean;
  required?: boolean;
  minimumDate?: Date;
  maximumDate?: Date;
  style?: any;
  containerStyle?: any;
  
  // Healthcare-specific props
  medicalContext?: 'birth_date' | 'appointment' | 'medication' | 'symptom_onset' | 'last_visit' | 'vaccination';
  showAge?: boolean; // Show calculated age for birth dates
  format?: 'short' | 'medium' | 'long' | 'relative';
  
  // Accessibility
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const calculateAge = (birthDate: Date): string => {
  const today = new Date();
  const birth = new Date(birthDate);
  
  let years = today.getFullYear() - birth.getFullYear();
  let months = today.getMonth() - birth.getMonth();
  
  if (months < 0 || (months === 0 && today.getDate() < birth.getDate())) {
    years--;
    months += 12;
  }
  
  if (today.getDate() < birth.getDate()) {
    months--;
  }
  
  if (years > 0) {
    return years === 1 ? '1 year old' : `${years} years old`;
  } else if (months > 0) {
    return months === 1 ? '1 month old' : `${months} months old`;
  } else {
    const days = Math.floor((today.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));
    return days === 1 ? '1 day old' : `${days} days old`;
  }
};

const getContextualLimits = (context?: string) => {
  const now = new Date();
  const oneHundredYearsAgo = new Date(now.getFullYear() - 100, now.getMonth(), now.getDate());
  const oneYearFromNow = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
  
  switch (context) {
    case 'birth_date':
      return {
        minimumDate: oneHundredYearsAgo,
        maximumDate: now,
      };
    case 'appointment':
      return {
        minimumDate: now,
        maximumDate: oneYearFromNow,
      };
    case 'vaccination':
    case 'last_visit':
      return {
        minimumDate: oneHundredYearsAgo,
        maximumDate: now,
      };
    case 'symptom_onset':
      return {
        minimumDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        maximumDate: now,
      };
    default:
      return {
        minimumDate: oneHundredYearsAgo,
        maximumDate: oneYearFromNow,
      };
  }
};

// ============================================================================
// DATE PICKER COMPONENT
// ============================================================================

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onDateChange,
  mode = 'date',
  placeholder,
  label,
  error,
  disabled = false,
  required = false,
  minimumDate,
  maximumDate,
  style,
  containerStyle,
  medicalContext,
  showAge = false,
  format = 'medium',
  accessibilityLabel,
  accessibilityHint,
}) => {
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const [tempDate, setTempDate] = useState<Date | undefined>(value);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const contextualLimits = useMemo(() => {
    return getContextualLimits(medicalContext);
  }, [medicalContext]);

  const effectiveMinimumDate = minimumDate || contextualLimits.minimumDate;
  const effectiveMaximumDate = maximumDate || contextualLimits.maximumDate;

  const displayValue = useMemo(() => {
    if (!value) return '';
    
    switch (format) {
      case 'short':
        return formatDate(value, 'MM/dd/yyyy');
      case 'long':
        return formatDate(value, 'EEEE, MMMM d, yyyy');
      case 'relative':
        return formatDateForDisplay(value);
      case 'medium':
      default:
        return formatDate(value, 'MMM d, yyyy');
    }
  }, [value, format]);

  const ageDisplay = useMemo(() => {
    if (!showAge || !value || medicalContext !== 'birth_date') return '';
    return calculateAge(value);
  }, [showAge, value, medicalContext]);

  const placeholderText = useMemo(() => {
    if (placeholder) return placeholder;
    
    switch (medicalContext) {
      case 'birth_date':
        return 'Select date of birth';
      case 'appointment':
        return 'Select appointment date';
      case 'vaccination':
        return 'Select vaccination date';
      case 'symptom_onset':
        return 'When did symptoms start?';
      case 'last_visit':
        return 'Select last visit date';
      default:
        return 'Select date';
    }
  }, [placeholder, medicalContext]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handlePress = useCallback(() => {
    if (disabled) return;
    setTempDate(value || new Date());
    setIsPickerVisible(true);
  }, [disabled, value]);

  const handleDateChange = useCallback((event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setIsPickerVisible(false);
    }
    
    if (event.type === 'set' && selectedDate) {
      if (Platform.OS === 'ios') {
        setTempDate(selectedDate);
      } else {
        onDateChange(selectedDate);
      }
    }
  }, [onDateChange]);

  const handleConfirm = useCallback(() => {
    if (tempDate) {
      onDateChange(tempDate);
    }
    setIsPickerVisible(false);
  }, [tempDate, onDateChange]);

  const handleCancel = useCallback(() => {
    setTempDate(value);
    setIsPickerVisible(false);
  }, [value]);

  // ============================================================================
  // RENDER METHODS
  // ============================================================================

  const renderDatePicker = () => {
    if (Platform.OS === 'android') {
      return (
        isPickerVisible && (
          <DateTimePicker
            value={tempDate || new Date()}
            mode={mode}
            display="default"
            onChange={handleDateChange}
            minimumDate={effectiveMinimumDate}
            maximumDate={effectiveMaximumDate}
          />
        )
      );
    }

    return (
      <Modal
        visible={isPickerVisible}
        transparent
        animationType="slide"
        onRequestClose={handleCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Pressable onPress={handleCancel} style={styles.modalButton}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </Pressable>
              <Text style={styles.modalTitle}>
                {medicalContext === 'birth_date' ? 'Date of Birth' : 'Select Date'}
              </Text>
              <Pressable onPress={handleConfirm} style={styles.modalButton}>
                <Text style={[styles.modalButtonText, styles.confirmButton]}>Done</Text>
              </Pressable>
            </View>
            
            <DateTimePicker
              value={tempDate || new Date()}
              mode={mode}
              display="spinner"
              onChange={handleDateChange}
              minimumDate={effectiveMinimumDate}
              maximumDate={effectiveMaximumDate}
              style={styles.picker}
            />
          </View>
        </View>
      </Modal>
    );
  };

  const renderIcon = () => {
    let iconName: keyof typeof Ionicons.glyphMap = 'calendar-outline';
    
    switch (medicalContext) {
      case 'birth_date':
        iconName = 'person-outline';
        break;
      case 'appointment':
        iconName = 'medical-outline';
        break;
      case 'vaccination':
        iconName = 'medical-outline';
        break;
      case 'symptom_onset':
        iconName = 'time-outline';
        break;
      default:
        iconName = 'calendar-outline';
    }

    return (
      <Ionicons
        name={iconName}
        size={20}
        color={disabled ? SEMANTIC_COLORS.text.disabled : SEMANTIC_COLORS.text.secondary}
      />
    );
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  const hasError = Boolean(error);
  const isEmpty = !value;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}
      
      <Pressable
        onPress={handlePress}
        disabled={disabled}
        style={[
          styles.inputContainer,
          hasError && styles.inputError,
          disabled && styles.inputDisabled,
          style,
        ]}
        accessibilityLabel={accessibilityLabel || label || placeholderText}
        accessibilityHint={accessibilityHint || 'Double tap to open date picker'}
        accessibilityRole="button"
        accessibilityState={{
          disabled,
          selected: !isEmpty,
        }}
      >
        <View style={styles.inputContent}>
          <Text
            style={[
              styles.inputText,
              isEmpty && styles.placeholderText,
              disabled && styles.disabledText,
            ]}
            numberOfLines={1}
          >
            {displayValue || placeholderText}
          </Text>
          
          {ageDisplay && (
            <Text style={styles.ageText}>({ageDisplay})</Text>
          )}
        </View>
        
        <View style={styles.iconContainer}>
          {renderIcon()}
        </View>
      </Pressable>

      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={16} color={SEMANTIC_COLORS.text.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {renderDatePicker()}
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
  label: {
    ...GLOBAL_STYLES.TEXT_STYLES.label,
    marginBottom: GLOBAL_STYLES.SPACING.xs,
  },
  required: {
    color: SEMANTIC_COLORS.text.error,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SEMANTIC_COLORS.input.background,
    borderWidth: 1,
    borderColor: SEMANTIC_COLORS.border.primary,
    borderRadius: GLOBAL_STYLES.BORDER_RADIUS.md,
    paddingHorizontal: GLOBAL_STYLES.SPACING.padding.input,
    paddingVertical: GLOBAL_STYLES.SPACING.padding.input,
    minHeight: GLOBAL_STYLES.LAYOUT.inputHeight,
  },
  inputError: {
    borderColor: SEMANTIC_COLORS.border.error,
  },
  inputDisabled: {
    backgroundColor: SEMANTIC_COLORS.input.disabled,
    opacity: 0.6,
  },
  inputContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: GLOBAL_STYLES.SPACING.xs,
  },
  inputText: {
    ...GLOBAL_STYLES.TEXT_STYLES.body,
    color: SEMANTIC_COLORS.text.primary,
    flex: 1,
  },
  placeholderText: {
    color: SEMANTIC_COLORS.text.tertiary,
  },
  disabledText: {
    color: SEMANTIC_COLORS.text.disabled,
  },
  ageText: {
    ...GLOBAL_STYLES.TEXT_STYLES.caption,
    color: SEMANTIC_COLORS.text.secondary,
    fontStyle: 'italic',
  },
  iconContainer: {
    marginLeft: GLOBAL_STYLES.SPACING.sm,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: GLOBAL_STYLES.SPACING.xs,
    marginTop: GLOBAL_STYLES.SPACING.xs,
  },
  errorText: {
    ...GLOBAL_STYLES.TEXT_STYLES.caption,
    color: SEMANTIC_COLORS.text.error,
    flex: 1,
  },
  
  // Modal styles for iOS
  modalOverlay: {
    flex: 1,
    backgroundColor: SEMANTIC_COLORS.background.modal,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: SEMANTIC_COLORS.background.primary,
    borderTopLeftRadius: GLOBAL_STYLES.BORDER_RADIUS.lg,
    borderTopRightRadius: GLOBAL_STYLES.BORDER_RADIUS.lg,
    paddingBottom: GLOBAL_STYLES.LAYOUT.safeAreaBottom,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: GLOBAL_STYLES.SPACING.lg,
    paddingVertical: GLOBAL_STYLES.SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: SEMANTIC_COLORS.border.primary,
  },
  modalTitle: {
    ...GLOBAL_STYLES.TEXT_STYLES.h3,
    color: SEMANTIC_COLORS.text.primary,
  },
  modalButton: {
    paddingVertical: GLOBAL_STYLES.SPACING.xs,
    paddingHorizontal: GLOBAL_STYLES.SPACING.sm,
  },
  modalButtonText: {
    ...GLOBAL_STYLES.TEXT_STYLES.body,
    color: SEMANTIC_COLORS.text.link,
  },
  confirmButton: {
    fontWeight: '600',
  },
  picker: {
    backgroundColor: SEMANTIC_COLORS.background.primary,
  },
});

// ============================================================================
// EXPORT
// ============================================================================

export default DatePicker;
