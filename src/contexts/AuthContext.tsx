import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { authApi } from '../utils/authApi';
import { User } from '../utils/authApi';
import { unregisterCurrentDevice } from '../component/NotificationService';
import { resetTo } from '../navigation/NavigationService';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Login validation result
 */
export interface LoginValidationResult {
  isValid: boolean;
  errors: {
    login?: string;
    password?: string;
  };
}

/**
 * Login result
 */
export interface LoginResult {
  success: boolean;
  error?: string;
  errors?: {
    login?: string;
    password?: string;
  };
}

/**
 * Main Auth Context Data
 */
interface AuthContextData {
  // Authentication
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;

  // Auth Methods
  validateLogin: (login: string, password: string) => LoginValidationResult;
  signIn: (login: string, password: string) => Promise<LoginResult>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;

  // User settings
  updateUserSettings: (settings: any) => Promise<void>;
}

// ============================================================================
// CONTEXT IMPLEMENTATION
// ============================================================================

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      await loadStoredUser();
    } catch (error) {
      console.log('Error initializing app:', error);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // AUTHENTICATION METHODS
  // ============================================================================

  const loadStoredUser = async () => {
    try {
      const storedUser = await authApi.loadStoredUser();
      setUser(storedUser);
    } catch (error) {
      console.log('Error loading stored user:', error);
    }
  };

  /**
   * Validate login form
   * Returns error keys that can be translated in the UI
   * Accepts email OR student_id (format: HV-XXXXX-XXX)
   */
  const validateLogin = (login: string, password: string): LoginValidationResult => {
    const errors: { login?: string; password?: string } = {};

    // Validate login (email or student_id)
    if (!login) {
      errors.login = 'LOGIN_REQUIRED';
    } else {
      // Check if it's email format
      const isEmail = /\S+@\S+\.\S+/.test(login);
      // Check if it's student_id format (e.g., HV-00485-TVD)
      const isStudentId = /^[A-Z]{2,3}-\d+-[A-Z]{2,4}$/i.test(login);

      if (!isEmail && !isStudentId) {
        errors.login = 'VALID_LOGIN'; // "Please enter a valid email or student ID"
      }
    }

    // Validate password
    if (!password) {
      errors.password = 'PASSWORD_REQUIRED';
    } else if (password.length < 6) {
      errors.password = 'PASSWORD_MIN_LENGTH';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  };

  /**
   * Sign in user with validation and error handling
   * Uses Laravel Student API: POST /api/student/login
   */
  const signIn = async (login: string, password: string): Promise<LoginResult> => {
    try {
      console.log('Login attempt:', login);

      // Call the API
      const response = await authApi.signIn(login, password);

      console.log('Login successful:', response.user);

      // User and token are already saved in authApi.signIn
      setUser(response.user);

      return {
        success: true,
      };
    } catch (error: any) {
      console.log('Login error:', error);

      let errorMessage = 'Login failed. Please try again.';
      const errors: { login?: string; password?: string } = {};

      // Handle error response from server
      if (error.response?.data) {
        const data = error.response.data;

        if (data.message) {
          errorMessage = data.message;
          errors.login = errorMessage;
        }
      } else if (error.message) {
        errorMessage = error.message;
        errors.login = errorMessage;
      }

      return {
        success: false,
        error: errorMessage,
        errors,
      };
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);

      // Unregister device before logout
      try {
        await unregisterCurrentDevice();
        console.log('✅ Device unregistered successfully');
      } catch (deviceError) {
        console.error('⚠️ Failed to unregister device, continuing logout:', deviceError);
        // Continue with logout even if device unregistration fails
      }

      // Logout from backend (invalidates token)
      await authApi.signOut();

      // Clear local state
      setUser(null);
      setLoading(false);

      // Navigate back to Login
      resetTo('Login');
    } catch (error: any) {
      console.error('Logout error:', error);
      // Force logout even if API fails
      setUser(null);
      setLoading(false);
      resetTo('Login');
    }
  };

  /**
   * Refresh user data from server
   * Uses GET /api/student/me
   */
  const refreshUser = async () => {
    try {
      const updatedUser = await authApi.getCurrentUser();
      setUser(updatedUser);
    } catch (error: any) {
      console.log('Refresh user error:', error);
      throw error;
    }
  };

  // ============================================================================
  // USER SETTINGS
  // ============================================================================

  const updateUserSettings = async (settings: any) => {
    try {
      // TODO: Implement user settings update
      console.log('Updating user settings:', settings);
    } catch (error) {
      console.log('Error updating user settings:', error);
      throw error;
    }
  };

  // ============================================================================
  // CONTEXT PROVIDER
  // ============================================================================

  return (
    <AuthContext.Provider
      value={{
        // Authentication
        isAuthenticated: !!user,
        user,
        loading,
        validateLogin,
        signIn,
        signOut,
        refreshUser,
        updateUserSettings,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ============================================================================
// HOOK
// ============================================================================

export function useAuth(): AuthContextData {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth phải được sử dụng trong AuthProvider');
  }

  return context;
}

// ============================================================================
// EXPORTS
// ============================================================================

export type {
  AuthContextData,
};