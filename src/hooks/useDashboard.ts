import { useQuery } from '@tanstack/react-query';
import { studentApi } from '../services/StudentApiService';

/**
 * React Query hooks for Dashboard
 */

export const useClasses = () => {
    return useQuery({
        queryKey: ['classes'],
        queryFn: () => studentApi.getClasses(),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

export const useDashboardChart = () => {
    return useQuery({
        queryKey: ['dashboardChart'],
        queryFn: () => studentApi.getDashboardChart(),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};
