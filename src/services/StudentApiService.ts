import axios, { AxiosInstance } from 'axios';
import env from '../config/env';
import {
    CalendarEvent,
    Notification,
    Homework,
    HomeworkWithStatus,
    SubmittedHomework,
    HomeworkSubmission,
    SubmissionResult,
    DownloadLinkResponse,
    AttendanceSummary,
    AbsentDetail,
    HomeworkIncompleteDetail,
    ClassForAbsence,
    ScheduleDate,
    ApiResponse,
    TranscriptData,
    ClassDetailData,
    TranscriptClass,
    EvaluationForm,
    EvaluationDetail,
    FacultyRatingData,
    FacultyRatingInfo,
    LossCommit,
    TeacherCommentListItem,
    TeacherCommentDetail,
    BillListItem,
    BillDetailData,
    PaymentReceipt,
    PaymentDetail,
    HomeworkResult,
    HomeworkScoreDetail,
    MaterialCourse,
    MaterialLesson,
    FacultyRatingSession,
    FacultyRatingSubmission,
    CourseEvaluationForm,
    CourseEvaluationSubmission,
    SupportRequest,
    SupportRequestCreate,
    AbsenceRequestClass,
    AbsenceRequestDate,
    AbsenceRequestItem,
    AbsenceRequestCreate,
    ExamScheduleItem,
    ExamScheduleDetail,
    StudentClass,
    ClassesResponse,
    ClassFeedResponse,
    FeedComment,
    FeedCommenter,
    ApiSuccessResponse,
} from '../types/student-api.types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { handleApiError } from '../utils/errorHandler';

// ============================================================================
// STUDENT API CLIENT
// ============================================================================

/**
 * Create dedicated axios instance for Student API
 * Base URL: /api/student
 */
