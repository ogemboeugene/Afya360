/**
 * Global Styles for Afya360 Healthcare App
 * 
 * This file contains global styling constants, typography, and reusable style objects
 * that maintain consistency throughout the healthcare application.
 */

import { StyleSheet, Dimensions, Platform } from 'react-native';
import { COLOR_PALETTE, SEMANTIC_COLORS } from './colors';

// ============================================================================
// DEVICE & LAYOUT CONSTANTS
// ============================================================================

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const LAYOUT = {
  // Screen dimensions
  screenWidth: SCREEN_WIDTH,
  screenHeight: SCREEN_HEIGHT,
  
  // Safe area and padding
  safeAreaTop: Platform.OS === 'ios' ? 44 : 0,
  safeAreaBottom: Platform.OS === 'ios' ? 34 : 0,
  
  // Component dimensions
  headerHeight: 60,
  tabBarHeight: 80,
  buttonHeight: 48,
  inputHeight: 48,
  cardMinHeight: 120,
  
  // Responsive breakpoints
  isSmallDevice: SCREEN_WIDTH < 375,
  isMediumDevice: SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 414,
  isLargeDevice: SCREEN_WIDTH >= 414,
  
  // Container widths
  maxContentWidth: 600,
  sideMargin: 20,
} as const;

// ============================================================================
// SPACING SYSTEM
// ============================================================================

export const SPACING = {
  // Base spacing unit (8px)
  unit: 8,
  
  // Predefined spacing values
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
  
  // Semantic spacing
  padding: {
    screen: 20,
    card: 16,
    button: 16,
    input: 12,
    modal: 24,
  },
  
  margin: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
} as const;

// ============================================================================
// TYPOGRAPHY SYSTEM
// ============================================================================

export const TYPOGRAPHY = {
  // Font families
  fontFamily: {
    regular: Platform.select({
      ios: 'System',
      android: 'Roboto',
      default: 'System',
    }),
    medium: Platform.select({
      ios: 'System',
      android: 'Roboto-Medium',
      default: 'System',
    }),
    bold: Platform.select({
      ios: 'System',
      android: 'Roboto-Bold',
      default: 'System',
    }),
    light: Platform.select({
      ios: 'System',
      android: 'Roboto-Light',
      default: 'System',
    }),
  },
  
  // Font sizes
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    display: 40,
  },
  
  // Line heights
  lineHeight: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 28,
    xl: 32,
    xxl: 36,
    xxxl: 40,
    display: 48,
  },
  
  // Font weights
  fontWeight: {
    light: '300' as const,
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
} as const;

// ============================================================================
// BORDER RADIUS SYSTEM
// ============================================================================

export const BORDER_RADIUS = {
  none: 0,
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  pill: 999,
  round: '50%',
} as const;

// ============================================================================
// SHADOW SYSTEM
// ============================================================================

export const SHADOWS = {
  // Card shadows
  card: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    android: {
      elevation: 4,
    },
    default: {},
  }),
  
  // Button shadows
  button: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
    },
    android: {
      elevation: 2,
    },
    default: {},
  }),
  
  // Modal shadows
  modal: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 16,
    },
    android: {
      elevation: 8,
    },
    default: {},
  }),
  
  // Header shadows
  header: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    android: {
      elevation: 2,
    },
    default: {},
  }),
} as const;

// ============================================================================
// TEXT STYLES
// ============================================================================

