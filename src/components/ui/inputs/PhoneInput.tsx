import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import TextInput, { TextInputProps } from './TextInput';
import { SelectModal, SelectOption } from '../modals/SelectModal';
import { COLORS } from '../../../styles/colors';
import { SPACING, TEXT_STYLES } from '../../../styles/globalStyles';

export interface PhoneInputProps extends Omit<TextInputProps, 'value' | 'onChangeText' | 'keyboardType'> {
  value?: string;
  onChangeText: (phoneNumber: string, fullNumber: string) => void;
  countryCode?: string;
  onCountryCodeChange?: (countryCode: string) => void;
  onChangeCountryCode?: (countryCode: string) => void;
  defaultCountryCode?: string;
  showCountryPicker?: boolean;
  enableValidation?: boolean;
}

// Kenya and common country codes
const COUNTRY_CODES: SelectOption[] = [
  { label: '🇰🇪 Kenya (+254)', value: '+254' },
  { label: '🇺🇸 United States (+1)', value: '+1' },
  { label: '🇬🇧 United Kingdom (+44)', value: '+44' },
  { label: '🇺🇬 Uganda (+256)', value: '+256' },
  { label: '🇹🇿 Tanzania (+255)', value: '+255' },
  { label: '🇷🇼 Rwanda (+250)', value: '+250' },
  { label: '🇸🇸 South Sudan (+211)', value: '+211' },
  { label: '🇪🇹 Ethiopia (+251)', value: '+251' },
  { label: '🇸🇴 Somalia (+252)', value: '+252' },
  { label: '🇿🇦 South Africa (+27)', value: '+27' },
  { label: '🇳🇬 Nigeria (+234)', value: '+234' },
  { label: '🇬🇭 Ghana (+233)', value: '+233' },
];

