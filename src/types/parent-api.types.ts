
export interface ParentUser {
    id: number;
    username: string;
    name: string;
    phone: string;
    email: string;
    is_active: boolean;
    created_at: string;
    children?: Child[];
}

export interface Child {
    id: number;
    student_id: string;
    full_name: string;
    email?: string;
    phone?: string;
    relationship?: string;
    is_primary?: boolean;
    // Additional fields from /children endpoint
    birthday?: string;
    is_active?: number;
    avatar?: string;
    class_code?: string;
}

export interface ParentLoginResponse {
    status: boolean;
    message: string;
    data: {
        token: string;
        parent: ParentUser;
    };
}

export interface ApiResponse<T> {
    status: boolean;
    message?: string;
    data?: T;
}

// Feed Types
import { ClassFeedItem } from './student-api.types';

export interface ParentStudentClass {
    bill_detail_id: number;
    class_name: string;
    course_name: string;
    id_class: number;
    deadline_1: string;
    deadline_2: string;
    day_begin: string;
    day_end: string;
    is_open: number;
    is_done: number;
    is_study: number;
    is_reserve: number;
    is_learn_again: number;
    is_dung_hoc: number;
    lop_truoc_bao_luu: string | null;
    is_chuyen: number;
    so_lan_danh_gia: number;
    lan_danh_gia?: number;
}

export interface ParentStudentClassesResponse {
    status: boolean;
    message: string;
    data: {
        data: ParentStudentClass[];
        today: string;
    };
}

export interface ParentFeedFilters {
    student_id: number;
    class_id: number;
}

export interface ParentFeedData {
    feeds: ClassFeedItem[];
    total: number;
    filters: ParentFeedFilters;
    current_page?: number;
    last_page?: number;
}

export interface ParentFeedResponse {
    status: boolean;
    data: ParentFeedData;
}

// Dashboard API Types
export interface ChildInfo {
    id: number;
    student_id: string;
    full_name: string;
    email: string;
    avatar: string | null;
    campus_id: string;
}

export interface LearningSummary {
    total_courses: number;
    active_courses: number;
    average_score: number;
    completed_courses: number;
}

export interface ClassInfo {
    id: number;
    class_id: number;
    course_id: number;
    class_name: string;
    course_name: string;
    campus_name: string;
    day_begin: string;
    day_end: string;
    test_middle: string | null;
    test_final: string | null;
    status: string;
    is_dat: string;
    is_pass: string;
    average: number | null;
    overall_score: number | null;
    is_blocked: boolean;
    block_reason: string | null;
}

export interface ChartDataItem {
    course_id: number;
    class_id: number;
    course_name: string;
    class_name: string;
    is_dung_hoc: number;
    is_chuyen: number;
    is_reserve: number;
    day_begin: string;
    day_end: string;
    total_lesson: number;
    studied: number;
    remaining: number;
    display_name: string;
}

export interface ProgressDataItem extends ClassInfo {
    progress: {
        total: number;
        learned: number;
        percentage: number;
    };
}

export interface ParentDashboardStats {
    active_courses_count: number;
    average_score: number;
    attendance_rate: number;
    completed_courses_count: number;
}

export interface ActiveClassInfo {
    id: number;
    class_id: number;
    course_id: number;
    class_name: string;
    course_name: string;
    campus_name: string;
    day_begin: string;
    day_end: string;
    test_middle: string | null;
    test_final: string | null;
    status: string;
    is_dat: string;
    is_pass: string;
    average: number | null;
    overall_score: number | null;
    is_blocked: boolean;
    block_reason: string | null;
    progress_percent: number;
}

export interface ChildDashboardData {
    info: ChildInfo;
    stats: ParentDashboardStats;
    active_classes: ActiveClassInfo[];
}

export interface DashboardData {
    children: ChildDashboardData[];
    parent_name: string;
}

export interface DashboardResponse {
    status: boolean;
    message: string;
    data: DashboardData;
}

