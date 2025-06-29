/**
 * Health Context for Afya360 Healthcare App
 * 
 * Manages health records, medical data, and health-related state across the app.
 * Provides centralized access to health information, vital signs, medications,
 * appointments, and health analytics.
 */

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { 
  HealthRecord, 
  MedicalCondition, 
  Medication, 
  VitalSigns, 
  Appointment, 
  Immunization,
  HealthInsurance,
  EmergencyContact,
  HealthMetrics,
  User
} from '../types';
import { storageService } from '../services/storage/storageService';
import { apiClient } from '../services/api/apiClient';
import { calculateBMI, calculateBMICategory, calculateAgeFromDate } from '../utils/healthcare';

// ============================================================================
// HEALTH STATE & ACTIONS
// ============================================================================

interface HealthState {
  healthRecords: HealthRecord[];
  medicalConditions: MedicalCondition[];
  medications: Medication[];
  vitalSigns: VitalSigns[];
  appointments: Appointment[];
  immunizations: Immunization[];
  healthInsurance: HealthInsurance | null;
  emergencyContacts: EmergencyContact[];
  healthMetrics: HealthMetrics | null;
  isLoading: boolean;
  error: string | null;
  lastSyncAt: Date | null;
}

type HealthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_HEALTH_RECORDS'; payload: HealthRecord[] }
  | { type: 'ADD_HEALTH_RECORD'; payload: HealthRecord }
  | { type: 'UPDATE_HEALTH_RECORD'; payload: HealthRecord }
  | { type: 'DELETE_HEALTH_RECORD'; payload: string }
  | { type: 'SET_MEDICAL_CONDITIONS'; payload: MedicalCondition[] }
  | { type: 'ADD_MEDICAL_CONDITION'; payload: MedicalCondition }
  | { type: 'UPDATE_MEDICAL_CONDITION'; payload: MedicalCondition }
  | { type: 'DELETE_MEDICAL_CONDITION'; payload: string }
  | { type: 'SET_MEDICATIONS'; payload: Medication[] }
  | { type: 'ADD_MEDICATION'; payload: Medication }
  | { type: 'UPDATE_MEDICATION'; payload: Medication }
  | { type: 'DELETE_MEDICATION'; payload: string }
  | { type: 'SET_VITAL_SIGNS'; payload: VitalSigns[] }
  | { type: 'ADD_VITAL_SIGNS'; payload: VitalSigns }
  | { type: 'SET_APPOINTMENTS'; payload: Appointment[] }
  | { type: 'ADD_APPOINTMENT'; payload: Appointment }
  | { type: 'UPDATE_APPOINTMENT'; payload: Appointment }
  | { type: 'DELETE_APPOINTMENT'; payload: string }
  | { type: 'SET_IMMUNIZATIONS'; payload: Immunization[] }
  | { type: 'ADD_IMMUNIZATION'; payload: Immunization }
  | { type: 'SET_HEALTH_INSURANCE'; payload: HealthInsurance | null }
  | { type: 'SET_EMERGENCY_CONTACTS'; payload: EmergencyContact[] }
  | { type: 'ADD_EMERGENCY_CONTACT'; payload: EmergencyContact }
  | { type: 'UPDATE_EMERGENCY_CONTACT'; payload: EmergencyContact }
  | { type: 'DELETE_EMERGENCY_CONTACT'; payload: string }
  | { type: 'UPDATE_HEALTH_METRICS'; payload: HealthMetrics }
  | { type: 'SET_LAST_SYNC'; payload: Date }
  | { type: 'RESET_HEALTH_DATA' };

// ============================================================================
// INITIAL STATE & REDUCER
// ============================================================================

const initialState: HealthState = {
  healthRecords: [],
  medicalConditions: [],
  medications: [],
  vitalSigns: [],
  appointments: [],
  immunizations: [],
  healthInsurance: null,
  emergencyContacts: [],
  healthMetrics: null,
  isLoading: false,
  error: null,
  lastSyncAt: null,
};

