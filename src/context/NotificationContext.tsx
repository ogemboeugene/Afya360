/**
 * Notification Context for Afya360 Healthcare App
 * 
 * Manages push notifications, in-app notifications, medication reminders,
 * appointment alerts, and health-related notifications across the app.
 */

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { NotificationSettings, User } from '../types';
import { storageService } from '../services/storage/storageService';
import { apiClient } from '../services/api/apiClient';

// ============================================================================
// NOTIFICATION TYPES & INTERFACES
// ============================================================================

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  type: 'medication' | 'appointment' | 'emergency' | 'health_tip' | 'system' | 'reminder';
  priority: 'low' | 'normal' | 'high' | 'critical';
  isRead: boolean;
  createdAt: Date;
  scheduledFor?: Date;
  actionRequired?: boolean;
  deepLink?: string;
}

export interface MedicationReminder {
  id: string;
  medicationId: string;
  medicationName: string;
  dosage: string;
  scheduledTimes: string[]; // Array of time strings like "08:00", "20:00"
  isActive: boolean;
  userId: string;
}

export interface AppointmentReminder {
  id: string;
  appointmentId: string;
  title: string;
  dateTime: Date;
  reminderTimes: number[]; // Minutes before appointment: [60, 15]
  isActive: boolean;
}

// ============================================================================
// NOTIFICATION STATE & ACTIONS
// ============================================================================

interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  notificationSettings: NotificationSettings | null;
  pushToken: string | null;
  isPermissionGranted: boolean;
  medicationReminders: MedicationReminder[];
  appointmentReminders: AppointmentReminder[];
  isLoading: boolean;
  error: string | null;
}

type NotificationAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_NOTIFICATIONS'; payload: AppNotification[] }
  | { type: 'ADD_NOTIFICATION'; payload: AppNotification }
  | { type: 'UPDATE_NOTIFICATION'; payload: AppNotification }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'MARK_AS_READ'; payload: string }
  | { type: 'MARK_ALL_AS_READ' }
  | { type: 'SET_UNREAD_COUNT'; payload: number }
  | { type: 'SET_NOTIFICATION_SETTINGS'; payload: NotificationSettings }
  | { type: 'SET_PUSH_TOKEN'; payload: string | null }
  | { type: 'SET_PERMISSION_GRANTED'; payload: boolean }
  | { type: 'SET_MEDICATION_REMINDERS'; payload: MedicationReminder[] }
  | { type: 'ADD_MEDICATION_REMINDER'; payload: MedicationReminder }
  | { type: 'UPDATE_MEDICATION_REMINDER'; payload: MedicationReminder }
  | { type: 'REMOVE_MEDICATION_REMINDER'; payload: string }
  | { type: 'SET_APPOINTMENT_REMINDERS'; payload: AppointmentReminder[] }
  | { type: 'ADD_APPOINTMENT_REMINDER'; payload: AppointmentReminder }
  | { type: 'UPDATE_APPOINTMENT_REMINDER'; payload: AppointmentReminder }
  | { type: 'REMOVE_APPOINTMENT_REMINDER'; payload: string }
  | { type: 'CLEAR_ALL_NOTIFICATIONS' };

// ============================================================================
// INITIAL STATE & REDUCER
// ============================================================================

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  notificationSettings: null,
  pushToken: null,
  isPermissionGranted: false,
  medicationReminders: [],
  appointmentReminders: [],
  isLoading: false,
  error: null,
};

