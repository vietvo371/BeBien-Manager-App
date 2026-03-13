import { useRef, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';

/**
 * Khi screen được focus, kiểm tra ngay xem data có stale không.
 * Chỉ refetch nếu (Date.now() - dataUpdatedAt) > staleTime.
 * Bỏ qua lần focus đầu tiên vì query đã chạy khi mount.
 *
 * @param refetch        Hàm refresh data (từ useQuery hoặc custom)
 * @param dataUpdatedAt  Timestamp lần cuối data được cập nhật (từ useQuery)
 * @param staleTime      Ngưỡng coi data là cũ (ms) — khớp với staleTime trong useQuery
 */
export function useRefreshOnFocus(
  refetch: () => void,
  dataUpdatedAt: number,
  staleTime: number,
) {
  const isFirstFocus = useRef(true);

  useFocusEffect(
    useCallback(() => {
      if (isFirstFocus.current) {
        isFirstFocus.current = false;
        return;
      }
      if (Date.now() - dataUpdatedAt > staleTime) {
        refetch();
      }
    }, [refetch, dataUpdatedAt, staleTime])
  );
}
