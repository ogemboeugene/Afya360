/**
 * Utility Functions for Afya360 Healthcare App
 * 
 * This file contains comprehensive utility functions for data manipulation,
 * validation, formatting, and calculations used throughout the application.
 */

import { VALIDATION_RULES, DATE_TIME } from '../constants';

// ============================================================================
// DATE AND TIME UTILITIES
// ============================================================================

/**
 * Format a date according to the specified format
 * @param date - Date to format
 * @param format - Format string (e.g., 'DD/MM/YYYY', 'HH:mm', 'MMM d, yyyy')
 * @returns Formatted date string
 */
export const formatDate = (date: Date, format: string = DATE_TIME.DATE_FORMAT): string => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return '';
  }

  const day = date.getDate().toString().padStart(2, '0');
  const dayUnpadded = date.getDate().toString();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear().toString();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');

  // Month names
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthShortNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  // Day names
  const dayNames = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
  ];

  let formattedDate = format;

  // Replace patterns in order of specificity (longest first)
  formattedDate = formattedDate
    .replace(/EEEE/g, dayNames[date.getDay()]) // Full day name
    .replace(/MMMM/g, monthNames[date.getMonth()]) // Full month name
    .replace(/MMM/g, monthShortNames[date.getMonth()]) // Short month name
    .replace(/yyyy/g, year) // 4-digit year
    .replace(/YYYY/g, year) // 4-digit year
    .replace(/dd/g, day) // 2-digit day
    .replace(/DD/g, day) // 2-digit day
    .replace(/d/g, dayUnpadded) // 1-digit day
    .replace(/MM/g, month) // 2-digit month
    .replace(/HH/g, hours) // 2-digit hours
    .replace(/mm/g, minutes) // 2-digit minutes
    .replace(/ss/g, seconds); // 2-digit seconds

  return formattedDate;
};

/**
 * Parse a date string into a Date object
 * @param dateString - Date string to parse
 * @param format - Expected format of the date string
 * @returns Parsed Date object or null if invalid
 */
export const parseDate = (dateString: string, format: string = DATE_TIME.DATE_FORMAT): Date | null => {
  if (!dateString || typeof dateString !== 'string') {
    return null;
  }

  try {
    // Handle DD/MM/YYYY format
    if (format === 'DD/MM/YYYY') {
      const [day, month, year] = dateString.split('/').map(Number);
      if (day && month && year) {
        return new Date(year, month - 1, day);
      }
    }
    
    // Handle ISO format
    if (format === 'ISO') {
      return new Date(dateString);
    }
    
    // Default parsing
    const parsed = new Date(dateString);
    return isNaN(parsed.getTime()) ? null : parsed;
  } catch (error) {
    return null;
  }
};

/**
 * Calculate age from birth date
 * @param birthDate - Date of birth
 * @returns Age in years
 */
export const calculateAge = (birthDate: Date): number => {
  if (!birthDate || !(birthDate instanceof Date)) {
    return 0;
  }

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return Math.max(0, age);
};

/**
 * Get relative time string (e.g., "2 hours ago", "in 3 days")
 * @param date - Date to compare
 * @param baseDate - Base date for comparison (defaults to now)
 * @returns Relative time string
 */
