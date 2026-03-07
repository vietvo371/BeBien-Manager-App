import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosInstance } from 'axios';
import env from '../config/env';
import { User, LoginResponse, ApiResponse } from '../types/student-api.types';
import { ParentUser, ParentLoginResponse } from '../types/parent-api.types';
import { ErrorModalManager } from './ErrorModalManager';
import { handleApiError } from './errorHandler';

// ============================================================================
// TYPES
// ============================================================================

export interface SignUpData {
  email?: string;
  phone?: string;
  password: string;
  fullName: string;
  role?: string;
}

export interface SignInResponse {
  user: User;
  token: string;
}

export interface SignInParentResponse {
  parent: ParentUser;
  token: string;
}

// Export User from student-api.types
export type { User };
export type { ParentUser };

// ============================================================================
// API CLIENTS
// ============================================================================

/**
 * Create dedicated axios instance for Student API
 * Base URL: /api/student
 */
const createStudentApiClient = (): AxiosInstance => {
  const studentApi = axios.create({
    baseURL: `${env.API_URL}/api/student`,
    timeout: 15000,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  // Request interceptor: Add Bearer token
  studentApi.interceptors.request.use(
    async (config) => {
      const token = await AsyncStorage.getItem('@auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('token', token);
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor: Handle Laravel error format and show user-friendly errors
  studentApi.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.data) {
        // Laravel error format: { status: 'error', message: '...', errors: {...} }
        const { message, errors } = error.response.data;
        error.message = message || 'An error occurred';
        error.validationErrors = errors;
      }

      // Handle errors with modal (except 401/403 which are handled by main Api.tsx)
      const status = error.response?.status;
      if (status !== 401 && status !== 403 && status !== 422) {
        handleApiError(error, true); // ✅ Auto show modal for errors
      }

      return Promise.reject(error);
    }
  );

  return studentApi;
};

/**
 * Create dedicated axios instance for Parent API
 * Base URL: /api/parent
 */
const createParentApiClient = (): AxiosInstance => {
  const parentApi = axios.create({
    baseURL: `${env.API_URL}/api/parent`,
    timeout: 15000,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  // Request interceptor: Add Bearer token
  parentApi.interceptors.request.use(
    async (config) => {
      const token = await AsyncStorage.getItem('@parent_auth_token');
      console.log('parent_token', token);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('parent_token', token);
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor: Handle error format and show user-friendly errors
  parentApi.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.data) {
        const { message, errors } = error.response.data;
        error.message = message || 'An error occurred';
        error.validationErrors = errors;
      }

      // Handle errors with modal (except 401/403 which are handled by main Api.tsx)
      const status = error.response?.status;
      if (status !== 401 && status !== 403 && status !== 422) {
        handleApiError(error, true); // ✅ Auto show modal for errors
      }

      return Promise.reject(error);
    }
  );

  return parentApi;
};

// ============================================================================
// AUTH API SERVICE
// ============================================================================

class AuthApiService {
  // Student Keys
  private readonly TOKEN_KEY = '@auth_token';
  private readonly USER_KEY = '@user_data';

  // Parent Keys
  private readonly PARENT_TOKEN_KEY = '@parent_auth_token';
  private readonly PARENT_USER_KEY = '@parent_user_data';

  private studentApi: AxiosInstance;
  private parentApi: AxiosInstance;

  constructor() {
    this.studentApi = createStudentApiClient();
    this.parentApi = createParentApiClient();
  }

  // ==========================================================================
  // STUDENT AUTH
  // ==========================================================================

  /**
   * Sign in user with Laravel Sanctum
   * POST /api/student/login
   */
  async signIn(login: string, password: string): Promise<SignInResponse> {
    try {
      const response = await this.studentApi.post('/login', {
        login,
        password,
      });

      // Actual API format: { status: true, data: { token: "...", student: {...} } }
      if (response.data.status === true && response.data.data) {
        const { token, student } = response.data.data;

        // Save tokens and user data
        await this.saveToken(token);
        await this.saveUser(student);

        return { user: student, token };
      }

      throw new Error(response.data.message || 'Login failed');
    } catch (error: any) {
      console.error('Sign in error:', error);
      
      // Show user-friendly error for login failures
      if (error.response?.status === 422 || error.response?.status === 401) {
        ErrorModalManager.showError(
          'Đăng nhập thất bại',
          error.message || 'Tên đăng nhập hoặc mật khẩu không đúng'
        );
      } else {
        handleApiError(error, true);
      }
      
      throw error;
    }
  }

  /**
   * Sign out user
   * POST /api/student/logout
   */
  async signOut(): Promise<void> {
    try {
      // Call backend to invalidate token
      await this.studentApi.post('/logout');
    } catch (error) {
      console.error('Sign out error:', error);
      // Continue to clear local storage even if API call fails
    } finally {
      // Clear local storage
      await AsyncStorage.multiRemove([this.TOKEN_KEY, this.USER_KEY]);
    }
  }


  /**
   * Get current user info
   * GET /api/student/me
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await this.studentApi.get('/me');

      // Actual API format: { status: true, data: { student: {...} } }
      if (response.data.status === true && response.data.data?.student) {
        const user = response.data.data.student;
        await this.saveUser(user);
        return user;
      }

      return null;
    } catch (error: any) {
      // Handle 401 Unauthenticated or any other errors
      // API returns: { "message": "Unauthenticated." } with 401 status
      if (error.response?.status === 401) {
        console.log('User not authenticated - clearing auth data');
        // Clear stored token and user data
        await this.signOut();
      } else {
        console.error('Get current user error:', error);
      }
      return null;
    }
  }

  /**
   * Load stored user data
   */
  async loadStoredUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem(this.USER_KEY);
      if (userData) {
        return JSON.parse(userData);
      }
      return null;
    } catch (error) {
      console.error('Error loading stored user:', error);
      return null;
    }
  }

  /**
   * Update user profile (placeholder - not in Student API spec)
   */
  async updateProfile(updates: Partial<User>): Promise<User> {
    try {
      // TODO: Implement when profile update endpoint is available
      throw new Error('Profile update not implemented');
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  /**
   * Change password
   * POST /api/student/change-password
   */
  async changePassword(newPassword: string): Promise<void> {
    try {
      const response = await this.studentApi.post('/change-password', {
        password: newPassword,
        password_confirmation: newPassword,
      });

      // API returns: { status: true, message: "Cập nhật mật khẩu thành công", data: [] }
      if (response.data?.status === true) {
        console.log('Password changed successfully:', response.data.message);
        return;
      }

      throw new Error(response.data?.message || 'Đổi mật khẩu thất bại');
    } catch (error: any) {
      console.error('Error changing password:', error);
      throw error;
    }
  }

  /**
   * Register FCM device token for push notifications
   * POST /api/student/device/register
   */
  async registerDevice(
    fcmToken: string,
    deviceType: 'android' | 'ios',
    deviceName: string,
    deviceId: string
  ): Promise<void> {
    try {
      const response = await this.studentApi.post('/device/register', {
        fcm_token: fcmToken,
        device_type: deviceType,
        device_name: deviceName,
        device_id: deviceId,
      });

      if (response.data?.status === 'success') {
        console.log('Device registered successfully');
        return;
      }

      throw new Error(response.data?.message || 'Đăng ký thiết bị thất bại');
    } catch (error: any) {
      console.error('Error registering device:', error);
      throw error;
    }
  }

  /**
   * Unregister FCM device token
   * POST /api/student/device/unregister
   */
  async unregisterDevice(fcmToken: string): Promise<void> {
    try {
      const response = await this.studentApi.post('/device/unregister', {
        fcm_token: fcmToken,
      });

      if (response.data?.status === 'success') {
        console.log('Device unregistered successfully');
        return;
      }

      throw new Error(response.data?.message || 'Hủy đăng ký thiết bị thất bại');
    } catch (error: any) {
      console.error('Error unregistering device:', error);
      throw error;
    }
  }

  // ==========================================================================
  // PARENT AUTH
  // ==========================================================================

  /**
   * Register FCM device token for parent push notifications
   * POST /api/parent/device/register
   */
  async registerParentDevice(
    fcmToken: string,
    deviceType: 'android' | 'ios',
    deviceName: string,
    deviceId: string
  ): Promise<void> {
    try {
      const response = await this.parentApi.post('/device/register', {
        fcm_token: fcmToken,
        device_type: deviceType,
        device_name: deviceName,
        device_id: deviceId,
      });

      if (response.data?.status === 'success' || response.data?.status === true) {
        console.log('Parent device registered successfully');
        return;
      }

      throw new Error(response.data?.message || 'Đăng ký thiết bị thất bại');
    } catch (error: any) {
      console.error('Error registering parent device:', error);
      throw error;
    }
  }

  /**
   * Unregister FCM device token for parent
   * POST /api/parent/device/unregister
   */
  async unregisterParentDevice(fcmToken: string): Promise<void> {
    try {
      const response = await this.parentApi.post('/device/unregister', {
        fcm_token: fcmToken,
      });

      if (response.data?.status === 'success' || response.data?.status === true) {
        console.log('Parent device unregistered successfully');
        return;
      }

      throw new Error(response.data?.message || 'Hủy đăng ký thiết bị thất bại');
    } catch (error: any) {
      console.error('Error unregistering parent device:', error);
      throw error;
    }
  }

  /**
   * Sign in parent
   * POST /api/parent/login
   */
  async signInParent(username: string, password: string): Promise<SignInParentResponse> {
    try {
      const response = await this.parentApi.post('/login', {
        username: username,
        password: password,
      });

      // API format: { status: true, message: "...", data: { token: "...", parent: {...} } }
      if (response.data.status === true && response.data.data) {
        const { token, parent } = response.data.data;

        // Save tokens and user data
        await this.saveParentToken(token);
        await this.saveParentUser(parent);

        return { parent, token };
      }

      throw new Error(response.data.message || 'Login failed');
    } catch (error: any) {
      console.error('Parent Sign in error:', error);
      
      // Show user-friendly error for login failures
      if (error.response?.status === 422 || error.response?.status === 401) {
        ErrorModalManager.showError(
          'Đăng nhập thất bại',
          error.message || 'Tên đăng nhập hoặc mật khẩu không đúng'
        );
      } else {
        handleApiError(error, true);
      }
      
      throw error;
    }
  }

  /**
   * Sign out parent
   * POST /api/parent/logout
   */
  async signOutParent(): Promise<void> {
    try {
      await this.parentApi.post('/logout');
    } catch (error) {
      console.error('Parent Sign out error:', error);
    } finally {
      await AsyncStorage.multiRemove([this.PARENT_TOKEN_KEY, this.PARENT_USER_KEY]);
    }
  }

  /**
   * Change parent password
   * POST /api/parent/change-password
   */
  async changeParentPassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      const response = await this.parentApi.post('/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
      });

      if (response.data?.status === 'success' || response.data?.status === true) {
        console.log('Parent password changed successfully');
        return;
      }

      throw new Error(response.data?.message || 'Đổi mật khẩu thất bại');
    } catch (error: any) {
      console.error('Error changing parent password:', error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  }

  /**
   * Get current parent info from storage
   */
  async getCurrentParent(): Promise<ParentUser | null> {
    try {
      const userData = await AsyncStorage.getItem(this.PARENT_USER_KEY);
      if (userData) {
        return JSON.parse(userData);
      }
      return null;
    } catch (error) {
      console.error('Error loading stored parent user:', error);
      return null;
    }
  }

  /**
   * Check if parent is authenticated
   */
  async isParentAuthenticated(): Promise<boolean> {
    try {
      const token = await this.getParentToken();
      return !!token;
    } catch (error) {
      return false;
    }
  }


  // ============================================================================
  // TOKEN MANAGEMENT (STUDENT)
  // ============================================================================

  /**
   * Save auth token
   */
  private async saveToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(this.TOKEN_KEY, token);
    } catch (error) {
      console.error('Error saving token:', error);
    }
  }

  /**
   * Get auth token
   */
  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(this.TOKEN_KEY);
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  /**
   * Save user data
   */
  private async saveUser(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(this.USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user:', error);
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await this.getToken();
      return !!token;
    } catch (error) {
      return false;
    }
  }

  // ============================================================================
  // TOKEN MANAGEMENT (PARENT)
  // ============================================================================

  private async saveParentToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(this.PARENT_TOKEN_KEY, token);
    } catch (error) {
      console.error('Error saving parent token:', error);
    }
  }

  async getParentToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(this.PARENT_TOKEN_KEY);
    } catch (error) {
      console.error('Error getting parent token:', error);
      return null;
    }
  }

  private async saveParentUser(user: ParentUser): Promise<void> {
    try {
      await AsyncStorage.setItem(this.PARENT_USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Error saving parent user:', error);
    }
  }
  // ============================================================================
  // COMMON AUTH METHODS
  // ============================================================================

  /**
   * Check login status and role
   * GET /api/auth/check-login
   */
  async checkLogin(token: string): Promise<{ is_student: boolean } | null> {
    try {
      const response = await axios.get(`${env.API_URL}/api/auth/check-login`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        timeout: 5000,
      });
      console.log('Check login response:', token);

      if (response.data?.status === true && response.data?.data) {
        return {
          is_student: response.data.data.is_student
        };
      }
      return null;
    } catch (error) {
      console.log('Check login error:', error);
      return null;
    }
  }
}

// ============================================================================
// EXPORT SINGLETON INSTANCE
// ============================================================================

export const authApi = new AuthApiService();

// Helper exports for convenience
export const getCurrentUser = () => authApi.getCurrentUser();
export const getCurrentParent = () => authApi.getCurrentParent();

