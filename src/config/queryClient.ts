/**
 * React Query Configuration
 * 
 * Cấu hình QueryClient cho @tanstack/react-query
 * - Cache management
 * - Retry logic
 * - Stale time
 * - Error handling
 */

import { QueryClient } from '@tanstack/react-query';
import env from './env';

// Default options cho tất cả queries
const queryConfig = {
  queries: {
    // Thời gian data được coi là "fresh" (không refetch tự động)
    staleTime: 1000 * 60 * 5, // 5 phút
    
    // Thời gian data được giữ trong cache
    gcTime: 1000 * 60 * 30, // 30 phút (cacheTime đổi tên thành gcTime trong v5)
    
    // Số lần retry khi request thất bại
    retry: (failureCount: number, error: any) => {
      // Không retry với lỗi 4xx (client errors)
      if (error?.response?.status && error.response.status >= 400 && error.response.status < 500) {
        return false;
      }
      // Retry tối đa 2 lần với lỗi khác
      return failureCount < 2;
    },
    
    // Retry delay với exponential backoff
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
    
    // Không refetch khi window focus (có thể bật trong production)
    refetchOnWindowFocus: env.IS_PRODUCTION,
    
    // Refetch khi reconnect network
    refetchOnReconnect: true,
    
    // Refetch khi mount (chỉ bật trong development)
    refetchOnMount: env.IS_DEVELOPMENT,
  },
  mutations: {
    // Retry mutations 1 lần
    retry: 1,
    
    // Error handling cho mutations
    onError: (error: any) => {
      if (env.DEBUG) {
        console.error('Mutation error:', error);
      }
    },
  },
};

// Tạo QueryClient instance
export const queryClient = new QueryClient({
  defaultOptions: queryConfig,
});

// Query keys - Centralized query keys cho easy refetching
export const queryKeys = {
  // Auth
  auth: {
    me: ['auth', 'me'] as const,
    profile: ['auth', 'profile'] as const,
  },
  
  // Students
  students: {
    all: ['students'] as const,
    list: (filters?: any) => ['students', 'list', filters] as const,
    detail: (id: string) => ['students', 'detail', id] as const,
    attendance: (id: string) => ['students', 'attendance', id] as const,
    grades: (id: string) => ['students', 'grades', id] as const,
  },
  
  // Teachers
  teachers: {
    all: ['teachers'] as const,
    list: (filters?: any) => ['teachers', 'list', filters] as const,
    detail: (id: string) => ['teachers', 'detail', id] as const,
    schedule: (id: string) => ['teachers', 'schedule', id] as const,
  },
  
  // Classes
  classes: {
    all: ['classes'] as const,
    list: (filters?: any) => ['classes', 'list', filters] as const,
    detail: (id: string) => ['classes', 'detail', id] as const,
    students: (id: string) => ['classes', 'students', id] as const,
    schedule: (id: string) => ['classes', 'schedule', id] as const,
  },
  
  // Attendance
  attendance: {
    all: ['attendance'] as const,
    byClass: (classId: string, date?: string) => ['attendance', 'class', classId, date] as const,
    byStudent: (studentId: string) => ['attendance', 'student', studentId] as const,
  },
  
  // Payments
  payments: {
    all: ['payments'] as const,
    list: (filters?: any) => ['payments', 'list', filters] as const,
    detail: (id: string) => ['payments', 'detail', id] as const,
    history: (studentId: string) => ['payments', 'history', studentId] as const,
  },
  
  // Notifications
  notifications: {
    all: ['notifications'] as const,
    list: () => ['notifications', 'list'] as const,
    unread: () => ['notifications', 'unread'] as const,
  },
  
  // Courses
  courses: {
    all: ['courses'] as const,
    list: (filters?: any) => ['courses', 'list', filters] as const,
    detail: (id: string) => ['courses', 'detail', id] as const,
  },
};

// Helper function để invalidate multiple queries
export const invalidateQueries = {
  students: () => queryClient.invalidateQueries({ queryKey: queryKeys.students.all }),
  teachers: () => queryClient.invalidateQueries({ queryKey: queryKeys.teachers.all }),
  classes: () => queryClient.invalidateQueries({ queryKey: queryKeys.classes.all }),
  attendance: () => queryClient.invalidateQueries({ queryKey: queryKeys.attendance.all }),
  payments: () => queryClient.invalidateQueries({ queryKey: queryKeys.payments.all }),
  notifications: () => queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all }),
  courses: () => queryClient.invalidateQueries({ queryKey: queryKeys.courses.all }),
  all: () => queryClient.invalidateQueries(),
};

export default queryClient;