export const getRelativeTime = (date: Date, baseDate: Date = new Date()): string => {
  if (!date || !(date instanceof Date)) {
    return '';
  }

  const diffMs = date.getTime() - baseDate.getTime();
  const diffMinutes = Math.floor(Math.abs(diffMs) / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const isPast = diffMs < 0;

  if (diffMinutes < 1) {
    return 'now';
  } else if (diffMinutes < 60) {
    return isPast ? `${diffMinutes} min ago` : `in ${diffMinutes} min`;
  } else if (diffHours < 24) {
    return isPast ? `${diffHours} hr ago` : `in ${diffHours} hr`;
  } else if (diffDays < 7) {
    return isPast ? `${diffDays} day${diffDays > 1 ? 's' : ''} ago` : `in ${diffDays} day${diffDays > 1 ? 's' : ''}`;
  } else {
    return formatDate(date, 'DD/MM/YYYY');
  }
};

/**
 * Check if a date is today
 * @param date - Date to check
 * @returns True if date is today
 */
export const isToday = (date: Date): boolean => {
  if (!date || !(date instanceof Date)) {
    return false;
  }

  const today = new Date();
  return date.toDateString() === today.toDateString();
};

/**
 * Get the start and end of a day
 * @param date - Date to get boundaries for
 * @returns Object with start and end dates
 */
export const getDayBoundaries = (date: Date): { start: Date; end: Date } => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  
  return { start, end };
};

/**
 * Format date for user-friendly display with relative dates
 * @param date - Date to format
 * @param baseDate - Base date for comparison (defaults to current date)
 * @returns User-friendly formatted date string
 */
export const formatDateForDisplay = (date: Date, baseDate: Date = new Date()): string => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return '';
  }

  const now = baseDate;
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  // Today
  if (isToday(date)) {
    return 'Today';
  }
  
  // Yesterday
  if (diffDays === 1) {
    return 'Yesterday';
  }
  
  // Tomorrow
  if (diffDays === -1) {
    return 'Tomorrow';
  }
  
  // Within the last week
  if (diffDays > 1 && diffDays <= 7) {
    return `${diffDays} days ago`;
  }
  
  // Within the next week
  if (diffDays < -1 && diffDays >= -7) {
    return `In ${Math.abs(diffDays)} days`;
  }
  
  // Within the current year
  const currentYear = now.getFullYear();
  const dateYear = date.getFullYear();
  
  if (dateYear === currentYear) {
    return formatDate(date, 'DD MMM');
  }
  
  // Different year
  return formatDate(date, 'DD MMM YYYY');
};

// ============================================================================
// STRING UTILITIES
// ============================================================================

/**
 * Capitalize the first letter of each word
 * @param str - String to capitalize
 * @returns Capitalized string
 */
export const capitalize = (str: string): string => {
  if (!str || typeof str !== 'string') {
    return '';
  }

  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Truncate text to specified length with ellipsis
 * @param text - Text to truncate
 * @param length - Maximum length
 * @param suffix - Suffix to add when truncated
 * @returns Truncated text
 */
export const truncateText = (text: string, length: number, suffix: string = '...'): string => {
  if (!text || typeof text !== 'string') {
    return '';
  }

  if (text.length <= length) {
    return text;
  }

  return text.slice(0, length - suffix.length) + suffix;
};

/**
 * Convert string to URL-friendly slug
 * @param str - String to convert
 * @returns URL-friendly slug
 */
export const slugify = (str: string): string => {
  if (!str || typeof str !== 'string') {
    return '';
  }

  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

/**
 * Extract initials from a name
 * @param name - Full name
 * @param maxInitials - Maximum number of initials
 * @returns Initials string
 */
export const getInitials = (name: string, maxInitials: number = 2): string => {
  if (!name || typeof name !== 'string') {
    return '';
  }

  return name
    .split(' ')
    .filter(part => part.length > 0)
    .slice(0, maxInitials)
    .map(part => part.charAt(0).toUpperCase())
    .join('');
};

/**
 * Mask sensitive information (e.g., phone numbers, emails)
 * @param value - Value to mask
 * @param type - Type of masking
 * @returns Masked value
 */
export const maskSensitiveData = (value: string, type: 'phone' | 'email' | 'id'): string => {
  if (!value || typeof value !== 'string') {
    return '';
  }

  switch (type) {
    case 'phone':
      // Mask middle digits: +254123***456
      if (value.length > 6) {
        return value.slice(0, 6) + '*'.repeat(Math.max(0, value.length - 9)) + value.slice(-3);
      }
      return value;
    
    case 'email':
      // Mask email: j***@example.com
      const [local, domain] = value.split('@');
      if (local && domain) {
        const maskedLocal = local.charAt(0) + '*'.repeat(Math.max(0, local.length - 2)) + (local.length > 1 ? local.slice(-1) : '');
        return `${maskedLocal}@${domain}`;
      }
      return value;
    
    case 'id':
      // Mask ID number: 123***89
      if (value.length > 4) {
        return value.slice(0, 3) + '*'.repeat(Math.max(0, value.length - 5)) + value.slice(-2);
      }
      return value;
    
    default:
      return value;
  }
};

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Validate email address
 * @param email - Email to validate
 * @returns True if valid email
 */
export const validateEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') {
    return false;
  }

  return VALIDATION_RULES.EMAIL.REGEX.test(email.toLowerCase()) && 
         email.length <= VALIDATION_RULES.EMAIL.MAX_LENGTH;
};

