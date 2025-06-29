/**
 * ProfileSetupScreen
 * Step 2 of the onboarding process - Basic profile information setup
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StatusBar,
} from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

// Import our reusable components
import Button from '../../components/ui/buttons/Button';
import { TextInput } from '../../components/ui/inputs/TextInput';
import { DatePicker } from '../../components/ui/inputs/DatePicker';
import { Dropdown } from '../../components/ui/inputs/Dropdown';
import { Afya360Logo } from '../../components/common/Afya360Logo';

// Import styles and constants
import { COLORS } from '../../styles/colors';
import { TEXT_STYLES } from '../../styles/globalStyles';
import { VALIDATION_MESSAGES } from '../../constants';
import { validateName, validateIDNumber, formatIDNumber } from '../../utils/validation';

// Local options (mutable)
const GENDER_OPTIONS = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
  { label: 'Prefer not to say', value: 'prefer_not_to_say' },
];

// Import hooks
import { useAuth } from '../../hooks/useAuth';

// Types
import { RootStackParamList, EmergencyContact } from '../../types';

type ProfileSetupScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'ProfileSetup'
>;

type ProfileSetupScreenRouteProp = RouteProp<
  RootStackParamList,
  'ProfileSetup'
>;

interface Props {
  navigation: ProfileSetupScreenNavigationProp;
  route: ProfileSetupScreenRouteProp;
}

interface ProfileFormData {
  firstName: string;
  lastName: string;
  dateOfBirth: Date | null;
  gender: 'male' | 'female' | 'other' | '';
  nationalId: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
}

const RELATION_OPTIONS = [
  { label: 'Spouse', value: 'spouse' },
  { label: 'Parent', value: 'parent' },
  { label: 'Child', value: 'child' },
  { label: 'Sibling', value: 'sibling' },
  { label: 'Friend', value: 'friend' },
  { label: 'Other', value: 'other' },
];

export const ProfileSetupScreen: React.FC<Props> = ({ navigation }) => {
  const { updateProfile, isLoading } = useAuth();
  
  // State management
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: '',
    lastName: '',
    dateOfBirth: null,
    gender: '',
    nationalId: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: '',
  });
  
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Form validation
  const validateForm = (): boolean => {

    const newErrors: Partial<Record<keyof ProfileFormData, string>> = {};

    // Required fields
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (!validateName(formData.firstName)) {
      newErrors.firstName = 'Please enter a valid first name';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (!validateName(formData.lastName)) {
      newErrors.lastName = 'Please enter a valid last name';
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required' as any;
    } else {
      const age = new Date().getFullYear() - formData.dateOfBirth.getFullYear();
      if (age < 1 || age > 120) {
        newErrors.dateOfBirth = 'Please enter a valid date of birth' as any;
      }
    }

    if (!formData.gender) {
      newErrors.gender = 'Please select your gender';
    }

    // Optional ID number validation
    if (formData.nationalId && !validateIDNumber(formData.nationalId)) {
      newErrors.nationalId = 'Please enter a valid ID number';
    }

    // Emergency contact validation
    if (!formData.emergencyContactName.trim()) {
      newErrors.emergencyContactName = 'Emergency contact name is required';
    } else if (!validateName(formData.emergencyContactName)) {
      newErrors.emergencyContactName = 'Please enter a valid contact name';
    }

    if (!formData.emergencyContactPhone.trim()) {
      newErrors.emergencyContactPhone = 'Emergency contact phone is required';
    } else if (formData.emergencyContactPhone.length < 10) {
      newErrors.emergencyContactPhone = 'Please enter a valid phone number';
    }

    if (!formData.emergencyContactRelation) {
      newErrors.emergencyContactRelation = 'Please select relationship';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fill in all required fields correctly.');
      return;
    }

    try {
      const emergencyContact: EmergencyContact = {
        id: Date.now().toString(), // Generate temporary ID
        name: formData.emergencyContactName,
        phone: formData.emergencyContactPhone,
        relationship: formData.emergencyContactRelation,
        isPrimary: true,
        canAccessRecords: false, // Default to false
      };

      const profileData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        dateOfBirth: formData.dateOfBirth!,
        gender: formData.gender as 'male' | 'female' | 'other',
        nationalId: formData.nationalId ? formatIDNumber(formData.nationalId) : undefined,
        emergencyContact,
      };

      await updateProfile(profileData);
      
      // Navigate to security setup
      navigation.navigate('SecuritySetup');
    } catch (error) {
      Alert.alert('Error', 'Failed to save profile information. Please try again.');
    }
  };

  // Handle field changes
  const handleFieldChange = (field: keyof ProfileFormData, value: any) => {
    setFormData({ ...formData, [field]: value });
    
    // Clear error for this field
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Afya360Logo 
              variant="default" 
              size="medium"
              style={styles.logo}
            />
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '50%' }]} />
              </View>
              <Text style={styles.progressText}>Step 2 of 4</Text>
            </View>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.title}>Tell Us About Yourself</Text>
            <Text style={styles.description}>
              This information helps us provide personalized healthcare services
            </Text>

            <View style={styles.form}>
              {/* Personal Information Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Personal Information</Text>
                
                <View style={styles.row}>
                  <View style={styles.halfWidth}>
                    <TextInput
                      label="First Name"
                      placeholder="Enter your first name"
                      value={formData.firstName}
                      onChangeText={(value) => handleFieldChange('firstName', value)}
                      errorText={errors.firstName}
                      required
                      autoCapitalize="words"
                    />
                  </View>
                  <View style={styles.halfWidth}>
                    <TextInput
                      label="Last Name"
                      placeholder="Enter your last name"
                      value={formData.lastName}
                      onChangeText={(value) => handleFieldChange('lastName', value)}
                      errorText={errors.lastName}
                      required
                      autoCapitalize="words"
                    />
                  </View>
                </View>

                <DatePicker
                  label="Date of Birth"
                  value={formData.dateOfBirth || undefined}
                  onDateChange={(date) => handleFieldChange('dateOfBirth', date)}
                  error={typeof errors.dateOfBirth === 'string' ? errors.dateOfBirth : undefined}
                  required
                  maximumDate={new Date()}
                  minimumDate={new Date(1900, 0, 1)}
                />

                <Dropdown
                  label="Gender"
                  placeholder="Select your gender"
                  options={GENDER_OPTIONS}
                  selectedValue={formData.gender}
                  onSelect={(option) => handleFieldChange('gender', option.value)}
                  error={errors.gender}
                  required
                />

                <TextInput
                  label="National ID Number (Optional)"
                  placeholder="Enter your ID number"
                  value={formData.nationalId}
                  onChangeText={(value) => handleFieldChange('nationalId', value)}
                  errorText={errors.nationalId}
                  keyboardType="numeric"
                  maxLength={8}
                  helperText="For NHIF integration and enhanced services"
                />
              </View>

              {/* Emergency Contact Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Emergency Contact</Text>
                <Text style={styles.sectionDescription}>
                  This person will be contacted in case of a medical emergency
                </Text>

                <TextInput
                  label="Contact Name"
                  placeholder="Enter contact's full name"
                  value={formData.emergencyContactName}
                  onChangeText={(value) => handleFieldChange('emergencyContactName', value)}
                  errorText={errors.emergencyContactName}
                  required
                  autoCapitalize="words"
                />

                <TextInput
                  label="Phone Number"
                  placeholder="0712 345 678"
                  value={formData.emergencyContactPhone}
                  onChangeText={(value) => handleFieldChange('emergencyContactPhone', value)}
                  errorText={errors.emergencyContactPhone}
                  required
                  keyboardType="phone-pad"
                  maxLength={13}
                />

                <Dropdown
                  label="Relationship"
                  placeholder="Select relationship"
                  options={RELATION_OPTIONS}
                  selectedValue={formData.emergencyContactRelation}
                  onSelect={(option) => handleFieldChange('emergencyContactRelation', option.value)}
                  error={errors.emergencyContactRelation}
                  required
                />
              </View>

              {/* Action Buttons */}
              <View style={styles.buttonContainer}>
                <Button
                  title="Continue"
                  onPress={handleSubmit}
                  loading={isLoading}
                  disabled={!formData.firstName || !formData.lastName || !formData.dateOfBirth}
                  style={styles.continueButton}
                />
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Back Button */}
        <View style={styles.backButtonContainer}>
          <Button
            title="Back"
            variant="link"
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingTop: Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 0, // Manual safe area
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 32,
  },
  logo: {
    marginBottom: 24,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: COLORS.gray200,
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary500,
    borderRadius: 2,
  },
  progressText: {
    ...TEXT_STYLES.caption,
    color: COLORS.gray600,
  },
  content: {
    flex: 1,
  },
  title: {
    ...TEXT_STYLES.h2,
    color: COLORS.gray900,
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    ...TEXT_STYLES.body,
    color: COLORS.gray600,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  form: {
    flex: 1,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    ...TEXT_STYLES.h4,
    color: COLORS.gray900,
    marginBottom: 8,
  },
  sectionDescription: {
    ...TEXT_STYLES.caption,
    color: COLORS.gray600,
    marginBottom: 16,
    lineHeight: 20,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  halfWidth: {
    flex: 1,
  },
  buttonContainer: {
    marginTop: 24,
    marginBottom: 32,
  },
  continueButton: {
    marginBottom: 16,
  },
  backButtonContainer: {
    padding: 24,
    paddingTop: 0,
  },
  backButton: {
    paddingVertical: 12,
  },
});

export default ProfileSetupScreen;