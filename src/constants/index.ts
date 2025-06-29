/**
 * Application Constants
 * 
 * INSTRUCTIONS FOR IMPLEMENTATION:
 * This file should contain all application-wide constants and configuration.
 * 
 * CONSTANTS TO DEFINE:
 * - API URLs and endpoints
 * - App configuration settings
 * - Default values and limits
 * - Error messages
 * - Status codes
 * - Time intervals and durations
 * - UI constants (dimensions, spacing, etc.)
 * 
 * SECTIONS TO INCLUDE:
 * - API_ENDPOINTS: All API endpoint URLs
 * - APP_CONFIG: App-wide configuration
 * - STORAGE_KEYS: Keys for local storage
 * - ERROR_MESSAGES: Standardized error messages
 * - NOTIFICATION_TYPES: Notification categories
 * - PERMISSIONS: Permission types and messages
 * - TIMEOUTS: Request and session timeouts
 * 
 * ORGANIZATION:
 * - Group related constants together
 * - Use clear, descriptive names
 * - Document complex constants
 * - Make constants type-safe
 */

/**
 * Application Constants for Afya360 Healthcare App
 * 
 * This file contains all application-wide constants, configuration settings,
 * and static data used throughout the application.
 */

// ============================================================================
// API CONFIGURATION
// ============================================================================

// Base API URL - use environment variable in production
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://api.afya360.co.ke';

// API Version
export const API_VERSION = 'v1';

// Full API URL
export const API_URL = `${API_BASE_URL}/${API_VERSION}`;

// API Endpoints organized by feature
export const API_ENDPOINTS = {
  // Authentication endpoints
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh',
    VERIFY_PHONE: '/auth/verify-phone',
    VERIFY_EMAIL: '/auth/verify-email',
    RESET_PASSWORD: '/auth/reset-password',
    SEND_OTP: '/auth/send-otp',
    VERIFY_OTP: '/auth/verify-otp',
    SETUP_PIN: '/auth/setup-pin',
    VERIFY_PIN: '/auth/verify-pin',
    SETUP_BIOMETRIC: '/auth/setup-biometric',
  },
  
  // User profile endpoints
  USER: {
    PROFILE: '/user/profile',
    UPDATE_PROFILE: '/user/profile',
    UPLOAD_AVATAR: '/user/avatar',
    PREFERENCES: '/user/preferences',
    DELETE_ACCOUNT: '/user/delete',
  },
  
  // Health records endpoints
  HEALTH: {
    RECORDS: '/health/records',
    RECORD_BY_ID: '/health/records/:id',
    CONDITIONS: '/health/conditions',
    ALLERGIES: '/health/allergies',
    IMMUNIZATIONS: '/health/immunizations',
    VISITS: '/health/visits',
    DOCUMENTS: '/health/documents',
    UPLOAD_DOCUMENT: '/health/documents/upload',
  },
  
  // Medications endpoints
  MEDICATIONS: {
    SEARCH: '/medications/search',
    DETAILS: '/medications/:id',
    PRESCRIPTIONS: '/medications/prescriptions',
    PRESCRIPTION_BY_ID: '/medications/prescriptions/:id',
    INTERACTIONS: '/medications/interactions',
    ADHERENCE: '/medications/adherence',
    SCAN: '/medications/scan',
    REMINDERS: '/medications/reminders',
  },
  
  // Healthcare providers endpoints
  PROVIDERS: {
    SEARCH: '/providers/search',
    DETAILS: '/providers/:id',
    REVIEWS: '/providers/:id/reviews',
    AVAILABILITY: '/providers/:id/availability',
    BOOK_APPOINTMENT: '/providers/:id/book',
  },
  
  // Healthcare facilities endpoints
  FACILITIES: {
    SEARCH: '/facilities/search',
    NEARBY: '/facilities/nearby',
    DETAILS: '/facilities/:id',
    SERVICES: '/facilities/:id/services',
    REVIEWS: '/facilities/:id/reviews',
  },
  
  // Appointments endpoints
  APPOINTMENTS: {
    LIST: '/appointments',
    CREATE: '/appointments',
    UPDATE: '/appointments/:id',
    CANCEL: '/appointments/:id/cancel',
    RESCHEDULE: '/appointments/:id/reschedule',
  },
  
  // Insurance endpoints
  INSURANCE: {
    CARDS: '/insurance/cards',
    VERIFY: '/insurance/verify',
    CLAIMS: '/insurance/claims',
    SUBMIT_CLAIM: '/insurance/claims/submit',
  },
  
  // Emergency endpoints
  EMERGENCY: {
    CONTACTS: '/emergency/contacts',
    SERVICES: '/emergency/services',
    SHARE_LOCATION: '/emergency/share-location',
    ALERT: '/emergency/alert',
  },
  
  // Notifications endpoints
  NOTIFICATIONS: {
    LIST: '/notifications',
    MARK_READ: '/notifications/:id/read',
    MARK_ALL_READ: '/notifications/read-all',
    SETTINGS: '/notifications/settings',
    REGISTER_TOKEN: '/notifications/register-token',
  },
} as const;