/**
 * Validate Kenyan phone number
 * @param phone - Phone number to validate
 * @returns True if valid Kenyan phone number
 */
export const validatePhone = (phone: string): boolean => {
  if (!phone || typeof phone !== 'string') {
    return false;
  }

  // Remove spaces and common separators
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  
  return VALIDATION_RULES.PHONE.REGEX.test(cleanPhone);
};

/**
 * Validate password strength
 * @param password - Password to validate
 * @returns Validation result with details
 */
export const validatePassword = (password: string): {
  isValid: boolean;
  score: number;
  feedback: string[];
} => {
  const feedback: string[] = [];
  let score = 0;

  if (!password || typeof password !== 'string') {
    return { isValid: false, score: 0, feedback: ['Password is required'] };
  }

  // Length check
  if (password.length < VALIDATION_RULES.PASSWORD.MIN_LENGTH) {
    feedback.push(`Password must be at least ${VALIDATION_RULES.PASSWORD.MIN_LENGTH} characters`);
  } else {
    score += 1;
  }

  // Uppercase check
  if (VALIDATION_RULES.PASSWORD.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
    feedback.push('Password must contain at least one uppercase letter');
  } else if (VALIDATION_RULES.PASSWORD.REQUIRE_UPPERCASE) {
    score += 1;
  }

  // Lowercase check
  if (VALIDATION_RULES.PASSWORD.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
    feedback.push('Password must contain at least one lowercase letter');
  } else if (VALIDATION_RULES.PASSWORD.REQUIRE_LOWERCASE) {
    score += 1;
  }

  // Numbers check
  if (VALIDATION_RULES.PASSWORD.REQUIRE_NUMBERS && !/\d/.test(password)) {
    feedback.push('Password must contain at least one number');
  } else if (VALIDATION_RULES.PASSWORD.REQUIRE_NUMBERS) {
    score += 1;
  }

  // Symbols check
  if (VALIDATION_RULES.PASSWORD.REQUIRE_SYMBOLS && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    feedback.push('Password must contain at least one special character');
  } else if (VALIDATION_RULES.PASSWORD.REQUIRE_SYMBOLS) {
    score += 1;
  }

  const maxScore = 4 + (VALIDATION_RULES.PASSWORD.REQUIRE_SYMBOLS ? 1 : 0);
  const isValid = feedback.length === 0;

  return { isValid, score: (score / maxScore) * 100, feedback };
};

/**
 * Validate Kenyan National ID
 * @param nationalId - National ID to validate
 * @returns True if valid format
 */
export const validateNationalId = (nationalId: string): boolean => {
  if (!nationalId || typeof nationalId !== 'string') {
    return false;
  }

  const cleanId = nationalId.replace(/\s/g, '');
  return VALIDATION_RULES.NATIONAL_ID.REGEX.test(cleanId) && 
         cleanId.length === VALIDATION_RULES.NATIONAL_ID.LENGTH;
};

