/**
 * TypeScript Type Definitions for Afya360 Healthcare App
 * 
 * This file contains all TypeScript interfaces and types used throughout the app.
 * Organized by feature domain with comprehensive healthcare data models.
 */

// ============================================================================
// USER & AUTHENTICATION TYPES
// ============================================================================

export interface User {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  nationalId?: string;
  profilePicture?: string;
  emergencyContact?: EmergencyContact;
  createdAt: Date;
  updatedAt: Date;
  isVerified: boolean;
  preferences: UserPreferences;
}

export interface AuthCredentials {
  email?: string;
  phone?: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

export interface UserPreferences {
  language: 'en' | 'sw';
  notifications: NotificationSettings;
  biometricEnabled: boolean;
  theme: 'light' | 'dark' | 'system';
}

// ============================================================================
// HEALTH RECORDS & MEDICAL DATA TYPES
// ============================================================================

export interface HealthRecord {
  id: string;
  userId: string;
  type: HealthRecordType;
  title: string;
  description: string;
  date: Date;
  attachments: Document[];
  providerId?: string;
  facilityId?: string;
  tags: string[];
  isPrivate: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type HealthRecordType = 
  | 'diagnosis' 
  | 'lab_result' 
  | 'imaging' 
  | 'surgery' 
  | 'vaccination' 
  | 'checkup' 
  | 'emergency';

export interface MedicalCondition {
  id: string;
  name: string;
  icd10Code?: string;
  description?: string;
  severity: 'mild' | 'moderate' | 'severe';
  status: 'active' | 'resolved' | 'chronic';
  diagnosedDate: Date;
  notes?: string;
}

export interface Allergy {
  id: string;
  allergen: string;
  type: AllergyType;
  severity: AllergySeverity;
  reaction: string[];
  notes?: string;
  diagnosedDate?: Date;
}

export type AllergyType = 'food' | 'medication' | 'environmental' | 'other';
export type AllergySeverity = 'mild' | 'moderate' | 'severe' | 'life_threatening';

export interface Immunization {
  id: string;
  vaccine: string;
  date: Date;
  doseNumber?: number;
  nextDueDate?: Date;
  administeredBy: string;
  facilityId?: string;
  batchNumber?: string;
  notes?: string;
}

export interface Visit {
  id: string;
  providerId: string;
  facilityId: string;
  date: Date;
  reason: string;
  diagnosis?: string;
  treatment?: string;
  followUpDate?: Date;
  cost?: number;
  insuranceCovered?: boolean;
  notes?: string;
  prescriptions: Prescription[];
}

// ============================================================================
// MEDICATION & PRESCRIPTION TYPES
// ============================================================================

export interface Medication {
  id: string;
  name: string;
  genericName?: string;
  strength: string;
  form: MedicationForm;
  manufacturer?: string;
  description?: string;
  sideEffects?: string[];
  contraindications?: string[];
  activeIngredients: string[];
}

export type MedicationForm = 
  | 'tablet' 
  | 'capsule' 
  | 'liquid' 
  | 'injection' 
  | 'cream' 
  | 'inhaler' 
  | 'patch';

export interface Prescription {
  id: string;
  medicationId: string;
  medication: Medication;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  prescribedBy: string;
  prescribedDate: Date;
  startDate: Date;
  endDate?: Date;
  refillsRemaining?: number;
  isActive: boolean;
  adherenceTracking: AdherenceRecord[];
}

export interface AdherenceRecord {
  id: string;
  prescriptionId: string;
  scheduledTime: Date;
  takenTime?: Date;
  status: 'taken' | 'missed' | 'skipped';
  notes?: string;
}

export interface DrugInteraction {
  severity: 'mild' | 'moderate' | 'severe';
  description: string;
  medications: string[];
  recommendations: string[];
}

// ============================================================================
// HEALTHCARE PROVIDERS & FACILITIES
// ============================================================================

export interface HealthcareProvider {
  id: string;
  name: string;
  specialties: string[];
  qualification: string;
  licenseNumber: string;
  profilePicture?: string;
  rating: number;
  reviewCount: number;
  facilities: HealthcareFacility[];
  availableSlots?: TimeSlot[];
  consultationFee?: number;
  acceptedInsurance: string[];
  languages: string[];
  experience: number;
  bio?: string;
}

export interface HealthcareFacility {
  id: string;
  name: string;
  type: FacilityType;
  address: Address;
  location: GeoLocation;
  phone: string;
  email?: string;
  website?: string;
  services: string[];
  operatingHours: OperatingHours;
  rating: number;
  images?: string[];
  amenities: string[];
  acceptedInsurance: string[];
  emergencyServices: boolean;
}

export type FacilityType = 
  | 'hospital' 
  | 'clinic' 
  | 'pharmacy' 
  | 'laboratory' 
  | 'imaging_center' 
  | 'dental' 
  | 'eye_care';

export interface Address {
  street: string;
  city: string;
  county: string;
  postalCode?: string;
  country: string;
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
}

export interface OperatingHours {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export interface DaySchedule {
  isOpen: boolean;
  openTime?: string;
  closeTime?: string;
  breaks?: TimeSlot[];
}

// ============================================================================
// APPOINTMENTS & SCHEDULING
// ============================================================================

export interface Appointment {
  id: string;
  providerId: string;
  provider: HealthcareProvider;
  facilityId: string;
  facility: HealthcareFacility;
  date: Date;
  duration: number;
  reason: string;
  status: AppointmentStatus;
  type: AppointmentType;
  notes?: string;
  cost?: number;
  insuranceCovered?: boolean;
  reminders: ReminderSettings[];
  createdAt: Date;
}

export type AppointmentStatus = 
  | 'scheduled' 
  | 'confirmed' 
  | 'in_progress' 
  | 'completed' 
  | 'cancelled' 
  | 'no_show';

export type AppointmentType = 
  | 'consultation' 
  | 'follow_up' 
  | 'procedure' 
  | 'emergency' 
  | 'telemedicine';

export interface TimeSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  providerId?: string;
}

export interface ReminderSettings {
  type: 'push' | 'sms' | 'email';
  timeBeforeAppointment: number; // in minutes
  isEnabled: boolean;
}

// ============================================================================
// INSURANCE & BILLING
// ============================================================================

export interface InsuranceCard {
  id: string;
  provider: string;
  type: InsuranceType;
  policyNumber: string;
  groupNumber?: string;
  memberId: string;
  primaryHolder: string;
  relationship: 'self' | 'spouse' | 'child' | 'other';
  effectiveDate: Date;
  expirationDate?: Date;
  coverageDetails: CoverageDetails;
  cardImage?: string;
  isActive: boolean;
}

export type InsuranceType = 'nhif' | 'private' | 'employer' | 'family';

export interface CoverageDetails {
  medicalCoverage: number;
  dentalCoverage?: number;
  visionCoverage?: number;
  deductible: number;
  copayment: number;
  outOfPocketMax: number;
  prescriptionCoverage?: number;
}

export interface Claim {
  id: string;
  appointmentId?: string;
  amount: number;
  claimDate: Date;
  status: ClaimStatus;
  description: string;
  providerId: string;
  insuranceCardId: string;
  documents: Document[];
  approvedAmount?: number;
  rejectionReason?: string;
}

export type ClaimStatus = 'submitted' | 'processing' | 'approved' | 'rejected' | 'paid';

// ============================================================================
// EMERGENCY & CONTACTS
// ============================================================================

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  address?: Address;
  isPrimary: boolean;
  canAccessRecords: boolean;
}

export interface EmergencyService {
  id: string;
  name: string;
  type: EmergencyType;
  phone: string;
  location?: GeoLocation;
  isAvailable24x7: boolean;
  services: string[];
}

export type EmergencyType = 'ambulance' | 'hospital' | 'fire' | 'police' | 'poison_control';

// ============================================================================
// NOTIFICATIONS & COMMUNICATIONS
// ============================================================================

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isRead: boolean;
  actionRequired: boolean;
  actionUrl?: string;
  data?: Record<string, any>;
  createdAt: Date;
  expiresAt?: Date;
}

