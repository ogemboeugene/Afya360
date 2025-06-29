/**
 * Healthcare Utilities
 * Medical and healthcare-specific utility functions for the Afya360 app
 */

// BMI calculation and categorization
export const calculateBMI = (weight: number, height: number, weightUnit: 'kg' | 'lbs' = 'kg', heightUnit: 'cm' | 'm' | 'ft' | 'in' = 'cm'): {
  bmi: number;
  category: 'underweight' | 'normal' | 'overweight' | 'obese_class1' | 'obese_class2' | 'obese_class3';
  recommendation: string;
} => {
  // Convert weight to kg
  let weightKg = weight;
  if (weightUnit === 'lbs') {
    weightKg = weight * 0.453592;
  }
  
  // Convert height to meters
  let heightM = height;
  if (heightUnit === 'cm') {
    heightM = height / 100;
  } else if (heightUnit === 'ft') {
    heightM = height * 0.3048;
  } else if (heightUnit === 'in') {
    heightM = height * 0.0254;
  }
  
  const bmi = weightKg / (heightM * heightM);
  
  let category: 'underweight' | 'normal' | 'overweight' | 'obese_class1' | 'obese_class2' | 'obese_class3';
  let recommendation: string;
  
  if (bmi < 18.5) {
    category = 'underweight';
    recommendation = 'Consider consulting a healthcare provider about healthy weight gain strategies.';
  } else if (bmi < 25) {
    category = 'normal';
    recommendation = 'Maintain your current healthy weight through balanced diet and regular exercise.';
  } else if (bmi < 30) {
    category = 'overweight';
    recommendation = 'Consider lifestyle changes to achieve a healthier weight. Consult your healthcare provider.';
  } else if (bmi < 35) {
    category = 'obese_class1';
    recommendation = 'Weight management is important for your health. Please consult a healthcare provider.';
  } else if (bmi < 40) {
    category = 'obese_class2';
    recommendation = 'Significant health risks. Please seek medical guidance for weight management.';
  } else {
    category = 'obese_class3';
    recommendation = 'Severe health risks. Immediate medical consultation is strongly recommended.';
  }
  
  return { bmi: Math.round(bmi * 10) / 10, category, recommendation };
};

// Blood pressure interpretation
export const interpretBloodPressure = (systolic: number, diastolic: number): {
  category: 'normal' | 'elevated' | 'high_stage1' | 'high_stage2' | 'crisis';
  description: string;
  recommendation: string;
  color: string;
} => {
  if (systolic < 120 && diastolic < 80) {
    return {
      category: 'normal',
      description: 'Normal Blood Pressure',
      recommendation: 'Maintain a healthy lifestyle with regular exercise and balanced diet.',
      color: '#22C55E', // Green
    };
  } else if (systolic >= 120 && systolic <= 129 && diastolic < 80) {
    return {
      category: 'elevated',
      description: 'Elevated Blood Pressure',
      recommendation: 'Adopt heart-healthy lifestyle changes to prevent high blood pressure.',
      color: '#F59E0B', // Yellow
    };
  } else if ((systolic >= 130 && systolic <= 139) || (diastolic >= 80 && diastolic <= 89)) {
    return {
      category: 'high_stage1',
      description: 'High Blood Pressure Stage 1',
      recommendation: 'Lifestyle changes and possibly medication. Consult your healthcare provider.',
      color: '#F97316', // Orange
    };
  } else if ((systolic >= 140 && systolic <= 179) || (diastolic >= 90 && diastolic <= 119)) {
    return {
      category: 'high_stage2',
      description: 'High Blood Pressure Stage 2',
      recommendation: 'Medication and lifestyle changes needed. See your healthcare provider soon.',
      color: '#EF4444', // Red
    };
  } else {
    return {
      category: 'crisis',
      description: 'Hypertensive Crisis',
      recommendation: 'Seek immediate medical attention. This requires emergency care.',
      color: '#DC2626', // Dark Red
    };
  }
};

