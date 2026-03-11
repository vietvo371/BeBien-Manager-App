import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AppState, AppStateStatus } from 'react-native';
import {
  getMessaging,
  onMessage,
} from '@react-native-firebase/messaging';
import { getApp } from '@react-native-firebase/app';


export function useOrderRealtime() {
  const queryClient = useQueryClient();
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const messagingInstance = getMessaging(getApp());

    // Chỉ xử lý query invalidation — KHÔNG display notification ở đây
    // Việc display + routing đã do NotificationService.tsx lo
    // Hook này là fallback đảm bảo data luôn fresh khi app đang mở
    const unsubscribeForeground = onMessage(messagingInstance, (remoteMessage) => {
      const type = remoteMessage.data?.type as string | undefined;

      if (type === 'xoa_mon') {
        queryClient.invalidateQueries({ queryKey: ['cancel-items'] });
      } else if (type?.startsWith('hoa_don') || type?.startsWith('order')) {
        queryClient.invalidateQueries({ queryKey: ['hoaDonOpen'] });
      } else if (type?.startsWith('bep')) {
        queryClient.invalidateQueries({ queryKey: ['bepDonMonTheoBan'] });
        queryClient.invalidateQueries({ queryKey: ['bepXongMonTheoNhom'] });
      } else {
        // Không rõ type → refresh tất cả
        queryClient.invalidateQueries({ queryKey: ['hoaDonOpen'] });
        queryClient.invalidateQueries({ queryKey: ['cancel-items'] });
        queryClient.invalidateQueries({ queryKey: ['bepDonMonTheoBan'] });
        queryClient.invalidateQueries({ queryKey: ['bepXongMonTheoNhom'] });
      }
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
