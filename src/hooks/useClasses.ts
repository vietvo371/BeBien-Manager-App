/**
 * Classes Hooks - React Query
 * 
 * Custom hooks để fetch và manage class data với React Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../config/queryClient';
import Api from '../utils/Api';

// Types
export interface Class {
  id: string;
  name: string;
  teacher_id: string;
  teacher_name: string;
  course_id: string;
  schedule: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'completed' | 'cancelled';
  student_count: number;
}

export interface ClassFilters {
  teacher_id?: string;
  course_id?: string;
  status?: string;
  search?: string;
}

/**
 * Fetch all classes
 */
export function useClasses(filters?: ClassFilters) {
  return useQuery({
    queryKey: queryKeys.classes.list(filters),
    queryFn: async () => {
      const response = await Api.get('/classes', { params: filters });
      return response.data as Class[];
    },
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Fetch single class
 */
export function useClass(classId: string) {
  return useQuery({
    queryKey: queryKeys.classes.detail(classId),
    queryFn: async () => {
      const response = await Api.get(`/classes/${classId}`);
      return response.data as Class;
    },
    enabled: !!classId,
  });
}

/**
 * Fetch class students
 */
export function useClassStudents(classId: string) {
  return useQuery({
    queryKey: queryKeys.classes.students(classId),
    queryFn: async () => {
      const response = await Api.get(`/classes/${classId}/students`);
      return response.data;
    },
    enabled: !!classId,
  });
}

/**
 * Fetch class schedule
 */
export function useClassSchedule(classId: string) {
  return useQuery({
    queryKey: queryKeys.classes.schedule(classId),
    queryFn: async () => {
      const response = await Api.get(`/classes/${classId}/schedule`);
      return response.data;
    },
    enabled: !!classId,
  });
}

/**
 * Create class mutation
 */
export function useCreateClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Class>) => {
      const response = await Api.post('/classes', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.classes.all });
    },
  });
}

/**
 * Update class mutation
 */
export function useUpdateClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Class> }) => {
      const response = await Api.put(`/classes/${id}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.classes.detail(variables.id) 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.classes.all 
      });
    },
  });
}

/**
 * Add student to class
 */
export function useAddStudentToClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ classId, studentId }: { classId: string; studentId: string }) => {
      const response = await Api.post(`/classes/${classId}/students`, { student_id: studentId });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.classes.students(variables.classId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.classes.detail(variables.classId) 
      });
    },
  });
}

/**
 * Remove student from class
 */
export function useRemoveStudentFromClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ classId, studentId }: { classId: string; studentId: string }) => {
      const response = await Api.delete(`/classes/${classId}/students/${studentId}`);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.classes.students(variables.classId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.classes.detail(variables.classId) 
      });
    },
  });
}
