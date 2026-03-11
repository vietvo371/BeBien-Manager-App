/**
 * Notification Service Component
 *
 * Component để xử lý Firebase push notifications
 * Wrap component này ở root level của app
 */

import React, { useEffect, useRef, useState } from 'react';
import { Platform, AppState, AppStateStatus, Alert, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfo from 'react-native-device-info';
import { QueryClient } from '@tanstack/react-query';
import {
  setupNotificationListeners,
  getFCMToken,
  requestUserPermission,
  displayLocalNotification,
  createNotificationChannel,
  checkNotificationPermission,
} from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { authApi } from '../utils/authApi';
import Toast from 'react-native-toast-message';
import * as NavigationService from '../navigation/NavigationService';
import { queryClient as globalQueryClient } from '../config/queryClient';

// ─── Notification type routing ────────────────────────────────────────────────

/**
 * Các loại notification từ server và tab đích tương ứng.
 * type = xoa_mon        → HomeScreen (Duyệt huỷ)
 * type = hoa_don_*      → OrderScreen
 * type = bep_*          → KitchenScreen
 */
type NotifType = string | undefined;

const getTargetTab = (type: NotifType): 'Home' | 'Order' | 'Kitchen' => {
  if (!type) return 'Home';
  if (type === 'xoa_mon')             return 'Home';
  if (type.startsWith('hoa_don') || type.startsWith('order')) return 'Order';
  if (type.startsWith('bep'))         return 'Kitchen';
  return 'Home';
};

/**
 * Invalidate đúng React Query keys theo notification type.
 */
const invalidateByType = (qc: QueryClient, type: NotifType) => {
  if (type === 'xoa_mon') {
    qc.invalidateQueries({ queryKey: ['cancel-items'] });
    return;
  }
  if (type?.startsWith('hoa_don') || type?.startsWith('order')) {
    qc.invalidateQueries({ queryKey: ['hoaDonOpen'] });
    return;
  }
  if (type?.startsWith('bep')) {
    qc.invalidateQueries({ queryKey: ['bepDonMonTheoBan'] });
    qc.invalidateQueries({ queryKey: ['bepXongMonTheoNhom'] });
    return;
  }
  // Fallback: refresh tất cả
  qc.invalidateQueries({ queryKey: ['cancel-items'] });
  qc.invalidateQueries({ queryKey: ['hoaDonOpen'] });
  qc.invalidateQueries({ queryKey: ['bepDonMonTheoBan'] });
  qc.invalidateQueries({ queryKey: ['bepXongMonTheoNhom'] });
};

// Key lưu FCM token đã đăng ký thành công lần cuối
const LAST_REGISTERED_FCM_KEY = '@last_registered_fcm_token';

// Optional: Import notifee if available
let notifee: any = null;
let EventType: any = null;
try {
  const notifeeModule = require('@notifee/react-native');
  notifee = notifeeModule.default || notifeeModule;
  EventType = notifeeModule.EventType;
} catch {
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

  // ── Refs (không trigger re-render) ─────────────────────────────────────────
  const appStateRef        = useRef(AppState.currentState);
  const isFirebaseInitRef  = useRef(false);   // thay state → ref để tránh re-run useEffect
  const userRef            = useRef(user);     // snapshot user cho handler async
  const isRegisteringRef   = useRef(false);    // guard chống double-register FCM

  const [hasCheckedPermission, setHasCheckedPermission] = useState(false);

  // Sync userRef mỗi khi user thay đổi
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // ── Firebase init / cleanup — chỉ phụ thuộc user ──────────────────────────
  useEffect(() => {
    if (user && !isFirebaseInitRef.current) {
      console.log('👤 User logged in, initializing Firebase...', user.ten_nguoi_kiem_duyet);
      initFirebase();
    } else if (!user && isFirebaseInitRef.current) {
      console.log('👤 User logged out, cleaning up Firebase...');
      isFirebaseInitRef.current = false;
      setHasCheckedPermission(false);
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Listeners — chỉ đăng ký MỘT LẦN (empty deps) ─────────────────────────
  useEffect(() => {
    createNotificationChannel();

    const unsubscribeNotifications = setupNotificationListeners(
      handleForegroundNotification,
      handleNotificationOpened,
    );

    // AppState listener — chỉ đăng ký 1 lần, dùng ref bên trong handler
    const appStateSub = AppState.addEventListener('change', handleAppStateChange);

    // onTokenRefresh: Firebase tự rotate token → cập nhật ngay với backend
    let unsubscribeTokenRefresh: (() => void) | undefined;
    try {
      const { getMessaging } = require('@react-native-firebase/messaging');
      const { getApp } = require('@react-native-firebase/app');
      const messaging = getMessaging(getApp());
      unsubscribeTokenRefresh = messaging.onTokenRefresh(async (newToken: string) => {
        console.log('🔄 Firebase rotated FCM token, syncing...');
        // Xoá token cũ đã lưu để buộc re-register
        await AsyncStorage.removeItem(LAST_REGISTERED_FCM_KEY);
        await syncFCMTokenToBackend(newToken);
      });
    } catch {
      // Firebase chưa init khi mount — không sao, sẽ được gọi sau
    }

    let unsubscribeNotifee: any = null;
    if (notifee) {
      unsubscribeNotifee = notifee.onForegroundEvent(({ type, detail }: any) => {
        handleNotifeeEvent(type, detail);
      });
    }

    return () => {
      unsubscribeNotifications();
      appStateSub.remove();
      unsubscribeTokenRefresh?.();
      if (unsubscribeNotifee) unsubscribeNotifee();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Firebase init ──────────────────────────────────────────────────────────

  const initFirebase = async () => {
    try {
      const { initializeFirebase } = require('../config/firebase');
      const success = await initializeFirebase();
      if (success) {
        console.log('✅ Firebase initialized');
        isFirebaseInitRef.current = true;
        await checkAndRequestPermission();
        await updateFCMToken();
      } else {
        console.warn('⚠️ Firebase initialization failed');
      }
    } catch (error) {
      console.error('❌ Error initializing Firebase:', error);
    }
  };

  // ── Permissions ────────────────────────────────────────────────────────────

  const checkAndRequestPermission = async () => {
    try {
      const { hasPermission, canRequest, status } = await checkNotificationPermission();
      if (hasPermission) return true;

      if (!hasCheckedPermission) {
        setHasCheckedPermission(true);
        if (canRequest) {
          showPermissionAlert();
        } else {
          console.log(`⚠️ Permission status: ${status} — user must enable in Settings`);
          showSettingsGuide();
        }
      }
      return false;
    } catch (error) {
      console.error('❌ Error checking permission:', error);
      return false;
    }
  };

  const showPermissionAlert = () => {
    Alert.alert(
      '🔔 Bật thông báo',
      'Bạn có muốn nhận thông báo về các yêu cầu hủy món và thông tin quan trọng không?',
      [
        { text: 'Để sau', style: 'cancel' },
        {
          text: 'Bật thông báo',
          onPress: async () => {
            const granted = await requestUserPermission();
            if (granted) {
              Toast.show({ type: 'success', text1: '✅ Đã bật thông báo', position: 'top' });
            } else {
              showSettingsGuide();
            }
          },
        },
      ],
      { cancelable: true },
    );
  };

  const showSettingsGuide = () => {
    Alert.alert(
      'Cần cấp quyền thông báo',
      'Vui lòng vào Cài đặt và bật quyền Thông báo cho ứng dụng.',
      [
        { text: 'Đóng', style: 'cancel' },
        {
          text: 'Mở Cài đặt',
          onPress: () => {
            if (Platform.OS === 'ios') Linking.openURL('app-settings:');
            else Linking.openSettings();
          },
        },
      ],
    );
  };

  // ── Notification handlers ──────────────────────────────────────────────────

  const handleNotifeeEvent = async (type: any, detail: any) => {
    if (!notifee || !EventType) return;
    if (type === EventType.PRESS) {
      const notifType = detail.notification?.data?.type as NotifType;
      navigateByType(notifType);
      onNotificationOpened?.(detail.notification);
    }
  };

  /**
   * Foreground: hiện banner + invalidate query đúng key.
   * KHÔNG navigate — người dùng đang dùng app, chỉ cần data tự động refresh.
   */
  const handleForegroundNotification = async (notification: any) => {
    const title    = notification.notification?.title || 'Thông báo mới';
    const body     = notification.notification?.body  || '';
    const data     = notification.data as Record<string, string> | undefined;
    const notifType: NotifType = data?.type;

    // Invalidate query tương ứng ngay lập tức
    invalidateByType(globalQueryClient, notifType);

    // Hiện banner
    if (notifee) {
      await displayLocalNotification(title, body, data);
    } else {
      Toast.show({
        type: 'info',
        text1: title,
        text2: body,
        position: 'top',
        visibilityTime: 4000,
        autoHide: true,
        topOffset: 50,
        onPress: () => {
          navigateByType(notifType);
          onNotificationOpened?.(notification);
        },
      });
    }

    onNotification?.(notification);
  };

  /**
   * Background / Quit: người dùng tap vào notification → navigate đến đúng tab.
   */
  const handleNotificationOpened = (notification: any) => {
    const notifType: NotifType = notification?.data?.type;
    // Delay nhỏ để navigation stack sẵn sàng (đặc biệt khi app vừa mở từ quit)
    setTimeout(() => navigateByType(notifType), 500);
    onNotificationOpened?.(notification);
  };

  const navigateByType = (type: NotifType) => {
    try {
      const tab = getTargetTab(type);
      NavigationService.navigate('MainTabs' as any, { screen: tab });
      console.log(`🧭 Navigate to tab: ${tab} (type: ${type})`);
    } catch (error) {
      console.error('❌ Error navigating:', error);
    }
  };

  // ── AppState handler (dùng ref, không phụ thuộc state) ────────────────────

  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    const wasBackground = appStateRef.current.match(/inactive|background/);
    appStateRef.current = nextAppState;

    if (!wasBackground || nextAppState !== 'active') return;
    if (!isFirebaseInitRef.current) return;

    console.log('📱 App has come to foreground');
    await reregisterAndSyncFCM();
  };

  // ── FCM token management ───────────────────────────────────────────────────

  const getDeviceInfo = async () => {
    try {
      return {
        deviceId:   await DeviceInfo.getUniqueId(),
        deviceName: (await DeviceInfo.getDeviceName()) || `${Platform.OS} Device`,
        deviceType: (Platform.OS === 'ios' ? 'ios' : 'android') as 'ios' | 'android',
      };
    } catch {
      return {
        deviceId:   'unknown',
        deviceName: Platform.OS === 'ios' ? 'iOS Device' : 'Android Device',
        deviceType: (Platform.OS === 'ios' ? 'ios' : 'android') as 'ios' | 'android',
      };
    }
  };

  /**
   * Đồng bộ FCM token lên backend — chỉ gọi API khi token thực sự thay đổi.
   * Lưu token đã đăng ký thành công vào AsyncStorage để so sánh lần sau.
   */
  const syncFCMTokenToBackend = async (fcmToken: string) => {
    if (isRegisteringRef.current) return;
    isRegisteringRef.current = true;
    try {
      // Bỏ qua nếu token giống lần đăng ký cuối
      const lastToken = await AsyncStorage.getItem(LAST_REGISTERED_FCM_KEY);
      if (lastToken === fcmToken) {
        console.log('✅ FCM token unchanged, skipping registration');
        return;
      }

      const hasAuthToken = await authApi.getToken();
      if (!hasAuthToken) {
        console.log('⚠️ No auth token, skipping FCM register');
        return;
      }

      const deviceInfo = await getDeviceInfo();
      const success = await authApi.registerDevice(
        fcmToken,
        deviceInfo.deviceType,
        deviceInfo.deviceName,
        deviceInfo.deviceId,
      );

      // Chỉ lưu khi đăng ký thành công
      if (success) {
        await AsyncStorage.setItem(LAST_REGISTERED_FCM_KEY, fcmToken);
      }
    } finally {
      isRegisteringRef.current = false;
    }
  };

  /**
   * Lấy token hiện tại (KHÔNG xóa/tạo mới) rồi đồng bộ nếu có thay đổi.
   * Dùng khi login hoặc foreground — tránh xóa token không cần thiết.
   */
  const updateFCMToken = async () => {
    const token = await getFCMToken();
    if (token && userRef.current) {
      await syncFCMTokenToBackend(token);
    }
  };

  /**
   * Khi app quay lại foreground: chỉ lấy token hiện tại, không xóa/tạo mới.
   * FCM token ổn định trừ khi Firebase tự rotate (xử lý bởi onTokenRefresh).
   */
  const reregisterAndSyncFCM = async () => {
    console.log('🔄 Checking FCM token on foreground...');
    const currentToken = await getFCMToken();
    if (currentToken) {
      await syncFCMTokenToBackend(currentToken);
    }
  };

  return null;
};

// ── Export helper ─────────────────────────────────────────────────────────────

export const unregisterCurrentDevice = async () => {
  try {
    const token = await getFCMToken();
    if (!token) return;
    await authApi.unregisterDevice(token);
    // Xóa token đã lưu để lần login tiếp theo buộc re-register
    await AsyncStorage.removeItem(LAST_REGISTERED_FCM_KEY);
    console.log('✅ Device unregistered on logout');
  } catch (error: any) {
    console.warn('⚠️ Error unregistering device on logout:', error?.message);
  }
};

export default NotificationService;