// Medication adherence calculation
export const calculateMedicationAdherence = (
  prescribedDoses: number,
  takenDoses: number,
  period: 'daily' | 'weekly' | 'monthly' = 'daily'
): {
  adherencePercentage: number;
  category: 'excellent' | 'good' | 'fair' | 'poor';
  recommendation: string;
} => {
  const adherencePercentage = Math.round((takenDoses / prescribedDoses) * 100);
  
  let category: 'excellent' | 'good' | 'fair' | 'poor';
  let recommendation: string;
  
  if (adherencePercentage >= 90) {
    category = 'excellent';
    recommendation = 'Great job! Continue your current medication routine.';
  } else if (adherencePercentage >= 80) {
    category = 'good';
    recommendation = 'Good adherence. Try to maintain consistency with your medication schedule.';
  } else if (adherencePercentage >= 60) {
    category = 'fair';
    recommendation = 'Consider setting reminders or discussing with your healthcare provider about barriers to adherence.';
  } else {
    category = 'poor';
    recommendation = 'Poor adherence may affect treatment effectiveness. Please discuss with your healthcare provider immediately.';
  }
  
  return { adherencePercentage, category, recommendation };
};

// Age category determination
export const getAgeCategory = (age: number): {
  category: 'infant' | 'toddler' | 'child' | 'adolescent' | 'adult' | 'senior';
  description: string;
} => {
  if (age < 1) {
    return { category: 'infant', description: 'Infant (0-11 months)' };
  } else if (age < 3) {
    return { category: 'toddler', description: 'Toddler (1-2 years)' };
  } else if (age < 13) {
    return { category: 'child', description: 'Child (3-12 years)' };
  } else if (age < 20) {
    return { category: 'adolescent', description: 'Adolescent (13-19 years)' };
  } else if (age < 65) {
    return { category: 'adult', description: 'Adult (20-64 years)' };
  } else {
    return { category: 'senior', description: 'Senior (65+ years)' };
  }
};

// Health risk assessment based on various factors
export const assessHealthRisk = (factors: {
  age: number;
  bmi?: number;
  bloodPressureCategory?: 'normal' | 'elevated' | 'high_stage1' | 'high_stage2' | 'crisis';
  smokingStatus?: 'never' | 'former' | 'current';
  diabetesStatus?: 'none' | 'prediabetes' | 'type1' | 'type2';
  familyHistory?: string[];
  exerciseFrequency?: 'none' | 'rare' | 'moderate' | 'frequent';
}): {
  riskLevel: 'low' | 'moderate' | 'high' | 'very_high';
  riskFactors: string[];
  recommendations: string[];
} => {
  let riskScore = 0;
  const riskFactors: string[] = [];
  const recommendations: string[] = [];
  
  // Age factor
  if (factors.age > 65) {
    riskScore += 2;
    riskFactors.push('Advanced age');
  } else if (factors.age > 45) {
    riskScore += 1;
  }
  
  // BMI factor
  if (factors.bmi) {
    if (factors.bmi >= 30) {
      riskScore += 2;
      riskFactors.push('Obesity');
      recommendations.push('Weight management through diet and exercise');
    } else if (factors.bmi >= 25) {
      riskScore += 1;
      riskFactors.push('Overweight');
      recommendations.push('Maintain healthy weight');
    }
  }
  
  // Blood pressure factor
  if (factors.bloodPressureCategory) {
    if (factors.bloodPressureCategory === 'crisis') {
      riskScore += 4;
      riskFactors.push('Hypertensive crisis');
      recommendations.push('Immediate medical attention required');
    } else if (factors.bloodPressureCategory === 'high_stage2') {
      riskScore += 3;
      riskFactors.push('High blood pressure (Stage 2)');
      recommendations.push('Blood pressure management with medication');
    } else if (factors.bloodPressureCategory === 'high_stage1') {
      riskScore += 2;
      riskFactors.push('High blood pressure (Stage 1)');
      recommendations.push('Monitor blood pressure regularly');
    } else if (factors.bloodPressureCategory === 'elevated') {
      riskScore += 1;
      riskFactors.push('Elevated blood pressure');
      recommendations.push('Lifestyle modifications for blood pressure');
    }
  }
  
  // Smoking factor
  if (factors.smokingStatus === 'current') {
    riskScore += 3;
    riskFactors.push('Current smoking');
    recommendations.push('Smoking cessation support');
  } else if (factors.smokingStatus === 'former') {
    riskScore += 1;
    riskFactors.push('Former smoking history');
  }
  
  // Diabetes factor
  if (factors.diabetesStatus) {
    if (factors.diabetesStatus === 'type1' || factors.diabetesStatus === 'type2') {
      riskScore += 2;
      riskFactors.push('Diabetes');
      recommendations.push('Diabetes management and regular monitoring');
    } else if (factors.diabetesStatus === 'prediabetes') {
      riskScore += 1;
      riskFactors.push('Prediabetes');
      recommendations.push('Diabetes prevention strategies');
    }
  }
  
  // Exercise factor
  if (factors.exerciseFrequency === 'none') {
    riskScore += 2;
    riskFactors.push('Sedentary lifestyle');
    recommendations.push('Regular physical activity');
  } else if (factors.exerciseFrequency === 'rare') {
    riskScore += 1;
    riskFactors.push('Insufficient physical activity');
    recommendations.push('Increase exercise frequency');
  }
  
  // Family history factor
  if (factors.familyHistory && factors.familyHistory.length > 0) {
    riskScore += factors.familyHistory.length;
    riskFactors.push(`Family history of: ${factors.familyHistory.join(', ')}`);
    recommendations.push('Regular screening due to family history');
  }
  
  // Determine risk level
  let riskLevel: 'low' | 'moderate' | 'high' | 'very_high';
  if (riskScore <= 2) {
    riskLevel = 'low';
  } else if (riskScore <= 5) {
    riskLevel = 'moderate';
  } else if (riskScore <= 8) {
    riskLevel = 'high';
  } else {
    riskLevel = 'very_high';
  }
  
  // Add general recommendations
  if (riskLevel === 'low') {
    recommendations.push('Maintain current healthy lifestyle');
    recommendations.push('Regular health check-ups');
  } else if (riskLevel === 'moderate') {
    recommendations.push('Lifestyle modifications recommended');
    recommendations.push('More frequent health monitoring');
  } else if (riskLevel === 'high') {
    recommendations.push('Comprehensive health evaluation needed');
    recommendations.push('Consider medical intervention');
  } else {
    recommendations.push('Immediate medical consultation required');
    recommendations.push('Comprehensive treatment plan needed');
  }
  
  return { riskLevel, riskFactors, recommendations };
};

