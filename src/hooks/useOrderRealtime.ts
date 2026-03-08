import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Platform, AppState, AppStateStatus, Alert } from 'react-native';
import { 
  getMessaging, 
  getToken, 
  onMessage 
} from '@react-native-firebase/messaging';
import { getApp } from '@react-native-firebase/app';
import { displayLocalNotification } from '../config/firebase';

interface OrderNotificationData {
  type: 'order_created' | 'order_updated' | 'order_cancelled' | 'order_approved';
  order_id: number;
  status?: string;
}

export function useOrderRealtime() {
  const queryClient = useQueryClient();
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const logFCMToken = async () => {
      try {
        // Get FCM token using modular API
        // Note: iOS auto-registration is enabled by default in firebase.json
        const messagingInstance = getMessaging(getApp());
        const fcmToken = await getToken(messagingInstance);
        
        console.log('═══════════════════════════════════════════════');
        console.log('🎯 FCM TOKEN (Copy để test notification):');
        console.log(fcmToken);
        console.log('═══════════════════════════════════════════════');
      } catch (error) {
        console.error('❌ Error getting FCM token:', error);
        Alert.alert(
          '❌ FCM Error',
          `Failed to get token: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    };

    // Setup foreground message listener using modular API
    const messagingInstance = getMessaging(getApp());
    const unsubscribeForeground = onMessage(messagingInstance, async (remoteMessage) => {
      console.log('═══════════════════════════════════════════════');
      console.log('📱 FCM MESSAGE (Foreground):');
      console.log('Message ID:', remoteMessage.messageId);
      console.log('Notification:', JSON.stringify(remoteMessage.notification, null, 2));
      console.log('Data:', JSON.stringify(remoteMessage.data, null, 2));
      console.log('═══════════════════════════════════════════════');

      // Hiển thị notification banner với Notifee (foreground)
      if (remoteMessage.notification) {
        const title = remoteMessage.notification.title || 'Thông báo';
        const body = remoteMessage.notification.body || 'Có thông báo mới';
        
        // Convert data to Record<string, string> for Notifee
        const notifeeData: Record<string, string> = {};
        if (remoteMessage.data) {
          Object.keys(remoteMessage.data).forEach(key => {
            notifeeData[key] = String(remoteMessage.data![key]);
          });
        }

        // Display native notification banner
        await displayLocalNotification(title, body, notifeeData);
      }

      const data = remoteMessage.data as unknown as OrderNotificationData;

      if (data && data.type?.includes('order')) {
        console.log('🔄 Order notification - invalidating queries...');
        
        queryClient.invalidateQueries({ queryKey: ['orders'] });
        
        if (data.order_id) {
          queryClient.invalidateQueries({ queryKey: ['order', data.order_id] });
        }
      }
    });

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        console.log('🔄 App to foreground - refreshing orders...');
        queryClient.invalidateQueries({ queryKey: ['orders'] });
      }
      appState.current = nextAppState;
    };

    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

    logFCMToken();

    return () => {
      unsubscribeForeground();
      appStateSubscription.remove();
    };
  }, [queryClient]);
}
