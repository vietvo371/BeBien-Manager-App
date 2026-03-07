import axios, { AxiosInstance } from 'axios';
import env from '../config/env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiResponse, Child } from '../types/parent-api.types';
import { handleApiError } from '../utils/errorHandler';

// ============================================================================
// PARENT API CLIENT
// ============================================================================

/**
 * Create dedicated axios instance for Parent API
 * Base URL: /api/parent
 */
const createParentApiClient = (): AxiosInstance => {
    const parentApi = axios.create({
        baseURL: `${env.API_URL}/api/parent`,
        timeout: 15000,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
    });

    // Request interceptor: Add Bearer token
    parentApi.interceptors.request.use(
        async (config) => {
            const token = await AsyncStorage.getItem('@parent_auth_token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        (error) => Promise.reject(error)
    );

    // Response interceptor: Handle error format
    parentApi.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error.response?.data) {
                const { message, errors } = error.response.data;
                error.message = message || 'An error occurred';
                error.validationErrors = errors;
            }

            // Handle errors with modal (except 401/403 which are handled by main Api.tsx, and 422 validation errors)
            const status = error.response?.status;
            if (status !== 401 && status !== 403 && status !== 422) {
                handleApiError(error, true); // ✅ Auto show modal for errors
            }

            return Promise.reject(error);
        }
    );

    return parentApi;
};

// ============================================================================
// PARENT API SERVICE
// ============================================================================

class ParentApiService {
    private api: AxiosInstance;

    constructor() {
        this.api = createParentApiClient();
    }

    // ==========================================================================
    // DATA METHODS (Placeholder for future features)
    // ==========================================================================

    /**
     * Example method: Get children list
     * GET /api/parent/children
     */
    /**
     * Get children list
     * GET /api/parent/children
     */
    async getChildren(): Promise<Child[]> {
        try {
            const response = await this.api.get<ApiResponse<{ children: Child[] }>>('/children');

            // Log response for debugging
            console.log('Get children response:', response.data);

            if (response.data.status === true && response.data.data?.children) {
                return response.data.data.children;
            }
            return [];
        } catch (error) {
            console.error('Get children error:', error);
            throw error;
        }
    }

    /**
     * Get dashboard data including all children and their stats
     * GET /api/parent/dashboard/data
     */
    async getDashboardData(): Promise<import('../types/parent-api.types').DashboardData> {
        try {
            const response = await this.api.get<import('../types/parent-api.types').DashboardResponse>('/dashboard/data');

            console.log('Dashboard data response:', response.data);

            if (response.data.status === true && response.data.data) {
                return response.data.data;
            }

            throw new Error(response.data.message || 'Failed to fetch dashboard data');
        } catch (error) {
            console.error('Get dashboard data error:', error);
            throw error;
        }
    }
    // ==========================================================================
    // CLASSES & FEED
    // ==========================================================================

    /**
     * Get list of classes for a specific child
     * GET /api/parent/children/{studentId}/classes
     */
    async getStudentClasses(studentId: number | string): Promise<import('../types/parent-api.types').ParentStudentClass[]> {
        try {
            const response = await this.api.get<import('../types/parent-api.types').ParentStudentClassesResponse>(`/children/${studentId}/classes`);

            if (response.data.status === true && response.data.data?.data) {
                return response.data.data.data;
            }

            return [];
        } catch (error) {
            console.error('Get student classes error:', error);
            throw error;
        }
    }

    /**
     * Get class feed for a specific child and class
     * POST /api/parent/classes/feed
     */
    async getClassFeed(studentId: number | 0, classId: number | 0): Promise<import('../types/parent-api.types').ParentFeedData> {
        try {
            const response = await this.api.post<import('../types/parent-api.types').ParentFeedResponse>('/classes/feed', {
                student_id: studentId,
                class_id: classId
            });

            console.log('Get class feed response:', response.data);

            if (response.data.status === true && response.data.data) {
                return response.data.data;
            }

            throw new Error('Failed to fetch class feed');
        } catch (error) {
            console.error('Get class feed error:', error);
            throw error;
        }
    }

    /**
     * Get comments for a feed item
     * GET /api/parent/feeds/{feedId}/comments
     */
    async getFeedComments(feedId: number): Promise<import('../types/student-api.types').FeedComment[]> {
        try {
            const response = await this.api.get<import('../types/parent-api.types').ApiResponse<{ comments: import('../types/student-api.types').FeedComment[] }>>(`/feeds/${feedId}/comments`);

            if (response.data.status === true && response.data.data?.comments) {
                return response.data.data.comments;
            }

            return [];
        } catch (error) {
            console.error('Get feed comments error:', error);
            throw error;
        }
    }

