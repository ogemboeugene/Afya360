/**
 * Simple AuthContext - Temporary without Expo dependencies
 */

import React, { 
  createContext, 
  useContext, 
  useState, 
  ReactNode,
} from 'react';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: any) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
  sendOTP: (phoneNumber: string) => Promise<void>;
  verifyOTP: (phoneNumber: string, otp: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Debug authentication state
  console.log('AuthProvider render - user:', user, 'isLoading:', isLoading, 'isAuthenticated:', !!user);

  const login = async (credentials: any) => {
    setIsLoading(true);
    try {
      // Simulate login
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUser({
        id: '1',
        firstName: credentials.phoneNumber || 'John',
        lastName: 'Doe',
        phoneNumber: credentials.phoneNumber,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: any) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      if (user) {
        setUser({ ...user, ...data });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const sendOTP = async (phoneNumber: string) => {
    setIsLoading(true);
    try {
      // Simulate OTP sending delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log(`OTP sent to ${phoneNumber}`);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async (phoneNumber: string, otp: string) => {
    setIsLoading(true);
    try {
      // Simulate verification delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Simple validation - accept any 6-digit code that's not "000000"
      if (otp.length === 6 && otp !== '000000') {
        console.log(`OTP verified for ${phoneNumber}`);
        return;
      }
      
      throw new Error('Invalid OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    updateProfile,
    sendOTP,
    verifyOTP,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
