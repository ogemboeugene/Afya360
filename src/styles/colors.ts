/**
 * Color Palette for Afya360 Healthcare App
 * 
 * This file contains the complete color system optimized for healthcare applications.
 * Colors are chosen to be:
 * - Professional and trustworthy
 * - Accessible (WCAG AA compliant)
 * - Calming and healthcare-appropriate
 * - Suitable for medical information display
 */

// ============================================================================
// PRIMARY COLORS - Medical Blue Theme
// ============================================================================

export const PRIMARY_COLORS = {
  // Main brand colors - Medical blues that inspire trust and professionalism
  primary50: '#E3F2FD',   // Very light blue - backgrounds
  primary100: '#BBDEFB',  // Light blue - subtle highlights
  primary200: '#90CAF9',  // Light blue - disabled states
  primary300: '#64B5F6',  // Medium light blue - hover states
  primary400: '#42A5F5',  // Medium blue - secondary actions
  primary500: '#2196F3',  // Main brand blue - primary actions
  primary600: '#1E88E5',  // Darker blue - pressed states
  primary700: '#1976D2',  // Dark blue - emphasis
  primary800: '#1565C0',  // Darker blue - headers
  primary900: '#0D47A1',  // Darkest blue - text on light backgrounds
} as const;

// ============================================================================
// SECONDARY COLORS - Healthcare Green
// ============================================================================

export const SECONDARY_COLORS = {
  // Healthcare green - represents health, wellness, and positive outcomes
  secondary50: '#E8F5E8',   // Very light green - success backgrounds
  secondary100: '#C8E6C9',  // Light green - subtle success indicators
  secondary200: '#A5D6A7',  // Light green - medication adherence good
  secondary300: '#81C784',  // Medium light green - health improvements
  secondary400: '#66BB6A',  // Medium green - active health status
  secondary500: '#4CAF50',  // Main green - success, health, wellness
  secondary600: '#43A047',  // Darker green - confirmed actions
  secondary700: '#388E3C',  // Dark green - positive health indicators
  secondary800: '#2E7D32',  // Darker green - excellent health status
  secondary900: '#1B5E20',  // Darkest green - text on light backgrounds
} as const;

// ============================================================================
// ACCENT COLORS - Healthcare Orange
// ============================================================================

export const ACCENT_COLORS = {
  // Warm orange - for warnings, reminders, and important calls-to-action
  accent50: '#FFF3E0',    // Very light orange - warning backgrounds
  accent100: '#FFE0B2',   // Light orange - mild warnings
  accent200: '#FFCC80',   // Light orange - medication reminders
  accent300: '#FFB74D',   // Medium light orange - appointment reminders
  accent400: '#FFA726',   // Medium orange - attention needed
  accent500: '#FF9800',   // Main orange - warnings, reminders
  accent600: '#FB8C00',   // Darker orange - urgent reminders
  accent700: '#F57C00',   // Dark orange - important warnings
  accent800: '#EF6C00',   // Darker orange - critical reminders
  accent900: '#E65100',   // Darkest orange - emergency warnings
} as const;

// ============================================================================
// STATUS COLORS - Medical Indicators
// ============================================================================

export const STATUS_COLORS = {
  // Success - Health positive outcomes
  success50: '#E8F5E8',
  success100: '#C8E6C9',
  success500: '#4CAF50',  // Healthy, completed, good adherence
  success700: '#388E3C',
  success900: '#1B5E20',
  
  // Warning - Medical attention needed
  warning50: '#FFF8E1',
  warning100: '#FFECB3',
  warning500: '#FFC107',  // Medication due, appointment reminder
  warning700: '#F57C00',
  warning900: '#E65100',
  
  // Error - Critical medical issues
  error50: '#FFEBEE',
  error100: '#FFCDD2',
  error500: '#F44336',    // Critical alerts, missed medications, emergencies
  error700: '#D32F2F',
  error900: '#B71C1C',
  
  // Info - Medical information
  info50: '#E3F2FD',
  info100: '#BBDEFB',
  info500: '#2196F3',     // General information, tips, educational content
  info700: '#1976D2',
  info900: '#0D47A1',
} as const;

// ============================================================================
// NEUTRAL COLORS - Professional Grays
// ============================================================================

