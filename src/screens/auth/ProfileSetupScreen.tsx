/**
 * PROFILE SETUP SCREEN
 * User profile information collection during onboarding
 * Features: Personal info, validation, progress indicator
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  SafeAreaView,
} from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';

// Import components
import Button from '../../components/ui/buttons/Button';
import IconButton from '../../components/ui/buttons/IconButton';
import { TextInput } from '../../components/ui/inputs/TextInput';
import { CustomIcon } from '../../components/common/CustomIcon';
import { Afya360Logo } from '../../components/common/Afya360Logo';

// Import styles
import { COLORS } from '../../styles/colors';
import { TEXT_STYLES } from '../../styles/globalStyles';

// Import hooks
import { useAuth } from '../../hooks/useAuth';

// Types - simplified to match working screens
type NavigationProp = {
  navigate: (screen: string, params?: any) => void;
  goBack: () => void;
};

interface Props {
  navigation: NavigationProp;
}

interface ProfileData {
  firstName: string;
  lastName: string;
  dateOfBirth: Date | null;
  gender: 'male' | 'female' | 'other' | '';
  nationalId: string;
}

export const ProfileSetupScreen: React.FC<Props> = ({ navigation }) => {
  const { updateProfile, isLoading } = useAuth();
  
  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    dateOfBirth: null,
    gender: '',
    nationalId: '',
  });
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!profileData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (profileData.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    if (!profileData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (profileData.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }

    if (!profileData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else {
      const age = calculateAge(profileData.dateOfBirth);
      if (age < 13) {
        newErrors.dateOfBirth = 'Must be at least 13 years old';
      } else if (age > 120) {
        newErrors.dateOfBirth = 'Please enter a valid date of birth';
      }
    }

    if (!profileData.gender) {
      newErrors.gender = 'Gender selection is required';
    }

    if (profileData.nationalId && !/^\d{8}$/.test(profileData.nationalId)) {
      newErrors.nationalId = 'National ID must be 8 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateAge = (birthDate: Date): number => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    
    if (selectedDate) {
      setProfileData(prev => ({ ...prev, dateOfBirth: selectedDate }));
      if (errors.dateOfBirth) {
        const newErrors = { ...errors };
        delete newErrors.dateOfBirth;
        setErrors(newErrors);
      }
    }
  };

  const clearError = (field: string) => {
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await updateProfile({
        firstName: profileData.firstName.trim(),
        lastName: profileData.lastName.trim(),
        dateOfBirth: profileData.dateOfBirth!,
        gender: profileData.gender as 'male' | 'female' | 'other',
        nationalId: profileData.nationalId || undefined,
      });
      
      navigation.navigate('Permissions');
    } catch (error) {
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleDateString('en-GB');
  };

  const genderOptions = [
    { label: 'Male', value: 'male', icon: 'person' },
    { label: 'Female', value: 'female', icon: 'person' },
    { label: 'Other', value: 'other', icon: 'person' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[COLORS.primary50, COLORS.white]}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <IconButton
            icon="arrow-back"
            variant="transparent"
            size="medium"
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          />
          
          <View style={styles.headerContent}>
            <Afya360Logo 
              variant="icon-only"
              size="small"
            />
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '66%' }]} />
              </View>
              <Text style={styles.progressText}>2 of 3</Text>
            </View>
          </View>
        </View>

        {/* Content */}
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* Title Section */}
            <View style={styles.titleSection}>
              <CustomIcon
                library="MaterialIcons"
                name="person-add"
                size={48}
                color={COLORS.primary500}
                style={styles.titleIcon}
              />
              <Text style={styles.title}>Complete Your Profile</Text>
              <Text style={styles.subtitle}>
                Help us personalize your healthcare experience
              </Text>
            </View>

            {/* Form Fields */}
            <View style={styles.form}>
              {/* Name Fields */}
              <View style={styles.nameRow}>
                <View style={[styles.nameField, styles.nameFieldLeft]}>
                  <TextInput
                    label="First Name *"
                    placeholder="Enter first name"
                    value={profileData.firstName}
                    onChangeText={(text) => {
                      setProfileData(prev => ({ ...prev, firstName: text }));
                      clearError('firstName');
                    }}
                    errorText={errors.firstName}
                    autoCapitalize="words"
                  />
                </View>
                <View style={[styles.nameField, styles.nameFieldRight]}>
                  <TextInput
                    label="Last Name *"
                    placeholder="Enter last name"
                    value={profileData.lastName}
                    onChangeText={(text) => {
                      setProfileData(prev => ({ ...prev, lastName: text }));
                      clearError('lastName');
                    }}
                    errorText={errors.lastName}
                    autoCapitalize="words"
                  />
                </View>
              </View>

              {/* Date of Birth */}
              <TouchableOpacity
                style={styles.dateField}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.fieldLabel}>Date of Birth *</Text>
                <View style={[
                  styles.dateInput,
                  errors.dateOfBirth ? styles.dateInputError : null
                ]}>
                  <Text style={[
                    styles.dateText,
                    !profileData.dateOfBirth ? styles.placeholderText : null
                  ]}>
                    {formatDate(profileData.dateOfBirth) || 'Select date of birth'}
                  </Text>
                  <CustomIcon
                    library="MaterialIcons"
                    name="calendar-today"
                    size={20}
                    color={COLORS.gray500}
                  />
                </View>
                {errors.dateOfBirth && (
                  <Text style={styles.errorText}>{errors.dateOfBirth}</Text>
                )}
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={profileData.dateOfBirth || new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleDateChange}
                  maximumDate={new Date()}
                  minimumDate={new Date(1900, 0, 1)}
                />
              )}

              {/* Gender Selection */}
              <View style={styles.genderSection}>
                <Text style={styles.fieldLabel}>Gender *</Text>
                <View style={styles.genderOptions}>
                  {genderOptions.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.genderOption,
                        profileData.gender === option.value ? styles.genderOptionSelected : null
                      ]}
                      onPress={() => {
                        setProfileData(prev => ({ ...prev, gender: option.value as any }));
                        clearError('gender');
                      }}
                    >
                      <CustomIcon
                        library="MaterialIcons"
                        name={option.icon}
                        size={20}
                        color={profileData.gender === option.value ? COLORS.primary500 : COLORS.gray500}
                      />
                      <Text style={[
                        styles.genderText,
                        profileData.gender === option.value ? styles.genderTextSelected : null
                      ]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {errors.gender && (
                  <Text style={styles.errorText}>{errors.gender}</Text>
                )}
              </View>

              {/* National ID (Optional) */}
              <TextInput
                label="National ID"
                placeholder="Enter 8-digit national ID (optional)"
                value={profileData.nationalId}
                onChangeText={(text) => {
                  // Only allow numbers
                  const numbersOnly = text.replace(/\D/g, '');
                  setProfileData(prev => ({ ...prev, nationalId: numbersOnly }));
                  clearError('nationalId');
                }}
                errorText={errors.nationalId}
                keyboardType="numeric"
                maxLength={8}
              />
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <Button
            title="Continue"
            onPress={handleSubmit}
            loading={isLoading}
            disabled={!profileData.firstName || !profileData.lastName || !profileData.dateOfBirth || !profileData.gender}
            style={styles.continueButton}
          />
          
          <View style={styles.securityIndicator}>
            <CustomIcon
              library="MaterialIcons"
              name="security"
              size={16}
              color={COLORS.success500}
            />
            <Text style={styles.securityText}>
              Your information is encrypted and secure
            </Text>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButton: {
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressContainer: {
    alignItems: 'flex-end',
  },
  progressBar: {
    width: 80,
    height: 4,
    backgroundColor: COLORS.gray200,
    borderRadius: 2,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary500,
    borderRadius: 2,
  },
  progressText: {
    ...TEXT_STYLES.caption,
    color: COLORS.gray600,
    fontSize: 12,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  titleIcon: {
    marginBottom: 16,
  },
  title: {
    ...TEXT_STYLES.h1,
    color: COLORS.gray800,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    ...TEXT_STYLES.body,
    color: COLORS.gray600,
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    gap: 20,
  },
  nameRow: {
    flexDirection: 'row',
    gap: 12,
  },
  nameField: {
    flex: 1,
  },
  nameFieldLeft: {},
  nameFieldRight: {},
  dateField: {
    marginBottom: 4,
  },
  fieldLabel: {
    ...TEXT_STYLES.bodySmall,
    color: COLORS.gray700,
    fontWeight: '500',
    marginBottom: 8,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: COLORS.gray300,
    borderRadius: 12,
    backgroundColor: COLORS.white,
  },
  dateInputError: {
    borderColor: COLORS.error500,
  },
  dateText: {
    ...TEXT_STYLES.body,
    color: COLORS.gray800,
  },
  placeholderText: {
    color: COLORS.gray500,
  },
  genderSection: {},
  genderOptions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 4,
  },
  genderOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.gray300,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    gap: 8,
  },
  genderOptionSelected: {
    borderColor: COLORS.primary500,
    backgroundColor: COLORS.primary50,
  },
  genderText: {
    ...TEXT_STYLES.bodySmall,
    color: COLORS.gray700,
    fontWeight: '500',
  },
  genderTextSelected: {
    color: COLORS.primary600,
  },
  errorText: {
    ...TEXT_STYLES.caption,
    color: COLORS.error500,
    marginTop: 4,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 16,
  },
  continueButton: {
    marginBottom: 16,
  },
  securityIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  securityText: {
    ...TEXT_STYLES.caption,
    color: COLORS.success500,
    fontWeight: '500',
  },
});

export default ProfileSetupScreen;