const healthReducer = (state: HealthState, action: HealthAction): HealthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    
    case 'SET_HEALTH_RECORDS':
      return { ...state, healthRecords: action.payload };
    
    case 'ADD_HEALTH_RECORD':
      return { 
        ...state, 
        healthRecords: [...state.healthRecords, action.payload] 
      };
    
    case 'UPDATE_HEALTH_RECORD':
      return {
        ...state,
        healthRecords: state.healthRecords.map(record =>
          record.id === action.payload.id ? action.payload : record
        ),
      };
    
    case 'DELETE_HEALTH_RECORD':
      return {
        ...state,
        healthRecords: state.healthRecords.filter(record => record.id !== action.payload),
      };
    
    case 'SET_MEDICAL_CONDITIONS':
      return { ...state, medicalConditions: action.payload };
    
    case 'ADD_MEDICAL_CONDITION':
      return {
        ...state,
        medicalConditions: [...state.medicalConditions, action.payload],
      };
    
    case 'UPDATE_MEDICAL_CONDITION':
      return {
        ...state,
        medicalConditions: state.medicalConditions.map(condition =>
          condition.id === action.payload.id ? action.payload : condition
        ),
      };
    
    case 'DELETE_MEDICAL_CONDITION':
      return {
        ...state,
        medicalConditions: state.medicalConditions.filter(condition => condition.id !== action.payload),
      };
    
    case 'SET_MEDICATIONS':
      return { ...state, medications: action.payload };
    
    case 'ADD_MEDICATION':
      return {
        ...state,
        medications: [...state.medications, action.payload],
      };
    
    case 'UPDATE_MEDICATION':
      return {
        ...state,
        medications: state.medications.map(medication =>
          medication.id === action.payload.id ? action.payload : medication
        ),
      };
    
    case 'DELETE_MEDICATION':
      return {
        ...state,
        medications: state.medications.filter(medication => medication.id !== action.payload),
      };
    
    case 'SET_VITAL_SIGNS':
      return { ...state, vitalSigns: action.payload };
    
    case 'ADD_VITAL_SIGNS':
      return {
        ...state,
        vitalSigns: [action.payload, ...state.vitalSigns],
      };
    
    case 'SET_APPOINTMENTS':
      return { ...state, appointments: action.payload };
    
    case 'ADD_APPOINTMENT':
      return {
        ...state,
        appointments: [...state.appointments, action.payload],
      };
    
    case 'UPDATE_APPOINTMENT':
      return {
        ...state,
        appointments: state.appointments.map(appointment =>
          appointment.id === action.payload.id ? action.payload : appointment
        ),
      };
    
    case 'DELETE_APPOINTMENT':
      return {
        ...state,
        appointments: state.appointments.filter(appointment => appointment.id !== action.payload),
      };
    
    case 'SET_IMMUNIZATIONS':
      return { ...state, immunizations: action.payload };
    
    case 'ADD_IMMUNIZATION':
      return {
        ...state,
        immunizations: [...state.immunizations, action.payload],
      };
    
    case 'SET_HEALTH_INSURANCE':
      return { ...state, healthInsurance: action.payload };
    
    case 'SET_EMERGENCY_CONTACTS':
      return { ...state, emergencyContacts: action.payload };
    
    case 'ADD_EMERGENCY_CONTACT':
      return {
        ...state,
        emergencyContacts: [...state.emergencyContacts, action.payload],
      };
    
    case 'UPDATE_EMERGENCY_CONTACT':
      return {
        ...state,
        emergencyContacts: state.emergencyContacts.map(contact =>
          contact.id === action.payload.id ? action.payload : contact
        ),
      };
    
    case 'DELETE_EMERGENCY_CONTACT':
      return {
        ...state,
        emergencyContacts: state.emergencyContacts.filter(contact => contact.id !== action.payload),
      };
    
    case 'UPDATE_HEALTH_METRICS':
      return { ...state, healthMetrics: action.payload };
    
    case 'SET_LAST_SYNC':
      return { ...state, lastSyncAt: action.payload };
    
    case 'RESET_HEALTH_DATA':
      return initialState;
    
    default:
      return state;
  }
};

// ============================================================================
// CONTEXT INTERFACE & PROVIDER
// ============================================================================