export const PhoneInput: React.FC<PhoneInputProps> = ({
  value = '',
  onChangeText,
  countryCode,
  onCountryCodeChange,
  onChangeCountryCode,
  defaultCountryCode = '+254',
  showCountryPicker = true,
  enableValidation = true,
  label,
  errorText,
  placeholder = 'Enter phone number',
  ...textInputProps
}) => {
  const [selectedCountryCode, setSelectedCountryCode] = useState(countryCode || defaultCountryCode);
  const [showPicker, setShowPicker] = useState(false);
  const [phoneError, setPhoneError] = useState<string | undefined>();

  // Use either onChangeCountryCode or onCountryCodeChange (for backward compatibility)
  const handleCountryCodeChange = onChangeCountryCode || onCountryCodeChange;

  const validatePhoneNumber = (phone: string, code: string): boolean => {
    // Remove any spaces, dashes, or special characters
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    
    // Basic validation - just check if it has digits and reasonable length
    if (cleanPhone.length < 7 || cleanPhone.length > 15) {
      return false;
    }
    
    // Country-specific validation (optional, more lenient)
    if (code === '+254') {
      // Kenyan mobile numbers: 7XX XXX XXX or 1XX XXX XXX, but also accept other formats
      const kenyanMobileRegex = /^[71]\d{8}$/;
      if (kenyanMobileRegex.test(cleanPhone)) {
        return true;
      }
      // Accept other formats for Kenya too (international users)
      return cleanPhone.length >= 7 && cleanPhone.length <= 12;
    }
    
    if (code === '+1') {
      // US/Canada: 10 digits
      return cleanPhone.length === 10;
    }
    
    if (code === '+44') {
      // UK: 10-11 digits
      return cleanPhone.length >= 10 && cleanPhone.length <= 11;
    }
    
    // For other countries, accept any reasonable length
    return cleanPhone.length >= 7 && cleanPhone.length <= 15;
  };

  const formatPhoneNumber = (phone: string, code: string): string => {
    // Remove any spaces, dashes, or special characters for processing
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    
    // Format based on country code
    if (code === '+254' && cleanPhone.length >= 9) {
      // Kenya: XXX XXX XXX
      if (cleanPhone.length === 9) {
        return cleanPhone.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
      }
    }
    
    if (code === '+1' && cleanPhone.length === 10) {
      // US/Canada: (XXX) XXX-XXXX
      return cleanPhone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
    }
    
    if (code === '+44' && cleanPhone.length >= 10) {
      // UK: XXXX XXX XXX or similar
      if (cleanPhone.length === 10) {
        return cleanPhone.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
      }
      if (cleanPhone.length === 11) {
        return cleanPhone.replace(/(\d{5})(\d{3})(\d{3})/, '$1 $2 $3');
      }
    }
    
    // For other countries or if length doesn't match, apply basic formatting
    if (cleanPhone.length >= 7) {
      // Basic formatting: groups of 3-4 digits
      if (cleanPhone.length <= 10) {
        return cleanPhone.replace(/(\d{3})(\d{3})(\d+)/, '$1 $2 $3');
      } else {
        return cleanPhone.replace(/(\d{3})(\d{3})(\d{3})(\d+)/, '$1 $2 $3 $4');
      }
    }
    
    return phone; // Return original if too short to format
  };

  const handlePhoneChange = (phoneNumber: string) => {
    // Remove any non-digit characters except spaces and dashes for formatting
    const cleanNumber = phoneNumber.replace(/[^\d\s\-]/g, '');
    const formattedNumber = formatPhoneNumber(cleanNumber, selectedCountryCode);
    
    if (enableValidation) {
      const isValid = validatePhoneNumber(cleanNumber, selectedCountryCode);
      if (!isValid && cleanNumber.length >= 7) {
        setPhoneError('Please enter a valid phone number');
      } else {
        setPhoneError(undefined);
      }
    }

    const fullNumber = `${selectedCountryCode}${cleanNumber.replace(/[\s\-]/g, '')}`;
    onChangeText(formattedNumber, fullNumber);
  };

  const handleCountryCodeSelect = (option: SelectOption) => {
    const newCode = option.value as string;
    setSelectedCountryCode(newCode);
    handleCountryCodeChange?.(newCode);
    setShowPicker(false);
    
    // Re-validate phone number with new country code
    if (value && enableValidation) {
      const cleanPhone = value.replace(/[\s\-\(\)]/g, '');
      const isValid = validatePhoneNumber(cleanPhone, newCode);
      if (!isValid && cleanPhone.length >= 7) {
        setPhoneError('Please enter a valid phone number for the selected country');
      } else {
        setPhoneError(undefined);
      }
    }
  };

  const selectedCountry = COUNTRY_CODES.find(country => country.value === selectedCountryCode);

  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>
          {label}
          {textInputProps.required && <Text style={styles.required}> *</Text>}
        </Text>
      )}
      
      <View style={styles.phoneContainer}>
        {/* Country code picker */}
        {showCountryPicker && (
          <TouchableOpacity
            style={[
              styles.countryCodeButton,
              (errorText || phoneError) && styles.errorBorder,
            ]}
            onPress={() => setShowPicker(true)}
            accessibilityRole="button"
            accessibilityLabel="Select country code"
          >
            <Text style={styles.countryCodeText}>
              {selectedCountry?.label.split(' ')[0] || '🇰🇪'} {selectedCountryCode}
            </Text>
            <Icon name="chevron-down" size={16} color={COLORS.gray600} />
          </TouchableOpacity>
        )}

        {/* Phone number input */}
        <View style={styles.inputContainer}>
          <TextInput
            {...textInputProps}
            value={value}
            onChangeText={handlePhoneChange}
            placeholder={placeholder}
            keyboardType="phone-pad"
            autoComplete="tel"
            textContentType="telephoneNumber"
            errorText={errorText || phoneError}
            containerStyle={styles.phoneInput}
            label="" // Remove label since we show it above the container
          />
        </View>
      </View>

      {/* Error message */}
      {(errorText || phoneError) && (
        <Text style={styles.errorText}>{errorText || phoneError}</Text>
      )}

      {/* Country picker modal */}
      <SelectModal
        visible={showPicker}
        onClose={() => setShowPicker(false)}
        title="Select Country"
        options={COUNTRY_CODES}
        selectedValue={selectedCountryCode}
        onSelect={handleCountryCodeSelect}
        searchable
        searchPlaceholder="Search countries..."
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  label: {
    ...TEXT_STYLES.body,
    color: COLORS.gray800,
    marginBottom: SPACING.xs,
    fontWeight: '600',
  },
  required: {
    color: COLORS.error50,
  },
  phoneContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  countryCodeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray300,
    borderRadius: SPACING.sm,
    minHeight: 48,
    gap: SPACING.xs,
  },
  errorBorder: {
    borderColor: COLORS.error50,
    borderWidth: 2,
  },
  countryCodeText: {
    ...TEXT_STYLES.body,
    color: COLORS.gray900,
    fontSize: 14,
  },
  inputContainer: {
    flex: 1,
  },
  phoneInput: {
    marginBottom: 0, // Remove bottom margin since we handle it at container level
  },
  errorText: {
    ...TEXT_STYLES.caption,
    color: COLORS.error50,
    marginTop: SPACING.xs,
  },
});

// Export default for convenience
export default PhoneInput;