// ============================================================================
// STORAGE KEYS
// ============================================================================

export const STORAGE_KEYS = {
  // Authentication
  AUTH_TOKEN: '@afya360:auth_token',
  REFRESH_TOKEN: '@afya360:refresh_token',
  USER_DATA: '@afya360:user_data',
  BIOMETRIC_ENABLED: '@afya360:biometric_enabled',
  PIN_HASH: '@afya360:pin_hash',
  LAST_LOGIN: '@afya360:last_login',
  
  // App state
  ONBOARDING_COMPLETED: '@afya360:onboarding_completed',
  FIRST_LAUNCH: '@afya360:first_launch',
  APP_VERSION: '@afya360:app_version',
  
  // User preferences
  THEME: '@afya360:theme',
  LANGUAGE: '@afya360:language',
  NOTIFICATION_SETTINGS: '@afya360:notification_settings',
  LOCATION_PERMISSION: '@afya360:location_permission',
  CAMERA_PERMISSION: '@afya360:camera_permission',
  
  // Cached data
  HEALTH_RECORDS: '@afya360:health_records',
  MEDICATIONS: '@afya360:medications',
  PROVIDERS: '@afya360:providers',
  FACILITIES: '@afya360:facilities',
  EMERGENCY_CONTACTS: '@afya360:emergency_contacts',
  
  // Offline data
  OFFLINE_QUEUE: '@afya360:offline_queue',
  LAST_SYNC: '@afya360:last_sync',
} as const;

// ============================================================================
// APP CONFIGURATION
// ============================================================================

export const APP_CONFIG = {
  // App information
  APP_NAME: 'Afya360',
  APP_VERSION: '1.0.0',
  BUILD_NUMBER: '1',
  
  // Session management
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes in milliseconds
  TOKEN_REFRESH_THRESHOLD: 5 * 60 * 1000, // 5 minutes before expiry
  AUTO_LOGOUT_WARNING: 2 * 60 * 1000, // Show warning 2 minutes before logout
  
  // Authentication
  PIN_LENGTH: 4,
  MAX_LOGIN_ATTEMPTS: 3,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
  OTP_LENGTH: 6,
  OTP_EXPIRY: 5 * 60 * 1000, // 5 minutes
  
  // Location settings
  LOCATION_UPDATE_INTERVAL: 30000, // 30 seconds
  LOCATION_DISTANCE_FILTER: 100, // 100 meters
  DEFAULT_SEARCH_RADIUS: 10000, // 10km
  
  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  
  // File uploads
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'image/jpeg', 'image/png'],
  
  // Cache settings
  CACHE_EXPIRY: 24 * 60 * 60 * 1000, // 24 hours
  OFFLINE_STORAGE_LIMIT: 50 * 1024 * 1024, // 50MB
  
  // Notification settings
  MEDICATION_REMINDER_INTERVAL: 15 * 60 * 1000, // 15 minutes
  APPOINTMENT_REMINDER_TIMES: [24 * 60, 60, 15], // 24 hours, 1 hour, 15 minutes before
  
  // Network settings
  API_TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;

