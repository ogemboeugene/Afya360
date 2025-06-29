/**
 * Validation Utilities
 * Common validation functions for the Afya360 healthcare app
 */

import { VALIDATION_RULES } from '../constants';

// Email validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export interface PhoneValidationResult {
  isValid: boolean;
  error?: string;
  formattedNumber?: string;
}

// Phone number validation (Kenya format)
export const validateKenyanPhoneNumber = (phone: string): boolean => {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Kenya phone number patterns
  const patterns = [
    /^254[17]\d{8}$/, // +254 7xxxxxxxx or +254 1xxxxxxxx
    /^0[17]\d{8}$/, // 07xxxxxxxx or 01xxxxxxxx
    /^[17]\d{8}$/, // 7xxxxxxxx or 1xxxxxxxx
  ];
  
  return patterns.some(pattern => pattern.test(cleaned));
};

export const validatePhoneNumber = (phoneNumber: string): PhoneValidationResult => {
  if (!phoneNumber || typeof phoneNumber !== 'string') {
    return {
      isValid: false,
      error: 'Phone number is required'
    };
  }

  // Remove all non-digit characters except +
  const cleanNumber = phoneNumber.replace(/[^\d+]/g, '');
  
  // Check if it's empty after cleaning
  if (!cleanNumber) {
        return {
      isValid: false,
      error: 'Please enter a valid phone number'
    };
  }

  // Kenya phone number validation
  if (cleanNumber.startsWith('+254') || cleanNumber.startsWith('254')) {
    return validateKenyaPhoneNumber(cleanNumber);
  }
  
  // Remove + for local numbers
  const localNumber = cleanNumber.replace(/^\+/, '');
  
    // Check for Kenya local format (07XX XXX XXX or 01XX XXX XXX)
  if (localNumber.startsWith('0')) {
    return validateKenyaLocalNumber(localNumber);
  }
  
  // International number validation (basic)
  if (cleanNumber.startsWith('+')) {
    return validateInternationalNumber(cleanNumber);
  }
  
  return {
    isValid: false,
    error: 'Please enter a valid phone number with country code'
  };
};


/**
 * Validates Kenya phone numbers with +254 or 254 prefix
 */
const validateKenyaPhoneNumber = (phoneNumber: string): PhoneValidationResult => {
  // Remove +254 or 254 prefix
  const withoutPrefix = phoneNumber.replace(/^\+?254/, '');
  
  // Should have 9 digits remaining
  if (withoutPrefix.length !== 9) {
    return {
      isValid: false,
            error: 'Kenya phone number should have 9 digits after country code'
    };
  }
  
  // Check if it starts with valid prefixes
  const validPrefixes = ['7', '1']; // 7XX for mobile, 1XX for some carriers
  const firstDigit = withoutPrefix[0];
  
  if (!validPrefixes.includes(firstDigit)) {
    return {
      isValid: false,
      error: 'Kenya phone number should start with 7 or 1 after country code'
    };
  }

    // For mobile numbers (7XX), check specific valid prefixes
  if (firstDigit === '7') {
    const mobilePrefix = withoutPrefix.substring(0, 2);
    const validMobilePrefixes = ['70', '71', '72', '73', '74', '75', '76', '77', '78', '79'];
    
    if (!validMobilePrefixes.includes(mobilePrefix)) {
      return {
        isValid: false,
        error: 'Invalid Kenya mobile number prefix'
      };
    }
  }
  
  // Check if all characters are digits
  if (!/^\d+$/.test(withoutPrefix)) {
    return {
      isValid: false,
      error: 'Phone number should contain only digits'
    };
  }
  
  return {
    isValid: true,
    formattedNumber: `+254${withoutPrefix}`
  };
};


/**
 * Validates Kenya local format phone numbers (0XXX XXX XXX)
 */
const validateKenyaLocalNumber = (phoneNumber: string): PhoneValidationResult => {
  // Should be 10 digits starting with 0
  if (phoneNumber.length !== 10) {
    return {
      isValid: false,
      error: 'Kenya phone number should be 10 digits starting with 0'
    };
  }
    
  // Check if it starts with valid prefixes
  const prefix = phoneNumber.substring(0, 3);
  const validPrefixes = ['070', '071', '072', '073', '074', '075', '076', '077', '078', '079', '010', '011'];
  
  if (!validPrefixes.includes(prefix)) {
    return {
      isValid: false,
      error: 'Invalid Kenya phone number prefix'
    };
  }
  
  // Check if all characters are digits
  if (!/^\d+$/.test(phoneNumber)) {
    return {
              isValid: false,
      error: 'Phone number should contain only digits'
    };
  }
  
  // Convert to international format
  const internationalNumber = `+254${phoneNumber.substring(1)}`;
  
  return {
    isValid: true,
    formattedNumber: internationalNumber
  };
};


