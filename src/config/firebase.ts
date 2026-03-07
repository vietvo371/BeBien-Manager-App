/**
 * Firebase Configuration
 * 
 * Setup Firebase Cloud Messaging (FCM) for push notifications
 */

import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';
import env from './env';

// Optional: Import notifee if available
let notifee: any = null;
let AndroidImportance: any = null;
try {
  const notifeeModule = require('@notifee/react-native');
  notifee = notifeeModule.default || notifeeModule;
  AndroidImportance = notifeeModule.AndroidImportance;
} catch (error) {
  console.log('⚠️ Notifee not installed, will use basic notifications');
}

/**
 * Check current notification permission status
 * iOS: Check trước khi request để tránh gọi request khi đã denied
 * Android: Check permission status
 */
export async function checkNotificationPermission(): Promise<{
  hasPermission: boolean;
  canRequest: boolean; // true nếu có thể request (chưa denied)
  status: string;
}> {
  try {
    if (Platform.OS === 'android') {
      if (Platform.Version >= 33) {
        const { PermissionsAndroid } = require('react-native');
        const granted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        return {
          hasPermission: granted,
          canRequest: !granted, // Có thể request nếu chưa granted
          status: granted ? 'granted' : 'not_determined',
        };
      }
      // Android < 13 không cần permission
      return {
        hasPermission: true,
        canRequest: false,
        status: 'granted',
      };
    }

    // iOS - Check current status
    const authStatus = await messaging().hasPermission();
    const hasPermission =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    const canRequest = authStatus === messaging.AuthorizationStatus.NOT_DETERMINED;

    let status = 'denied';
    if (hasPermission) status = 'granted';
    else if (canRequest) status = 'not_determined';

    console.log(`📱 iOS notification permission status: ${status} (${authStatus})`);

    return {
      hasPermission,
      canRequest,
      status,
    };
  } catch (error) {
    console.error('❌ Error checking notification permission:', error);
    return {
      hasPermission: false,
      canRequest: false,
      status: 'error',
    };
  }
}

/**
 * Request permission cho push notifications
 * iOS yêu cầu permission trước khi nhận notifications
 * Android 13+ cũng cần runtime permission
 */
export async function requestUserPermission(): Promise<boolean> {
  try {
    // Check current status first
    const { hasPermission, canRequest, status } = await checkNotificationPermission();

    // Nếu đã có permission, return true ngay
    if (hasPermission) {
      console.log('✅ Notification permission already granted');
      return true;
    }

    // Nếu không thể request (đã denied trước đó), return false
    if (!canRequest) {
      console.log('⚠️ Cannot request permission - user must enable in Settings');
      console.log('Current status:', status);
      return false;
    }

    // Android 13+ - Request permission
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const { PermissionsAndroid } = require('react-native');
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );

      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        console.log('❌ Android notification permission denied');
        return false;
      }
      console.log('✅ Android notification permission granted');
      return true;
    }

    // iOS - Request permission (chỉ khi status = NOT_DETERMINED)
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('✅ iOS notification permission granted:', authStatus);
      return true;
    }

    console.log('❌ iOS notification permission denied');
    return false;
  } catch (error) {
    console.error('❌ Error requesting notification permission:', error);
    return false;
  }
}

/**
 * Get FCM Token
 * Token này dùng để gửi push notifications đến device cụ thể
 * @param forceRefresh - Force delete old token và lấy token mới (mặc định false)
 */
export async function getFCMToken(forceRefresh: boolean = false): Promise<string | null> {
  try {
    // Check Firebase config validity
    if (env.FIREBASE.API_KEY.includes('YOUR_')) {
      console.warn('⚠️ Firebase credentials not configured properly');
      return null;
    }

    // Check if device supports FCM
    if (!messaging().isDeviceRegisteredForRemoteMessages) {
      await messaging().registerDeviceForRemoteMessages();
    }

    // Xóa token cũ nếu forceRefresh = true (tránh duplicate tokens)
    if (forceRefresh) {
      try {
        await messaging().deleteToken();
        console.log('🗑️ Deleted old FCM token');
      } catch (deleteError) {
        console.log('⚠️ No old token to delete or deletion failed:', deleteError);
      }
    }

    const token = await messaging().getToken();

    if (token) {
      console.log('✅ FCM Token:', token);
      return token;
    }

    console.log('❌ No FCM token available');
    return null;
  } catch (error) {
    console.error('❌ Error getting FCM token:', error);
    return null;
  }
}

/**
 * Create notification channel for Android (cần gọi 1 lần khi app khởi động)
 */
export async function createNotificationChannel() {
  if (!notifee || !AndroidImportance || Platform.OS !== 'android') {
    return;
  }

  try {
    await notifee.createChannel({
      id: 'lms_notifications',
      name: 'LMS WISEENGLISH Notifications',
      importance: AndroidImportance.HIGH,
      sound: 'default',
      vibration: true,
    });
    console.log('✅ Android notification channel created');
  } catch (error) {
    console.error('❌ Error creating notification channel:', error);
  }
}

/**
 * Display local notification with notifee (dùng cho foreground trên cả iOS và Android)
 * Notifee sẽ hiển thị notification banner native khi app ở foreground
 */