export type NotificationType = 
  | 'medication_reminder' 
  | 'appointment_reminder' 
  | 'health_tip' 
  | 'system_update' 
  | 'emergency_alert';

export interface NotificationSettings {
  pushNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  medicationReminders: boolean;
  appointmentReminders: boolean;
  healthTips: boolean;
  emergencyAlerts: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
}

// ============================================================================
// DOCUMENTS & FILES
// ============================================================================

export interface Document {
  id: string;
  name: string;
  type: DocumentType;
  url: string;
  size: number;
  mimeType: string;
  uploadedAt: Date;
  uploadedBy: string;
  tags: string[];
  isPublic: boolean;
  expiresAt?: Date;
}

export type DocumentType = 
  | 'lab_result' 
  | 'prescription' 
  | 'insurance_card' 
  | 'id_document' 
  | 'medical_report' 
  | 'invoice';

// ============================================================================
// API & FORM TYPES
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: ValidationError[];
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface FormField {
  name: string;
  value: any;
  error?: string;
  isValid: boolean;
  isTouched: boolean;
}

export interface FormState {
  fields: Record<string, FormField>;
  isValid: boolean;
  isSubmitting: boolean;
  hasErrors: boolean;
}

// ============================================================================
// NAVIGATION TYPES
// ============================================================================