export const NEUTRAL_COLORS = {
  // Professional grays for text, borders, and backgrounds
  white: '#FFFFFF',
  gray50: '#FAFAFA',      // App background
  gray100: '#F5F5F5',     // Card backgrounds
  gray200: '#EEEEEE',     // Dividers, borders
  gray300: '#E0E0E0',     // Disabled elements
  gray400: '#BDBDBD',     // Placeholder text
  gray500: '#9E9E9E',     // Secondary text
  gray600: '#757575',     // Primary text light
  gray700: '#616161',     // Primary text
  gray800: '#424242',     // Headers, emphasis
  gray900: '#212121',     // Main text, titles
  black: '#000000',
} as const;

// ============================================================================
// MEDICAL SPECIALTY COLORS
// ============================================================================

export const SPECIALTY_COLORS = {
  cardiology: '#E91E63',      // Pink/Red - Heart
  neurology: '#9C27B0',       // Purple - Brain
  orthopedics: '#FF5722',     // Orange-Red - Bones
  pediatrics: '#FFEB3B',      // Yellow - Children
  gynecology: '#E91E63',      // Pink - Women's health
  oncology: '#795548',        // Brown - Serious conditions
  dermatology: '#FFC107',     // Amber - Skin
  ophthalmology: '#03DAC5',   // Teal - Eyes
  psychiatry: '#673AB7',      // Deep Purple - Mental health
  emergency: '#F44336',       // Red - Emergency
  general: '#2196F3',         // Blue - General practice
  surgery: '#009688',         // Teal - Surgery
} as const;

// ============================================================================
// MEDICATION COLORS
// ============================================================================

export const MEDICATION_COLORS = {
  taken: '#4CAF50',           // Green - Medication taken
  missed: '#F44336',          // Red - Medication missed
  upcoming: '#FF9800',        // Orange - Medication due soon
  overdue: '#E91E63',         // Pink - Medication overdue
  paused: '#9E9E9E',          // Gray - Medication paused
  morning: '#FFC107',         // Amber - Morning medications
  afternoon: '#FF9800',       // Orange - Afternoon medications
  evening: '#673AB7',         // Purple - Evening medications
  night: '#3F51B5',           // Indigo - Night medications
} as const;

// ============================================================================
// APPOINTMENT COLORS
// ============================================================================

export const APPOINTMENT_COLORS = {
  scheduled: '#2196F3',       // Blue - Scheduled
  confirmed: '#4CAF50',       // Green - Confirmed
  inProgress: '#FF9800',      // Orange - In progress
  completed: '#9C27B0',       // Purple - Completed
  cancelled: '#F44336',       // Red - Cancelled
  noShow: '#795548',          // Brown - No show
  rescheduled: '#FF5722',     // Orange-Red - Rescheduled
} as const;

// ============================================================================
// HEALTH RECORD COLORS
// ============================================================================

export const HEALTH_RECORD_COLORS = {
  diagnosis: '#E91E63',       // Pink - Diagnosis
  labResult: '#2196F3',       // Blue - Lab results
  imaging: '#9C27B0',         // Purple - Imaging
  surgery: '#FF5722',         // Orange-Red - Surgery
  vaccination: '#4CAF50',     // Green - Vaccination
  checkup: '#00BCD4',         // Cyan - Regular checkup
  emergency: '#F44336',       // Red - Emergency
  prescription: '#FF9800',    // Orange - Prescription
} as const;

// ============================================================================
// GRADIENT DEFINITIONS
// ============================================================================

export const GRADIENTS = {
  primary: ['#2196F3', '#1976D2'],           // Blue gradient
  secondary: ['#4CAF50', '#388E3C'],         // Green gradient
  accent: ['#FF9800', '#F57C00'],            // Orange gradient
  success: ['#4CAF50', '#2E7D32'],           // Success gradient
  warning: ['#FFC107', '#F57C00'],           // Warning gradient
  error: ['#F44336', '#D32F2F'],             // Error gradient
  medical: ['#2196F3', '#4CAF50'],           // Medical gradient (blue to green)
  health: ['#E8F5E8', '#C8E6C9'],            // Health background gradient
  emergency: ['#FF5722', '#F44336'],         // Emergency gradient
} as const;

// ============================================================================
// SEMANTIC COLOR MAPPINGS
// ============================================================================