// Vaccination schedule helper
export const getVaccinationStatus = (
  vaccines: Array<{
    name: string;
    dateAdministered: Date;
    nextDueDate?: Date;
  }>,
  age: number
): {
  upToDate: boolean;
  overdue: string[];
  upcoming: string[];
  completed: string[];
} => {
  // This is a simplified version - in a real app, you'd have comprehensive vaccination schedules
  const kenyaVaccineSchedule = [
    { name: 'BCG', ageMonths: 0 },
    { name: 'OPV-0', ageMonths: 0 },
    { name: 'DPT-HepB-Hib-1', ageMonths: 1.5 },
    { name: 'OPV-1', ageMonths: 1.5 },
    { name: 'PCV-1', ageMonths: 1.5 },
    { name: 'Rota-1', ageMonths: 1.5 },
    // Add more vaccines as needed
  ];
  
  const completed: string[] = [];
  const overdue: string[] = [];
  const upcoming: string[] = [];
  
  vaccines.forEach(vaccine => {
    completed.push(vaccine.name);
  });
  
  // Check for overdue vaccines (simplified logic)
  kenyaVaccineSchedule.forEach(scheduleVaccine => {
    const ageInMonths = age * 12;
    const isAdministered = vaccines.some(v => v.name === scheduleVaccine.name);
    
    if (!isAdministered && ageInMonths > scheduleVaccine.ageMonths + 1) {
      overdue.push(scheduleVaccine.name);
    } else if (!isAdministered && ageInMonths >= scheduleVaccine.ageMonths - 1) {
      upcoming.push(scheduleVaccine.name);
    }
  });
  
  return {
    upToDate: overdue.length === 0,
    overdue,
    upcoming,
    completed,
  };
};