const createStudentApiClient = (): AxiosInstance => {
    const studentApi = axios.create({
        baseURL: `${env.API_URL}/api/student`,
        timeout: 15000,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
    });

    // Request interceptor: Add Bearer token
    studentApi.interceptors.request.use(
        async (config) => {
            const token = await AsyncStorage.getItem('@auth_token');
            // const token = "d8bfpiISwsCyJiZqSrf8RBD8gjhdsK5oxNaPjJaWa1abdde7";
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        (error) => Promise.reject(error)
    );

    // Response interceptor: Handle Laravel error format
    studentApi.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error.response?.data) {
                // Laravel error format: { status: 'error', message: '...', errors: {...} }
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

    return studentApi;
};

// ============================================================================
// STUDENT API SERVICE
// ============================================================================

class StudentApiService {
    private api: AxiosInstance;

    constructor() {
        this.api = createStudentApiClient();
    }

    // ==========================================================================
    // CALENDAR & NOTIFICATIONS
    // ==========================================================================

    /**
     * Get calendar/schedule
     * GET /api/student/calendar
     */
    async getCalendar(): Promise<CalendarEvent[]> {
        try {
            const response = await this.api.get<ApiResponse<{ calendar: CalendarEvent[] }>>('/calendar');

            if (response.data.status === true && response.data.data?.calendar) {
                return response.data.data.calendar;
            }

            return [];
        } catch (error) {
            console.error('Get calendar error:', error);
            throw error;
        }
    }

    /**
     * Get notifications (merged with attendance)
     * GET /api/student/notifications
     */
    async getNotifications(): Promise<Notification[]> {
        try {
            const response = await this.api.get<ApiResponse<{ notifications: Notification[] }>>('/notifications');

            // API returns { data: { notifications: [...] } }
            if (response.data.status === true && response.data.data?.notifications) {
                return response.data.data.notifications;
            }

            return [];
        } catch (error) {
            console.error('Get notifications error:', error);
            throw error;
        }
    }

    // ==========================================================================
    // HOMEWORK
    // ==========================================================================

    /**
     * Get homework list (pending)
     * GET /api/student/homework/list/{type}
     * @param type 1 = BTVN, 2 = NLP
     */
    async getHomeworkList(type: 1 | 2): Promise<Homework[]> {
        try {
            const response = await this.api.get<ApiResponse<{ homeworks: Homework[] }>>(`/homework/list/${type}`);

            // API returns { data: { homeworks: [...] } }
            if (response.data.status === true && response.data.data?.homeworks) {
                return response.data.data.homeworks;
            }

            return [];
        } catch (error) {
            console.error('Get homework list error:', error);
            throw error;
        }
    }

    /**
     * Get homework details with submission status
     * GET /api/student/homework/details/{type}
     * @param type 1 = BTVN, 2 = NLP
     */
    async getHomeworkDetails(type: 1 | 2): Promise<HomeworkWithStatus[]> {
        try {
            const response = await this.api.get<ApiResponse<HomeworkWithStatus[]>>(`/homework/details/${type}`);

            if (response.data.status === true && response.data.data) {
                return response.data.data;
            }

            return [];
        } catch (error) {
            console.error('Get homework details error:', error);
            throw error;
        }
    }

    /**
     * Submit homework (file or Google Drive link)
     * POST /api/student/homework/submit
     */
    async submitHomework(data: FormData): Promise<SubmissionResult> {
        try {
            const response = await this.api.post<ApiResponse<SubmissionResult>>(
                '/homework/submit',
                data,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            console.log(response.data);

            if (response.data.status === true && response.data.data) {
                return response.data.data;
            }

            throw new Error('Homework submission failed');
        } catch (error) {
            console.error('Submit homework error:', error);
            throw error;
        }
    }

    /**
     * Get submitted homework list
     * GET /api/student/homework/submitted/{type}
     * @param type 1 = BTVN, 2 = NLP
     */
    async getSubmittedHomework(type: 1 | 2): Promise<SubmittedHomework[]> {
        try {
            const response = await this.api.get<ApiResponse<SubmittedHomework[]>>(`/homework/submitted/${type}`);

            if (response.data.status === true && response.data.data) {
                return response.data.data;
            }

            return [];
        } catch (error) {
            console.error('Get submitted homework error:', error);
            throw error;
        }
    }

    /**
     * Download submitted homework (get S3 signed URL)
     * GET /api/student/homework/download/{class_id}/{homework_id}
     */
    async downloadHomework(classId: number, homeworkId: number): Promise<DownloadLinkResponse> {
        try {
            const response = await this.api.get<ApiResponse<DownloadLinkResponse>>(
                `/homework/download/${classId}/${homeworkId}`
            );
            console.log(response.data);
            if (response.data.status === true && response.data.data) {
                return response.data.data;
            }

            throw new Error('Unable to get download link');
        } catch (error) {
            console.error('Download homework error:', error);
            throw error;
        }
    }

    /**
     * Download homework template
     * GET /api/student/homework/download-template/{id}
     */
    async downloadTemplate(id: number): Promise<DownloadLinkResponse> {
        try {
            const response = await this.api.get<ApiResponse<DownloadLinkResponse>>(
                `/homework/download-template/${id}`
            );

            if (response.data.status === true && response.data.data) {
                return response.data.data;
            }

            throw new Error('Unable to get template link');
        } catch (error) {
            console.error('Download template error:', error);
            throw error;
        }
    }

    // ==========================================================================
    // ATTENDANCE
    // ==========================================================================

    /**
     * Get attendance summary for all classes
     * GET /api/student/attendance/summary
     */
    async getAttendanceSummary(): Promise<AttendanceSummary[]> {
        try {
            const response = await this.api.get<ApiResponse<{ attendance: AttendanceSummary[] }>>('/attendance/summary');

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
     * Get absent details for a class
     * GET /api/student/attendance/absent-details/{class_id}
     */
    async getAbsentDetails(classId: number): Promise<AbsentDetail[]> {
        try {
            const response = await this.api.get<ApiResponse<any>>(
                `/attendance/absent-details/${classId}`
            );

            if (response.data.status === true && response.data.data) {
                if (Array.isArray(response.data.data.absent_sessions)) {
                    return response.data.data.absent_sessions;
                }
                // Fallback
                if (Array.isArray(response.data.data)) {
                    return response.data.data;
                }
            }

            return [];
        } catch (error) {
            console.error('Get absent details error:', error);
            throw error;
        }
    }

    /**
     * Get homework incomplete details for a class
     * GET /api/student/attendance/homework-details/{class_id}
     */
    async getHomeworkIncomplete(classId: number): Promise<HomeworkIncompleteDetail[]> {
        try {
            const response = await this.api.get<ApiResponse<any>>(
                `/attendance/homework-details/${classId}`
            );

            if (response.data.status === true && response.data.data) {
                if (Array.isArray(response.data.data.homeworks)) {
                    return response.data.data.homeworks;
                }
                // Fallback
                if (Array.isArray(response.data.data)) {
                    return response.data.data;
                }
            }

            return [];
        } catch (error) {
            console.error('Get homework incomplete error:', error);
            throw error;
        }
    }

    // ==========================================================================
    // DASHBOARD
    // ==========================================================================

    /**
     * Get student classes list
     * GET /api/student/classes
     */
    async getClasses(): Promise<any[]> {
        try {
            const response = await this.api.get('/classes');

            if (response.data.status === true && response.data.data?.data) {
                return response.data.data.data;
            }

            return [];
        } catch (error) {
            console.error('Get classes error:', error);
            throw error;
        }
    }

    /**
     * Get dashboard chart data
     * GET /api/student/dashboard/chart
     */
    async getDashboardChart(): Promise<any[]> {
        try {
            const response = await this.api.get('/dashboard/chart');

            if (response.data.status === true && response.data.data?.data) {
                return response.data.data.data;
            }

            return [];
        } catch (error) {
            console.error('Get dashboard chart error:', error);
            throw error;
        }
    }

    // ==========================================================================
    // TRANSCRIPT & GRADES
    // ==========================================================================

    /**
     * Get transcript by course
     * GET /api/student/transcript/course/{courseId}
     */
    async getTranscriptByCourse(courseId: number): Promise<TranscriptClass[]> {
        try {
            // Note: The API returns { data: { data: [ ...classes ] } } based on user screenshot
            const response = await this.api.get<ApiResponse<{ data: TranscriptClass[] }>>(`/transcript/course/${courseId}`);
            console.log('getTranscriptByCourse response:', JSON.stringify(response.data, null, 2));

            if (response.data.status === true && response.data.data?.data) {
                return response.data.data.data;
            }

            return [];
        } catch (error) {
            console.error('Get transcript by course error:', error);
            throw error;
        }
    }

    /**
     * Get student transcript (all course grades)
     * GET /api/student/transcript
     */
    async getTranscript(): Promise<TranscriptData> {
        try {
            const response = await this.api.get<ApiResponse<TranscriptData>>('/transcript');
            console.log(response.data);
            if (response.data.status === true && response.data.data) {
                return response.data.data;
            }

            return {
                student_name: '',
                student_code: '',
                classes: [],
                total_courses: 0,
            };
        } catch (error) {
            console.error('Get transcript error:', error);
            throw error;
        }
    }

    /**
     * Get class detail with sessions
     * GET /api/student/transcript/{class_id}/details
     */
    async getClassDetail(classId: number): Promise<ClassDetailData> {
        try {
            const response = await this.api.get<ApiResponse<ClassDetailData>>(
                `/transcript/${classId}/details`
            );
            console.log(response.data);

            if (response.data.status === true && response.data.data) {
                return response.data.data;
            }

            throw new Error('Failed to get class detail');
        } catch (error) {
            console.error('Get class detail error:', error);
            throw error;
        }
    }

    // ==========================================================================
    // STUDENT EVALUATION
    // ==========================================================================

    /**
     * Get evaluation forms list
     * GET /api/student/evaluation/form
     */
    async getEvaluationForms(): Promise<EvaluationForm[]> {
        try {
            const response = await this.api.get<ApiResponse<{ data: EvaluationForm[] }>>('/evaluation/form');

            if (response.data.status === true && response.data.data?.data) {
                console.log(response.data.data.data);
                return response.data.data.data;
            }

            return [];
        } catch (error) {
            console.error('Get evaluation forms error:', error);
            throw error;
        }
    }

    /**
     * Get evaluation details
     * GET /api/student/evaluation/{bill_detail_id}/{class_id}/details
     */
    async getEvaluationDetails(billDetailId: number, classId: number): Promise<EvaluationDetail | null> {
        try {
            const response = await this.api.get<ApiResponse<{ data: EvaluationDetail }>>(
                `/evaluation/${billDetailId}/${classId}/details`
            );

            if (response.data.status === true && response.data.data?.data) {
                console.log(response.data.data.data);
                return response.data.data.data;
            }

            return null;
        } catch (error) {
            console.error('Get evaluation details error:', error);
            throw error;
        }
    }

    /**
     * Submit evaluation round 1
     * POST /api/student/evaluation/round-1
     */
    async submitEvaluationRound1(data: any): Promise<any> {
        try {
            const response = await this.api.post('/evaluation/round-1', data);
            console.log(response.data);
            return response.data;
        } catch (error) {
            console.error('Submit evaluation round 1 error:', error);
            throw error;
        }
    }

    /**
     * Submit evaluation round 2
     * POST /api/student/evaluation/round-2
     */
    async submitEvaluationRound2(data: any): Promise<any> {
        try {
            const response = await this.api.post('/evaluation/round-2', data);
            console.log(response.data);
            return response.data;
        } catch (error) {
            console.error('Submit evaluation round 2 error:', error);
            throw error;
        }
    }

    // ==========================================================================
    // FACULTY RATING
    // ==========================================================================

    /**
     * Get faculty rating data
     * GET /api/student/faculty-rating/data
     */
    async getFacultyRatingData(): Promise<FacultyRatingData[]> {
        try {
            const response = await this.api.get<ApiResponse<{ data: FacultyRatingData[] }>>('/faculty-rating/data');
            console.log(response.data);
            if (response.data.status === true && response.data.data?.data) {
                return response.data.data.data;
            }

            return [];
        } catch (error) {
            console.error('Get faculty rating data error:', error);
            throw error;
        }
    }

    /**
     * Get faculty rating info
     * GET /api/student/faculty-rating/{id}/evaluate
     */
    async getFacultyRatingInfo(id: number): Promise<FacultyRatingInfo | null> {
        try {
            const response = await this.api.get<ApiResponse<{ data: FacultyRatingInfo }>>(
                `/faculty-rating/${id}/evaluate`
            );
            console.log(response.data);
            if (response.data.status === true && response.data.data?.data) {
                return response.data.data.data;
            }

            return null;
        } catch (error) {
            console.error('Get faculty rating info error:', error);
            throw error;
        }
    }

    /**
     * Get homework results (faculty rating context)
     * GET /api/student/faculty-rating/homework/results
     */
    async getHomeworkResults(): Promise<HomeworkResult[]> {
        try {
            const response = await this.api.get<ApiResponse<{ data: HomeworkResult[] }>>(
                '/faculty-rating/homework/results'
            );
            console.log(response.data);
            if (response.data.status === true && response.data.data?.data) {
                return response.data.data.data;
            }

            return [];
        } catch (error) {
            console.error('Get homework results error:', error);
            throw error;
        }
    }

    /**
     * Get submitted homework (faculty rating context)
     * GET /api/student/faculty-rating/homework/submitted/{type}
     * type: 'btvn' | 'btnlp' (based on example URL .../submitted/btvn)
     */
    async getSubmittedHomeworkFaculty(type: string): Promise<any[]> {
        try {
            const response = await this.api.get<ApiResponse<{ data: any[] }>>(
                `/faculty-rating/homework/submitted/${type}`
            );
            console.log(response.data);
            if (response.data.status === true && response.data.data?.data) {
                return response.data.data.data;
            }

            return [];
        } catch (error) {
            console.error('Get submitted homework faculty error:', error);
            throw error;
        }
    }

    /**
     * Get homework evaluation list
     * GET /api/student/faculty-rating/homework/evaluation-list
     */
    async getHomeworkEvaluationList(): Promise<HomeworkResult[]> {
        try {
            const response = await this.api.get<ApiResponse<{ data: HomeworkResult[] }>>(
                '/faculty-rating/homework/evaluation-list'
            );
            console.log(response.data);
            if (response.data.status === true && response.data.data?.data) {
                return response.data.data.data;
            }

            return [];
        } catch (error) {
            console.error('Get homework evaluation list error:', error);
            throw error;
        }
    }

    /**
     * Get homework score details
     * GET /api/student/faculty-rating/homework/score/{id}
     */
    async getHomeworkScoreDetail(id: number): Promise<HomeworkScoreDetail | null> {
        try {
            const response = await this.api.get<ApiResponse<{ data: HomeworkScoreDetail }>>(
                `/faculty-rating/homework/score/${id}`
            );
            console.log(response.data);
            if (response.data.status === true && response.data.data?.data) {
                return response.data.data.data;
            }

            return null;
        } catch (error) {
            console.error('Get homework score detail error:', error);
            throw error;
        }
    }

    // ==========================================================================
    // PAYMENTS
    // ==========================================================================

    /**
     * Get payment receipts
     * GET /api/student/payments
     */
    async getPayments(): Promise<PaymentReceipt[]> {
        try {
            const response = await this.api.get<ApiResponse<{ tablePayment: PaymentReceipt[] }>>('/payments');
            console.log(response.data);
            if (response.data.status === true && response.data.data?.tablePayment) {
                return response.data.data.tablePayment;
            }

            return [];
        } catch (error) {
            console.error('Get payments error:', error);
            throw error;
        }
    }

    // ==========================================================================
    // LEARNING MATERIALS
    // ==========================================================================

    /**
     * Get list of courses with materials
     * GET /api/student/materials/courses
     */
    async getMaterialCourses(): Promise<MaterialCourse[]> {
        try {
            const response = await this.api.get<ApiResponse<any>>(
                '/materials/courses'
            );
            console.log('getMaterialCourses response:', JSON.stringify(response.data, null, 2));

            if (response.data.status === true && response.data.data) {
                // Check for data.courses (based on log)
                if (Array.isArray(response.data.data.courses)) {
                    return response.data.data.courses;
                }
                // Fallback / Standard format
                if (Array.isArray(response.data.data.data)) {
                    return response.data.data.data;
                }
                if (Array.isArray(response.data.data)) {
                    return response.data.data;
                }
            }

            return [];
        } catch (error) {
            console.error('Get material courses error:', error);
            throw error;
        }
    }

    /**
     * Get lessons for a course
     * GET /api/student/materials/lessons/{course_id}
     */
    async getMaterialLessons(courseId: number): Promise<MaterialLesson[]> {
        try {
            const response = await this.api.get<ApiResponse<any>>(
                `/materials/lessons/${courseId}`
            );
            console.log(`getMaterialLessons ${courseId} response:`, JSON.stringify(response.data, null, 2));

            if (response.data.status === true && response.data.data) {
                // Check for data.lessons
                if (Array.isArray(response.data.data.lessons)) {
                    return response.data.data.lessons;
                }
                // Fallback
                if (Array.isArray(response.data.data.data)) {
                    return response.data.data.data;
                }
                if (Array.isArray(response.data.data)) {
                    return response.data.data;
                }
            }

            return [];
        } catch (error) {
            console.error('Get material lessons error:', error);
            throw error;
        }
    }

    /**
     * Download material video
     * GET /api/student/materials/download/video/{course_id}/{lesson_id}
     */
    async downloadMaterialVideo(courseId: number, lessonId: number): Promise<string> {
        try {
            const response = await this.api.get<ApiResponse<any>>(
                `/materials/download/video/${courseId}/${lessonId}`
            );
            console.log(response.data);
            if (response.data.status === true && response.data.data) {
                // If data is string (direct URL)
                if (typeof response.data.data === 'string') return response.data.data;
                // If data is object (download_url property)
                if (response.data.data.download_url) return response.data.data.download_url;
            }
            throw new Error('Download link not found');
        } catch (error) {
            console.error('Download video error:', error);
            throw error;
        }
    }

    // ==========================================================================
    // EXAM SCHEDULE
    // ==========================================================================

    /**
     * Get exam schedule list
     * GET /api/student/exams
     */
    async getExams(): Promise<ExamScheduleItem[]> {
        try {
            const response = await this.api.get<ApiResponse<ExamScheduleItem[]>>('/exams');
            console.log('getExams response:', response.data);

            // Check if response is successful
            if ('data' in response.data && response.data.data) {
                // API returns { success: true, data: [...] } directly
                if (Array.isArray(response.data.data)) {
                    return response.data.data;
                }
            }
            return [];
        } catch (error) {
            console.error('Get exams error:', error);
            throw error;
        }
    }

    /**
     * Get exam detail
     * GET /api/student/exams/{scheduleId}
     */
    async getExamDetail(scheduleId: number): Promise<ExamScheduleDetail | null> {
        try {
            const response = await this.api.get<ApiResponse<ExamScheduleDetail>>(`/exams/${scheduleId}`);
            console.log('getExamDetail response:', JSON.stringify(response.data, null, 2));

            // Try different response structures
            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            // @ts-ignore - fallback for different API structure
            if (response.data.status === true && response.data.data) {
                // @ts-ignore
                if (response.data.data.schedule) {
                    // @ts-ignore
                    return response.data.data;
                }
                // @ts-ignore
                if (response.data.data.data && response.data.data.data.schedule) {
                    // @ts-ignore
                    return response.data.data.data;
                }
            }

            return null;
        } catch (error) {
            console.error('Get exam detail error:', error);
            throw error;
        }
    }

    /**
     * Start an exam / Check logic before starting
     * POST /api/student/exams/{id}/start
     */
    async startExam(scheduleId: number): Promise<any> {
        try {
            const response = await this.api.post<ApiResponse<any>>(`/exams/${scheduleId}/start`);
            console.log('startExam response:', response.data);

            if ((response.data as any).success || response.data.status === true) {
                return response.data;
            }
            throw new Error(response.data.message || 'Start exam failed');
        } catch (error) {
            console.error('Start exam error:', error);
            throw error;
        }
    }

    /**
     * Take an exam (get questions)
     * GET /api/student/exams/{id}/take
     */
    async takeExam(scheduleId: number): Promise<any> {
        try {
            const response = await this.api.get<ApiResponse<any>>(`/exams/${scheduleId}/take`);
            console.log('takeExam response:', response.data);

            if ((response.data as any).success || response.data.status === true) {
                return response.data.data;
            }
            throw new Error(response.data.message || 'Take exam failed');
        } catch (error) {
            console.error('Take exam error:', error);
            throw error;
        }
    }





    /**
     * Submit exam answers
     * POST /api/student/exams/{scheduleId}/submit
     */
    async submitExam(
        scheduleId: number,
        payload: { answers: Array<{ question: number; answer: string }> }
    ): Promise<any> {
        try {
            const response = await this.api.post<ApiResponse<any>>(`/exams/${scheduleId}/submit`, payload);
            console.log('submitExam response:', response.data);
            if ((response.data as any).success || response.data.status === true) {
                return response.data;
            }
            throw new Error((response.data as any).message || 'Nộp bài thất bại');
        } catch (error) {
            console.error('Submit exam error:', error);
            throw error;
        }
    }

    /**
     * Get exam result
     * GET /api/student/exams/{scheduleId}/result
     */
    async getExamResult(scheduleId: number): Promise<any> {
        try {
            const response = await this.api.get<ApiResponse<any>>(`/exams/${scheduleId}/result`);
            console.log('getExamResult response:', response.data);
            if ((response.data as any).success || response.data.status === true) {
                return (response.data as any).data || response.data;
            }
            throw new Error((response.data as any).message || 'Không thể tải kết quả');
        } catch (error) {
            console.error('Get exam result error:', error);
            throw error;
        }
    }

    /**
     * Download material slide
     * GET /api/student/materials/download/slide/{course_id}/{lesson_id}
     */
    async downloadMaterialSlide(courseId: number, lessonId: number): Promise<string> {
        try {
            const response = await this.api.get<ApiResponse<any>>(
                `/materials/download/slide/${courseId}/${lessonId}`
            );
            console.log(response.data);
            if (response.data.status === true && response.data.data) {
                // If data is string (direct URL)
                if (typeof response.data.data === 'string') return response.data.data;
                // If data is object (download_url property)
                if (response.data.data.download_url) return response.data.data.download_url;
            }
            throw new Error('Download link not found');
        } catch (error) {
            console.error('Download slide error:', error);
            throw error;
        }
    }

    /**
     * Download material PDF
     * GET /api/student/materials/download/pdf/{course_id}/{lesson_id}
     */
    async downloadMaterialPdf(courseId: number, lessonId: number): Promise<string> {
        try {
            const response = await this.api.get<ApiResponse<any>>(
                `/materials/download/pdf/${courseId}/${lessonId}`
            );
            console.log(response.data);
            if (response.data.status === true && response.data.data) {
                // If data is string (direct URL)
                if (typeof response.data.data === 'string') return response.data.data;
                // If data is object (download_url property)
                if (response.data.data.download_url) return response.data.data.download_url;
            }
            throw new Error('Download link not found');
        } catch (error) {
            console.error('Download pdf error:', error);
            throw error;
        }
    }

    /**
     * Download entire course material (zip/document)
     * GET /api/student/materials/download/course/{course_id}
     */
    async downloadCourseMaterial(courseId: number): Promise<string> {
        try {
            const response = await this.api.get<ApiResponse<any>>(
                `/materials/download/course/${courseId}`
            );
            console.log(response.data);
            if (response.data.status === true && response.data.data) {
                // If data is string (direct URL)
                if (typeof response.data.data === 'string') return response.data.data;
                // If data is object (download_url property)
                if (response.data.data.download_url) return response.data.data.download_url;
            }
            throw new Error('Download link not found');
        } catch (error) {
            console.error('Download course material error:', error);
            throw error;
        }
    }
    /**
     * Get loss commitment list
     * GET /api/student/loss-commit
     */
    async getLossCommit(): Promise<LossCommit[]> {
        try {
            const response = await this.api.get<ApiResponse<{ loss_commit: LossCommit[] }>>(
                '/loss-commit'
            );
            console.log(response.data);
            if (response.data.status === true && response.data.data?.loss_commit) {
                return response.data.data.loss_commit;
            }
            return [];
        } catch (error) {
            console.error('Get loss commit error:', error);
            throw error;
        }
    }

    // ==========================================================================
    // TEACHER COMMENTS
    // ==========================================================================

    /**
     * Get teacher comments list
     * GET /api/student/comments/list
     */
    async getTeacherCommentsList(): Promise<TeacherCommentListItem[]> {
        try {
            const response = await this.api.get<ApiResponse<{ comments: TeacherCommentListItem[] }>>(
                '/comments/list'
            );
            console.log(response.data);
            if (response.data.status === true && response.data.data?.comments) {
                return response.data.data.comments;
            }
            return [];
        } catch (error) {
            console.error('Get teacher comments list error:', error);
            throw error;
        }
    }

    /**
     * Get teacher comment details for a class
     * GET /api/student/comments/details/{class_id}
     */
    async getTeacherCommentDetails(classId: number): Promise<TeacherCommentDetail> {
        try {
            const response = await this.api.get<ApiResponse<TeacherCommentDetail>>(
                `/comments/details/${classId}`
            );
            console.log(response.data);
            if (response.data.status === true && response.data.data) {
                return response.data.data;
            }
            throw new Error('No data found');
        } catch (error) {
            console.error('Get teacher comment details error:', error);
            throw error;
        }
    }

    // ==========================================================================
    // BILLS/CONTRACTS
    // ==========================================================================

    /**
     * Get list of bills by date
     * GET /api/student/bills
     */
    async getBillsList(): Promise<BillListItem[]> {
        try {
            const response = await this.api.get<ApiResponse<{ day_bill: BillListItem[] }>>(
                '/bills'
            );
            console.log(response.data);
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
     * Get bill details by day ID
     * GET /api/student/bills/{idDay}/details
     */
    async getBillDetails(idDay: number): Promise<BillDetailData> {
        try {
            const response = await this.api.get<ApiResponse<BillDetailData>>(
                `/bills/${idDay}/details`
            );
            console.log(response.data);
            if (response.data.status === true && response.data.data) {
                return response.data.data;
            }
            throw new Error('No data found');
        } catch (error) {
            console.error('Get bill details error:', error);
            throw error;
        }
    }

    // ==========================================================================
    // PAYMENT RECEIPTS
    // ==========================================================================

    /**
     * Get list of payment receipts
     * GET /api/student/payments
     */
    async getPaymentsList(): Promise<PaymentReceipt[]> {
        try {
            const response = await this.api.get<ApiResponse<{ tablePayment: PaymentReceipt[] }>>(
                '/payments'
            );
            console.log(response.data);
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
     * Get payment receipt details
     * GET /api/student/payments/{id}
     */
    async getPaymentDetail(id: number): Promise<PaymentDetail> {
        try {
            const response = await this.api.get<ApiResponse<PaymentDetail>>(
                `/payments/${id}`
            );
            console.log(response.data);
            if (response.data.status === true && response.data.data) {
                return response.data.data;
            }
            throw new Error('No data found');
        } catch (error) {
            console.error('Get payment detail error:', error);
            throw error;
        }
    }

    // ==========================================================================
    // FACULTY RATING
    // ==========================================================================

    /**
     * Get faculty rating sessions list
     * GET /api/student/faculty-rating/data
     */
    async getFacultyRatingSessions(): Promise<FacultyRatingSession[]> {
        try {
            const response = await this.api.get<ApiResponse<{ data: FacultyRatingSession[] }>>(
                '/faculty-rating/data'
            );
            console.log(response.data);
            if (response.data.status === true && response.data.data?.data) {
                return response.data.data.data;
            }
            return [];
        } catch (error) {
            console.error('Get faculty rating sessions error:', error);
            throw error;
        }
    }

    /**
     * Submit faculty rating evaluation
     * POST /api/student/faculty-rating/evaluate
     */
    async submitFacultyRating(data: FacultyRatingSubmission): Promise<boolean> {
        try {
            const response = await this.api.post<ApiResponse<any>>(
                '/faculty-rating/evaluate',
                data
            );
            console.log(response.data);
            return response.data.status === true;
        } catch (error) {
            console.error('Submit faculty rating error:', error);
            throw error;
        }
    }

    // ==========================================================================
    // COURSE EVALUATION
    // ==========================================================================

    /**
     * Get course evaluation forms list
     * GET /api/student/evaluation/form
     */
    async getCourseEvaluationForms(): Promise<CourseEvaluationForm[]> {
        try {
            const response = await this.api.get<ApiResponse<{ data: CourseEvaluationForm[] }>>(
                '/evaluation/form'
            );
            console.log(response.data);
            if (response.data.status === true && response.data.data?.data) {
                return response.data.data.data;
            }
            return [];
        } catch (error) {
            console.error('Get course evaluation forms error:', error);
            throw error;
        }
    }

    /**
     * Submit round 1 course evaluation
     * POST /api/student/evaluation/round-1
     */
    async submitRound1Evaluation(data: CourseEvaluationSubmission): Promise<boolean> {
        try {
            const response = await this.api.post<ApiResponse<any>>(
                '/evaluation/round-1',
                data
            );
            console.log(response.data);
            return response.data.status === true;
        } catch (error) {
            console.error('Submit round 1 evaluation error:', error);
            throw error;
        }
    }

    /**
     * Submit round 2 course evaluation
     * POST /api/student/evaluation/round-2
     */
    async submitRound2Evaluation(data: CourseEvaluationSubmission): Promise<boolean> {
        try {
            const response = await this.api.post<ApiResponse<any>>(
                '/evaluation/round-2',
                data
            );
            console.log(response.data);
            return response.data.status === true;
        } catch (error) {
            console.error('Submit round 2 evaluation error:', error);
            throw error;
        }
    }

    // ==========================================================================
    // SUPPORT REQUESTS
    // ==========================================================================

    /**
     * Get support requests list
     * GET /api/student/requests/list
     */
    async getSupportRequests(): Promise<SupportRequest[]> {
        try {
            const response = await this.api.get<ApiResponse<{ list_request: SupportRequest[] }>>(
                '/requests/list'
            );
            console.log(response.data);
            if (response.data.status === true && response.data.data?.list_request) {
                return response.data.data.list_request;
            }
            return [];
        } catch (error) {
            console.error('Get support requests error:', error);
            throw error;
        }
    }

    /**
     * Create support request
     * POST /api/student/requests/create
     */
    async createSupportRequest(data: SupportRequestCreate): Promise<boolean> {
        try {
            const response = await this.api.post<ApiResponse<any>>(
                '/requests/create',
                data
            );
            console.log(response.data);
            return response.data.status === true;
        } catch (error) {
            console.error('Create support request error:', error);
            throw error;
        }
    }

    /**
     * Delete support request
     * DELETE /api/student/requests/:id
     */
    async deleteSupportRequest(id: number): Promise<boolean> {
        try {
            const response = await this.api.delete<ApiResponse<any>>(
                `/requests/${id}`
            );
            console.log(response.data);
            return response.data.status === true;
        } catch (error) {
            console.error('Delete support request error:', error);
            throw error;
        }
    }

    // ==========================================================================
    // ABSENCE REQUESTS
    // ==========================================================================

    /**
     * Get classes for absence request
     * GET /api/student/absence-request/classes
     */
    async getAbsenceRequestClasses(): Promise<AbsenceRequestClass[]> {
        try {
            const response = await this.api.get<ApiResponse<{ classes: AbsenceRequestClass[] }>>(
                '/absence-request/classes'
            );
            console.log('getAbsenceRequestClasses response:', response.data);
            if (response.data.status === true && response.data.data?.classes) {
                return response.data.data.classes;
            }
            return [];
        } catch (error) {
            console.error('Get absence request classes error:', error);
            throw error;
        }
    }

    /**
     * Get dates for absence request by class
     * GET /api/student/absence-request/dates/:class_id
     */
    async getAbsenceRequestDates(classId: number): Promise<AbsenceRequestDate[]> {
        try {
            const response = await this.api.get<ApiResponse<{ dates: AbsenceRequestDate[] }>>(
                `/absence-request/dates/${classId}`
            );
            console.log('getAbsenceRequestDates response:', response.data);
            if (response.data.status === true && response.data.data?.dates) {
                return response.data.data.dates;
            }
            return [];
        } catch (error) {
            console.error('Get absence request dates error:', error);
            throw error;
        }
    }

    /**
     * Get absence requests list
     * GET /api/student/absence-request/list
     */
    async getAbsenceRequests(): Promise<AbsenceRequestItem[]> {
        try {
            const response = await this.api.get<ApiResponse<{ requests: AbsenceRequestItem[] }>>(
                '/absence-request/list'
            );
            console.log(response.data);
            if (response.data.status === true && response.data.data?.requests) {
                return response.data.data.requests;
            }
            return [];
        } catch (error) {
            console.error('Get absence requests error:', error);
            throw error;
        }
    }

    /**
     * Create absence request
     * POST /api/student/absence-request/create
     */
    async createAbsenceRequest(data: AbsenceRequestCreate): Promise<boolean> {
        try {
            const response = await this.api.post<ApiResponse<any>>(
                '/absence-request/create',
                data
            );
            console.log(response.data);
            return response.data.status === true;
        } catch (error) {
            console.error('Create absence request error:', error);
            throw error;
        }
    }

    /**
     * Delete absence request
     * DELETE /api/student/absence-request/:id
     */
    async deleteAbsenceRequest(id: number): Promise<boolean> {
        try {
            const response = await this.api.delete<ApiResponse<any>>(
                `/absence-request/${id}`
            );
            console.log(response.data);
            return response.data.status === true;
        } catch (error) {
            console.error('Delete absence request error:', error);
            throw error;
        }
    }

    // ============================================================================
    // CLASS ACTIVITY (HOAT DONG LOP)
    // ============================================================================

    /**
     * Get student classes list
     * GET /api/student/classes
     */
    async getStudentClasses(): Promise<StudentClass[]> {
        try {
            const response = await this.api.get<ClassesResponse>('/classes');
            console.log('Student classes response:', response.data);

            if (response.data.status && response.data.data) {
                return response.data.data.data;
            }
            return [];
        } catch (error) {
            console.error('Get student classes error:', error);
            handleApiError(error);
            return [];
        }
    }

    /**
     * Get class feed/activity
     * GET /api/student/classes/{classId}/feed
     */
    async getClassFeed(classId: number, page: number = 1): Promise<ClassFeedResponse['data']> {
        try {
            const response = await this.api.get<ClassFeedResponse>(
                `/classes/${classId}/feed`,
                { params: { page } }
            );
            console.log('Class feed response:', response.data);

            if (response.data.status && response.data.data) {
                return response.data.data;
            }

            // Return empty pagination structure if no data
            return {
                current_page: 1,
                data: [],
                first_page_url: '',
                from: null,
                last_page: 1,
                last_page_url: '',
                links: [],
                next_page_url: null,
                path: '',
                per_page: 10,
                prev_page_url: null,
                to: null,
                total: 0,
            };
        } catch (error) {
            console.error('Get class feed error:', error);
            handleApiError(error);
            throw error;
        }
    }

    /**
     * Get comments for a feed
     * GET /api/student/feeds/{feedId}/comments
     */
    async getFeedComments(feedId: number): Promise<FeedComment[]> {
        try {
            const response = await this.api.get<ApiResponse<FeedComment[]>>(
                `/feeds/${feedId}/comments`
            );
            console.log('Get comments response:', response.data);

            if (response.data.status) {
                return (response.data as ApiSuccessResponse<FeedComment[]>).data;
            }
            return [];
        } catch (error) {
            console.error('Get feed comments error:', error);
            handleApiError(error);
            return [];
        }
    }

    /**
     * Add a new comment
     * POST /api/student/feeds/{feedId}/comments
     */
    async addFeedComment(feedId: number, content: string): Promise<FeedComment | null> {
        try {
            const response = await this.api.post<ApiResponse<FeedComment>>(
                `/feeds/${feedId}/comments`,
                { content }
            );
            console.log('Add comment response:', response.data);

            if (response.data.status) {
                return (response.data as ApiSuccessResponse<FeedComment>).data;
            }
            return null;
        } catch (error) {
            console.error('Add feed comment error:', error);
            handleApiError(error);
            return null;
        }
    }

    /**
     * Delete a comment
     * DELETE /api/student/feeds/{feedId}/comments/{commentId}
     */
    async deleteFeedComment(feedId: number, commentId: number): Promise<boolean> {
        try {
            const response = await this.api.delete<ApiResponse<any>>(
                `/feeds/${feedId}/comments/${commentId}`
            );
            console.log('Delete comment response:', response.data);

            return response.data.status === true;
        } catch (error) {
            console.error('Delete feed comment error:', error);
            handleApiError(error);
            return false;
        }
    }
}

// ============================================================================
// EXPORT SINGLETON INSTANCE
// ============================================================================

export const studentApi = new StudentApiService();
