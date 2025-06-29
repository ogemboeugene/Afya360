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
  validatePhoneNumber?: boolean;
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
  validatePhoneNumber = true,
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

  const validateKenyanPhone = (phone: string, code: string): boolean => {
    if (code === '+254') {
      // Remove any spaces, dashes, or special characters
      const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
      // Kenyan mobile numbers: 7XX XXX XXX or 1XX XXX XXX
      const kenyanMobileRegex = /^[71]\d{8}$/;
      return kenyanMobileRegex.test(cleanPhone);
    }
    return true; // For other countries, we'll do basic validation
  };

  const formatPhoneNumber = (phone: string, code: string): string => {
    if (code === '+254' && phone.length >= 9) {
      const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
      if (cleanPhone.length === 9) {
        return cleanPhone.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
      }
    }
    return phone;
  };

  const handlePhoneChange = (phoneNumber: string) => {
    // Remove any non-digit characters except spaces and dashes for formatting
    const cleanNumber = phoneNumber.replace(/[^\d\s\-]/g, '');
    const formattedNumber = formatPhoneNumber(cleanNumber, selectedCountryCode);
    
    if (validatePhoneNumber) {
      const isValid = validateKenyanPhone(cleanNumber, selectedCountryCode);
      if (!isValid && cleanNumber.length >= 9) {
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
    if (value && validatePhoneNumber) {
      const cleanPhone = value.replace(/[\s\-\(\)]/g, '');
      const isValid = validateKenyanPhone(cleanPhone, newCode);
      if (!isValid && cleanPhone.length >= 9) {
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
