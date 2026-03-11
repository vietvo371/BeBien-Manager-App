/**
 * Centralized Authentication Service
 * 
 * Provides high-level auth operations:
 * - Logout with FCM token cleanup
 * - Token validation
 * - Session management
 * 
 * Usage:
 * import { AuthService } from '@/services/AuthService';
 * 
 * await AuthService.logout();
 * const isValid = await AuthService.checkToken();
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { getMessaging, getToken } from '@react-native-firebase/messaging';
import { getApp } from '@react-native-firebase/app';
import { authApi } from '../utils/authApi';
import { resetTo } from '../navigation/NavigationService';
import { ErrorModalManager } from '../utils/ErrorModalManager';

export const AuthService = {
  /**
   * Logout user with cleanup
   * 
   * Flow:
   * 1. Unregister FCM token from server (if not skipApi)
   * 2. Call logout API to invalidate session
   * 3. Clear local storage (token, user, etc.)
   * 4. Reset navigation to Login screen
   * 
   * @param options.skipApi - Skip API calls (useful when server is unreachable)
   */
  async logout(options: { skipApi?: boolean } = {}) {
    console.log('🚪 AuthService.logout() called, skipApi:', options.skipApi);
    
    try {
      if (!options.skipApi) {
        try {
          // Unregister FCM token before logout
          const messagingInstance = getMessaging(getApp());
          const fcmToken = await getToken(messagingInstance);
          if (fcmToken) {
            console.log('📱 Unregistering FCM token...');
            await authApi.unregisterDevice(fcmToken);
          }
        } catch (fcmError) {
          console.warn('⚠️ Failed to unregister FCM token:', fcmError);
          // Continue logout even if FCM unregister fails
        }

        // Call logout API
        try {
          await authApi.signOut();
          console.log('✅ Logout API call successful');
        } catch (apiError) {
          console.warn('⚠️ Logout API call failed:', apiError);
          // Continue to clear local state even if API fails
        }
      }
    } finally {
      // Always clear local storage regardless of API call results
      console.log('🧹 Clearing local storage...');
      
      await AsyncStorage.multiRemove([
        '@auth_token',
        '@user_data',
        '@remember_me',
        '@saved_username',
      ]);

      console.log('✅ Local storage cleared');
      console.log('🔄 Resetting to Login screen...');
      
      // Reset navigation to Login screen
      resetTo('Login');
    }
  },

  /**
   * Check if current token is valid
   * 
   * Flow:
   * 1. Get token from AsyncStorage
   * 2. Call /auth/check-login API
   * 3. If valid, return true
   * 4. If invalid, logout and return false
   * 
   * @returns true if token is valid, false otherwise
   */
  async checkToken(): Promise<boolean> {
    try {
      const token = await authApi.getToken();
      
      if (!token) {
        console.log('❌ No token found in storage');
        return false;
      }

      console.log('🔍 Checking token validity...');
      const result = await authApi.verifyToken(token);
      
      if (result) {
        console.log('✅ Token is valid');
        return true;
      }

      console.log('❌ Token check failed or returned invalid data');
      
      // Token is invalid, logout without API call
      await this.logout({ skipApi: true });
      return false;
    } catch (error) {
      console.error('❌ Token check error:', error);
      
      // On error, logout without API call
      await this.logout({ skipApi: true });
      return false;
    }
  },

  /**
   * Check if user is currently authenticated
   * 
   * Simple check without API call
   * 
   * @returns true if token exists in storage
   */
  async isAuthenticated(): Promise<boolean> {
    return await authApi.isAuthenticated();
  },

  /**
   * Get current user from AsyncStorage
   * 
   * @returns User object or null
   */
  async getStoredUser() {
    return await authApi.loadStoredUser();
  },

  /**
   * Handle 401 Unauthorized response
   * 
   * Shows session expired modal and logs out
   */
  handleUnauthorized() {
    console.log('❌ 401 Unauthorized - Session expired');
    
    ErrorModalManager.showSessionExpired(async () => {
      await this.logout({ skipApi: true });
    });
  },

  /**
   * Handle 403 Forbidden response
   * 
   * Shows access denied modal and logs out
   */
  handleForbidden() {
    console.log('❌ 403 Forbidden - Access denied');
    
    ErrorModalManager.showAccessDenied(async () => {
      await this.logout({ skipApi: true });
    });
  },

  /**
   * Handle network timeout
   * 
   * Shows timeout modal and logs out
   */
  handleTimeout() {
    console.log('❌ Request timeout after retries');
    
    ErrorModalManager.showTimeoutError(async () => {
      await this.logout({ skipApi: true });
    });
  },
};

export default AuthService;
