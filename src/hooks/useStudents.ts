/**
 * Student Hooks - React Query
 * 
 * Custom hooks để fetch và manage student data với React Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../config/queryClient';
import Api from '../utils/Api';

// Types
export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  class_id: string;
  enrollment_date: string;
  status: 'active' | 'inactive';
}

export interface StudentFilters {
  class_id?: string;
  status?: string;
  search?: string;
}

/**
 * Fetch all students
 */
export function useStudents(filters?: StudentFilters) {
  return useQuery({
    queryKey: queryKeys.students.list(filters),
    queryFn: async () => {
      const response = await Api.get('/students', { params: filters });
      return response.data as Student[];
    },
    staleTime: 1000 * 60 * 5, // 5 phút
    enabled: true, // Có thể điều kiện hóa query
  });
}

/**
 * Fetch single student
 */
export function useStudent(studentId: string) {
  return useQuery({
    queryKey: queryKeys.students.detail(studentId),
    queryFn: async () => {
      const response = await Api.get(`/students/${studentId}`);
      return response.data as Student;
    },
    enabled: !!studentId, // Chỉ fetch khi có studentId
  });
}

/**
 * Fetch student attendance
 */
export function useStudentAttendance(studentId: string) {
  return useQuery({
    queryKey: queryKeys.students.attendance(studentId),
    queryFn: async () => {
      const response = await Api.get(`/students/${studentId}/attendance`);
      return response.data;
    },
    enabled: !!studentId,
  });
}

/**
 * Fetch student grades
 */
export function useStudentGrades(studentId: string) {
  return useQuery({
    queryKey: queryKeys.students.grades(studentId),
    queryFn: async () => {
      const response = await Api.get(`/students/${studentId}/grades`);
      return response.data;
    },
    enabled: !!studentId,
  });
}

/**
 * Create student mutation
 */
export function useCreateStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Student>) => {
      const response = await Api.post('/students', data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate và refetch students list
      queryClient.invalidateQueries({ queryKey: queryKeys.students.all });
    },
  });
}

/**
 * Update student mutation
 */
export function useUpdateStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Student> }) => {
      const response = await Api.put(`/students/${id}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate student detail
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.students.detail(variables.id) 
      });
      // Invalidate students list
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.students.all 
      });
    },
  });
}

/**
 * Delete student mutation
 */
export function useDeleteStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await Api.delete(`/students/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.students.all });
    },
  });
}

// Example usage in component:
/*
function StudentListScreen() {
  const { data: students, isLoading, error } = useStudents();
  const createStudent = useCreateStudent();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  const handleCreateStudent = async (data: Partial<Student>) => {
    try {
      await createStudent.mutateAsync(data);
      Alert.alert('Success', 'Student created successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to create student');
    }
  };

  return (
    <FlatList
      data={students}
      renderItem={({ item }) => <StudentCard student={item} />}
    />
  );
}
*/
