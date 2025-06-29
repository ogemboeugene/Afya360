/**
 * UI Components - Buttons
 * Export all button components for easy importing
 */

export { default as Button } from './Button';
export { default as IconButton } from './IconButton';
export { default as FloatingActionButton } from './FloatingActionButton';

// Re-export types for convenience
export type {
  ButtonProps,
  ButtonVariant,
  ButtonSize,
} from './Button';

export type {
  IconButtonProps,
  IconButtonVariant,
  IconButtonSize,
} from './IconButton';

export type {
  FloatingActionButtonProps,
  FABVariant,
  FABSize,
  FABPosition,
} from './FloatingActionButton';

/**
 * Usage Examples:
 * 
 * import { Button, IconButton, FloatingActionButton } from '../components/ui/buttons';
 * 
 * // Primary button
 * <Button
 *   title="Login"
 *   variant="primary"
 *   size="large"
 *   onPress={handleLogin}
 *   fullWidth
 * />
 * 
 * // Icon button
 * <IconButton
 *   icon="add"
 *   variant="primary"
 *   size="medium"
 *   onPress={handleAdd}
 * />
 * 
 * // Floating Action Button
 * <FloatingActionButton
 *   icon="medical"
 *   variant="emergency"
 *   position="bottom-right"
 *   onPress={handleEmergency}
 * />
 */