interface HealthContextType extends HealthState {
  // Health Records
  fetchHealthRecords: () => Promise<void>;
  addHealthRecord: (record: Omit<HealthRecord, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateHealthRecord: (id: string, updates: Partial<HealthRecord>) => Promise<void>;
  deleteHealthRecord: (id: string) => Promise<void>;
  
  // Medical Conditions
  fetchMedicalConditions: () => Promise<void>;
  addMedicalCondition: (condition: Omit<MedicalCondition, 'id'>) => Promise<void>;
  updateMedicalCondition: (id: string, updates: Partial<MedicalCondition>) => Promise<void>;
  deleteMedicalCondition: (id: string) => Promise<void>;
  
  // Medications
  fetchMedications: () => Promise<void>;
  addMedication: (medication: Omit<Medication, 'id'>) => Promise<void>;
  updateMedication: (id: string, updates: Partial<Medication>) => Promise<void>;
  deleteMedication: (id: string) => Promise<void>;
  
  // Vital Signs
  fetchVitalSigns: () => Promise<void>;
  addVitalSigns: (vitalSigns: Omit<VitalSigns, 'id'>) => Promise<void>;
  
  // Appointments
  fetchAppointments: () => Promise<void>;
  addAppointment: (appointment: Omit<Appointment, 'id'>) => Promise<void>;
  updateAppointment: (id: string, updates: Partial<Appointment>) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;
  
  // Immunizations
  fetchImmunizations: () => Promise<void>;
  addImmunization: (immunization: Omit<Immunization, 'id'>) => Promise<void>;
  
  // Health Insurance
  fetchHealthInsurance: () => Promise<void>;
  updateHealthInsurance: (insurance: Omit<HealthInsurance, 'id'>) => Promise<void>;
  
  // Emergency Contacts
  fetchEmergencyContacts: () => Promise<void>;
  addEmergencyContact: (contact: Omit<EmergencyContact, 'id'>) => Promise<void>;
  updateEmergencyContact: (id: string, updates: Partial<EmergencyContact>) => Promise<void>;
  deleteEmergencyContact: (id: string) => Promise<void>;
  
  // Health Metrics & Analytics
  calculateHealthMetrics: (user: User) => HealthMetrics;
  getLatestVitalSigns: () => VitalSigns | null;
  getActiveMedications: () => Medication[];
  getUpcomingAppointments: (days?: number) => Appointment[];
  
  // Data Management
  syncHealthData: () => Promise<void>;
  clearHealthData: () => void;
}

const HealthContext = createContext<HealthContextType | undefined>(undefined);

interface HealthProviderProps {
  children: React.ReactNode;
}

export const HealthProvider: React.FC<HealthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(healthReducer, initialState);

  // ============================================================================
  // HEALTH RECORDS OPERATIONS
  // ============================================================================

  const fetchHealthRecords = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const response = await apiClient.get('/health-records');
      dispatch({ type: 'SET_HEALTH_RECORDS', payload: response.data });
      