// ============================================================================
// UI CONSTANTS
// ============================================================================

export const UI_CONSTANTS = {
  // Spacing
  SPACING: {
    XS: 4,
    SM: 8,
    MD: 16,
    LG: 24,
    XL: 32,
    XXL: 48,
  },
  
  // Border radius
  BORDER_RADIUS: {
    SM: 4,
    MD: 8,
    LG: 12,
    XL: 16,
    PILL: 999,
  },
  
  // Font sizes
  FONT_SIZE: {
    XS: 12,
    SM: 14,
    MD: 16,
    LG: 18,
    XL: 20,
    XXL: 24,
    XXXL: 32,
  },
  
  // Icon sizes
  ICON_SIZE: {
    XS: 16,
    SM: 20,
    MD: 24,
    LG: 28,
    XL: 32,
    XXL: 48,
  },
  
  // Screen dimensions
  HEADER_HEIGHT: 60,
  TAB_BAR_HEIGHT: 80,
  SAFE_AREA_PADDING: 20,
  
  // Animation durations
  ANIMATION: {
    FAST: 150,
    NORMAL: 250,
    SLOW: 350,
  },
} as const;

// ============================================================================
// ERROR MESSAGES
// ============================================================================

export const ERROR_MESSAGES = {
  // Network errors
  NETWORK_ERROR: 'Network connection error. Please check your internet connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  TIMEOUT_ERROR: 'Request timeout. Please try again.',
  
  // Authentication errors
  INVALID_CREDENTIALS: 'Invalid email/phone or password.',
  ACCOUNT_LOCKED: 'Account locked due to too many failed attempts.',
  SESSION_EXPIRED: 'Your session has expired. Please log in again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  
  // Validation errors
  REQUIRED_FIELD: 'This field is required.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  INVALID_PHONE: 'Please enter a valid phone number.',
  WEAK_PASSWORD: 'Password must be at least 8 characters with letters and numbers.',
  PASSWORD_MISMATCH: 'Passwords do not match.',
  INVALID_PIN: 'PIN must be 4 digits.',
  INVALID_OTP: 'Invalid OTP code.',
  
  // Permission errors
  CAMERA_PERMISSION: 'Camera permission is required to scan documents.',
  LOCATION_PERMISSION: 'Location permission is required to find nearby facilities.',
  BIOMETRIC_PERMISSION: 'Biometric permission is required for secure authentication.',
  
  // Generic errors
  SOMETHING_WENT_WRONG: 'Something went wrong. Please try again.',
  TRY_AGAIN_LATER: 'Please try again later.',
  NO_DATA_FOUND: 'No data found.',
  OFFLINE_ERROR: 'You are offline. Some features may not be available.',
} as const;

// ============================================================================
// SUCCESS MESSAGES
// ============================================================================

export const SUCCESS_MESSAGES = {
  // Authentication
  LOGIN_SUCCESS: 'Welcome back!',
  REGISTRATION_SUCCESS: 'Account created successfully!',
  PASSWORD_RESET: 'Password reset link sent to your email.',
  PIN_SETUP: 'PIN setup completed successfully.',
  BIOMETRIC_SETUP: 'Biometric authentication enabled successfully.',
  
  // Profile
  PROFILE_UPDATED: 'Profile updated successfully.',
  AVATAR_UPDATED: 'Profile picture updated successfully.',
  
  // Health records
  RECORD_ADDED: 'Health record added successfully.',
  RECORD_UPDATED: 'Health record updated successfully.',
  RECORD_DELETED: 'Health record deleted successfully.',
  
  // Medications
  MEDICATION_ADDED: 'Medication added successfully.',
  REMINDER_SET: 'Medication reminder set successfully.',
  
  // Appointments
  APPOINTMENT_BOOKED: 'Appointment booked successfully.',
  APPOINTMENT_CANCELLED: 'Appointment cancelled successfully.',
  APPOINTMENT_RESCHEDULED: 'Appointment rescheduled successfully.',
  
  // General
  SAVED_SUCCESSFULLY: 'Saved successfully.',
  DELETED_SUCCESSFULLY: 'Deleted successfully.',
  SENT_SUCCESSFULLY: 'Sent successfully.',
} as const;