    /**
     * Add a comment to a feed item
     * POST /api/parent/feeds/{feedId}/comments
     */
    async addFeedComment(feedId: number, content: string): Promise<import('../types/student-api.types').FeedComment | null> {
        try {
            const response = await this.api.post<import('../types/parent-api.types').ApiResponse<{ comment: import('../types/student-api.types').FeedComment }>>(`/feeds/${feedId}/comments`, {
                content
            });

            if (response.data.status === true && response.data.data?.comment) {
                return response.data.data.comment;
            }

            return null;
        } catch (error) {
            console.error('Add feed comment error:', error);
            throw error;
        }
    }

    /**
     * Delete a comment
     * DELETE /api/parent/feeds/{feedId}/comments/{commentId}
     */
    async deleteFeedComment(feedId: number, commentId: number): Promise<boolean> {
        try {
            const response = await this.api.delete<import('../types/parent-api.types').ApiResponse<any>>(`/feeds/${feedId}/comments/${commentId}`);
            return response.data.status === true;
        } catch (error) {
            console.error('Delete feed comment error:', error);
            throw error;
        }
    }

    /**
     * Get schedule for a specific child
     * GET /api/parent/children/{studentId}/calendar
     */
    async getSchedule(studentId: string | number): Promise<import('../types/parent-api.types').CalendarEvent[]> {
        try {
            // Using ID to fetch calendar
            const response = await this.api.get<import('../types/parent-api.types').ScheduleResponse>(`/children/${studentId}/calendar`);

            if (response.data.status === true && response.data.data) {
                return response.data.data.calendar;
            }

            throw new Error(response.data.message || 'Failed to fetch schedule');
        } catch (error) {
            console.error('Get schedule error:', error);
            throw error;
        }
    }

    /**
     * Get transcript for a specific child
     * GET /api/parent/children/{studentId}/transcript
     */
    async getTranscript(studentId: string | number): Promise<import('../types/parent-api.types').TranscriptData> {
        try {
            const response = await this.api.get<import('../types/parent-api.types').TranscriptResponse>(`/children/${studentId}/transcript`);

            console.log('Get transcript response:', response.data);

            if (response.data.status === true && response.data.data) {
                return response.data.data;
            }

            throw new Error(response.data.message || 'Failed to fetch transcript');
        } catch (error) {
            console.error('Get transcript error:', error);
            throw error;
        }
    }

    /**
     * Get transcript detail for a specific class of a child
     * GET /api/parent/children/{studentId}/transcript/{classId}
     */
    async getTranscriptDetail(studentId: string | number, classId: number): Promise<import('../types/parent-api.types').TranscriptDetailData> {
        try {
            const response = await this.api.get<import('../types/parent-api.types').TranscriptDetailResponse>(`/children/${studentId}/transcript/${classId}`);

            console.log('Get transcript detail response:', response.data);

            if (response.data.status === true && response.data.data) {
                return response.data.data;
            }

            throw new Error(response.data.message || 'Failed to fetch transcript detail');
        } catch (error) {
            console.error('Get transcript detail error:', error);
            throw error;
        }
    }

    /**
     * Get list of teacher comments for a child
     * GET /api/parent/children/{studentId}/comments
     */
    async getTeacherComments(studentId: string | number): Promise<import('../types/parent-api.types').CommentClassInfo[]> {
        try {
            const response = await this.api.get<import('../types/parent-api.types').CommentListResponse>(`/children/${studentId}/comments`);

            console.log('Get comments response:', response.data);

            if (response.data.status === true && response.data.data?.comments) {
                return response.data.data.comments;
            }

            return [];
        } catch (error) {
            console.error('Get comments error:', error);
            throw error;
        }
    }

    /**
     * Get detail of teacher comments for a specific class
     * GET /api/parent/children/{studentId}/comments/{classId}
     */
    async getTeacherCommentDetail(studentId: string | number, classId: number): Promise<import('../types/parent-api.types').TeacherCommentDetailData> {
        try {
            const response = await this.api.get<import('../types/parent-api.types').TeacherCommentDetailResponse>(`/children/${studentId}/comments/${classId}`);

            console.log('Get comment detail response:', response.data);

            if (response.data.status === true && response.data.data) {
                return response.data.data;
            }

            throw new Error(response.data.message || 'Failed to fetch comment detail');
        } catch (error) {
            console.error('Get comment detail error:', error);
            throw error;
        }
    }

