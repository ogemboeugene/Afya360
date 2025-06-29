import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../styles/colors';
import { SPACING, BORDER_RADIUS, TEXT_STYLES } from '../../../styles/globalStyles';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface DropdownOption {
  label: string;
  value: string | number;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
}

export interface DropdownProps {
  options: DropdownOption[];
  selectedValue?: string | number;
  onSelect: (option: DropdownOption) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  label?: string;
  required?: boolean;
  style?: any;
  dropdownStyle?: any;
  maxHeight?: number;
  searchable?: boolean;
  
  // Accessibility
  accessibilityLabel?: string;
  testID?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  options,
  selectedValue,
  onSelect,
  placeholder = 'Select an option',
  disabled = false,
  error,
  label,
  required = false,
  style,
  dropdownStyle,
  maxHeight = SCREEN_HEIGHT * 0.3,
  searchable = false,
  accessibilityLabel,
  testID,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownLayout, setDropdownLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const dropdownRef = useRef<TouchableOpacity>(null);
  const animatedValue = useRef(new Animated.Value(0)).current;

  const selectedOption = options.find(option => option.value === selectedValue);

  const handlePress = () => {
    if (disabled) return;

    dropdownRef.current?.measure((x: number, y: number, width: number, height: number, pageX: number, pageY: number) => {
      setDropdownLayout({ x: pageX, y: pageY + height, width, height });
      setIsOpen(true);
      
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleClose = () => {
    Animated.timing(animatedValue, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setIsOpen(false);
    });
  };

  const handleSelect = (option: DropdownOption) => {
    if (option.disabled) return;
    onSelect(option);
    handleClose();
  };

  const renderOption = ({ item }: { item: DropdownOption }) => (
    <TouchableOpacity
      style={[
        styles.optionItem,
        item.disabled && styles.disabledOption,
        item.value === selectedValue && styles.selectedOption,
      ]}
      onPress={() => handleSelect(item)}
      disabled={item.disabled}
    >
      {item.icon && (
        <Ionicons
          name={item.icon}
          size={18}
          color={
            item.disabled
              ? COLORS.gray400
              : item.value === selectedValue
              ? COLORS.primary500
              : COLORS.gray600
          }
          style={styles.optionIcon}
        />
      )}
      <Text
        style={[
          styles.optionText,
          item.disabled && styles.disabledOptionText,
          item.value === selectedValue && styles.selectedOptionText,
        ]}
      >
        {item.label}
      </Text>
      {item.value === selectedValue && (
        <Ionicons
          name="checkmark"
          size={18}
          color={COLORS.primary500}
        />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, style]}>
      {/* Label */}
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}

      {/* Dropdown trigger */}
      <TouchableOpacity
        ref={dropdownRef}
        style={[
          styles.dropdown,
          disabled && styles.disabledDropdown,
          error && styles.errorDropdown,
          isOpen && styles.openDropdown,
        ]}
        onPress={handlePress}
        disabled={disabled}
        accessibilityLabel={accessibilityLabel || label}
        accessibilityRole="button"
        accessibilityState={{ expanded: isOpen, disabled }}
        testID={testID}
      >
        <View style={styles.dropdownContent}>
          {selectedOption?.icon && (
            <Ionicons
              name={selectedOption.icon}
              size={18}
              color={disabled ? COLORS.gray400 : COLORS.gray600}
              style={styles.selectedIcon}
            />
          )}
          <Text
            style={[
              styles.dropdownText,
              !selectedOption && styles.placeholderText,
              disabled && styles.disabledText,
            ]}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </Text>
        </View>
        <Ionicons
          name={isOpen ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={disabled ? COLORS.gray400 : COLORS.gray600}
        />
      </TouchableOpacity>

      {/* Error message */}
      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Dropdown modal */}
      <Modal
        visible={isOpen}
        transparent
        animationType="none"
        onRequestClose={handleClose}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={handleClose}
        >
          <Animated.View
            style={[
              styles.dropdownList,
              dropdownStyle,
              {
                left: dropdownLayout.x,
                top: dropdownLayout.y,
                width: dropdownLayout.width,
                maxHeight,
                opacity: animatedValue,
                transform: [
                  {
                    scaleY: animatedValue.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <FlatList
              data={options}
              keyExtractor={(item) => item.value.toString()}
              renderItem={renderOption}
              showsVerticalScrollIndicator={false}
              bounces={false}
            />
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  label: {
    ...TEXT_STYLES.label,
    color: COLORS.gray800,
    marginBottom: SPACING.xs,
  },
  required: {
    color: COLORS.error50,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray300,
    borderRadius: BORDER_RADIUS.md,
    minHeight: 48,
  },
  disabledDropdown: {
    backgroundColor: COLORS.gray100,
    borderColor: COLORS.gray200,
  },
  errorDropdown: {
    borderColor: COLORS.error50,
    borderWidth: 2,
  },
  openDropdown: {
    borderColor: COLORS.primary500,
    borderWidth: 2,
  },
  dropdownContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedIcon: {
    marginRight: SPACING.sm,
  },
  dropdownText: {
    ...TEXT_STYLES.body,
    color: COLORS.gray900,
    flex: 1,
  },
  placeholderText: {
    color: COLORS.gray400,
  },
  disabledText: {
    color: COLORS.gray400,
  },
  errorText: {
    ...TEXT_STYLES.caption,
    color: COLORS.error50,
    marginTop: SPACING.xs,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  dropdownList: {
    position: 'absolute',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    elevation: 8,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    minHeight: 44,
  },
  disabledOption: {
    opacity: 0.5,
  },
  selectedOption: {
    backgroundColor: COLORS.primary50,
  },
  optionIcon: {
    marginRight: SPACING.sm,
  },
  optionText: {
    ...TEXT_STYLES.body,
    color: COLORS.gray900,
    flex: 1,
  },
  disabledOptionText: {
    color: COLORS.gray400,
  },
  selectedOptionText: {
    color: COLORS.primary500,
    fontWeight: '600',
  },
});

// Export default for convenience
export default Dropdown;
