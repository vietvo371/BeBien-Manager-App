import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AppState, AppStateStatus } from 'react-native';
import {
  getMessaging,
  onMessage,
} from '@react-native-firebase/messaging';
import { getApp } from '@react-native-firebase/app';

interface OrderNotificationData {
  type?: string;
  order_id?: number;
}

export function useOrderRealtime() {
  const queryClient = useQueryClient();
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const messagingInstance = getMessaging(getApp());

    // Chỉ xử lý query invalidation — KHÔNG display notification ở đây
    // Việc display đã do NotificationService.tsx → setupNotificationListeners() lo
    const unsubscribeForeground = onMessage(messagingInstance, (remoteMessage) => {
      const data = remoteMessage.data as unknown as OrderNotificationData;
      if (data?.type?.includes('order')) {
        queryClient.invalidateQueries({ queryKey: ['orders'] });
        if (data.order_id) {
          queryClient.invalidateQueries({ queryKey: ['order', data.order_id] });
        }
      }
      // Invalidate các query liên quan khi nhận bất kỳ FCM nào
      queryClient.invalidateQueries({ queryKey: ['hoaDonOpen'] });
      queryClient.invalidateQueries({ queryKey: ['cancel-items'] });
      queryClient.invalidateQueries({ queryKey: ['bepDonMonTheoBan'] });
      queryClient.invalidateQueries({ queryKey: ['bepXongMonTheoNhom'] });
    });

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        console.log('🔄 App to foreground - refreshing orders...');
        queryClient.invalidateQueries({ queryKey: ['orders'] });
        queryClient.invalidateQueries({ queryKey: ['hoaDonOpen'] });
      }
      appState.current = nextAppState;
    };

    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      unsubscribeForeground();
      appStateSubscription.remove();
    };
  }, [queryClient]);
}