const notificationReducer = (state: NotificationState, action: NotificationAction): NotificationState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    
    case 'SET_NOTIFICATIONS':
      const unreadCount = action.payload.filter(n => !n.isRead).length;
      return { 
        ...state, 
        notifications: action.payload.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ),
        unreadCount 
      };
    
    case 'ADD_NOTIFICATION':
      const newNotifications = [action.payload, ...state.notifications];
      return {
        ...state,
        notifications: newNotifications,
        unreadCount: action.payload.isRead ? state.unreadCount : state.unreadCount + 1,
      };
    
    case 'UPDATE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification.id === action.payload.id ? action.payload : notification
        ),
      };
    
    case 'REMOVE_NOTIFICATION':
      const removedNotification = state.notifications.find(n => n.id === action.payload);
      return {
        ...state,
        notifications: state.notifications.filter(notification => notification.id !== action.payload),
        unreadCount: removedNotification && !removedNotification.isRead 
          ? state.unreadCount - 1 
          : state.unreadCount,
      };
    
    case 'MARK_AS_READ':
      const targetNotification = state.notifications.find(n => n.id === action.payload);
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification.id === action.payload 
            ? { ...notification, isRead: true }
            : notification
        ),
        unreadCount: targetNotification && !targetNotification.isRead 
          ? state.unreadCount - 1 
          : state.unreadCount,
      };
    
    case 'MARK_ALL_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map(notification => ({
          ...notification,
          isRead: true,
        })),
        unreadCount: 0,
      };
    
    case 'SET_UNREAD_COUNT':
      return { ...state, unreadCount: action.payload };
    
    case 'SET_NOTIFICATION_SETTINGS':
      return { ...state, notificationSettings: action.payload };
    
    case 'SET_PUSH_TOKEN':
      return { ...state, pushToken: action.payload };
    
    case 'SET_PERMISSION_GRANTED':
      return { ...state, isPermissionGranted: action.payload };
    
    case 'SET_MEDICATION_REMINDERS':
      return { ...state, medicationReminders: action.payload };
    
    case 'ADD_MEDICATION_REMINDER':
      return {
        ...state,
        medicationReminders: [...state.medicationReminders, action.payload],
      };
    
    case 'UPDATE_MEDICATION_REMINDER':
      return {
        ...state,
        medicationReminders: state.medicationReminders.map(reminder =>
          reminder.id === action.payload.id ? action.payload : reminder
        ),
      };
    
    case 'REMOVE_MEDICATION_REMINDER':
      return {
        ...state,
        medicationReminders: state.medicationReminders.filter(reminder => reminder.id !== action.payload),
      };
    
    case 'SET_APPOINTMENT_REMINDERS':
      return { ...state, appointmentReminders: action.payload };
    
    case 'ADD_APPOINTMENT_REMINDER':
      return {
        ...state,
        appointmentReminders: [...state.appointmentReminders, action.payload],
      };
    
    case 'UPDATE_APPOINTMENT_REMINDER':
      return {
        ...state,
        appointmentReminders: state.appointmentReminders.map(reminder =>
          reminder.id === action.payload.id ? action.payload : reminder
        ),
      };
    
    case 'REMOVE_APPOINTMENT_REMINDER':
      return {
        ...state,
        appointmentReminders: state.appointmentReminders.filter(reminder => reminder.id !== action.payload),
      };
    
    case 'CLEAR_ALL_NOTIFICATIONS':
      return {
        ...state,
        notifications: [],
        unreadCount: 0,
      };
    
    default:
      return state;
  }
};

// ============================================================================
// CONTEXT INTERFACE & PROVIDER
// ============================================================================

interface NotificationContextType extends NotificationState {
  // Permission & Setup
  requestPermission: () => Promise<boolean>;
  registerForPushNotifications: () => Promise<string | null>;
  
  // Notification Management
  fetchNotifications: () => Promise<void>;
  addNotification: (notification: Omit<AppNotification, 'id' | 'createdAt'>) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  removeNotification: (id: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  
  // Scheduling
  scheduleLocalNotification: (notification: {
    title: string;
    body: string;
    data?: Record<string, any>;
    trigger?: Date | number;
  }) => Promise<string>;
  cancelScheduledNotification: (id: string) => Promise<void>;
  
  // Settings
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => Promise<void>;
  getNotificationSettings: () => Promise<NotificationSettings | null>;
  
  // Medication Reminders
  addMedicationReminder: (reminder: Omit<MedicationReminder, 'id'>) => Promise<void>;
  updateMedicationReminder: (id: string, updates: Partial<MedicationReminder>) => Promise<void>;
  removeMedicationReminder: (id: string) => Promise<void>;
  
  // Appointment Reminders
  addAppointmentReminder: (reminder: Omit<AppointmentReminder, 'id'>) => Promise<void>;
  updateAppointmentReminder: (id: string, updates: Partial<AppointmentReminder>) => Promise<void>;
  removeAppointmentReminder: (id: string) => Promise<void>;
  
  // Health Notifications
  sendHealthTip: (tip: string) => Promise<void>;
  sendEmergencyAlert: (message: string, data?: Record<string, any>) => Promise<void>;
  
  // Utility
  getUnreadNotifications: () => AppNotification[];
  getNotificationsByType: (type: AppNotification['type']) => AppNotification[];
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);

  // ============================================================================
  // SETUP & PERMISSIONS
  // ============================================================================

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      const granted = finalStatus === 'granted';
      dispatch({ type: 'SET_PERMISSION_GRANTED', payload: granted });
      
      if (granted) {
        await registerForPushNotifications();
      }
      
