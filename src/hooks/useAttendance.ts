import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { studentApi } from '../services/StudentApiService';
import {
  AttendanceSummary,
  AbsentDetail,
  HomeworkIncompleteDetail,
} from '../types/student-api.types';

// ============================================================================
// QUERY KEYS
// ============================================================================

export const attendanceKeys = {
  all: ['attendance'] as const,
  summary: () => [...attendanceKeys.all, 'summary'] as const,
  absentDetails: (classId: number) => [...attendanceKeys.all, 'absent', classId] as const,
  homeworkIncomplete: (classId: number) => [...attendanceKeys.all, 'homework-incomplete', classId] as const,
};

// ============================================================================
// ATTENDANCE QUERIES
// ============================================================================

/**
 * Get attendance summary for all classes
 * GET /api/student/attendance/summary
 */
export function useAttendanceSummary(): UseQueryResult<AttendanceSummary[], Error> {
  return useQuery({
    queryKey: attendanceKeys.summary(),
    queryFn: () => studentApi.getAttendanceSummary(),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Get absent details for a class
 * GET /api/student/attendance/absent-details/{class_id}
 */
export function useAbsentDetails(classId: number): UseQueryResult<AbsentDetail[], Error> {
  return useQuery({
    queryKey: attendanceKeys.absentDetails(classId),
    queryFn: async () => {
      const result = await studentApi.getAbsentDetails(classId);
      return result;
    },
    enabled: !!classId,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Get homework incomplete details for a class
 * GET /api/student/attendance/homework-details/{class_id}
 */
export function useHomeworkIncomplete(classId: number): UseQueryResult<HomeworkIncompleteDetail[], Error> {
  return useQuery({
    queryKey: attendanceKeys.homeworkIncomplete(classId),
    queryFn: async () => {
      const result = await studentApi.getHomeworkIncomplete(classId);
      return result;
    },
    enabled: !!classId,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}
