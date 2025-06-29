/**
 * HealthCard Component for Afya360 Healthcare App
 * 
 * A specialized card component for displaying health-related information
 * such as vital signs, medication reminders, appointment details, etc.
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, CardProps } from './Card';
import { COLORS as colors } from '../../styles/colors';
import { GLOBAL_STYLES as globalStyles } from '../../styles/globalStyles';
import { formatDate, formatDateForDisplay } from '../../utils';

// ============================================================================
// INTERFACES
// ============================================================================

export type HealthCardType = 
  | 'vital_signs' 
  | 'medication' 
  | 'appointment' 
  | 'emergency_contact' 
  | 'medical_condition' 
  | 'immunization'
  | 'health_tip'
  | 'alert';

export interface HealthCardData {
  id: string;
  type: HealthCardType;
  title: string;
  subtitle?: string;
  value?: string | number;
  unit?: string;
  date?: Date;
  priority?: 'low' | 'normal' | 'high' | 'critical';
  status?: 'active' | 'inactive' | 'completed' | 'overdue' | 'upcoming';
  metadata?: Record<string, any>;
}

export interface HealthCardProps extends Omit<CardProps, 'children'> {
  data: HealthCardData;
  showDate?: boolean;
  showStatus?: boolean;
  showIcon?: boolean;
  compact?: boolean;
  onActionPress?: () => void;
  actionLabel?: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getCardIcon = (type: HealthCardType): keyof typeof Ionicons.glyphMap => {
  switch (type) {
    case 'vital_signs':
      return 'pulse-outline';
    case 'medication':
      return 'medical-outline';
    case 'appointment':
      return 'calendar-outline';
    case 'emergency_contact':
      return 'call-outline';
    case 'medical_condition':
      return 'fitness-outline';
    case 'immunization':
      return 'shield-checkmark-outline';
    case 'health_tip':
      return 'bulb-outline';
    case 'alert':
      return 'warning-outline';
    default:
      return 'heart-outline';
  }
};

const getStatusColor = (status?: string): string => {
  switch (status) {
    case 'active':
      return colors.status.success;
    case 'inactive':
      return colors.text.tertiary;
    case 'completed':
      return colors.status.success;
    case 'overdue':
      return colors.status.error;
    case 'upcoming':
      return colors.status.warning;
    default:
      return colors.text.secondary;
  }
};

const getPriorityColor = (priority?: string): string => {
  switch (priority) {
    case 'critical':
      return colors.status.error;
    case 'high':
      return colors.status.warning;
    case 'normal':
      return colors.primary.main;
    case 'low':
      return colors.text.tertiary;
    default:
      return colors.text.secondary;
  }
};

// ============================================================================
// HEALTH CARD COMPONENT
// ============================================================================

export const HealthCard: React.FC<HealthCardProps> = ({
  data,
  showDate = true,
  showStatus = true,
  showIcon = true,
  compact = false,
  onActionPress,
  actionLabel,
  ...cardProps
}) => {
  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const iconName = getCardIcon(data.type);
  const statusColor = getStatusColor(data.status);
  const priorityColor = getPriorityColor(data.priority);
  
  const cardStatus = data.priority === 'critical' || data.status === 'overdue' 
    ? 'error' 
    : data.priority === 'high' || data.status === 'upcoming'
    ? 'warning'
    : data.status === 'completed' || data.status === 'active'
    ? 'success'
    : 'default';

  // ============================================================================
  // RENDER METHODS
  // ============================================================================

  const renderHeader = () => (
    <View style={styles.header}>
      {showIcon && (
        <View style={[styles.iconContainer, { backgroundColor: priorityColor + '20' }]}>
          <Ionicons 
            name={iconName} 
            size={compact ? 16 : 20} 
            color={priorityColor}
          />
        </View>
      )}
      
      <View style={styles.headerContent}>
        <Text style={[
          compact ? styles.titleCompact : styles.title,
          { color: colors.text.primary }
        ]}>
          {data.title}
        </Text>
        
        {data.subtitle && (
          <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
            {data.subtitle}
          </Text>
        )}
      </View>

      {showStatus && data.status && (
        <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>
            {data.status.replace('_', ' ').toUpperCase()}
          </Text>
        </View>
      )}
    </View>
  );

  const renderValue = () => {
    if (!data.value) return null;

    return (
      <View style={styles.valueContainer}>
        <Text style={[styles.value, { color: colors.text.primary }]}>
          {data.value}
          {data.unit && (
            <Text style={[styles.unit, { color: colors.text.secondary }]}>
              {' '}{data.unit}
            </Text>
          )}
        </Text>
      </View>
    );
  };

  const renderFooter = () => {
    const hasDate = showDate && data.date;
    const hasAction = onActionPress && actionLabel;
    
    if (!hasDate && !hasAction) return null;

    return (
      <View style={styles.footer}>
        {hasDate && (
          <Text style={[styles.date, { color: colors.text.tertiary }]}>
            {formatDateForDisplay(data.date!)}
          </Text>
        )}
        
        {hasAction && (
          <Text 
            style={[styles.actionButton, { color: colors.primary.main }]}
            onPress={onActionPress}
          >
            {actionLabel}
          </Text>
        )}
      </View>
    );
  };

  const renderMetadata = () => {
    if (!data.metadata || compact) return null;

    return (
      <View style={styles.metadata}>
        {Object.entries(data.metadata).map(([key, value]) => (
          <View key={key} style={styles.metadataItem}>
            <Text style={[styles.metadataKey, { color: colors.text.secondary }]}>
              {key.replace('_', ' ')}:
            </Text>
            <Text style={[styles.metadataValue, { color: colors.text.primary }]}>
              {String(value)}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <Card
      {...cardProps}
      status={cardStatus}
      urgent={data.priority === 'critical'}
      size={compact ? 'small' : 'medium'}
    >
      <View style={compact ? styles.compactContent : styles.content}>
        {renderHeader()}
        {renderValue()}
        {renderMetadata()}
        {renderFooter()}
      </View>
    </Card>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  content: {
    gap: globalStyles.spacing.sm,
  },
  compactContent: {
    gap: globalStyles.spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: globalStyles.spacing.sm,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: globalStyles.borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
    gap: globalStyles.spacing.xs,
  },
  title: {
    ...globalStyles.typography.h4,
    fontWeight: '600',
  },
  titleCompact: {
    ...globalStyles.typography.body1,
    fontWeight: '600',
  },
  subtitle: {
    ...globalStyles.typography.body2,
  },
  statusBadge: {
    paddingHorizontal: globalStyles.spacing.xs,
    paddingVertical: globalStyles.spacing.xs / 2,
    borderRadius: globalStyles.borderRadius.sm,
  },
  statusText: {
    ...globalStyles.typography.caption,
    fontWeight: '600',
    fontSize: 10,
  },
  valueContainer: {
    alignItems: 'flex-start',
  },
  value: {
    ...globalStyles.typography.h2,
    fontWeight: '700',
  },
  unit: {
    ...globalStyles.typography.body1,
    fontWeight: '400',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: globalStyles.spacing.xs,
  },
  date: {
    ...globalStyles.typography.caption,
  },
  actionButton: {
    ...globalStyles.typography.body2,
    fontWeight: '600',
  },
  metadata: {
    gap: globalStyles.spacing.xs,
  },
  metadataItem: {
    flexDirection: 'row',
    gap: globalStyles.spacing.xs,
  },
  metadataKey: {
    ...globalStyles.typography.caption,
    fontWeight: '500',
    textTransform: 'capitalize',
    minWidth: 80,
  },
  metadataValue: {
    ...globalStyles.typography.caption,
    flex: 1,
  },
});

// ============================================================================
// EXPORT
// ============================================================================

export type { HealthCardType, HealthCardData };
export { HealthCard };
export default HealthCard;