export interface CalendarEvent {
    id: number;
    class_id: number;
    class_name: string;
    date: string;
    time_start: string;
    time_end: string;
    room_name: string;
    teacher_name: string;
    campus_name: string;
    title: string;
    name_skill: string;
    is_test: number;
}

export interface ScheduleResponse {
    status: boolean;
    message: string;
    data: {
        calendar: CalendarEvent[];
    };
}

export interface TranscriptData {
    student_name: string;
    student_code: string;
    classes: ClassInfo[];
    total_courses: number;
}

export interface TranscriptResponse {
    status: boolean;
    message: string;
    data: TranscriptData;
}

export interface TranscriptSession {
    id: number;
    class_name: string;
    is_learn: number;
    is_permission: number;
    phan_tram_btvn: number | null;
    phan_tram_btnlp: number | null;
    diem_thuong: number;
    session_date: string;
    start_time: string;
    end_time: string;
}

export interface TranscriptDetailData {
    class_id: number;
    class_name: string;
    course_name: string;
    test_middle: number | null;
    test_final: number | null;
    attendance: {
        attended: number;
        total: number;
        percentage: number;
    };
    averages: {
        btvn: number;
        btnlp: number;
        bonus_points: number;
    };
    sessions: TranscriptSession[];
}

export interface TranscriptDetailResponse {
    status: boolean;
    message: string;
    data: TranscriptDetailData;
}

// Teacher Comments Types
export interface CommentClassInfo {
    class_id: number;
    class_name: string;
    course_name: string;
    student_name: string;
    student_code: string;
    has_feedback_round_1: boolean;
    has_feedback_round_2: boolean;
}

export interface CommentListResponse {
    status: boolean;
    message: string;
    data: {
        comments: CommentClassInfo[];
    };
}

export interface TeacherFeedback {
    dot_nhan_xet: number;
    created_at: string;
    [key: string]: any; // Allow dynamic fields based on skill
}

export interface SkillFeedback {
    skill: string;
    teacher_name_round_1: string | null;
    teacher_name_round_2: string | null;
    feedback_round_1: TeacherFeedback | null;
    feedback_round_2: TeacherFeedback | null;
}

export interface TeacherCommentDetailData {
    class_id: number;
    class_name: string;
    student_name: string;
    student_code: string;
    feedback: SkillFeedback[];
}

export interface TeacherCommentDetailResponse {
    status: boolean;
    message: string;
    data: TeacherCommentDetailData;
}

// Attendance Types
export interface AttendanceSummaryItem {
    class_id: number;
    class_name: string;
    course_id: number;
    course_name: string;
    total_sessions: number;
    present_count: number;
    absent_count: number;
    attendance_rate: number;
}

export interface AttendanceSummaryResponse {
    status: boolean;
    message: string;
    data: {
        attendance: AttendanceSummaryItem[];
    };
}

export interface AbsentSession {
    id: number;
    date: string;
    time_start: string;
    time_end: string;
    reason: string;
}

export interface AbsentDetailResponse {
    status: boolean;
    message: string;
    data: {
        absent_sessions: AbsentSession[];
    };
}

// Notification Types
export interface NotificationStudent {
    id: number;
    full_name: string;
    student_id: string;
}

export interface NotificationItem {
    id: number;
    title: string;
    created: string;
    created_at: string;
    content: string;
    subject: string;
    type: number;
    is_seen: number;
    student: NotificationStudent;
}

export interface NotificationResponse {
    status: boolean;
    message: string;
    data: {
        notifications: NotificationItem[];
    };
}

// ============================================================================
// BILL / CONTRACT TYPES
// ============================================================================

// Bill list item
export interface ParentBillListItem {
    id: number;
    day_bill: string; // Format: "DD-MM-YYYY"
}

// Bill list response
export interface ParentBillListResponse {
    status: boolean;
    message: string;
    data: {
        day_bill: ParentBillListItem[];
    };
}

