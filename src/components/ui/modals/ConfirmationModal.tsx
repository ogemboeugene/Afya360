import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BaseModal, BaseModalProps } from './BaseModal';
import { Button } from '../buttons/Button';
import { COLORS } from '../../../styles/colors';
import { GLOBAL_STYLES } from '../../../styles/globalStyles';

export interface ConfirmationModalProps extends Omit<BaseModalProps, 'children'> {
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmButtonVariant?: 'primary' | 'secondary' | 'outline' | 'text' | 'danger';
  cancelButtonVariant?: 'primary' | 'secondary' | 'outline' | 'text' | 'danger';
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  isLoading?: boolean;
  destructive?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmButtonVariant = 'primary',
  cancelButtonVariant = 'outline',
  icon,
  iconColor,
  onConfirm,
  onCancel,
  isLoading = false,
  destructive = false,
  ...modalProps
}) => {
  const handleConfirm = () => {
    onConfirm();
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      modalProps.onClose();
    }
  };

  const getIconColor = () => {
    if (iconColor) return iconColor;
    if (destructive) return COLORS.feedback.error;
    return COLORS.primary.main;
  };

  const getConfirmVariant = () => {
    if (destructive) return 'danger';
    return confirmButtonVariant;
  };

  return (
    <BaseModal
      {...modalProps}
      size="small"
      position="center"
    >
      <View style={styles.container}>
        {/* Icon */}
        {icon && (
          <View style={styles.iconContainer}>
            <Ionicons
              name={icon}
              size={48}
              color={getIconColor()}
            />
          </View>
        )}

        {/* Message */}
        <Text style={styles.message}>{message}</Text>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title={cancelText}
            variant={cancelButtonVariant}
            size="medium"
            onPress={handleCancel}
            style={styles.cancelButton}
            disabled={isLoading}
          />
          <Button
            title={confirmText}
            variant={getConfirmVariant()}
            size="medium"
            onPress={handleConfirm}
            style={styles.confirmButton}
            loading={isLoading}
            disabled={isLoading}
          />
        </View>
      </View>
    </BaseModal>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: GLOBAL_STYLES.spacing.large,
  },
  message: {
    ...GLOBAL_STYLES.text.body,
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: GLOBAL_STYLES.spacing.xl,
    lineHeight: 24,
  },
  actions: {
    flexDirection: 'row',
    gap: GLOBAL_STYLES.spacing.medium,
    width: '100%',
  },
  cancelButton: {
    flex: 1,
  },
  confirmButton: {
    flex: 1,
  },
});

// Export default for convenience
export default ConfirmationModal;