// Medical emergency detection
export const detectMedicalEmergency = (vitals: {
  heartRate?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  temperature?: number;
  oxygenSaturation?: number;
  consciousnessLevel?: 'alert' | 'confused' | 'unconscious';
}): {
  isEmergency: boolean;
  emergencyLevel: 'none' | 'warning' | 'urgent' | 'critical';
  alerts: string[];
  recommendations: string[];
} => {
  const alerts: string[] = [];
  const recommendations: string[] = [];
  let emergencyLevel: 'none' | 'warning' | 'urgent' | 'critical' = 'none';
  
  // Heart rate checks
  if (vitals.heartRate) {
    if (vitals.heartRate < 40 || vitals.heartRate > 150) {
      alerts.push('Critical heart rate detected');
      emergencyLevel = 'critical';
      recommendations.push('Seek immediate medical attention');
    } else if (vitals.heartRate < 50 || vitals.heartRate > 120) {
      alerts.push('Abnormal heart rate');
      if (emergencyLevel === 'none') emergencyLevel = 'warning';
      recommendations.push('Monitor closely and consider medical consultation');
    }
  }
  
  // Blood pressure checks
  if (vitals.bloodPressureSystolic && vitals.bloodPressureDiastolic) {
    if (vitals.bloodPressureSystolic >= 180 || vitals.bloodPressureDiastolic >= 120) {
      alerts.push('Hypertensive crisis detected');
      emergencyLevel = 'critical';
      recommendations.push('Seek emergency medical care immediately');
    } else if (vitals.bloodPressureSystolic < 90 || vitals.bloodPressureDiastolic < 60) {
      alerts.push('Severe hypotension detected');
      emergencyLevel = 'urgent';
      recommendations.push('Seek immediate medical attention');
    }
  }
  
  // Temperature checks
  if (vitals.temperature) {
    if (vitals.temperature >= 40 || vitals.temperature <= 34) {
      alerts.push('Critical body temperature');
      emergencyLevel = 'critical';
      recommendations.push('Seek emergency medical care immediately');
    } else if (vitals.temperature >= 39 || vitals.temperature <= 35) {
      alerts.push('Severe fever or hypothermia');
      if (emergencyLevel === 'none' || emergencyLevel === 'warning') emergencyLevel = 'urgent';
      recommendations.push('Seek medical attention promptly');
    }
  }
  
  // Oxygen saturation checks
  if (vitals.oxygenSaturation) {
    if (vitals.oxygenSaturation < 90) {
      alerts.push('Critical oxygen saturation');
      emergencyLevel = 'critical';
      recommendations.push('Seek emergency medical care immediately');
    } else if (vitals.oxygenSaturation < 95) {
      alerts.push('Low oxygen saturation');
      if (emergencyLevel === 'none' || emergencyLevel === 'warning') emergencyLevel = 'urgent';
      recommendations.push('Seek medical attention');
    }
  }
  
  // Consciousness level checks
  if (vitals.consciousnessLevel) {
    if (vitals.consciousnessLevel === 'unconscious') {
      alerts.push('Patient unconscious');
      emergencyLevel = 'critical';
      recommendations.push('Call emergency services immediately');
    } else if (vitals.consciousnessLevel === 'confused') {
      alerts.push('Altered consciousness');
      if (emergencyLevel === 'none' || emergencyLevel === 'warning') emergencyLevel = 'urgent';
      recommendations.push('Seek medical attention promptly');
    }
  }
  
  return {
    isEmergency: emergencyLevel === 'urgent' || emergencyLevel === 'critical',
    emergencyLevel,
    alerts,
    recommendations,
  };
};

// Convert units commonly used in healthcare
export const convertMedicalUnits = {
  temperature: {
    celsiusToFahrenheit: (celsius: number) => (celsius * 9/5) + 32,
    fahrenheitToCelsius: (fahrenheit: number) => (fahrenheit - 32) * 5/9,
  },
  weight: {
    kgToLbs: (kg: number) => kg * 2.20462,
    lbsToKg: (lbs: number) => lbs * 0.453592,
  },
  height: {
    cmToFeet: (cm: number) => cm * 0.0328084,
    cmToInches: (cm: number) => cm * 0.393701,
    feetToCm: (feet: number) => feet * 30.48,
    inchesToCm: (inches: number) => inches * 2.54,
  },
  pressure: {
    mmHgToKPa: (mmHg: number) => mmHg * 0.133322,
    kPaToMmHg: (kPa: number) => kPa * 7.50062,
  },
};
