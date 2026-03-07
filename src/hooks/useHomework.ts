import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { studentApi } from '../services/StudentApiService';
import {
    Homework,
    HomeworkWithStatus,
    SubmittedHomework,
    SubmissionResult,
    DownloadLinkResponse,
} from '../types/student-api.types';

// ============================================================================
// QUERY KEYS
// ============================================================================

export const homeworkKeys = {
    all: ['homework'] as const,
    list: (type: 1 | 2) => [...homeworkKeys.all, 'list', type] as const,
    details: (type: 1 | 2) => [...homeworkKeys.all, 'details', type] as const,
    submitted: (type: 1 | 2) => [...homeworkKeys.all, 'submitted', type] as const,
};

// ============================================================================
// HOMEWORK QUERIES
// ============================================================================

/**
 * Get homework list (pending)
 * @param type 1 = BTVN, 2 = NLP
 */
export function useHomeworkList(type: 1 | 2): UseQueryResult<Homework[], Error> {
    return useQuery({
        queryKey: homeworkKeys.list(type),
        queryFn: () => studentApi.getHomeworkList(type),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

/**
 * Get homework details with submission status
 * @param type 1 = BTVN, 2 = NLP
 */
export function useHomeworkDetails(type: 1 | 2): UseQueryResult<HomeworkWithStatus[], Error> {
    return useQuery({
        queryKey: homeworkKeys.details(type),
        queryFn: () => studentApi.getHomeworkDetails(type),
        staleTime: 1000 * 60 * 3, // 3 minutes
    });
}

/**
 * Get submitted homework list
 * @param type 1 = BTVN, 2 = NLP
 */
export function useSubmittedHomework(type: 1 | 2): UseQueryResult<SubmittedHomework[], Error> {
    return useQuery({
        queryKey: homeworkKeys.submitted(type),
        queryFn: () => studentApi.getSubmittedHomework(type),
        staleTime: 1000 * 60 * 10, // 10 minutes
    });
}

// ============================================================================
// HOMEWORK MUTATIONS
// ============================================================================

interface SubmitHomeworkVariables {
    formData: FormData;
    type: 1 | 2;
}

/**
 * Submit homework (file or Google Drive link)
 * Invalidates homework queries on success
 */
export function useSubmitHomework(): UseMutationResult<
    SubmissionResult,
    Error,
    SubmitHomeworkVariables
> {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ formData }: SubmitHomeworkVariables) => studentApi.submitHomework(formData),
        onSuccess: (_, { type }) => {
            // Invalidate homework queries to refresh data
            queryClient.invalidateQueries({ queryKey: homeworkKeys.list(type) });
            queryClient.invalidateQueries({ queryKey: homeworkKeys.details(type) });
            queryClient.invalidateQueries({ queryKey: homeworkKeys.submitted(type) });
        },
    });
}

/**
 * Download homework (get S3 signed URL)
 */
export function useDownloadHomework(): UseMutationResult<
    DownloadLinkResponse,
    Error,
    { classId: number; homeworkId: number }
> {
    return useMutation({
        mutationFn: ({ classId, homeworkId }) => studentApi.downloadHomework(classId, homeworkId),
    });
}

/**
 * Download homework template
 */
export function useDownloadTemplate(): UseMutationResult<
    DownloadLinkResponse,
    Error,
    { id: number }
> {
    return useMutation({
        mutationFn: ({ id }) => studentApi.downloadTemplate(id),
    });
}
