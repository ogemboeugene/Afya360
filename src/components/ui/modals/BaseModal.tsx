import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../../../styles/colors';
import { GLOBAL_STYLES, SPACING, BORDER_RADIUS, SHADOWS, TEXT_STYLES } from '../../../styles/globalStyles';

export interface BaseModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  
  // Layout options
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
  position?: 'center' | 'bottom' | 'top';
  
  // Behavior options
  dismissible?: boolean;
  closeOnBackdrop?: boolean;
  showCloseButton?: boolean;
  animationType?: 'fade' | 'slide' | 'none';
  
  // Styling
  backgroundColor?: string;
  borderRadius?: number;
  padding?: number;
  
  // Accessibility
  accessibilityLabel?: string;
  
  // Callbacks
  onShow?: () => void;
  onDismiss?: () => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const BaseModal: React.FC<BaseModalProps> = ({
  visible,
  onClose,
  title,
  subtitle,
  children,
  size = 'medium',
  position = 'center',
  dismissible = true,
  closeOnBackdrop = true,
  showCloseButton = true,
  animationType = 'fade',
  backgroundColor = COLORS.background.primary,
  borderRadius = BORDER_RADIUS.large,
  padding = SPACING.large,
  accessibilityLabel,
  onShow,
  onDismiss,
}) => {
  const scaleValue = React.useRef(new Animated.Value(0)).current;
  const opacityValue = React.useRef(new Animated.Value(0)).current;

  // Animation effects
  React.useEffect(() => {
    if (visible) {
      onShow?.();
      
      Animated.parallel([
        Animated.timing(opacityValue, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleValue, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacityValue, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 0.8,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onDismiss?.();
      });
    }
  }, [visible]);

  const handleBackdropPress = () => {
    if (closeOnBackdrop && dismissible) {
      onClose();
    }
  };

  const handleClose = () => {
    if (dismissible) {
      onClose();
    }
  };

  const getModalSize = () => {
    switch (size) {
      case 'small':
        return {
          width: Math.min(SCREEN_WIDTH * 0.8, 320),
          maxHeight: SCREEN_HEIGHT * 0.4,
        };
      case 'medium':
        return {
          width: Math.min(SCREEN_WIDTH * 0.9, 480),
          maxHeight: SCREEN_HEIGHT * 0.6,
        };
      case 'large':
        return {
          width: Math.min(SCREEN_WIDTH * 0.95, 640),
          maxHeight: SCREEN_HEIGHT * 0.8,
        };
      case 'fullscreen':
        return {
          width: SCREEN_WIDTH,
          height: SCREEN_HEIGHT,
        };
      default:
        return {
          width: Math.min(SCREEN_WIDTH * 0.9, 480),
          maxHeight: SCREEN_HEIGHT * 0.6,
        };
    }
  };

  const getPositionStyle = () => {
    const baseStyle = {
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
    };

    switch (position) {
      case 'top':
        return {
          ...baseStyle,
          justifyContent: 'flex-start' as const,
          paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 20 : 40,
        };
      case 'bottom':
        return {
          ...baseStyle,
          justifyContent: 'flex-end' as const,
          paddingBottom: 20,
        };
      case 'center':
      default:
        return baseStyle;
    }
  };

  const modalSize = getModalSize();
  const positionStyle = getPositionStyle();

  return (
    <Modal
      visible={visible}
      transparent
      animationType={animationType}
      onRequestClose={handleClose}
      statusBarTranslucent
      accessibilityLabel={accessibilityLabel || 'Modal'}
    >
      <TouchableWithoutFeedback onPress={handleBackdropPress}>
        <Animated.View
          style={[
            styles.backdrop,
            positionStyle,
            { opacity: opacityValue }
          ]}
        >
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.modalContainer,
                modalSize,
                {
                  backgroundColor,
                  borderRadius: size === 'fullscreen' ? 0 : borderRadius,
                  padding: size === 'fullscreen' ? 0 : padding,
                  transform: [
                    { scale: size === 'fullscreen' ? 1 : scaleValue }
                  ],
                },
              ]}
            >
              {/* Header */}
              {(title || showCloseButton) && (
                <View style={styles.header}>
                  <View style={styles.headerContent}>
                    {title && (
                      <View style={styles.titleContainer}>
                        <Text style={styles.title}>{title}</Text>
                        {subtitle && (
                          <Text style={styles.subtitle}>{subtitle}</Text>
                        )}
                      </View>
                    )}
                  </View>
                  
                  {showCloseButton && dismissible && (
                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={handleClose}
                      accessibilityLabel="Close modal"
                      accessibilityRole="button"
                    >
                      <Icon
                        name="close"
                        size={24}
                        color={COLORS.text.secondary}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {/* Content */}
              <View style={styles.content}>
                {children}
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    ...SHADOWS.medium,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: SPACING.medium,
  },
  headerContent: {
    flex: 1,
    paddingRight: SPACING.medium,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    ...TEXT_STYLES.heading3,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    ...TEXT_STYLES.body,
    color: COLORS.text.secondary,
  },
  closeButton: {
    padding: SPACING.xs,
    borderRadius: BORDER_RADIUS.medium,
    backgroundColor: COLORS.background.secondary,
  },
  content: {
    flex: 1,
  },
});

// Export default for convenience
export default BaseModal;
