import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { studentApi } from '../services/StudentApiService';
import {
    AbsenceRequestClass,
    AbsenceRequestDate,
    AbsenceRequestItem,
    AbsenceRequestCreate,
} from '../types/student-api.types';

// ============================================================================
// QUERY KEYS
// ============================================================================

export const absenceRequestKeys = {
    all: ['absenceRequest'] as const,
    classes: () => [...absenceRequestKeys.all, 'classes'] as const,
    dates: (classId: number) => [...absenceRequestKeys.all, 'dates', classId] as const,
    list: () => [...absenceRequestKeys.all, 'list'] as const,
};

// ============================================================================
// ABSENCE REQUEST QUERIES
// ============================================================================

/**
 * Get classes that can request absence
 * GET /api/student/absence-request/classes
 */
export function useAbsenceRequestClasses(): UseQueryResult<AbsenceRequestClass[], Error> {
    return useQuery({
        queryKey: absenceRequestKeys.classes(),
        queryFn: () => studentApi.getAbsenceRequestClasses(),
        staleTime: 1000 * 60 * 10, // 10 minutes
    });
}

/**
 * Get dates that can request absence for a class
 * GET /api/student/absence-request/dates/{class_id}
 */
export function useAbsenceRequestDates(classId: number): UseQueryResult<AbsenceRequestDate[], Error> {
    return useQuery({
        queryKey: absenceRequestKeys.dates(classId),
        queryFn: () => studentApi.getAbsenceRequestDates(classId),
        enabled: !!classId,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

/**
 * Get list of absence requests
 * GET /api/student/absence-request/list
 */
export function useAbsenceRequestList(): UseQueryResult<AbsenceRequestItem[], Error> {
    return useQuery({
        queryKey: absenceRequestKeys.list(),
        queryFn: () => studentApi.getAbsenceRequests(),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

// ============================================================================
// ABSENCE REQUEST MUTATIONS
// ============================================================================

/**
 * Create absence request
 * POST /api/student/absence-request/create
 * Must be within 15 minutes after class start time
 */
export function useCreateAbsenceRequest(): UseMutationResult<
    boolean,
    Error,
    AbsenceRequestCreate
> {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: AbsenceRequestCreate) => studentApi.createAbsenceRequest(data),
        onSuccess: () => {
            // Invalidate queries to refresh data
            queryClient.invalidateQueries({ queryKey: absenceRequestKeys.list() });
            queryClient.invalidateQueries({ queryKey: absenceRequestKeys.all });
        },
    });
}

/**
 * Delete absence request (only pending requests)
 * DELETE /api/student/absence-request/{id}
 */
export function useDeleteAbsenceRequest(): UseMutationResult<
    boolean,
    Error,
    { id: number }
> {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id }: { id: number }) => studentApi.deleteAbsenceRequest(id),
        onSuccess: () => {
            // Invalidate queries to refresh data
            queryClient.invalidateQueries({ queryKey: absenceRequestKeys.list() });
            queryClient.invalidateQueries({ queryKey: absenceRequestKeys.all });
        },
    });
}
