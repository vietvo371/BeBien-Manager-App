import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AppState, AppStateStatus } from 'react-native';
import {
  getMessaging,
  onMessage,
} from '@react-native-firebase/messaging';
import { getApp } from '@react-native-firebase/app';

const BACKGROUND_STALE_THRESHOLD = 2 * 60 * 1000; // 2 phút

export function useOrderRealtime() {
  const queryClient = useQueryClient();
  const appState = useRef(AppState.currentState);
  const backgroundedAt = useRef<number>(0);

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
      const current = appState.current;

      if (current.match(/inactive|background/) && nextAppState === 'active') {
        // Chỉ invalidate nếu app đã background đủ lâu để data có thể thay đổi
        const timeAway = Date.now() - backgroundedAt.current;
        if (timeAway > BACKGROUND_STALE_THRESHOLD) {
          queryClient.invalidateQueries({ queryKey: ['hoaDonOpen'] });
          queryClient.invalidateQueries({ queryKey: ['cancel-items'] });
          queryClient.invalidateQueries({ queryKey: ['bepDonMonTheoBan'] });
          queryClient.invalidateQueries({ queryKey: ['bepXongMonTheoNhom'] });
        }
      } else if (nextAppState.match(/inactive|background/)) {
        backgroundedAt.current = Date.now();
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