// ============================================================================
// KENYAN HEALTHCARE SPECIFIC CONSTANTS
// ============================================================================

export const KENYA_HEALTHCARE = {
  // NHIF constants
  NHIF: {
    NAME: 'National Hospital Insurance Fund',
    HELPLINE: '0800721601',
    WEBSITE: 'https://www.nhif.or.ke',
  },
  
  // Emergency numbers in Kenya
  EMERGENCY_NUMBERS: {
    AMBULANCE: '999',
    POLICE: '999',
    FIRE: '999',
    RED_CROSS: '1199',
    AA_RESCUE: '0700707070',
    ST_JOHN_AMBULANCE: '0733333333',
  },
  
  // Common Kenyan counties
  COUNTIES: [
    'Baringo', 'Bomet', 'Bungoma', 'Busia', 'Elgeyo-Marakwet', 'Embu',
    'Garissa', 'Homa Bay', 'Isiolo', 'Kajiado', 'Kakamega', 'Kericho',
    'Kiambu', 'Kilifi', 'Kirinyaga', 'Kisii', 'Kisumu', 'Kitui',
    'Kwale', 'Laikipia', 'Lamu', 'Machakos', 'Makueni', 'Mandera',
    'Marsabit', 'Meru', 'Migori', 'Mombasa', 'Murang\'a', 'Nairobi',
    'Nakuru', 'Nandi', 'Narok', 'Nyamira', 'Nyandarua', 'Nyeri',
    'Samburu', 'Siaya', 'Taita-Taveta', 'Tana River', 'Tharaka-Nithi',
    'Trans Nzoia', 'Turkana', 'Uasin Gishu', 'Vihiga', 'Wajir', 'West Pokot',
  ],
  
  // Common medical specialties in Kenya
  SPECIALTIES: [
    'General Practice', 'Internal Medicine', 'Pediatrics', 'Obstetrics & Gynecology',
    'Surgery', 'Orthopedics', 'Cardiology', 'Dermatology', 'Ophthalmology',
    'ENT', 'Psychiatry', 'Radiology', 'Pathology', 'Anesthesiology',
    'Emergency Medicine', 'Family Medicine', 'Neurology', 'Oncology',
    'Urology', 'Nephrology', 'Endocrinology', 'Gastroenterology',
  ],
} as const;

// ============================================================================
// VALIDATION RULES
// ============================================================================

export const VALIDATION_RULES = {
  // Password validation
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SYMBOLS: false,
  },
  
  // Phone number validation (Kenyan format)
  PHONE: {
    REGEX: /^(\+254|0)[17]\d{8}$/,
    LENGTH: 10,
    COUNTRY_CODE: '+254',
  },
  
  // Email validation
  EMAIL: {
    REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    MAX_LENGTH: 254,
  },
  
  // Names validation
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
    REGEX: /^[a-zA-Z\s'-]+$/,
  },
  
  // National ID validation (Kenyan)
  NATIONAL_ID: {
    LENGTH: 8,
    REGEX: /^\d{8}$/,
  },
} as const;

// ============================================================================
// DATE & TIME CONSTANTS
// ============================================================================

export const DATE_TIME = {
  // Date formats
  DATE_FORMAT: 'DD/MM/YYYY',
  TIME_FORMAT: 'HH:mm',
  DATETIME_FORMAT: 'DD/MM/YYYY HH:mm',
  API_DATE_FORMAT: 'YYYY-MM-DD',
  API_DATETIME_FORMAT: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
  
  // Time zones
  TIMEZONE: 'Africa/Nairobi',
  
  // Working hours
  CLINIC_HOURS: {
    START: '08:00',
    END: '17:00',
    LUNCH_START: '13:00',
    LUNCH_END: '14:00',
  },
} as const;

// ============================================================================
// USER DATA OPTIONS
// ============================================================================

export const GENDER_OPTIONS = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
  { label: 'Prefer not to say', value: 'prefer_not_to_say' },
] as const;

