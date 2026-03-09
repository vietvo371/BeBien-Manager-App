import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosInstance } from 'axios';
import env from '../config/env';
import { ErrorModalManager } from './ErrorModalManager';
import { handleApiError } from './errorHandler';

// ============================================================================
// TYPES
// ============================================================================

export interface User {
  ten_nguoi_kiem_duyet: string;
  so_dien_thoai: string;
}

export interface SignInResponse {
  user: User;
  token: string;
}

export interface LoginResponse {
  status: boolean;
  token: string;
  ten_nguoi_kiem_duyet: string;
  so_dien_thoai: string;
}

export interface ApiResponse<T = any> {
  status: boolean;
  data?: T;
  message?: string;
}

// ============================================================================
// API CLIENTS
// ============================================================================

/**
 * Create dedicated axios instance for Student API
 * Base URL: /api/student
 */
const createApiClient = (): AxiosInstance => {
  const api = axios.create({
    baseURL: `${env.API_URL}/api`,
    timeout: 15000,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    // Cho phép tất cả HTTP status đi vào response (không throw error cho 4xx)
    // Fix lỗi React Native New Architecture không populate error.response đúng cách
    validateStatus: () => true,
  });

  // Request interceptor: Add Bearer token
  api.interceptors.request.use(
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

  // Không cần response interceptor error — validateStatus: () => true xử lý tất cả

  return api;
};

// ============================================================================
// AUTH API SERVICE
// ============================================================================

class AuthApiService {
  // Student Keys
  private readonly TOKEN_KEY = '@auth_token';
  private readonly USER_KEY = '@user_data';



  private api: AxiosInstance;

  constructor() {
    this.api = createApiClient();
  }

  // ==========================================================================
  // STUDENT AUTH
  // ==========================================================================

  async signIn(soDienThoai: string, password: string): Promise<SignInResponse> {
    console.log('[signIn] POST /api/nguoi-kiem-duyet/login', { soDienThoai: soDienThoai, password: password });

    const response = await this.api.post('/nguoi-kiem-duyet/login', {
      so_dien_thoai: soDienThoai,
      password,
    });

    console.log('[signIn] status:', response.status, 'data:', response.data);

    const { status: httpStatus, data } = response;

    if (httpStatus === 200 && data?.status === true && data?.token) {
      const user: User = {
        ten_nguoi_kiem_duyet: data.ten_nguoi_kiem_duyet,
        so_dien_thoai: data.so_dien_thoai,
      };
      await this.saveToken(data.token);
      await this.saveUser(user);
      console.log('[signIn] ✅ success:', user.ten_nguoi_kiem_duyet);
      return { user, token: data.token };
    }

    if (httpStatus === 422 || httpStatus === 401) {
      const message =
        data?.message ||
        data?.errors?.so_dien_thoai?.[0] ||
        'Số điện thoại hoặc mật khẩu không đúng';
      console.warn('[signIn] 422/401:', message);
      ErrorModalManager.showError('Đăng nhập thất bại', message);
      throw new Error(message);
    }

    const serverMessage = data?.message || 'Đăng nhập thất bại';
    console.error('[signIn] server error:', httpStatus, serverMessage);
    ErrorModalManager.showError('Lỗi máy chủ', serverMessage);
    throw new Error(serverMessage);
  }

  /**
   * Sign out user — clear local storage (no server endpoint)
   */
  async signOut(): Promise<void> {
    try {
      await this.api.post('/nguoi-kiem-duyet/logout').catch(() => {});
    } finally {
      await AsyncStorage.multiRemove([this.TOKEN_KEY, this.USER_KEY]);
    }
  }

  /**
   * Get current user from local storage
   */
  async getCurrentUser(): Promise<User | null> {
    return this.loadStoredUser();
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
   * Register FCM device token for push notifications
   */
  async registerDevice(
    fcmToken: string,
    deviceType: 'android' | 'ios',
    deviceName: string,
    deviceId: string
  ): Promise<void> {
    try {
      await this.api.post('/nguoi-kiem-duyet/device/register', {
        fcm_token: fcmToken,
        device_type: deviceType,
        device_name: deviceName,
        device_id: deviceId,
      });
    } catch (error: any) {
      console.error('Error registering device:', error);
      throw error;
    }
  }

  /**
   * Unregister FCM device token
   */
  async unregisterDevice(fcmToken: string): Promise<void> {
    try {
      await this.api.post('/nguoi-kiem-duyet/device/unregister', {
        fcm_token: fcmToken,
      });
    } catch (error: any) {
      console.error('Error unregistering device:', error);
      throw error;
    }
  }

  // ==========================================================================
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

}

// ============================================================================
// EXPORT SINGLETON INSTANCE
// ============================================================================

export const authApi = new AuthApiService();

// Helper exports for convenience
export const getCurrentUser = () => authApi.getCurrentUser();