/**
 * Validate required field
 * @param value - Value to validate
 * @param fieldName - Name of the field for error message
 * @returns Validation result
 */
export const validateRequired = (value: any, fieldName: string = 'Field'): { isValid: boolean; error?: string } => {
  if (value === null || value === undefined || value === '') {
    return { isValid: false, error: `${fieldName} is required` };
  }

  if (typeof value === 'string' && value.trim() === '') {
    return { isValid: false, error: `${fieldName} is required` };
  }

  return { isValid: true };
};

// ============================================================================
// FORMATTING UTILITIES
// ============================================================================

/**
 * Format currency amount (Kenyan Shillings)
 * @param amount - Amount to format
 * @param includeSymbol - Whether to include currency symbol
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number, includeSymbol: boolean = true): string => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return includeSymbol ? 'KSh 0.00' : '0.00';
  }

  const formatted = amount.toLocaleString('en-KE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return includeSymbol ? `KSh ${formatted}` : formatted;
};

/**
 * Format phone number for display
 * @param phone - Phone number to format
 * @param international - Whether to use international format
 * @returns Formatted phone number
 */
export const formatPhoneNumber = (phone: string, international: boolean = false): string => {
  if (!phone || typeof phone !== 'string') {
    return '';
  }

  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');

  // Handle Kenyan numbers
  if (digits.startsWith('254')) {
    // International format: +254 123 456 789
    if (international) {
      return `+${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(9)}`;
    }
    // Local format: 0123 456 789
    return `0${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(9)}`;
  } else if (digits.startsWith('0') && digits.length === 10) {
    // Local format: 0123 456 789
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  }

  return phone; // Return original if format not recognized
};

/**
 * Format file size in human-readable format
 * @param bytes - File size in bytes
 * @returns Formatted file size string
 */
export const formatFileSize = (bytes: number): string => {
  if (typeof bytes !== 'number' || bytes < 0) {
    return '0 B';
  }

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
};

/**
 * Format medical condition severity
 * @param severity - Severity level
 * @returns Formatted severity string
 */
export const formatSeverity = (severity: 'mild' | 'moderate' | 'severe' | 'critical'): string => {
  const severityMap = {
    mild: 'Mild',
    moderate: 'Moderate',
    severe: 'Severe',
    critical: 'Critical',
  };

  return severityMap[severity] || capitalize(severity);
};

// ============================================================================
// CALCULATION UTILITIES
// ============================================================================

/**
 * Calculate BMI (Body Mass Index)
 * @param weight - Weight in kilograms
 * @param height - Height in meters
 * @returns BMI value and category
 */
export const calculateBMI = (weight: number, height: number): { bmi: number; category: string } => {
  if (typeof weight !== 'number' || typeof height !== 'number' || weight <= 0 || height <= 0) {
    return { bmi: 0, category: 'Invalid' };
  }

  const bmi = weight / (height * height);
  let category: string;

  if (bmi < 18.5) {
    category = 'Underweight';
  } else if (bmi < 25) {
    category = 'Normal weight';
  } else if (bmi < 30) {
    category = 'Overweight';
  } else {
    category = 'Obese';
  }

  return { bmi: Math.round(bmi * 10) / 10, category };
};

/**
 * Calculate medication adherence percentage
 * @param taken - Number of doses taken
 * @param prescribed - Number of doses prescribed
 * @returns Adherence percentage
 */
export const calculateAdherence = (taken: number, prescribed: number): number => {
  if (typeof taken !== 'number' || typeof prescribed !== 'number' || prescribed <= 0) {
    return 0;
  }

  return Math.min(100, Math.round((taken / prescribed) * 100));
};

/**
 * Calculate distance between two coordinates (Haversine formula)
 * @param lat1 - Latitude of first point
 * @param lon1 - Longitude of first point
 * @param lat2 - Latitude of second point
 * @param lon2 - Longitude of second point
 * @returns Distance in kilometers
 */
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c;
};