export const SEMANTIC_COLORS = {
  // Background colors
  background: {
    primary: NEUTRAL_COLORS.white,
    secondary: NEUTRAL_COLORS.gray50,
    tertiary: NEUTRAL_COLORS.gray100,
    modal: 'rgba(0, 0, 0, 0.5)',
  },
  
  // Text colors
  text: {
    primary: NEUTRAL_COLORS.gray900,
    secondary: NEUTRAL_COLORS.gray600,
    tertiary: NEUTRAL_COLORS.gray500,
    inverse: NEUTRAL_COLORS.white,
    disabled: NEUTRAL_COLORS.gray400,
    link: PRIMARY_COLORS.primary500,
    error: STATUS_COLORS.error500,
    success: STATUS_COLORS.success500,
    warning: STATUS_COLORS.warning700,
  },
  
  // Border colors
  border: {
    primary: NEUTRAL_COLORS.gray200,
    secondary: NEUTRAL_COLORS.gray300,
    focus: PRIMARY_COLORS.primary500,
    error: STATUS_COLORS.error500,
    success: STATUS_COLORS.success500,
    warning: STATUS_COLORS.warning500,
  },
  
  // Button colors
  button: {
    primary: PRIMARY_COLORS.primary500,
    primaryHover: PRIMARY_COLORS.primary600,
    primaryPressed: PRIMARY_COLORS.primary700,
    secondary: SECONDARY_COLORS.secondary500,
    secondaryHover: SECONDARY_COLORS.secondary600,
    accent: ACCENT_COLORS.accent500,
    accentHover: ACCENT_COLORS.accent600,
    disabled: NEUTRAL_COLORS.gray300,
    destructive: STATUS_COLORS.error500,
    destructiveHover: STATUS_COLORS.error700,
  },
  
  // Card colors
  card: {
    background: NEUTRAL_COLORS.white,
    border: NEUTRAL_COLORS.gray200,
    shadow: 'rgba(0, 0, 0, 0.1)',
    hover: NEUTRAL_COLORS.gray50,
  },
  
  // Input colors
  input: {
    background: NEUTRAL_COLORS.white,
    border: NEUTRAL_COLORS.gray300,
    borderFocus: PRIMARY_COLORS.primary500,
    borderError: STATUS_COLORS.error500,
    placeholder: NEUTRAL_COLORS.gray500,
    disabled: NEUTRAL_COLORS.gray100,
  },
  
  // Health status colors
  health: {
    excellent: STATUS_COLORS.success700,
    good: STATUS_COLORS.success500,
    fair: STATUS_COLORS.warning500,
    poor: STATUS_COLORS.error500,
    critical: STATUS_COLORS.error700,
    unknown: NEUTRAL_COLORS.gray500,
  },
} as const;

// ============================================================================
// ACCESSIBILITY COLORS
// ============================================================================

export const ACCESSIBILITY_COLORS = {
  // High contrast mode colors
  highContrast: {
    background: '#FFFFFF',
    text: '#000000',
    primary: '#0000FF',
    secondary: '#008000',
    error: '#FF0000',
    warning: '#FFA500',
    border: '#000000',
  },
  
  // Focus indicators
  focus: {
    outline: PRIMARY_COLORS.primary500,
    shadow: `0 0 0 3px ${PRIMARY_COLORS.primary200}`,
  },
} as const;

// ============================================================================
// EXPORT COLLECTIONS
// ============================================================================

// Main color palette
export const COLORS = {
  ...PRIMARY_COLORS,
  ...SECONDARY_COLORS,
  ...ACCENT_COLORS,
  ...STATUS_COLORS,
  ...NEUTRAL_COLORS,
  ...SEMANTIC_COLORS,
} as const;

// All colors organized by category
export const COLOR_PALETTE = {
  primary: PRIMARY_COLORS,
  secondary: SECONDARY_COLORS,
  accent: ACCENT_COLORS,
  status: STATUS_COLORS,
  neutral: NEUTRAL_COLORS,
  specialty: SPECIALTY_COLORS,
  medication: MEDICATION_COLORS,
  appointment: APPOINTMENT_COLORS,
  healthRecord: HEALTH_RECORD_COLORS,
  gradients: GRADIENTS,
  semantic: SEMANTIC_COLORS,
  accessibility: ACCESSIBILITY_COLORS,
} as const;

// Default export
export default COLOR_PALETTE;
