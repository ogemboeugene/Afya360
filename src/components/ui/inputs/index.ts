/**
 * Input Components for Afya360 Healthcare App
 * 
 * Exports all input-related components including text inputs, password inputs,
 * date pickers, dropdowns, search inputs, phone inputs and other form input 
 * elements with healthcare-specific features.
 */

// Core Input Components
export { TextInput } from './TextInput';
export type { TextInputProps, TextInputRef } from './TextInput';

export { PasswordInput } from './PasswordInput';
export type { PasswordStrength } from './PasswordInput';

export { DatePicker } from './DatePicker';
export type { DatePickerProps } from './DatePicker';

export { Dropdown } from './Dropdown';
export type { DropdownProps, DropdownOption } from './Dropdown';

export { SearchInput } from './SearchInput';
export type { SearchInputProps } from './SearchInput';

export { PhoneInput } from './PhoneInput';
export type { PhoneInputProps } from './PhoneInput';

// Default exports for convenience
import { TextInput } from './TextInput';
import { PasswordInput } from './PasswordInput';
import { DatePicker } from './DatePicker';
import { Dropdown } from './Dropdown';
import { SearchInput } from './SearchInput';
import { PhoneInput } from './PhoneInput';

export default {
  TextInput,
  PasswordInput,
  DatePicker,
  Dropdown,
  SearchInput,
  PhoneInput,
};
// - NumericInput.tsx
