import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BaseModal, BaseModalProps } from './BaseModal';
import { COLORS } from '../../../styles/colors';
import { SPACING, BORDER_RADIUS, TEXT_STYLES } from '../../../styles/globalStyles';

export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
  icon?: string; // Material Icons name
  description?: string;
}

export interface SelectModalProps extends Omit<BaseModalProps, 'children'> {
  options: SelectOption[];
  selectedValue?: string | number;
  onSelect: (option: SelectOption) => void;
  placeholder?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  multiSelect?: boolean;
  selectedValues?: (string | number)[];
  onMultiSelect?: (options: SelectOption[]) => void;
  emptyMessage?: string;
  maxHeight?: number;
}

export const SelectModal: React.FC<SelectModalProps> = ({
  options,
  selectedValue,
  onSelect,
  placeholder = 'Select an option',
  searchable = false,
  searchPlaceholder = 'Search options...',
  multiSelect = false,
  selectedValues = [],
  onMultiSelect,
  emptyMessage = 'No options available',
  maxHeight = 400,
  ...modalProps
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<(string | number)[]>(selectedValues);

  // Filter options based on search query
  const filteredOptions = React.useMemo(() => {
    if (!searchQuery.trim()) return options;
    
    const query = searchQuery.toLowerCase();
    return options.filter(option =>
      option.label.toLowerCase().includes(query) ||
      option.description?.toLowerCase().includes(query)
    );
  }, [options, searchQuery]);

  const handleSingleSelect = (option: SelectOption) => {
    if (option.disabled) return;
    onSelect(option);
    modalProps.onClose();
  };

  const handleMultiSelect = (option: SelectOption) => {
    if (option.disabled) return;

    let newSelectedItems: (string | number)[];
    
    if (selectedItems.includes(option.value)) {
      newSelectedItems = selectedItems.filter(value => value !== option.value);
    } else {
      newSelectedItems = [...selectedItems, option.value];
    }

    setSelectedItems(newSelectedItems);
    
    if (onMultiSelect) {
      const selectedOptions = options.filter(opt => 
        newSelectedItems.includes(opt.value)
      );
      onMultiSelect(selectedOptions);
    }
  };

  const isSelected = (value: string | number): boolean => {
    if (multiSelect) {
      return selectedItems.includes(value);
    }
    return selectedValue === value;
  };

  const renderOption = ({ item }: { item: SelectOption }) => {
    const selected = isSelected(item.value);
    
    return (
      <TouchableOpacity
        style={[
          styles.option,
          selected && styles.selectedOption,
          item.disabled && styles.disabledOption,
        ]}
        onPress={() => {
          if (multiSelect) {
            handleMultiSelect(item);
          } else {
            handleSingleSelect(item);
          }
        }}
        disabled={item.disabled}
        accessibilityRole="button"
        accessibilityState={{ selected }}
      >
        <View style={styles.optionContent}>
          {/* Icon */}
          {item.icon && (
            <View style={styles.optionIcon}>
              <Icon
                name={item.icon}
                size={20}
                color={
                  item.disabled
                    ? COLORS.gray400
                    : selected
                    ? COLORS.primary500
                    : COLORS.gray600
                }
              />
            </View>
          )}

          {/* Text content */}
          <View style={styles.optionText}>
            <Text
              style={[
                styles.optionLabel,
                selected && styles.selectedOptionLabel,
                item.disabled && styles.disabledOptionLabel,
              ]}
            >
              {item.label}
            </Text>
            {item.description && (
              <Text
                style={[
                  styles.optionDescription,
                  item.disabled && styles.disabledOptionDescription,
                ]}
              >
                {item.description}
              </Text>
            )}
          </View>

          {/* Selection indicator */}
          <View style={styles.selectionIndicator}>
            {multiSelect ? (
              <Icon
                name={selected ? 'check-box' : 'check-box-outline-blank'}
                size={20}
                color={
                  selected
                    ? COLORS.primary500
                    : COLORS.gray600
                }
              />
            ) : (
              selected && (
                <Icon
                  name="check"
                  size={20}
                  color={COLORS.primary500}
                />
              )
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <BaseModal
      {...modalProps}
      size="large"
      title={modalProps.title || placeholder}
    >
      <View style={styles.container}>
        {/* Search input */}
        {searchable && (
          <View style={styles.searchContainer}>
            <Icon
              name="search"
              size={20}
              color={COLORS.gray600}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder={searchPlaceholder}
              placeholderTextColor={COLORS.gray400}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCorrect={false}
              clearButtonMode="while-editing"
            />
          </View>
        )}

        {/* Options list */}
        <View style={[styles.listContainer, { maxHeight }]}>
          {filteredOptions.length > 0 ? (
            <FlatList
              data={filteredOptions}
              keyExtractor={(item) => item.value.toString()}
              renderItem={renderOption}
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyMessage}>{emptyMessage}</Text>
            </View>
          )}
        </View>

        {/* Multi-select actions */}
        {multiSelect && (
          <View style={styles.multiSelectActions}>
            <Text style={styles.selectionCount}>
              {selectedItems.length} selected
            </Text>
          </View>
        )}
      </View>
    </BaseModal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray100,
    borderRadius: BORDER_RADIUS.medium,
    paddingHorizontal: SPACING.medium,
    marginBottom: SPACING.medium,
    height: 48,
  },
  searchIcon: {
    marginRight: SPACING.small,
  },
  searchInput: {
    flex: 1,
    ...TEXT_STYLES.body,
    color: COLORS.gray900,
    height: '100%',
  },
  listContainer: {
    flex: 1,
  },
  option: {
    paddingVertical: SPACING.medium,
    paddingHorizontal: SPACING.small,
    borderRadius: BORDER_RADIUS.small,
  },
  selectedOption: {
    backgroundColor: COLORS.primary50 + '80',
  },
  disabledOption: {
    opacity: 0.5,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIcon: {
    marginRight: SPACING.medium,
  },
  optionText: {
    flex: 1,
  },
  optionLabel: {
    ...TEXT_STYLES.body,
    color: COLORS.gray900,
  },
  selectedOptionLabel: {
    color: COLORS.primary500,
    fontWeight: '600',
  },
  disabledOptionLabel: {
    color: COLORS.gray400,
  },
  optionDescription: {
    ...TEXT_STYLES.small,
    color: COLORS.gray600,
    marginTop: 2,
  },
  disabledOptionDescription: {
    color: COLORS.gray400,
  },
  selectionIndicator: {
    marginLeft: SPACING.medium,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.gray200,
    marginVertical: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyMessage: {
    ...TEXT_STYLES.body,
    color: COLORS.gray600,
    textAlign: 'center',
  },
  multiSelectActions: {
    paddingTop: SPACING.medium,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
    alignItems: 'center',
  },
  selectionCount: {
    ...TEXT_STYLES.small,
    color: COLORS.gray600,
  },
});

// Export default for convenience
export default SelectModal;