      return granted;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to request notification permission' });
      return false;
    }
  }, []);

  const registerForPushNotifications = useCallback(async (): Promise<string | null> => {
    try {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Afya360 Notifications',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      const token = (await Notifications.getExpoPushTokenAsync()).data;
      dispatch({ type: 'SET_PUSH_TOKEN', payload: token });
      
      // Send token to backend
      if (token) {
        await apiClient.post('/notifications/register-token', { 
          pushToken: token,
          platform: Platform.OS 
        });
      }
      
      return token;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to register for push notifications' });
      return null;
    }
  }, []);

  // ============================================================================
  // NOTIFICATION MANAGEMENT
  // ============================================================================

  const fetchNotifications = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const response = await apiClient.get('/notifications');
      dispatch({ type: 'SET_NOTIFICATIONS', payload: response.data });
      
      await storageService.setItem('notifications', response.data);
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch notifications' });
      
      // Try to load from cache
      const cachedNotifications = await storageService.getItem('notifications');
      if (cachedNotifications) {
        dispatch({ type: 'SET_NOTIFICATIONS', payload: cachedNotifications });
      }
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const addNotification = useCallback(async (notification: Omit<AppNotification, 'id' | 'createdAt'>) => {
    try {
      const newNotification: AppNotification = {
        ...notification,
        id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
      };

      dispatch({ type: 'ADD_NOTIFICATION', payload: newNotification });
      
      // Sync with backend
      await apiClient.post('/notifications', newNotification);
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add notification' });
    }
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    try {
      dispatch({ type: 'MARK_AS_READ', payload: id });
      await apiClient.put(`/notifications/${id}/read`);
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to mark notification as read' });
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      dispatch({ type: 'MARK_ALL_AS_READ' });
      await apiClient.put('/notifications/read-all');
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to mark all notifications as read' });
    }
  }, []);

  const removeNotification = useCallback(async (id: string) => {
    try {
      dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
      await apiClient.delete(`/notifications/${id}`);
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to remove notification' });
    }
  }, []);

  const clearAllNotifications = useCallback(async () => {
    try {
      dispatch({ type: 'CLEAR_ALL_NOTIFICATIONS' });
      await apiClient.delete('/notifications/clear-all');
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to clear notifications' });
    }
  }, []);

  // ============================================================================
  // LOCAL NOTIFICATION SCHEDULING
  // ============================================================================

  const scheduleLocalNotification = useCallback(async (notification: {
    title: string;
    body: string;
    data?: Record<string, any>;
    trigger?: Date | number;
  }): Promise<string> => {
    try {
      const trigger = notification.trigger 
        ? (notification.trigger instanceof Date 
            ? notification.trigger 
            : new Date(Date.now() + notification.trigger))
        : undefined;

      const triggerInput = trigger ? {
        type: Notifications.SchedulableTriggerInputTypes.DATE as Notifications.SchedulableTriggerInputTypes.DATE,
        date: trigger instanceof Date ? trigger : new Date(trigger)
      } : null;

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data || {},
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: triggerInput,
      });

      return notificationId;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to schedule notification' });
      throw error;
    }
  }, []);

  const cancelScheduledNotification = useCallback(async (id: string) => {
    try {
      await Notifications.cancelScheduledNotificationAsync(id);
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to cancel scheduled notification' });
    }
  }, []);

  // ============================================================================
  // SETTINGS
  // ============================================================================

  const updateNotificationSettings = useCallback(async (settings: Partial<NotificationSettings>) => {
    try {
      const currentSettings = state.notificationSettings || {};
      const updatedSettings: NotificationSettings = { 
        pushNotifications: true,
        emailNotifications: true,
        smsNotifications: false,
        medicationReminders: true,
        appointmentReminders: true,
        healthTips: true,
        emergencyAlerts: true,
        quietHoursStart: '22:00',
        quietHoursEnd: '07:00',
        ...currentSettings, 
        ...settings 
      };
      
      dispatch({ type: 'SET_NOTIFICATION_SETTINGS', payload: updatedSettings });
      await storageService.setItem('notification_settings', updatedSettings);
      await apiClient.put('/notifications/settings', updatedSettings);
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update notification settings' });
    }
  }, [state.notificationSettings]);

  const getNotificationSettings = useCallback(async (): Promise<NotificationSettings | null> => {
    try {
      const response = await apiClient.get('/notifications/settings');
      const settings = response.data;
      dispatch({ type: 'SET_NOTIFICATION_SETTINGS', payload: settings });
      await storageService.setItem('notification_settings', settings);
      return settings;
    } catch (error) {
      // Try to load from local storage
      const cachedSettings = await storageService.getItem('notification_settings');
      if (cachedSettings) {
        dispatch({ type: 'SET_NOTIFICATION_SETTINGS', payload: cachedSettings });
        return cachedSettings;
      }
      return null;
    }
  }, []);

  // ============================================================================
  // MEDICATION REMINDERS
  // ============================================================================

  const addMedicationReminder = useCallback(async (reminder: Omit<MedicationReminder, 'id'>) => {
    try {
      const newReminder: MedicationReminder = {
        ...reminder,
        id: `med_reminder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };

      dispatch({ type: 'ADD_MEDICATION_REMINDER', payload: newReminder });
      
      // Schedule local notifications for each time
      if (newReminder.isActive) {
        for (const time of newReminder.scheduledTimes) {
          await scheduleLocalNotification({
            title: 'Medication Reminder',
            body: `Time to take ${newReminder.medicationName} (${newReminder.dosage})`,
            data: { type: 'medication', reminderId: newReminder.id },
            trigger: new Date(`1970-01-01T${time}:00`), // Daily recurring
          });
        }
      }
      
      await apiClient.post('/notifications/medication-reminders', newReminder);
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add medication reminder' });
    }
  }, [scheduleLocalNotification]);

  const updateMedicationReminder = useCallback(async (id: string, updates: Partial<MedicationReminder>) => {
    try {
      const updatedReminder = state.medicationReminders.find(r => r.id === id);
      if (updatedReminder) {
        const newReminder = { ...updatedReminder, ...updates };
        dispatch({ type: 'UPDATE_MEDICATION_REMINDER', payload: newReminder });
        await apiClient.put(`/notifications/medication-reminders/${id}`, updates);
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update medication reminder' });
    }
  }, [state.medicationReminders]);

  const removeMedicationReminder = useCallback(async (id: string) => {
    try {
      dispatch({ type: 'REMOVE_MEDICATION_REMINDER', payload: id });
      await apiClient.delete(`/notifications/medication-reminders/${id}`);
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to remove medication reminder' });
    }
  }, []);

  // ============================================================================
  // APPOINTMENT REMINDERS (abbreviated implementation)
  // ============================================================================

  const addAppointmentReminder = useCallback(async (reminder: Omit<AppointmentReminder, 'id'>) => {
    // Implementation similar to medication reminders
  }, []);

  const updateAppointmentReminder = useCallback(async (id: string, updates: Partial<AppointmentReminder>) => {
    // Implementation similar to medication reminders
  }, []);

  const removeAppointmentReminder = useCallback(async (id: string) => {
    // Implementation similar to medication reminders
  }, []);

  // ============================================================================
  // HEALTH NOTIFICATIONS
  // ============================================================================

  const sendHealthTip = useCallback(async (tip: string) => {
    try {
      await addNotification({
        title: 'Health Tip',
        body: tip,
        type: 'health_tip',
        priority: 'normal',
        isRead: false,
      });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to send health tip' });
    }
  }, [addNotification]);

  const sendEmergencyAlert = useCallback(async (message: string, data?: Record<string, any>) => {
    try {
      await addNotification({
        title: 'Emergency Alert',
        body: message,
        data,
        type: 'emergency',
        priority: 'critical',
        isRead: false,
        actionRequired: true,
      });
      
      // Also send immediate local notification
      await scheduleLocalNotification({
        title: 'Emergency Alert',
        body: message,
        data: { ...data, urgent: true },
      });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to send emergency alert' });
    }
  }, [addNotification, scheduleLocalNotification]);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const getUnreadNotifications = useCallback((): AppNotification[] => {
    return state.notifications.filter(notification => !notification.isRead);
  }, [state.notifications]);

  const getNotificationsByType = useCallback((type: AppNotification['type']): AppNotification[] => {
    return state.notifications.filter(notification => notification.type === type);
  }, [state.notifications]);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    // Set up notification handlers
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      const notificationData = response.notification.request.content.data;
      // Handle notification tap/interaction
      console.log('Notification tapped:', notificationData);
    });

    const receivedListener = Notifications.addNotificationReceivedListener(notification => {
      // Handle notification received while app is in foreground
      console.log('Notification received:', notification);
    });

    return () => {
      Notifications.removeNotificationSubscription(responseListener);
      Notifications.removeNotificationSubscription(receivedListener);
    };
  }, []);

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const contextValue: NotificationContextType = {
    ...state,
    requestPermission,
    registerForPushNotifications,
    fetchNotifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    scheduleLocalNotification,
    cancelScheduledNotification,
    updateNotificationSettings,
    getNotificationSettings,
    addMedicationReminder,
    updateMedicationReminder,
    removeMedicationReminder,
    addAppointmentReminder,
    updateAppointmentReminder,
    removeAppointmentReminder,
    sendHealthTip,
    sendEmergencyAlert,
    getUnreadNotifications,
    getNotificationsByType,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

// ============================================================================
// HOOK
// ============================================================================

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

/**
 * INTEGRATION:
 * - Use expo-notifications for push notifications
 * - Integrate with notification scheduling service
 * - Work with user preferences and settings
 * - Handle deep linking from notifications
 */