      // Cache for offline access
      await storageService.storeData('health_records', response.data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch health records';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      
      // Try to load from cache
      const cachedRecords = await storageService.getData('health_records');
      if (cachedRecords) {
        dispatch({ type: 'SET_HEALTH_RECORDS', payload: cachedRecords });
      }
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const addHealthRecord = useCallback(async (record: Omit<HealthRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const response = await apiClient.post('/health-records', record);
      dispatch({ type: 'ADD_HEALTH_RECORD', payload: response.data });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add health record';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const updateHealthRecord = useCallback(async (id: string, updates: Partial<HealthRecord>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const response = await apiClient.put(`/health-records/${id}`, updates);
      dispatch({ type: 'UPDATE_HEALTH_RECORD', payload: response.data });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update health record';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const deleteHealthRecord = useCallback(async (id: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      await apiClient.delete(`/health-records/${id}`);
      dispatch({ type: 'DELETE_HEALTH_RECORD', payload: id });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete health record';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // ============================================================================
  // MEDICAL CONDITIONS OPERATIONS (abbreviated for space)
  // ============================================================================

  const fetchMedicalConditions = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await apiClient.get('/medical-conditions');
      dispatch({ type: 'SET_MEDICAL_CONDITIONS', payload: response.data });
      await storageService.storeData('medical_conditions', response.data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch medical conditions';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      
      const cachedConditions = await storageService.getData('medical_conditions');
      if (cachedConditions) {
        dispatch({ type: 'SET_MEDICAL_CONDITIONS', payload: cachedConditions });
      }
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const addMedicalCondition = useCallback(async (condition: Omit<MedicalCondition, 'id'>) => {
    try {
      const response = await apiClient.post('/medical-conditions', condition);
      dispatch({ type: 'ADD_MEDICAL_CONDITION', payload: response.data });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add medical condition';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  }, []);

  const updateMedicalCondition = useCallback(async (id: string, updates: Partial<MedicalCondition>) => {
    try {
      const response = await apiClient.put(`/medical-conditions/${id}`, updates);
      dispatch({ type: 'UPDATE_MEDICAL_CONDITION', payload: response.data });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update medical condition';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  }, []);

  const deleteMedicalCondition = useCallback(async (id: string) => {
    try {
      await apiClient.delete(`/medical-conditions/${id}`);
      dispatch({ type: 'DELETE_MEDICAL_CONDITION', payload: id });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete medical condition';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  }, []);

  // ============================================================================
  // MEDICATIONS OPERATIONS (abbreviated - similar pattern)
  // ============================================================================

  const fetchMedications = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await apiClient.get('/medications');
      dispatch({ type: 'SET_MEDICATIONS', payload: response.data });
      await storageService.storeData('medications', response.data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch medications';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      
      const cachedMedications = await storageService.getData('medications');
      if (cachedMedications) {
        dispatch({ type: 'SET_MEDICATIONS', payload: cachedMedications });
      }
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const addMedication = useCallback(async (medication: Omit<Medication, 'id'>) => {
    try {
      const response = await apiClient.post('/medications', medication);
      dispatch({ type: 'ADD_MEDICATION', payload: response.data });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add medication';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  }, []);

  const updateMedication = useCallback(async (id: string, updates: Partial<Medication>) => {
    try {
      const response = await apiClient.put(`/medications/${id}`, updates);
      dispatch({ type: 'UPDATE_MEDICATION', payload: response.data });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update medication';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  }, []);

  const deleteMedication = useCallback(async (id: string) => {
    try {
      await apiClient.delete(`/medications/${id}`);
      dispatch({ type: 'DELETE_MEDICATION', payload: id });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete medication';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  }, []);

  // Similar patterns for other data types (vital signs, appointments, etc.)...
  // For brevity, implementing key ones and placeholders for others

  const fetchVitalSigns = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await apiClient.get('/vital-signs');
      dispatch({ type: 'SET_VITAL_SIGNS', payload: response.data });
      await storageService.storeData('vital_signs', response.data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch vital signs';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const addVitalSigns = useCallback(async (vitalSigns: Omit<VitalSigns, 'id'>) => {
    try {
      const response = await apiClient.post('/vital-signs', vitalSigns);
      dispatch({ type: 'ADD_VITAL_SIGNS', payload: response.data });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add vital signs';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  }, []);

  // Placeholder implementations for other operations
  const fetchAppointments = useCallback(async () => {}, []);
  const addAppointment = useCallback(async (appointment: Omit<Appointment, 'id'>) => {}, []);
  const updateAppointment = useCallback(async (id: string, updates: Partial<Appointment>) => {}, []);
  const deleteAppointment = useCallback(async (id: string) => {}, []);
  const fetchImmunizations = useCallback(async () => {}, []);
  const addImmunization = useCallback(async (immunization: Omit<Immunization, 'id'>) => {}, []);
  const fetchHealthInsurance = useCallback(async () => {}, []);
  const updateHealthInsurance = useCallback(async (insurance: Omit<HealthInsurance, 'id'>) => {}, []);
  const fetchEmergencyContacts = useCallback(async () => {}, []);
  const addEmergencyContact = useCallback(async (contact: Omit<EmergencyContact, 'id'>) => {}, []);
  const updateEmergencyContact = useCallback(async (id: string, updates: Partial<EmergencyContact>) => {}, []);
  const deleteEmergencyContact = useCallback(async (id: string) => {}, []);

  // ============================================================================
  // HEALTH METRICS & ANALYTICS
  // ============================================================================

  const calculateHealthMetrics = useCallback((user: User): HealthMetrics => {
    const latestVitalSigns = state.vitalSigns[0];
    const age = calculateAgeFromDate(user.dateOfBirth);
    
    let bmi: number | undefined;
    let bmiCategory: string | undefined;
    
    if (latestVitalSigns?.weight && latestVitalSigns?.height) {
      bmi = calculateBMI(latestVitalSigns.weight, latestVitalSigns.height);
      bmiCategory = calculateBMICategory(bmi);
    }

    const metrics: HealthMetrics = {
      age,
      bmi,
      bmiCategory,
      activeMedications: state.medications.filter(med => med.isActive).length,
      upcomingAppointments: state.appointments.filter(apt => 
        new Date(apt.dateTime) > new Date() && 
        new Date(apt.dateTime) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      ).length,
      lastVitalSigns: latestVitalSigns?.recordedAt || null,
      chronicConditions: state.medicalConditions.filter(condition => condition.isActive).length,
    };

    dispatch({ type: 'UPDATE_HEALTH_METRICS', payload: metrics });
    return metrics;
  }, [state.vitalSigns, state.medications, state.appointments, state.medicalConditions]);

  const getLatestVitalSigns = useCallback((): VitalSigns | null => {
    return state.vitalSigns.length > 0 ? state.vitalSigns[0] : null;
  }, [state.vitalSigns]);

  const getActiveMedications = useCallback((): Medication[] => {
    return state.medications.filter(medication => medication.isActive);
  }, [state.medications]);

  const getUpcomingAppointments = useCallback((days: number = 7): Appointment[] => {
    const now = new Date();
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    
    return state.appointments
      .filter(appointment => {
        const appointmentDate = new Date(appointment.dateTime);
        return appointmentDate >= now && appointmentDate <= futureDate;
      })
      .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
  }, [state.appointments]);

  // ============================================================================
  // DATA MANAGEMENT
  // ============================================================================

  const syncHealthData = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      await Promise.all([
        fetchHealthRecords(),
        fetchMedicalConditions(),
        fetchMedications(),
        fetchVitalSigns(),
        fetchAppointments(),
        fetchImmunizations(),
        fetchHealthInsurance(),
        fetchEmergencyContacts(),
      ]);
      
      dispatch({ type: 'SET_LAST_SYNC', payload: new Date() });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sync health data';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [
    fetchHealthRecords,
    fetchMedicalConditions,
    fetchMedications,
    fetchVitalSigns,
    fetchAppointments,
    fetchImmunizations,
    fetchHealthInsurance,
    fetchEmergencyContacts,
  ]);

  const clearHealthData = useCallback(() => {
    dispatch({ type: 'RESET_HEALTH_DATA' });
    // Clear cached data
    storageService.removeData('health_records');
    storageService.removeData('medical_conditions');
    storageService.removeData('medications');
    storageService.removeData('vital_signs');
    storageService.removeData('appointments');
    storageService.removeData('immunizations');
    storageService.removeData('health_insurance');
    storageService.removeData('emergency_contacts');
  }, []);

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const contextValue: HealthContextType = {
    ...state,
    fetchHealthRecords,
    addHealthRecord,
    updateHealthRecord,
    deleteHealthRecord,
    fetchMedicalConditions,
    addMedicalCondition,
    updateMedicalCondition,
    deleteMedicalCondition,
    fetchMedications,
    addMedication,
    updateMedication,
    deleteMedication,
    fetchVitalSigns,
    addVitalSigns,
    fetchAppointments,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    fetchImmunizations,
    addImmunization,
    fetchHealthInsurance,
    updateHealthInsurance,
    fetchEmergencyContacts,
    addEmergencyContact,
    updateEmergencyContact,
    deleteEmergencyContact,
    calculateHealthMetrics,
    getLatestVitalSigns,
    getActiveMedications,
    getUpcomingAppointments,
    syncHealthData,
    clearHealthData,
  };

  return (
    <HealthContext.Provider value={contextValue}>
      {children}
    </HealthContext.Provider>
  );
};

// ============================================================================
// HOOK
// ============================================================================

export const useHealth = () => {
  const context = useContext(HealthContext);
  if (!context) {
    throw new Error('useHealth must be used within a HealthProvider');
  }
  return context;
};