export const TEXT_STYLES = StyleSheet.create({
  // Display styles
  displayLarge: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.fontSize.display,
    lineHeight: TYPOGRAPHY.lineHeight.display,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: SEMANTIC_COLORS.text.primary,
  },
  
  displayMedium: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    lineHeight: TYPOGRAPHY.lineHeight.xxxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: SEMANTIC_COLORS.text.primary,
  },
  
  // Heading styles
  h1: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.fontSize.xxl,
    lineHeight: TYPOGRAPHY.lineHeight.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: SEMANTIC_COLORS.text.primary,
  },
  
  h2: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.fontSize.xl,
    lineHeight: TYPOGRAPHY.lineHeight.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: SEMANTIC_COLORS.text.primary,
  },
  
  h3: {
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    fontSize: TYPOGRAPHY.fontSize.lg,
    lineHeight: TYPOGRAPHY.lineHeight.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: SEMANTIC_COLORS.text.primary,
  },
  
  h4: {
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    fontSize: TYPOGRAPHY.fontSize.md,
    lineHeight: TYPOGRAPHY.lineHeight.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: SEMANTIC_COLORS.text.primary,
  },
  
  // Body text styles
  bodyLarge: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.fontSize.lg,
    lineHeight: TYPOGRAPHY.lineHeight.lg,
    fontWeight: TYPOGRAPHY.fontWeight.regular,
    color: SEMANTIC_COLORS.text.primary,
  },
  
  body: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.fontSize.md,
    lineHeight: TYPOGRAPHY.lineHeight.md,
    fontWeight: TYPOGRAPHY.fontWeight.regular,
    color: SEMANTIC_COLORS.text.primary,
  },
  
  bodySmall: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.fontSize.sm,
    lineHeight: TYPOGRAPHY.lineHeight.sm,
    fontWeight: TYPOGRAPHY.fontWeight.regular,
    color: SEMANTIC_COLORS.text.secondary,
  },
  
  // Label styles
  label: {
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    fontSize: TYPOGRAPHY.fontSize.sm,
    lineHeight: TYPOGRAPHY.lineHeight.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: SEMANTIC_COLORS.text.primary,
  },
  
  labelSmall: {
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    fontSize: TYPOGRAPHY.fontSize.xs,
    lineHeight: TYPOGRAPHY.lineHeight.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: SEMANTIC_COLORS.text.secondary,
  },
  
  // Caption and helper text
  caption: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.fontSize.xs,
    lineHeight: TYPOGRAPHY.lineHeight.xs,
    fontWeight: TYPOGRAPHY.fontWeight.regular,
    color: SEMANTIC_COLORS.text.tertiary,
  },
  
  // Link styles
  link: {
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    fontSize: TYPOGRAPHY.fontSize.md,
    lineHeight: TYPOGRAPHY.lineHeight.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: SEMANTIC_COLORS.text.link,
    textDecorationLine: 'underline',
  },
  
  // Button text styles
  buttonText: {
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    fontSize: TYPOGRAPHY.fontSize.md,
    lineHeight: TYPOGRAPHY.lineHeight.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    textAlign: 'center',
  },
  
  buttonTextSmall: {
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    fontSize: TYPOGRAPHY.fontSize.sm,
    lineHeight: TYPOGRAPHY.lineHeight.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    textAlign: 'center',
  },
});

// ============================================================================
// CONTAINER STYLES
// ============================================================================

export const CONTAINER_STYLES = StyleSheet.create({
  // Screen containers
  screen: {
    flex: 1,
    backgroundColor: SEMANTIC_COLORS.background.primary,
  },
  
  screenWithPadding: {
    flex: 1,
    backgroundColor: SEMANTIC_COLORS.background.primary,
    paddingHorizontal: SPACING.padding.screen,
  },
  
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: SEMANTIC_COLORS.background.primary,
  },
  
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: SEMANTIC_COLORS.background.primary,
    paddingHorizontal: SPACING.padding.screen,
  },
  
  // Content containers
  contentContainer: {
    flex: 1,
    paddingHorizontal: SPACING.padding.screen,
    paddingTop: SPACING.md,
  },
  
  sectionContainer: {
    marginBottom: SPACING.lg,
  },
  
  // Card containers
  card: {
    backgroundColor: SEMANTIC_COLORS.card.background,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.padding.card,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: SEMANTIC_COLORS.card.border,
    ...SHADOWS.card,
  },
  
  cardNoPadding: {
    backgroundColor: SEMANTIC_COLORS.card.background,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: SEMANTIC_COLORS.card.border,
    ...SHADOWS.card,
  },
  
  // Row and column layouts
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  rowSpaceBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  column: {
    flexDirection: 'column',
  },
  
  // Center layouts
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  centerHorizontal: {
    alignItems: 'center',
  },
  
  centerVertical: {
    justifyContent: 'center',
  },
});

// ============================================================================
// EXPORT ALL STYLES
// ============================================================================

export const GLOBAL_STYLES = {
  LAYOUT,
  SPACING,
  TYPOGRAPHY,
  BORDER_RADIUS,
  SHADOWS,
  TEXT_STYLES,
  CONTAINER_STYLES,
} as const;

export default GLOBAL_STYLES;
