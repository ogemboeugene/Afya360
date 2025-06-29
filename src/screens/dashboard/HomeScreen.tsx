/**
 * HOME SCREEN (DASHBOARD)
 * Main landing page after authentication
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

// Import components
import { Afya360Logo } from '../../components/common/Afya360Logo';

// Import styles
import { COLORS } from '../../styles/colors';
import { TEXT_STYLES } from '../../styles/globalStyles';

// Import hooks
import { useAuth } from '../../hooks/useAuth';

// Types
import { TabParamList } from '../../types';

type HomeScreenNavigationProp = StackNavigationProp<
  TabParamList,
  'Home'
>;

type HomeScreenRouteProp = RouteProp<
  TabParamList,
  'Home'
>;

interface Props {
  navigation: HomeScreenNavigationProp;
  route: HomeScreenRouteProp;
}

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const quickActions = [
    { title: 'Scan Prescription', icon: '📝', action: () => console.log('Scan') },
    { title: 'Find Hospitals', icon: '🏥', action: () => console.log('Hospitals') },
    { title: 'Medications', icon: '💊', action: () => console.log('Medications') },
    { title: 'Emergency', icon: '🚨', action: () => console.log('Emergency') },
  ];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeText}>
              Welcome back, {user?.firstName || 'User'}!
            </Text>
            <Text style={styles.subtitle}>
              How are you feeling today?
            </Text>
          </View>
          
          <TouchableOpacity style={styles.emergencyButton}>
            <Text style={styles.emergencyButtonText}>🚨</Text>
          </TouchableOpacity>
        </View>

        {/* Health Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.cardTitle}>Health Summary</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>3</Text>
              <Text style={styles.summaryLabel}>Active Medications</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>2</Text>
              <Text style={styles.summaryLabel}>Upcoming Appointments</Text>
            </View>
          </View>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>5</Text>
              <Text style={styles.summaryLabel}>Health Records</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>1</Text>
              <Text style={styles.summaryLabel}>New Messages</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={styles.quickActionItem}
                onPress={action.action}
              >
                <Text style={styles.quickActionIcon}>{action.icon}</Text>
                <Text style={styles.quickActionTitle}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.recentActivity}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityItem}>
            <Text style={styles.activityIcon}>🏥</Text>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Hospital Visit</Text>
              <Text style={styles.activityDate}>Yesterday at 2:30 PM</Text>
            </View>
          </View>
          <View style={styles.activityItem}>
            <Text style={styles.activityIcon}>💊</Text>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Medication Reminder</Text>
              <Text style={styles.activityDate}>Today at 8:00 AM</Text>
            </View>
          </View>
        </View>

        {/* Logout Button (temporary for testing) */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray50,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
    backgroundColor: COLORS.white,
  },
  welcomeSection: {
    flex: 1,
  },
  welcomeText: {
    ...TEXT_STYLES.h3,
    color: COLORS.gray900,
    marginBottom: 4,
  },
  subtitle: {
    ...TEXT_STYLES.body,
    color: COLORS.gray600,
  },
  emergencyButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.error500,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emergencyButtonText: {
    fontSize: 24,
  },
  summaryCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: 24,
    marginBottom: 24,
    padding: 20,
    borderRadius: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    ...TEXT_STYLES.h4,
    color: COLORS.gray900,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryNumber: {
    ...TEXT_STYLES.h2,
    color: COLORS.primary500,
    marginBottom: 4,
  },
  summaryLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.gray600,
    textAlign: 'center',
  },
  quickActionsContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    ...TEXT_STYLES.h4,
    color: COLORS.gray900,
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionItem: {
    width: '48%',
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  quickActionTitle: {
    ...TEXT_STYLES.buttonText,
    color: COLORS.gray900,
    textAlign: 'center',
  },
  recentActivity: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  activityIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    ...TEXT_STYLES.buttonText,
    color: COLORS.gray900,
    marginBottom: 4,
  },
  activityDate: {
    ...TEXT_STYLES.caption,
    color: COLORS.gray600,
  },
  logoutButton: {
    marginHorizontal: 24,
    marginBottom: 40,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: COLORS.gray200,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutText: {
    ...TEXT_STYLES.buttonText,
    color: COLORS.gray700,
  },
});

export default HomeScreen;