export const ID_TYPE_OPTIONS = [
  { label: 'National ID', value: 'national_id' },
  { label: 'Passport', value: 'passport' },
  { label: 'Alien ID', value: 'alien_id' },
  { label: 'Birth Certificate', value: 'birth_certificate' },
] as const;

export const RELATIONSHIP_OPTIONS = [
  { label: 'Spouse', value: 'spouse' },
  { label: 'Parent', value: 'parent' },
  { label: 'Child', value: 'child' },
  { label: 'Sibling', value: 'sibling' },
  { label: 'Friend', value: 'friend' },
  { label: 'Other', value: 'other' },
] as const;

// ============================================================================
// VALIDATION MESSAGES
// ============================================================================

export const VALIDATION_MESSAGES = {
  // General validation messages
  REQUIRED: 'This field is required',
  INVALID_FORMAT: 'Invalid format',
  TOO_SHORT: 'Too short',
  TOO_LONG: 'Too long',
  
  // Phone number validation
  PHONE_REQUIRED: 'Phone number is required',
  PHONE_INVALID: 'Please enter a valid Kenyan phone number',
  PHONE_INVALID_FORMAT: 'Phone number must be in format 07XX XXX XXX or +254 7XX XXX XXX',
  
  // Name validation
  NAME_REQUIRED: 'Name is required',
  NAME_TOO_SHORT: 'Name must be at least 2 characters',
  NAME_TOO_LONG: 'Name must be less than 50 characters',
  NAME_INVALID_CHARS: 'Name can only contain letters, spaces, hyphens and apostrophes',
  
  // Email validation
  EMAIL_REQUIRED: 'Email is required',
  EMAIL_INVALID: 'Please enter a valid email address',
  EMAIL_TOO_LONG: 'Email must be less than 254 characters',
  
  // ID number validation
  ID_REQUIRED: 'ID number is required',
  ID_INVALID: 'Please enter a valid ID number',
  NATIONAL_ID_INVALID: 'National ID must be 8 digits',
  
  // Date validation
  DATE_REQUIRED: 'Date is required',
  DATE_INVALID: 'Please select a valid date',
  DATE_FUTURE: 'Date cannot be in the future',
  DATE_TOO_OLD: 'Please enter a more recent date',
  AGE_TOO_YOUNG: 'You must be at least 13 years old',
  AGE_TOO_OLD: 'Please verify your birth date',
  
  // PIN validation
  PIN_REQUIRED: 'PIN is required',
  PIN_TOO_SHORT: 'PIN must be 6 digits',
  PIN_INVALID: 'PIN must contain only numbers',
  PIN_MISMATCH: 'PINs do not match',
  
  // OTP validation
  OTP_REQUIRED: 'OTP is required',
  OTP_INVALID: 'Please enter a valid 6-digit OTP',
  OTP_EXPIRED: 'OTP has expired. Please request a new one',
  
  // Terms and conditions
  TERMS_REQUIRED: 'You must accept the terms and conditions',
  PRIVACY_REQUIRED: 'You must accept the privacy policy',
  
  // Emergency contact validation
  EMERGENCY_NAME_REQUIRED: 'Emergency contact name is required',
  EMERGENCY_PHONE_REQUIRED: 'Emergency contact phone is required',
  EMERGENCY_RELATIONSHIP_REQUIRED: 'Relationship is required',
  
  // Generic error messages
  NETWORK_ERROR: 'Network error. Please check your connection',
  SERVER_ERROR: 'Server error. Please try again later',
  UNKNOWN_ERROR: 'An unexpected error occurred',
} as const;

// // Export default configuration object
export default {
  API_BASE_URL,
  API_ENDPOINTS,
  STORAGE_KEYS,
  APP_CONFIG,
  UI_CONSTANTS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  KENYA_HEALTHCARE,
  VALIDATION_RULES,
  DATE_TIME,
  GENDER_OPTIONS,
  ID_TYPE_OPTIONS,
  RELATIONSHIP_OPTIONS,
  VALIDATION_MESSAGES,
} as const;
