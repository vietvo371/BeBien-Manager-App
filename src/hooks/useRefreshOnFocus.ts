import { useRef, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';

/**
 * Khi screen được focus, sau `delay` ms sẽ gọi `refetch` một lần duy nhất.
 * Timer tự huỷ nếu screen mất focus trước khi đủ thời gian.
 *
 * @param refetch  Hàm refresh data (từ useQuery hoặc custom)
 * @param delay    Thời gian chờ tính bằng ms (mặc định 3000ms)
 */
export function useRefreshOnFocus(
  refetch: () => void,
  delay: number = 5000,
) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useFocusEffect(
    useCallback(() => {
      timerRef.current = setTimeout(() => {
        refetch();
      }, delay);

      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
      };
    }, [refetch, delay])
  );
}
