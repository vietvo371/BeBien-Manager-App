/**
 * Push Notification Helper
 * 
 * Utility functions để làm việc với push notifications
 */

import messaging from '@react-native-firebase/messaging';
import { Platform, PermissionsAndroid } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FCM_TOKEN_KEY = '@fcm_token';

/**
 * Check if notification permission is granted
 */
export async function checkNotificationPermission(): Promise<boolean> {
  try {
    if (Platform.OS === 'android') {
      if (Platform.Version >= 33) {
        const result = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        return result;
      }
      // Android < 13 không cần permission
      return true;
    }

    // iOS
    const authStatus = await messaging().hasPermission();
    return (
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL
    );
  } catch (error) {
    console.error('Error checking notification permission:', error);
    return false;
  }
}

/**
 * Request notification permission (Android 13+)
 */
export async function requestNotificationPermission(): Promise<boolean> {
  try {
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );
      return result === PermissionsAndroid.RESULTS.GRANTED;
    }

    // iOS handled by Firebase
    return true;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
}

/**
 * Get stored FCM token
 */
export async function getStoredFCMToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(FCM_TOKEN_KEY);
  } catch (error) {
    console.error('Error getting stored FCM token:', error);
    return null;
  }
}

/**
 * Save FCM token
 */
export async function saveFCMToken(token: string): Promise<void> {
  try {
    await AsyncStorage.setItem(FCM_TOKEN_KEY, token);
  } catch (error) {
    console.error('Error saving FCM token:', error);
  }
}

/**
 * Clear FCM token (khi logout)
 */
export async function clearFCMToken(): Promise<void> {
  try {
    await AsyncStorage.removeItem(FCM_TOKEN_KEY);
  } catch (error) {
    console.error('Error clearing FCM token:', error);
  }
}

/**
 * Subscribe to topic
 */
export async function subscribeToTopic(topic: string): Promise<boolean> {
  try {
    await messaging().subscribeToTopic(topic);
    console.log(`✅ Subscribed to topic: ${topic}`);
    return true;
  } catch (error) {
    console.error(`❌ Error subscribing to topic ${topic}:`, error);
    return false;
  }
}

/**
 * Unsubscribe from topic
 */
export async function unsubscribeFromTopic(topic: string): Promise<boolean> {
  try {
    await messaging().unsubscribeFromTopic(topic);
    console.log(`✅ Unsubscribed from topic: ${topic}`);
    return true;
  } catch (error) {
    console.error(`❌ Error unsubscribing from topic ${topic}:`, error);
    return false;
  }
}

/**
 * Get notification badge count (iOS only)
 */
export async function getBadgeCount(): Promise<number> {
  if (Platform.OS === 'ios') {
    try {
      return await messaging().getBadge();
    } catch (error) {
      console.error('Error getting badge count:', error);
    }
  }
  return 0;
}

/**
 * Set notification badge count (iOS only)
 */
export async function setBadgeCount(count: number): Promise<void> {
  if (Platform.OS === 'ios') {
    try {
      await messaging().setBadge(count);
    } catch (error) {
      console.error('Error setting badge count:', error);
    }
  }
}

/**
 * Clear all notifications
 */
export async function clearNotifications(): Promise<void> {
  try {
    if (Platform.OS === 'ios') {
      await messaging().setBadge(0);
    }
    // Android: Clear notifications from notification tray
    // Note: Cần native module để clear Android notifications
  } catch (error) {
    console.error('Error clearing notifications:', error);
  }
}

/**
 * Handle notification click
 * Parse notification data và return navigation params
 */
export function parseNotificationData(notification: any): {
  screen: string;
  params: any;
} | null {
  try {
    const { data } = notification;
    
    if (!data || !data.type) {
      return null;
    }

    switch (data.type) {
      case 'class_schedule':
        return {
          screen: 'ClassDetail',
          params: { classId: data.class_id },
        };
      
      case 'attendance':
        return {
          screen: 'AttendanceDetail',
          params: { attendanceId: data.attendance_id },
        };
      
      case 'payment':
        return {
          screen: 'PaymentDetail',
          params: { paymentId: data.payment_id },
        };
      
      case 'message':
        return {
          screen: 'Chat',
          params: { chatId: data.chat_id },
        };
      
      default:
        return {
          screen: 'Notifications',
          params: {},
        };
    }
  } catch (error) {
    console.error('Error parsing notification data:', error);
    return null;
  }
}

export default {
  checkNotificationPermission,
  requestNotificationPermission,
  getStoredFCMToken,
  saveFCMToken,
  clearFCMToken,
  subscribeToTopic,
  unsubscribeFromTopic,
  getBadgeCount,
  setBadgeCount,
  clearNotifications,
  parseNotificationData,
};