/**
 * Convert degrees to radians
 * @param degrees - Degrees to convert
 * @returns Radians
 */
const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

// ============================================================================
// UTILITY HELPERS
// ============================================================================

/**
 * Generate a unique ID
 * @param prefix - Optional prefix for the ID
 * @returns Unique ID string
 */
export const generateId = (prefix: string = ''): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2);
  return prefix ? `${prefix}_${timestamp}_${random}` : `${timestamp}_${random}`;
};

/**
 * Deep clone an object
 * @param obj - Object to clone
 * @returns Cloned object
 */
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T;
  }

  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as T;
  }

  if (typeof obj === 'object') {
    const cloned = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned;
  }

  return obj;
};

/**
 * Debounce a function
 * @param func - Function to debounce
 * @param wait - Wait time in milliseconds
 * @returns Debounced function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Check if value is empty (null, undefined, empty string, empty array, empty object)
 * @param value - Value to check
 * @returns True if empty
 */
export const isEmpty = (value: any): boolean => {
  if (value === null || value === undefined) {
    return true;
  }

  if (typeof value === 'string') {
    return value.trim() === '';
  }

  if (Array.isArray(value)) {
    return value.length === 0;
  }

  if (typeof value === 'object') {
    return Object.keys(value).length === 0;
  }

  return false;
};

/**
 * Sleep for specified duration
 * @param ms - Duration in milliseconds
 * @returns Promise that resolves after the duration
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// ============================================================================
// HEALTHCARE SPECIFIC UTILITIES
// ============================================================================

/**
 * Parse medication frequency to daily count
 * @param frequency - Frequency string (e.g., "twice daily", "3 times a day")
 * @returns Number of times per day
 */
export const parseFrequencyToDailyCount = (frequency: string): number => {
  if (!frequency || typeof frequency !== 'string') {
    return 1;
  }

  const lower = frequency.toLowerCase();
  
  if (lower.includes('once') || lower.includes('1 time')) return 1;
  if (lower.includes('twice') || lower.includes('2 time')) return 2;
  if (lower.includes('thrice') || lower.includes('3 time')) return 3;
  if (lower.includes('4 time')) return 4;
  
  // Extract numbers
  const match = lower.match(/(\d+)/);
  if (match) {
    return parseInt(match[1], 10);
  }
  
  return 1;
};

/**
 * Get health status color based on value
 * @param value - Health metric value
 * @param ranges - Ranges for different status levels
 * @returns Status color key
 */
export const getHealthStatusColor = (
  value: number,
  ranges: { excellent: [number, number]; good: [number, number]; fair: [number, number] }
): 'excellent' | 'good' | 'fair' | 'poor' | 'critical' => {
  if (value >= ranges.excellent[0] && value <= ranges.excellent[1]) return 'excellent';
  if (value >= ranges.good[0] && value <= ranges.good[1]) return 'good';
  if (value >= ranges.fair[0] && value <= ranges.fair[1]) return 'fair';
  return value < ranges.fair[0] ? 'critical' : 'poor';
};

// Default export with all utilities
export default {
  // Date & Time
  formatDate,
  parseDate,
  calculateAge,
  getRelativeTime,
  isToday,
  getDayBoundaries,
  formatDateForDisplay,
  
  // String
  capitalize,
  truncateText,
  slugify,
  getInitials,
  maskSensitiveData,
  
  // Validation
  validateEmail,
  validatePhone,
  validatePassword,
  validateNationalId,
  validateRequired,
  
  // Formatting
  formatCurrency,
  formatPhoneNumber,
  formatFileSize,
  formatSeverity,
  
  // Calculations
  calculateBMI,
  calculateAdherence,
  calculateDistance,
  
  // Utilities
  generateId,
  deepClone,
  debounce,
  isEmpty,
  sleep,
  
  // Healthcare
  parseFrequencyToDailyCount,
  getHealthStatusColor,
};
