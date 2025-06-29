import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Text,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../styles/colors';
import { SPACING, BORDER_RADIUS, TEXT_STYLES } from '../../../styles/globalStyles';

export interface SearchInputProps {
  value?: string;
  onChangeText: (text: string) => void;
  onSearch?: (text: string) => void;
  onClear?: () => void;
  placeholder?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  showSearchButton?: boolean;
  showClearButton?: boolean;
  debounceMs?: number;
  style?: any;
  inputStyle?: any;
  
  // Accessibility
  accessibilityLabel?: string;
  testID?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value = '',
  onChangeText,
  onSearch,
  onClear,
  placeholder = 'Search...',
  disabled = false,
  autoFocus = false,
  showSearchButton = true,
  showClearButton = true,
  debounceMs = 300,
  style,
  inputStyle,
  accessibilityLabel,
  testID,
}) => {
  const [searchText, setSearchText] = useState(value);
  const [isFocused, setIsFocused] = useState(false);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchText !== value) {
        onChangeText(searchText);
      }
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [searchText, debounceMs, onChangeText]);

  // Update local state when value prop changes
  useEffect(() => {
    setSearchText(value);
  }, [value]);

  const handleTextChange = (text: string) => {
    setSearchText(text);
  };

  const handleSearch = () => {
    onSearch?.(searchText);
    Keyboard.dismiss();
  };

  const handleClear = () => {
    setSearchText('');
    onChangeText('');
    onClear?.();
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const hasValue = searchText.length > 0;

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.focusedContainer,
          disabled && styles.disabledContainer,
        ]}
      >
        {/* Search icon */}
        <TouchableOpacity
          style={styles.searchIcon}
          onPress={showSearchButton ? handleSearch : undefined}
          disabled={disabled || !showSearchButton}
        >
          <Ionicons
            name="search"
            size={20}
            color={
              disabled
                ? COLORS.gray400
                : isFocused || hasValue
                ? COLORS.primary500
                : COLORS.gray600
            }
          />
        </TouchableOpacity>

        {/* Text input */}
        <TextInput
          style={[
            styles.input,
            disabled && styles.disabledInput,
            inputStyle,
          ]}
          value={searchText}
          onChangeText={handleTextChange}
          onSubmitEditing={handleSearch}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          placeholderTextColor={COLORS.gray400}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
          autoFocus={autoFocus}
          editable={!disabled}
          accessibilityLabel={accessibilityLabel || 'Search input'}
          testID={testID}
        />

        {/* Clear button */}
        {hasValue && showClearButton && !disabled && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClear}
            accessibilityLabel="Clear search"
            accessibilityRole="button"
          >
            <Ionicons
              name="close-circle"
              size={20}
              color={COLORS.gray400}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray100,
    borderRadius: BORDER_RADIUS.xl,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  focusedContainer: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.primary500,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  disabledContainer: {
    backgroundColor: COLORS.gray50,
    opacity: 0.6,
  },
  searchIcon: {
    marginRight: SPACING.sm,
    padding: SPACING.xs,
  },
  input: {
    flex: 1,
    ...TEXT_STYLES.body,
    color: COLORS.gray900,
    paddingVertical: SPACING.xs,
    minHeight: 20,
  },
  disabledInput: {
    color: COLORS.gray400,
  },
  clearButton: {
    marginLeft: SPACING.sm,
    padding: SPACING.xs,
  },
});

// Export default for convenience
export default SearchInput;