    /**
     * Get attendance summary for a child
     * GET /api/parent/children/{studentId}/attendance/summary
     */
    async getAttendanceSummary(studentId: string | number): Promise<import('../types/parent-api.types').AttendanceSummaryItem[]> {
        try {
            const response = await this.api.get<import('../types/parent-api.types').AttendanceSummaryResponse>(`/children/${studentId}/attendance/summary`);

            console.log('Get attendance summary response:', response.data);

            if (response.data.status === true && response.data.data?.attendance) {
                return response.data.data.attendance;
            }

            return [];
        } catch (error) {
            console.error('Get attendance summary error:', error);
            throw error;
        }
    }

    /**
     * Get absent details for a specific class
     * GET /api/parent/children/{studentId}/attendance/absent-details/{classId}
     */
    async getAbsentDetails(studentId: string | number, classId: number): Promise<import('../types/parent-api.types').AbsentSession[]> {
        try {
            const response = await this.api.get<import('../types/parent-api.types').AbsentDetailResponse>(`/children/${studentId}/attendance/absent-details/${classId}`);

            console.log('Get absent details response:', response.data);

            if (response.data.status === true && response.data.data?.absent_sessions) {
                return response.data.data.absent_sessions;
            }

            return [];
        } catch (error) {
            console.error('Get absent details error:', error);
            throw error;
        }
    }

    /**
     * Get list of notifications for parent
     * GET /api/parent/notifications
     */
    async getNotifications(): Promise<import('../types/parent-api.types').NotificationItem[]> {
        try {
            const response = await this.api.get<import('../types/parent-api.types').NotificationResponse>('/notifications');

            console.log('Get notifications response:', response.data);

            if (response.data.status === true && response.data.data?.notifications) {
                return response.data.data.notifications;
            }

            return [];
        } catch (error) {
            console.error('Get notifications error:', error);
            throw error;
        }
    }

    /**
     * Get bills list for a specific child
     * GET /api/parent/children/{studentId}/bills
     */
    async getBillsList(studentId: string | number): Promise<import('../types/parent-api.types').ParentBillListItem[]> {
        try {
            const response = await this.api.get<import('../types/parent-api.types').ParentBillListResponse>(`/children/${studentId}/bills`);

            console.log('Get bills list response:', response.data);

            if (response.data.status === true && response.data.data?.day_bill) {
                return response.data.data.day_bill;
            }

            return [];
        } catch (error) {
            console.error('Get bills list error:', error);
            throw error;
        }
    }

    /**
     * Get bill details for a specific child and bill ID
     * GET /api/parent/children/{studentId}/bills/{idDay}/details
     */
    async getBillDetails(studentId: string | number, idDay: number): Promise<import('../types/parent-api.types').ParentBillDetailData> {
        try {
            const response = await this.api.get<import('../types/parent-api.types').ParentBillDetailResponse>(`/children/${studentId}/bills/${idDay}/details`);

            console.log('Get bill details response:', response.data);

            if (response.data.status === true && response.data.data) {
                return response.data.data;
            }

            throw new Error(response.data.message || 'Failed to fetch bill details');
        } catch (error) {
            console.error('Get bill details error:', error);
            throw error;
        }
    }

    /**
     * Get payments list for a specific child
     * GET /api/parent/children/{studentId}/payments
     */
    async getPaymentsList(studentId: string | number): Promise<import('../types/parent-api.types').ParentPaymentReceipt[]> {
        try {
            const response = await this.api.get<import('../types/parent-api.types').ParentPaymentListResponse>(`/children/${studentId}/payments`);

            console.log('Get payments list response:', response.data);

            if (response.data.status === true && response.data.data?.tablePayment) {
                return response.data.data.tablePayment;
            }

            return [];
        } catch (error) {
            console.error('Get payments list error:', error);
            throw error;
        }
    }

    /**
     * Get payment details for a specific child and payment ID
     * GET /api/parent/children/{studentId}/payments/{id}
     */
    async getPaymentDetail(studentId: string | number, id: number): Promise<import('../types/parent-api.types').ParentPaymentDetail> {
        try {
            const response = await this.api.get<import('../types/parent-api.types').ParentPaymentDetailResponse>(`/children/${studentId}/payments/${id}`);

            console.log('Get payment detail response:', response.data);

            if (response.data.status === true && response.data.data) {
                return response.data.data;
            }

            throw new Error(response.data.message || 'Failed to fetch payment details');
        } catch (error) {
            console.error('Get payment detail error:', error);
            throw error;
        }
    }
}

export const parentApiService = new ParentApiService();
