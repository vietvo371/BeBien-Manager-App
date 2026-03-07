import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { studentApi } from '../services/StudentApiService';
import { CalendarEvent, Notification } from '../types/student-api.types';

// ============================================================================
// QUERY KEYS
// ============================================================================

export const calendarKeys = {
    all: ['calendar'] as const,
    calendar: () => [...calendarKeys.all, 'list'] as const,
    notifications: () => [...calendarKeys.all, 'notifications'] as const,
};

// ============================================================================
// CALENDAR QUERIES
// ============================================================================

/**
 * Get student calendar/schedule
 * GET /api/student/calendar
 */
export function useCalendar(): UseQueryResult<CalendarEvent[], Error> {
    return useQuery({
        queryKey: calendarKeys.calendar(),
        queryFn: () => studentApi.getCalendar(),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

/**
 * Get notifications (merged with attendance)
 * GET /api/student/notifications
 */
export function useNotifications(): UseQueryResult<Notification[], Error> {
    return useQuery({
        queryKey: calendarKeys.notifications(),
        queryFn: () => studentApi.getNotifications(),
        staleTime: 1000 * 60 * 2, // 2 minutes
    });
}