export async function displayLocalNotification(
  title: string,
  body: string,
  data?: Record<string, string>
) {
  // Fallback nếu notifee chưa cài
  if (!notifee) {
    console.log('⚠️ Notifee not available, notification not displayed');
    return;
  }

  try {
    // Tạo channel cho Android nếu chưa có
    if (Platform.OS === 'android') {
      await createNotificationChannel();
    }

    await notifee.displayNotification({
      title,
      body,
      data,
      ...(Platform.OS === 'android' && {
        android: {
          channelId: 'lms_notifications',
          smallIcon: 'ic_notification', // Dùng icon đã tạo
          color: '#7f2d84', // Purple brand color
          pressAction: {
            id: 'default',
          },
        },
      }),
      ...(Platform.OS === 'ios' && {
        ios: {
          sound: 'default',
        },
      }),
    });
    console.log('✅ Local notification displayed with notifee');
  } catch (error) {
    console.error('❌ Error displaying local notification:', error);
  }
}

/**
 * Setup notification listeners
 */
export function setupNotificationListeners(
  onNotification?: (message: any) => void,
  onNotificationOpened?: (message: any) => void
) {
  // Foreground message handler
  const unsubscribeForeground = messaging().onMessage(async (remoteMessage) => {
    console.log('📱 Foreground notification received:', remoteMessage);

    if (onNotification) {
      onNotification(remoteMessage);
    }
  });

  // Background/Quit state message handler
  messaging().onNotificationOpenedApp((remoteMessage) => {
    console.log('📱 Notification opened app from background:', remoteMessage);

    if (onNotificationOpened) {
      onNotificationOpened(remoteMessage);
    }
  });

  // Check if app was opened by notification (when app was completely closed)
  messaging()
    .getInitialNotification()
    .then((remoteMessage) => {
      if (remoteMessage) {
        console.log('📱 Notification opened app from quit state:', remoteMessage);

        if (onNotificationOpened) {
          onNotificationOpened(remoteMessage);
        }
      }
    });

  // Token refresh listener
  const unsubscribeTokenRefresh = messaging().onTokenRefresh(async (token) => {
    console.log('🔄 FCM Token refreshed:', token);
    // TODO: Send new token to backend
  });

  // Return cleanup function
  return () => {
    unsubscribeForeground();
    unsubscribeTokenRefresh();
  };
}

/**
 * Background message handler
 * Phải đăng ký trước khi app khởi động (trong index.js)
 */
export function setupBackgroundMessageHandler() {
  messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    console.log('📱 Background notification received:', remoteMessage);
    // Handle background notification
  });
}

/**
 * Re-register FCM token (gọi khi app trở lại foreground)
 * Xóa token cũ và lấy token mới để tránh duplicate
 */
export async function reregisterFCMToken(): Promise<string | null> {
  try {
    console.log('🔄 Re-registering FCM token...');

    // Force refresh token (xóa cũ, lấy mới)
    const token = await getFCMToken(true);

    if (token) {
      console.log('✅ FCM token re-registered successfully');
      return token;
    }

    console.warn('⚠️ Failed to re-register FCM token');
    return null;
  } catch (error) {
    console.error('❌ Error re-registering FCM token:', error);
    return null;
  }
}

/**
 * Initialize Firebase
 */
export async function initializeFirebase(): Promise<boolean> {
  try {
    console.log('🔥 Initializing Firebase...');

    // Add delay for Android to ensure native modules are ready
    if (Platform.OS === 'android') {
      await new Promise<void>(resolve => setTimeout(() => resolve(), 1000));
    }

    // Check permission status first
    const { hasPermission, canRequest, status } = await checkNotificationPermission();

    if (!hasPermission) {
      if (canRequest) {
        // Có thể request permission
        console.log('📱 Requesting notification permission...');
        const granted = await requestUserPermission();

        if (!granted) {
          console.warn('⚠️ User denied notification permission');
          console.warn('⚠️ App will continue without push notifications');
          // iOS: Không thể lấy FCM token nếu không có permission
          // Nhưng vẫn cho phép app chạy bình thường
          if (Platform.OS === 'ios') {
            console.warn('⚠️ iOS requires notification permission to get FCM token');
            console.warn('⚠️ User can enable notifications later in Settings');
            return true; // ✅ Return true để app không bị block
          }
        }
      } else {
        // Không thể request (đã denied trước đó)
        console.warn('⚠️ Notification permission was denied previously');
        console.warn(`⚠️ Current status: ${status}`);
        console.warn('⚠️ User must enable notifications in device Settings');
        console.warn('⚠️ App will continue without push notifications');

        // iOS: Không thể lấy FCM token
        if (Platform.OS === 'ios') {
          console.warn('⚠️ To enable notifications:');
          console.warn('   Settings → LMS_App → Notifications → Allow Notifications');
          return true; // ✅ Return true để app không bị block
        }
      }
    } else {
      console.log('✅ Notification permission already granted');
    }

    // Get FCM token (first time: không force refresh)
    const token = await getFCMToken(false);
    if (!token) {
      console.warn('⚠️ Failed to get FCM token');
      // Don't fail completely, app can still work without notifications
      console.warn('⚠️ App will continue without push notifications');
      return true; // ✅ Return true để app không bị block
    }

    console.log('✅ Firebase initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize Firebase:', error);
    // Don't throw, just return true to allow app to continue
    console.warn('⚠️ App will continue without push notifications');
    return true; // ✅ Return true để app không bị block
  }
}

export default {
  checkNotificationPermission,
  requestUserPermission,
  getFCMToken,
  reregisterFCMToken,
  setupNotificationListeners,
  setupBackgroundMessageHandler,
  initializeFirebase,
  createNotificationChannel,
  displayLocalNotification,
};