export type RootStackParamList = {
  // Auth Flow
  Welcome: undefined;
  Login: undefined;
  SignUp: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  PinEntry: { mode: 'setup' | 'verify' };
  BiometricSetup: undefined;
  
  // Onboarding
  Onboarding: undefined;
  OnboardingWelcome: undefined;
  PhoneVerification: { phoneNumber?: string };
  OTPVerification: { phoneNumber: string };
  ProfileSetup: undefined;
  SecuritySetup: undefined;
  PermissionsScreen: undefined;
  Auth: undefined;
  
  // Main App
  Main: undefined;
  MainApp: undefined;
  
  // Shared Screens/Modals
  EmergencyContact: { contactId?: string };
  DocumentViewer: { documentUrl: string; title: string };
  QRScanner: { purpose: 'insurance' | 'facility' | 'medication' };
  CameraCapture: { purpose: 'profile' | 'document' | 'prescription' };
  Map: { facilities?: HealthcareFacility[]; emergencyMode?: boolean };
  
  // Health screens (for Health Stack Navigator)
  HealthRecords: undefined;
  MedicalConditions: undefined;
  Allergies: undefined;
  Immunizations: undefined;
  VisitHistory: undefined;
  Documents: undefined;
  
  // Medication screens (for Medications Stack Navigator)
  MedicationsList: undefined;
  AdherenceTracking: undefined;
  MedicationReminders: undefined;
  PrescriptionHistory: undefined;
  PharmacyLocator: undefined;
};

export type TabParamList = {
  Home: undefined;
  Health: undefined;
  Medications: undefined;
  Facilities: undefined;
  Emergency: undefined;
};

export type DrawerParamList = {
  MainTabs: undefined;
  Profile: undefined;
  Insurance: undefined;
  Providers: undefined;
  Notifications: undefined;
  Settings: undefined;
};

// Screen-specific param lists
export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  PinEntry: { mode: 'setup' | 'verify' };
  BiometricSetup: undefined;
};

export type HealthStackParamList = {
  HealthDashboard: undefined;
  HealthRecords: undefined;
  MedicalConditions: undefined;
  Allergies: undefined;
  Immunizations: undefined;
  VisitHistory: undefined;
  Documents: undefined;
  AddRecord: { type?: HealthRecordType };
  RecordDetail: { recordId: string };
};

export type AppointmentStackParamList = {
  AppointmentsList: undefined;
  BookAppointment: undefined;
  AppointmentDetail: { appointmentId: string };
  RescheduleAppointment: { appointmentId: string };
};

export type InsuranceStackParamList = {
  InsuranceDashboard: undefined;
  PolicyDetails: undefined;
  Claims: undefined;
  ClaimDetail: { claimId: string };
  SubmitClaim: undefined;
  Benefits: undefined;
};

export type ProfileStackParamList = {
  ProfileOverview: undefined;
  EditProfile: undefined;
  EmergencyContacts: undefined;
  Settings: undefined;
  Privacy: undefined;
  Support: undefined;
  About: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Health: undefined;
  Medications: undefined;
  Providers: undefined;
  Profile: undefined;
};

export type MedicationsStackParamList = {
  MedicationsList: undefined;
  AdherenceTracking: undefined;
  MedicationReminders: undefined;
  PrescriptionHistory: undefined;
  PharmacyLocator: undefined;
};

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export type NetworkStatus = 'online' | 'offline' | 'slow';

export interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: Date;
}
