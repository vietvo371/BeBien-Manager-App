/**
 * Notification Service Component
 * 
 * Component để xử lý Firebase push notifications
 * Wrap component này ở root level của app
 */

import React, { useEffect, useRef, useState } from 'react';
import { Platform, AppState, AppStateStatus, Alert, Linking } from 'react-native';
import { getMessaging, onMessage } from '@react-native-firebase/messaging';
import { getApp } from '@react-native-firebase/app';
import DeviceInfo from 'react-native-device-info';
import {
  setupNotificationListeners,
  getFCMToken,
  requestUserPermission,
  displayLocalNotification,
  createNotificationChannel,
  reregisterFCMToken,
  checkNotificationPermission
} from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { authApi } from '../utils/authApi';
import Toast from 'react-native-toast-message';
import * as NavigationService from '../navigation/NavigationService';

// Optional: Import notifee if available
let notifee: any = null;
let EventType: any = null;
try {
  const notifeeModule = require('@notifee/react-native');
  notifee = notifeeModule.default || notifeeModule;
  EventType = notifeeModule.EventType;
} catch (error) {
  console.log('⚠️ Notifee not installed');
}

interface NotificationServiceProps {
  onNotification?: (notification: any) => void;
  onNotificationOpened?: (notification: any) => void;
}

