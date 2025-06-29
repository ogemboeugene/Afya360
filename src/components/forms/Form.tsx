/**
 * Form Component for Afya360 Healthcare App
 * 
 * A comprehensive form wrapper component that provides validation,
 * error handling, loading states, and accessibility features.
 */

import React, { useState, useCallback, ReactNode } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Button from '../ui/buttons/Button';
import { COLORS } from '../../styles/colors';
import { GLOBAL_STYLES } from '../../styles/globalStyles';

// ============================================================================
// INTERFACES
// ============================================================================

export interface FormField<T = any> {
  name: string;
  value: T;
  error?: string | null;
  isRequired?: boolean;
  validator?: (value: T) => string | null;
}

export interface FormConfig {
  fields: Record<string, FormField>;
  onSubmit: (data: Record<string, any>) => Promise<void>;
  onValidate?: (data: Record<string, any>) => Record<string, string | null>;
  submitButtonText?: string;
  resetButtonText?: string;
  showResetButton?: boolean;
  isLoading?: boolean;
}

interface FormProps {
  config: FormConfig;
  children: ReactNode;
  style?: any;
  contentContainerStyle?: any;
  keyboardDismissMode?: 'none' | 'on-drag' | 'interactive';
  enableAutomaticScroll?: boolean;
  extraHeight?: number;
}

// Simple form props for basic usage
export interface SimpleFormProps {
  children: ReactNode;
  onSubmit?: (data: any) => void | Promise<void>;
  initialValues?: any;
  style?: any;
  contentContainerStyle?: any;
}

// Union type for both form interfaces
export type FormComponentProps = FormProps | SimpleFormProps;

// ============================================================================
// FORM COMPONENT
// ============================================================================

export const Form: React.FC<FormProps> = ({
  config,
  children,
  style,
  contentContainerStyle,
  keyboardDismissMode = 'interactive',
  enableAutomaticScroll = true,
  extraHeight = 150,
}) => {
  const [formData, setFormData] = useState(() => {
    const initialData: Record<string, any> = {};
    Object.keys(config.fields).forEach(key => {
      initialData[key] = config.fields[key].value;
    });
    return initialData;
  });

  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // ============================================================================
  // FORM METHODS
  // ============================================================================

  const updateField = useCallback((name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    setIsDirty(true);
    
    // Clear field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  }, [errors]);

  const validateField = useCallback((name: string, value: any): string | null => {
    const field = config.fields[name];
    if (!field) return null;

    // Check if required field is empty
    if (field.isRequired && (!value || (typeof value === 'string' && value.trim() === ''))) {
      return `${name.charAt(0).toUpperCase() + name.slice(1)} is required`;
    }

    // Run custom validator if provided
    if (field.validator && value) {
      return field.validator(value);
    }

    return null;
  }, [config.fields]);

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string | null> = {};
    let isValid = true;

    // Validate individual fields
    Object.keys(config.fields).forEach(name => {
      const error = validateField(name, formData[name]);
      if (error) {
        newErrors[name] = error;
        isValid = false;
      }
    });

    // Run global form validation if provided
    if (config.onValidate) {
      const globalErrors = config.onValidate(formData);
      Object.keys(globalErrors).forEach(name => {
        if (globalErrors[name]) {
          newErrors[name] = globalErrors[name];
          isValid = false;
        }
      });
    }

    setErrors(newErrors);
    return isValid;
  }, [config.fields, config.onValidate, formData, validateField]);

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      // Validate form
      if (!validateForm()) {
        Alert.alert(
          'Validation Error',
          'Please correct the errors in the form before submitting.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Submit form
      await config.onSubmit(formData);
      
      // Reset dirty state on successful submission
      setIsDirty(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      Alert.alert(
        'Submission Error',
        errorMessage,
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, validateForm, config.onSubmit, formData]);

  const handleReset = useCallback(() => {
    Alert.alert(
      'Reset Form',
      'Are you sure you want to reset the form? All changes will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            const initialData: Record<string, any> = {};
            Object.keys(config.fields).forEach(key => {
              initialData[key] = config.fields[key].value;
            });
            setFormData(initialData);
            setErrors({});
            setIsDirty(false);
          },
        },
      ]
    );
  }, [config.fields]);

  // ============================================================================
  // FORM CONTEXT
  // ============================================================================

  const formContext = {
    formData,
    errors,
    isSubmitting: isSubmitting || config.isLoading,
    isDirty,
    updateField,
    validateField,
    getFieldError: (name: string) => errors[name],
    hasFieldError: (name: string) => Boolean(errors[name]),
  };

  // Clone children and inject form context
  const enhancedChildren = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child as React.ReactElement<any>, {
        formContext,
      });
    }
    return child;
  });

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <KeyboardAwareScrollView
      style={[styles.container, style]}
      contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
      keyboardDismissMode={keyboardDismissMode}
      enableAutomaticScroll={enableAutomaticScroll}
      extraHeight={extraHeight}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.formContent}>
        {enhancedChildren}
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title={config.submitButtonText || 'Submit'}
          onPress={handleSubmit}
          loading={isSubmitting || config.isLoading}
          disabled={isSubmitting || config.isLoading}
          variant="primary"
          size="large"
          style={styles.submitButton}
        />

        {config.showResetButton && (
          <Button
            title={config.resetButtonText || 'Reset'}
            onPress={handleReset}
            disabled={isSubmitting || config.isLoading || !isDirty}
            variant="outline"
            size="large"
            style={styles.resetButton}
          />
        )}
      </View>
    </KeyboardAwareScrollView>
  );
};

// ============================================================================
// SIMPLE FORM COMPONENT
// ============================================================================

const SimpleForm: React.FC<SimpleFormProps> = ({
  children,
  onSubmit,
  initialValues,
  style,
  contentContainerStyle,
}) => {
  return (
    <View style={[styles.container, style]}>
      <KeyboardAwareScrollView
        style={styles.container}
        contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
        keyboardDismissMode="interactive"
        enableAutomaticScroll={true}
        extraHeight={150}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </KeyboardAwareScrollView>
    </View>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  contentContainer: {
    flexGrow: 1,
    padding: GLOBAL_STYLES.SPACING .lg,
  },
  formContent: {
    flex: 1,
    gap: GLOBAL_STYLES.SPACING .md,
  },
  buttonContainer: {
    marginTop: GLOBAL_STYLES.SPACING .xl,
    gap: GLOBAL_STYLES.SPACING .md,
  },
  submitButton: {
    marginHorizontal: 0,
  },
  resetButton: {
    marginHorizontal: 0,
  },
});

// ============================================================================
// EXPORT
// ============================================================================

export { Form as ComplexForm }; // Export complex form with new name
export { SimpleForm }; // Export SimpleForm named
export default SimpleForm; // Export SimpleForm as default