// Bill detail data
export interface ParentBillData {
    id: number;
    hash: string;
    student_id: number;
    bill_code: string;
    tong_tien_hoa_don: number;
    tong_tien_giam_gia: number;
    phan_tram_giam_gia: number;
    tong_tien_phai_tra: number;
    tong_tien_da_coc: number | null;
    tong_tien_con_no: number;
    phi_bao_luu: number;
    staff_id: number;
    campus_id: number;
    is_open: number;
    is_owe: number;
    content: string;
    created_at: string;
    updated_at: string;
    phan_tram_giam_thuc_te: number;
    student_code: string;
    full_name: string;
    campus_name: string;
    day_bill: string;
}

// Course in bill
export interface ParentCourseNormal {
    id: number;
    bill_code: string | null;
    student_id: number;
    course_id: number;
    combo_id: number | null;
    combo_name: string | null;
    course_name: string;
    price: number;
    is_start: number;
    is_bill: number;
    is_study: number;
    is_done: number;
    is_delete: number;
    is_pass: number;
    is_learn_again: number;
    is_reserve: number;
    six_month: number;
    is_chuyen: number;
    id_student_chuyen: number | null;
    reserve_reason: string | null;
    price_reserve: number | null;
    reason_not_pass: string | null;
    class_id: number;
    test_middle: number | null;
    test_final: number | null;
    content_middle: string | null;
    content_final: string | null;
    is_owe: number;
    day_add_to_class: string | null;
    price_real: number;
    count_lesson: number;
    campus_id: number;
    change_class: string | null;
    created_at: string;
    updated_at: string;
    is_dat: number;
    bill_id: number;
    is_mat_cam_ket: number;
    is_lop_mat_cam_ket: number;
    is_buoi_mat_cam_ket: number;
    day_wating: string;
    is_dung_hoc: number;
    lop_truoc_bao_luu: string | null;
    goi_dien: string | null;
    diem_khac: string | null;
    hinh_thuc_hoc: number;
}

// Bill detail response data
export interface ParentBillDetailData {
    data_bill: ParentBillData;
    course_normal: ParentCourseNormal[];
    paid: number;
}

// Bill detail response
export interface ParentBillDetailResponse {
    status: boolean;
    message: string;
    data: ParentBillDetailData;
}

// ============================================================================
// PAYMENT / RECEIPT TYPES
// ============================================================================

// Payment receipt in list
export interface ParentPaymentReceipt {
    id: number;
    name: string; // PT-TVD-2025-00802
    bill_code: string | null;
    campus_id: number;
    student_id: number;
    staff_id: number;
    content: string;
    is_open: number;
    amount_paid: number;
    cancel_reason: string | null;
    is_accept: number; // 1 = accepted, 0 = pending
    created_at: string;
    updated_at: string;
    bill_id: number;
    is_phieu_thu: number;
    so_tien_no: number | null;
}

// Payment list response
export interface ParentPaymentListResponse {
    status: boolean;
    message: string;
    data: {
        tablePayment: ParentPaymentReceipt[];
    };
}

// Student info in payment detail
export interface ParentPaymentStudent {
    id: number;
    student_id: string; // HV-00485-TVD
    avatar: string | null;
    email: string;
    full_name: string;
    last_name: string;
    first_name: string;
    phone_1: string;
    phone_2: string;
    sex: number;
    birthday: string;
    parents_name: string;
    parents_phone: string | null;
    parents_email: string | null;
    is_active: number;
    campus_id: string;
    address: string | null;
    full_address: string;
    created_at: string;
    updated_at: string;
    tong_tien_hop_dong: number;
    tong_tien_phieu_thu_da_xac_nhan: number;
    tong_tien_phieu_thu_chua_xac_nhan: number;
    tong_tien_da_hoc: number;
}

// Payment detail data
export interface ParentPaymentDetail {
    payment: ParentPaymentReceipt & {
        student: ParentPaymentStudent;
    };
}

// Payment detail response
export interface ParentPaymentDetailResponse {
    status: boolean;
    message: string;
    data: ParentPaymentDetail;
}