const NotificationService: React.FC<NotificationServiceProps> = ({
  onNotification,
  onNotificationOpened,
}) => {
  const { user } = useAuth();
  const appState = useRef(AppState.currentState);
  const [hasCheckedPermission, setHasCheckedPermission] = useState(false);
  const [isFirebaseInitialized, setIsFirebaseInitialized] = useState(false);

  // Initialize Firebase when user is logged in
  useEffect(() => {
    if (user && !isFirebaseInitialized) {
      console.log(`👤 User logged in, initializing Firebase...`, user.id);

      const initFirebase = async () => {
        try {
          const { initializeFirebase } = require('../config/firebase');
          const success = await initializeFirebase();

          if (success) {
            console.log(`✅ Firebase initialized for user:`, user.id);
            setIsFirebaseInitialized(true);

            // Check permission after initialization
            await checkAndRequestPermission();
          } else {
            console.warn('⚠️ Firebase initialization failed');
          }
        } catch (error) {
          console.error('❌ Error initializing Firebase:', error);
        }
      };

      initFirebase();
    } else if (!user && isFirebaseInitialized) {
      // User logged out, cleanup Firebase
      console.log('👤 User logged out, cleaning up Firebase...');
      setIsFirebaseInitialized(false);
      setHasCheckedPermission(false);
    }
  }, [user, isFirebaseInitialized]);

  useEffect(() => {
    // Chỉ setup listeners KHI Firebase đã initialized
    if (!isFirebaseInitialized) {
      return;
    }

    // Create notification channel cho Android (cần gọi 1 lần)
    createNotificationChannel();

    // Setup notification listeners
    const unsubscribe = setupNotificationListeners(
      handleForegroundNotification,
      handleNotificationOpened
    );

    // Listen to app state changes
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // Update FCM token when user logs in
    if (user) {
      updateFCMToken();
    }

    // Xử lý khi user tap vào notification (notifee - Android)
    let unsubscribeNotifee: any = null;
    if (notifee) {
      unsubscribeNotifee = notifee.onForegroundEvent(({ type, detail }: any) => {
        handleNotifeeEvent(type, detail);
      });
    }

    return () => {
      unsubscribe();
      subscription.remove();
      if (unsubscribeNotifee) {
        unsubscribeNotifee();
      }
    };
  }, [user, isFirebaseInitialized]);

  /**
   * Check notification permission và prompt user nếu chưa allow
   */
  const checkAndRequestPermission = async () => {
    try {
      // Sử dụng function từ firebase.ts
      const { hasPermission, canRequest, status } = await checkNotificationPermission();

      // Nếu đã có permission, không cần làm gì
      if (hasPermission) {
        return true;
      }

      // Nếu chưa check permission lần nào, prompt user
      if (!hasCheckedPermission) {
        setHasCheckedPermission(true);

        if (canRequest) {
          // Có thể request permission → Show alert
          showPermissionAlert();
        } else {
          // Đã denied trước đó → Show settings guide
          console.log(`⚠️ Permission status: ${status}`);
          console.log('⚠️ User must enable notifications in Settings');
          showSettingsGuide();
        }
      }

      return hasPermission;
    } catch (error) {
      console.error('❌ Error checking permission:', error);
      return false;
    }
  };

  /**
   * Hiển thị alert yêu cầu user bật notification
   */
  const showPermissionAlert = () => {
    Alert.alert(
      '🔔 Bật thông báo',
      'Bạn có muốn nhận thông báo về lịch học, điểm danh và thông tin quan trọng khác không?',
      [
        {
          text: 'Để sau',
          style: 'cancel',
          onPress: () => {
            console.log('User declined notification permission');
          },
        },
        {
          text: 'Bật thông báo',
          onPress: async () => {
            const granted = await requestUserPermission();
            if (granted) {
              Toast.show({
                type: 'success',
                text1: '✅ Đã bật thông báo',
                text2: 'Bạn sẽ nhận được thông báo quan trọng',
                position: 'top',
              });
            } else {
              // User denied permission, show guide to open settings
              showSettingsGuide();
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  /**
   * Hướng dẫn user mở Settings để bật notification
   */
  const showSettingsGuide = () => {
    Alert.alert(
      'Cần cấp quyền thông báo',
      'Để nhận thông báo quan trọng, vui lòng vào Cài đặt và bật quyền Thông báo cho ứng dụng.',
      [
        {
          text: 'Đóng',
          style: 'cancel',
        },
        {
          text: 'Mở Cài đặt',
          onPress: () => {
            if (Platform.OS === 'ios') {
              Linking.openURL('app-settings:');
            } else {
              Linking.openSettings();
            }
          },
        },
      ]
    );
  };

  /**
   * Xử lý khi user tap vào notification (notifee - Android)
   */
  const handleNotifeeEvent = async (type: any, detail: any) => {
    if (!notifee || !EventType) return;

    try {
      if (type === EventType.PRESS) {
        const data = detail.notification?.data;
        console.log('📱 Notifee notification pressed:', data);

        // Navigate to notification screen based on user type
        navigateToNotificationScreen();

        if (onNotificationOpened) {
          onNotificationOpened(detail.notification);
        }
      }
    } catch (error) {
      console.error('❌ Error handling notifee event:', error);
    }
  };

  /**
   * Handle foreground notification
   * Hiển thị notification trong app khi app đang mở
   */
  const handleForegroundNotification = async (notification: any) => {
    console.log('📱 Foreground notification:', notification);

    // Check permission khi có notification đến
    const hasPermission = await checkAndRequestPermission();

    const title = notification.notification?.title || 'Thông báo mới';
    const body = notification.notification?.body || '';
    const data = notification.data as Record<string, string> | undefined;

    // Hiển thị native notification banner với notifee (nếu có)
    if (notifee) {
      await displayLocalNotification(title, body, data);
    } else {
      // Fallback: Dùng Toast nếu notifee chưa cài
      Toast.show({
        type: 'info',
        text1: title,
        text2: body,
        position: 'top',
        visibilityTime: 4000,
        autoHide: true,
        topOffset: 50,
        onPress: () => {
          if (onNotificationOpened) {
            onNotificationOpened(notification);
          }
        },
      });
    }

    // Custom handler
    if (onNotification) {
      onNotification(notification);
    }
  };

  /**
   * Navigate to notification screen
   */
  const navigateToNotificationScreen = () => {
    try {
      const screenName = 'Home'; // Changed from 'ThongBao'
      console.log(`🔔 Navigating to ${screenName}`);

      // Use NavigationService to navigate
      NavigationService.navigate(screenName as any);
    } catch (error) {
      console.error('❌ Error navigating to notification screen:', error);
    }
  };

  /**
   * Handle notification opened
   * Xử lý khi user nhấn vào notification
   */
  const handleNotificationOpened = (notification: any) => {
    console.log('🔔 Notification opened:', notification);

    // Navigate to notification screen based on user type
    navigateToNotificationScreen();

    // Custom handler
    if (onNotificationOpened) {
      onNotificationOpened(notification);
    }
  };

  /**
   * Handle app state change
   * Re-register FCM token khi app trở lại foreground
   */
  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    if (
      appState.current.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      console.log('📱 App has come to foreground');

      // Re-register FCM token (xóa cũ, lấy mới)
      if (isFirebaseInitialized) {
        console.log('🔄 Re-registering FCM token after returning to foreground...');
        const newToken = await reregisterFCMToken();

        if (newToken) {
          // Update token to backend
          const deviceInfo = await getDeviceInfo();

          try {
            // Check if user still has valid token before registering
            const hasToken = await authApi.getToken();

            if (!hasToken) {
              console.log('⚠️ No auth token found, skipping device registration');
              return;
            }

            await authApi.registerDevice( 
              newToken,
              deviceInfo.deviceType,
              deviceInfo.deviceName,
              deviceInfo.deviceId
            );
            console.log('✅ FCM token re-registered with backend');
          } catch (error) {
            console.error('❌ Error re-registering token with backend:', error);
          }
        }
      }
    }

    appState.current = nextAppState;
  };

  /**
   * Get device information
   */
  const getDeviceInfo = async () => {
    try {
      const deviceId = await DeviceInfo.getUniqueId();
      const deviceName = await DeviceInfo.getDeviceName();
      const deviceType = Platform.OS === 'ios' ? 'ios' : 'android';

      return {
        deviceId,
        deviceName: deviceName || `${Platform.OS} Device`,
        deviceType: deviceType as 'android' | 'ios',
      };
    } catch (error) {
      console.error('❌ Error getting device info:', error);
      return {
        deviceId: 'unknown',
        deviceName: Platform.OS === 'ios' ? 'iOS Device' : 'Android Device',
        deviceType: Platform.OS === 'ios' ? 'ios' as const : 'android' as const,
      };
    }
  };

  /**
   * Update FCM token to backend
   * Register device with FCM token
   */
  const updateFCMToken = async () => {
    try {
      const token = await getFCMToken();

      if (token && user) {
        console.log(`🔄 Registering device with FCM token for user:`, user.id);

        const deviceInfo = await getDeviceInfo();

        // Check if user still has valid token before registering
        const hasToken = await authApi.getToken();

        if (!hasToken) {
          console.log('⚠️ No auth token found, skipping device registration');
          return;
        }

        // Register device
        await authApi.registerDevice(
          token,
          deviceInfo.deviceType,
          deviceInfo.deviceName,
          deviceInfo.deviceId
        );

        console.log('✅ Device registered successfully');
      }
    } catch (error: any) {
      // Check if backend FCM is not configured
      if (error?.message?.includes('serverKey') || error?.message?.includes('FCM')) {
        console.warn('⚠️ Backend FCM not configured yet, skipping device registration');
        console.warn('Backend needs to set FCM_SERVER_KEY in .env file');
      } else {
        console.error('❌ Error registering device:', error);
      }
    }
  };

  /**
   * Unregister device when user logs out
   */
  const unregisterDevice = async () => {
    try {
      const token = await getFCMToken();
      if (token) {
        console.log('🔄 Unregistering device...');
        await authApi.unregisterDevice(token);
        console.log('✅ Device unregistered successfully');
      }
    } catch (error: any) {
      // Check if backend FCM is not configured
      if (error?.message?.includes('serverKey') || error?.message?.includes('FCM')) {
        console.warn('⚠️ Backend FCM not configured, skipping device unregistration');
      } else {
        console.error('❌ Error unregistering device:', error);
      }
    }
  };

  // This component doesn't render anything
  return null;
};

/**
 * Helper function to unregister device
 * Call this when user logs out
 * Tự động detect student/parent và gọi đúng API
 */
export const unregisterCurrentDevice = async () => {
  try {
    const token = await getFCMToken();
    if (!token) {
      console.log('No FCM token found, skipping unregister');
      return;
    }

    // Unregister device
    await authApi.unregisterDevice(token);
    console.log('✅ Device unregistered on logout');
  } catch (error: any) {
    // Check if backend FCM is not configured
    if (error?.message?.includes('serverKey') || error?.message?.includes('FCM')) {
      console.warn('⚠️ Backend FCM not configured, skipping device unregistration on logout');
    } else {
      console.error('❌ Error unregistering device on logout:', error);
    }
  }
};

export default NotificationService;
