/**
 * Card Components for Afya360 Healthcare App
 * 
 * Exports all card-related components including base cards,
 * health-specific cards, and specialized healthcare displays.
 */

// Base Card Components
export { Card } from './Card';
export type { CardProps, CardVariant, CardSize, CardStatus } from './Card';

// Healthcare-Specific Cards
export { HealthCard } from './HealthCard';
export type { 
  HealthCardProps, 
  HealthCardType, 
  HealthCardData 
} from './HealthCard';

// Default export for convenience
export default {
  Card,
  HealthCard,
};