/**
 * Basic validation for international phone numbers
 */
const validateInternationalNumber = (phoneNumber: string): PhoneValidationResult => {
  // Should be between 7 and 15 digits (including country code)
  const digits = phoneNumber.replace(/^\+/, '');
  
  if (digits.length < 7 || digits.length > 15) {
    return {
      isValid: false,
      error: 'International phone number should be between 7 and 15 digits'
    };
  }

    // Check if all characters are digits
  if (!/^\d+$/.test(digits)) {
    return {
      isValid: false,
      error: 'Phone number should contain only digits'
    };
  }
  
  return {
    isValid: true,
    formattedNumber: phoneNumber
  };
};

// Password validation
export const validatePassword = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (password.length < VALIDATION_RULES.PASSWORD.MIN_LENGTH) {
    errors.push(`Password must be at least ${VALIDATION_RULES.PASSWORD.MIN_LENGTH} characters long`);
  }
  
  if (password.length > VALIDATION_RULES.PASSWORD.MAX_LENGTH) {
    errors.push(`Password must be no more than ${VALIDATION_RULES.PASSWORD.MAX_LENGTH} characters long`);
  }
  
  if (VALIDATION_RULES.PASSWORD.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (VALIDATION_RULES.PASSWORD.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (VALIDATION_RULES.PASSWORD.REQUIRE_NUMBERS && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (VALIDATION_RULES.PASSWORD.REQUIRE_SYMBOLS && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

// PIN validation
export const validatePIN = (pin: string): boolean => {
  const pinRegex = /^\d{4,6}$/;
  return pinRegex.test(pin);
};

// National ID validation (Kenya)
export const validateKenyanNationalID = (id: string): boolean => {
  const cleaned = id.replace(/\s/g, '');
  const idRegex = /^\d{7,8}$/;
  return idRegex.test(cleaned);
};

// Medical license validation (Kenya)
export const validateMedicalLicense = (license: string): boolean => {
  // Kenya medical license format: varies, but typically alphanumeric
  const cleaned = license.replace(/\s/g, '');
  return cleaned.length >= 5 && cleaned.length <= 20;
};

// Insurance number validation
export const validateInsuranceNumber = (number: string): boolean => {
  const cleaned = number.replace(/\s/g, '');
  return cleaned.length >= 5 && cleaned.length <= 50;
};

// Date validation
export const validateDate = (date: string): boolean => {
  const parsedDate = new Date(date);
  return !isNaN(parsedDate.getTime());
};

// Age validation
export const validateAge = (birthDate: string | Date): {
  isValid: boolean;
  age: number | null;
  error?: string;
} => {
  try {
    const birth = new Date(birthDate);
    const today = new Date();
    
    if (isNaN(birth.getTime())) {
      return { isValid: false, age: null, error: 'Invalid birth date' };
    }
    
    if (birth > today) {
      return { isValid: false, age: null, error: 'Birth date cannot be in the future' };
    }
    
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    const dayDiff = today.getDate() - birth.getDate();
    
    const actualAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;
    
    if (actualAge < 0) {
      return { isValid: false, age: null, error: 'Invalid age' };
    }
    
    if (actualAge > 150) {
      return { isValid: false, age: null, error: 'Age seems unrealistic' };
    }
    
    return { isValid: true, age: actualAge };
  } catch (error) {
    return { isValid: false, age: null, error: 'Error calculating age' };
  }
};

// Blood pressure validation
export const validateBloodPressure = (systolic: number, diastolic: number): {
  isValid: boolean;
  category: 'normal' | 'elevated' | 'high_stage1' | 'high_stage2' | 'crisis' | 'invalid';
  error?: string;
} => {
  if (!systolic || !diastolic || systolic <= 0 || diastolic <= 0) {
    return { isValid: false, category: 'invalid', error: 'Invalid blood pressure values' };
  }
  
  if (systolic < diastolic) {
    return { isValid: false, category: 'invalid', error: 'Systolic pressure cannot be lower than diastolic' };
  }
  
  if (systolic > 300 || diastolic > 200) {
    return { isValid: false, category: 'invalid', error: 'Blood pressure values seem unrealistic' };
  }
  
  // Blood pressure categories (AHA guidelines)
  if (systolic < 120 && diastolic < 80) {
    return { isValid: true, category: 'normal' };
  } else if (systolic >= 120 && systolic <= 129 && diastolic < 80) {
    return { isValid: true, category: 'elevated' };
  } else if ((systolic >= 130 && systolic <= 139) || (diastolic >= 80 && diastolic <= 89)) {
    return { isValid: true, category: 'high_stage1' };
  } else if ((systolic >= 140 && systolic <= 179) || (diastolic >= 90 && diastolic <= 119)) {
    return { isValid: true, category: 'high_stage2' };
  } else if (systolic >= 180 || diastolic >= 120) {
    return { isValid: true, category: 'crisis' };
  }
  
  return { isValid: true, category: 'normal' };
};

// Temperature validation
export const validateTemperature = (temp: number, unit: 'celsius' | 'fahrenheit' = 'celsius'): {
  isValid: boolean;
  category: 'hypothermia' | 'normal' | 'fever' | 'high_fever' | 'invalid';
  convertedTemp?: number;
  error?: string;
} => {
  if (!temp || isNaN(temp)) {
    return { isValid: false, category: 'invalid', error: 'Invalid temperature value' };
  }
  
  // Convert to Celsius for consistent categorization
  let tempCelsius = temp;
  if (unit === 'fahrenheit') {
    tempCelsius = (temp - 32) * 5/9;
  }
  
  // Validate reasonable temperature range
  if (tempCelsius < 25 || tempCelsius > 50) {
    return { isValid: false, category: 'invalid', error: 'Temperature seems unrealistic for human body temperature' };
  }
  
  // Temperature categories
  let category: 'hypothermia' | 'normal' | 'fever' | 'high_fever' | 'invalid';
  if (tempCelsius < 35) {
    category = 'hypothermia';
  } else if (tempCelsius <= 37.2) {
    category = 'normal';
  } else if (tempCelsius <= 38.9) {
    category = 'fever';
  } else {
    category = 'high_fever';
  }
  
  return {
    isValid: true,
    category,
    convertedTemp: unit === 'fahrenheit' ? temp : (temp * 9/5) + 32,
  };
};

// Heart rate validation
export const validateHeartRate = (rate: number, age?: number): {
  isValid: boolean;
  category: 'bradycardia' | 'normal' | 'tachycardia' | 'invalid';
  error?: string;
} => {
  if (!rate || isNaN(rate) || rate <= 0) {
    return { isValid: false, category: 'invalid', error: 'Invalid heart rate value' };
  }
  
  if (rate > 300) {
    return { isValid: false, category: 'invalid', error: 'Heart rate seems unrealistic' };
  }
  
  // Age-specific normal ranges (rough guidelines)
  let normalMin = 60;
  let normalMax = 100;
  
  if (age) {
    if (age < 1) {
      normalMin = 100;
      normalMax = 160;
    } else if (age < 3) {
      normalMin = 90;
      normalMax = 150;
    } else if (age < 6) {
      normalMin = 80;
      normalMax = 140;
    } else if (age < 12) {
      normalMin = 70;
      normalMax = 120;
    } else if (age >= 65) {
      normalMin = 50;
      normalMax = 100;
    }
  }
  
  let category: 'bradycardia' | 'normal' | 'tachycardia' | 'invalid';
  if (rate < normalMin) {
    category = 'bradycardia';
  } else if (rate <= normalMax) {
    category = 'normal';
  } else {
    category = 'tachycardia';
  }
  
  return { isValid: true, category };
};

// Weight validation
export const validateWeight = (weight: number, unit: 'kg' | 'lbs' = 'kg'): {
  isValid: boolean;
  convertedWeight?: number;
  bmiCategory?: 'underweight' | 'normal' | 'overweight' | 'obese';
  error?: string;
} => {
  if (!weight || isNaN(weight) || weight <= 0) {
    return { isValid: false, error: 'Invalid weight value' };
  }
  
  // Convert to kg for validation
  let weightKg = weight;
  if (unit === 'lbs') {
    weightKg = weight * 0.453592;
  }
  
  // Validate reasonable weight range (0.5kg to 500kg)
  if (weightKg < 0.5 || weightKg > 500) {
    return { isValid: false, error: 'Weight seems unrealistic' };
  }
  
  return {
    isValid: true,
    convertedWeight: unit === 'kg' ? weight * 2.20462 : weight / 2.20462,
  };
};

// Height validation
export const validateHeight = (height: number, unit: 'cm' | 'ft' | 'in' = 'cm'): {
  isValid: boolean;
  convertedHeight?: number;
  error?: string;
} => {
  if (!height || isNaN(height) || height <= 0) {
    return { isValid: false, error: 'Invalid height value' };
  }
  
  // Convert to cm for validation
  let heightCm = height;
  if (unit === 'ft') {
    heightCm = height * 30.48;
  } else if (unit === 'in') {
    heightCm = height * 2.54;
  }
  
  // Validate reasonable height range (20cm to 300cm)
  if (heightCm < 20 || heightCm > 300) {
    return { isValid: false, error: 'Height seems unrealistic' };
  }
  
  return {
    isValid: true,
    convertedHeight: unit === 'cm' ? height / 30.48 : (unit === 'ft' ? height * 30.48 : height / 2.54),
  };
};

// Name validation
export const validateName = (name: string): boolean => {
  if (!name || name.trim().length === 0) {
    return false;
  }
  
  const trimmedName = name.trim();
  
  // Check length
  if (trimmedName.length < VALIDATION_RULES.NAME.MIN_LENGTH || 
      trimmedName.length > VALIDATION_RULES.NAME.MAX_LENGTH) {
    return false;
  }
  
  // Check format (only letters, spaces, hyphens, and apostrophes)
  return VALIDATION_RULES.NAME.REGEX.test(trimmedName);
};

// Kenyan National ID validation
export const validateIDNumber = (idNumber: string): boolean => {
  if (!idNumber) {
    return false;
  }
  
  // Remove all non-digit characters
  const cleaned = idNumber.replace(/\D/g, '');
  
  // Check if it matches Kenyan National ID format (8 digits)
  return VALIDATION_RULES.NATIONAL_ID.REGEX.test(cleaned);
};

export const formatPhoneNumber = (phone: string): string => {
  if (!phone) return '';
  
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Handle different Kenya phone number formats
  if (cleaned.startsWith('254')) {
    // Already in international format (+254)
    const number = cleaned.slice(3);
    if (number.length === 9) {
      return `+254 ${number.slice(0, 3)} ${number.slice(3, 6)} ${number.slice(6)}`;
    }
  } else if (cleaned.startsWith('0')) {
    // Local format starting with 0
    const number = cleaned.slice(1);
    if (number.length === 9) {
      return `+254 ${number.slice(0, 3)} ${number.slice(3, 6)} ${number.slice(6)}`;
    }
  } else if (cleaned.length === 9) {
    // Without country code or leading 0
    return `+254 ${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }
  
  // Return original if can't format
  return phone;
};

// Format ID number for display
export const formatIDNumber = (idNumber: string): string => {
  if (!idNumber) {
    return '';
  }
  
  // Remove all non-digit characters
  const cleaned = idNumber.replace(/\D/g, '');
  
  // Format as XXXXXXXX for National ID
  if (cleaned.length <= 8) {
    return cleaned;
  }
  
  return cleaned.substring(0, 8);
};

// Date of birth validation
export const validateDateOfBirth = (date: Date): boolean => {
  if (!date) {
    return false;
  }
  
  const today = new Date();
  const age = today.getFullYear() - date.getFullYear();
  const monthDiff = today.getMonth() - date.getMonth();
  
  // Adjust age if birthday hasn't occurred this year
  const finalAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate()) 
    ? age - 1 
    : age;
  
  // Must be at least 13 years old and not more than 120 years old
  return finalAge >= 13 && finalAge <= 120 && date <= today;
};

// Emergency contact phone validation
export const validateEmergencyPhone = (phone: string): boolean => {
  return validateKenyanPhoneNumber(phone);
};

// Form validation helper
export const validateForm = (
  fields: Record<string, any>,
  rules: Record<string, {
    required?: boolean;
    validator?: (value: any) => boolean | { isValid: boolean; error?: string };
    message?: string;
  }>
): {
  isValid: boolean;
  errors: Record<string, string>;
} => {
  const errors: Record<string, string> = {};
  
  Object.entries(rules).forEach(([fieldName, rule]) => {
    const value = fields[fieldName];
    
    // Check required fields
    if (rule.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      errors[fieldName] = rule.message || `${fieldName} is required`;
      return;
    }
    
    // Skip validation if field is empty and not required
    if (!value && !rule.required) {
      return;
    }
    
    // Run custom validator
    if (rule.validator) {
      const result = rule.validator(value);
      if (typeof result === 'boolean') {
        if (!result) {
          errors[fieldName] = rule.message || `${fieldName} is invalid`;
        }
      } else if (!result.isValid) {
        errors[fieldName] = result.error || rule.message || `${fieldName} is invalid`;
      }
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
