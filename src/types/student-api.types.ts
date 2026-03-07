/**
 * TypeScript type definitions for Student API
 * Based on API_STUDENT.md v2.0
 */

// ============================================================================
// AUTH & USER TYPES
// ============================================================================

export interface User {
    id: number;
    student_id: string;
    email: string;
    full_name: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    address?: string | null;
    birthday?: string;
    campus_id?: number;
    is_active: number;
    created_at?: string;
}

export interface LoginRequest {
    login: string; // email or student_id
    password: string;
}

export interface LoginResponse {
    status: 'success' | 'error';
    message: string;
    data?: {
        token: string;
        user: User;
    };
    errors?: any;
}

// ============================================================================
// CALENDAR & NOTIFICATIONS
// ============================================================================

export interface CalendarEvent {
    id: number;
    class_id: number;
    class_name: string;
    date: string; // "YYYY-MM-DD"
    time_start: string; // "HH:mm"
    time_end: string; // "HH:mm"
    room_name: string;
    teacher_name: string;
    campus_name: string;
    title: string;
    name_skill: string;
    is_test: number;
}

export interface Notification {
    created: string;
    subject: string;
    content: string;
    type: number; // 3: học vụ, 4: điểm danh
}

// ============================================================================
// HOMEWORK TYPES
// ============================================================================

export interface Homework {
    id: number;
    title: string;
    class_id: number;
    class_name: string;
    deadline: string;
    deadline_formatted: string;
    type: number; // 1: BTVN, 2: NLP
}

export interface HomeworkWithStatus extends Homework {
    submitted: boolean;
    submission_id?: number;
    submission_date?: string;
    grade?: number | null;
}

export interface SubmittedHomework {
    id: number;
    bai_hoc_id: number;
    class_id: number;
    class_name: string;
    student_id: number;
    schedule_id: number;
    ten_bai_tap: string;
    ten_giao_vien: string;
    ngay_hoc: string;
    type: number;
    diem: number | null;
    nhan_xet: string | null;
    link_driver: string | null;
    link_file: string | null;
    link_danh_gia: string | null;
    phan_tram_bai_tap: number | null;
    ghi_chu_bai_tap: string | null;
    created_at: string;
    updated_at: string;
}

export interface HomeworkSubmission {
    schedule_id: number;
    bai_tap_id: number;
    type: 1 | 2;
    file?: File | Blob;
    link_driver?: string;
}

export interface SubmissionResult {
    submission_id: number;
    message: string;
}

export interface DownloadFile {
    key: string;
    filename: string;
    url?: string;
}

export interface DownloadLinkResponse {
    url?: string;
    count?: number;
    files?: DownloadFile[];
}

// ============================================================================
// ATTENDANCE TYPES
// ============================================================================

export interface AttendanceDetail {
    id: number;
    student_id: number;
    class_id: number;
    start: string;
    end: string;
    is_learn: number; // 0: chưa điểm danh, 1: có đi, 2: vắng có phép, 3: vắng không phép
    phan_tram_btvn: number;
    phan_tram_btnlp: number;
    buoi_hoc: string;
}

export interface AttendanceStatistics {
    total_sessions: number;
    present: number;
    absent_with_permission: number;
    absent_without_permission: number;
    not_checked: number;
    attendance_rate: number;
}

export interface AttendanceSummary {
    class_id: number;
    class_name: string;
    course_id: number;
    course_name: string;
    // Statistics fields (flat structure from API)
    total_sessions: number;
    present_count: number;
    absent_count: number;
    attendance_rate: number;
}

export interface AbsentDetail {
    id: number;
    date: string;
    time_start: string;
    time_end: string;
    reason: string;
}

export interface HomeworkIncompleteDetail {
    id: number;
    deadline: string;
    is_submitted: boolean;
    title: string;
}

// ============================================================================
// TRANSCRIPT & GRADES TYPES
// ============================================================================

export interface TranscriptClass {
    id: number;
    class_id: number;
    class_name: string;
    course_name: string;
    campus_name: string;
    day_begin: string;
    day_end: string;
    test_middle: number | null;
    test_final: number | null;
    status: string; // "Đang Học" | "Hoàn thành"
    is_dat: string | number; // "Chưa đánh giá" | "Đạt" | "Không đạt" or 0/1
    is_pass: string | number; // "Chưa đánh giá" | "Pass" | "Fail" or 0/1
    average: number | null;
    overall_score: number | null;
    // New fields from JSON update
    so_buoi_hoc?: number;
    btvn?: number;
    diem_thuong?: string | number;
    da_hoc?: number | string;
    is_dat_text?: string;
    is_pass_text?: string;
    is_study?: number;
    is_reserve?: number;
    is_learn_again?: number;
    is_done?: number;
}

export interface TranscriptData {
    student_name: string;
    student_code: string;
    classes: TranscriptClass[];
    total_courses: number;
}

export interface ClassDetailSession {
    id: number;
    class_name: string;
    is_learn: number; // 0: chưa điểm danh, 1: có đi, 2: vắng có phép, 3: vắng không phép
    is_permission: number; // 0: không xin phép, 1: có xin phép, 2: đã duyệt
    phan_tram_btvn: number | null;
    phan_tram_btnlp: number | null;
    diem_thuong: number;
    session_date: string; // "DD/MM/YYYY"
    start_time: string; // "HH:mm"
    end_time: string; // "HH:mm"
}

export interface ClassDetailData {
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
    sessions: ClassDetailSession[];
}

// ============================================================================
// ABSENCE REQUEST TYPES
// ============================================================================

export interface ClassForAbsence {
    id: number;
    student_id: number;
    class_id: number;
    course_id: number;
    course_name: string;
    class_name: string;
    is_start: number;
    is_done: number;
}

export interface ScheduleDate {
    id: number;
    student_id: number;
    class_id: number;
    start: string;
    end: string;
    is_learn: number;
    day_begin: string;
}

export interface AbsenceRequest {
    class_id: number;
    schedule_id: number;
    ly_do_vang: string;
}

export interface AbsenceRequestItem {
    id: number;
    schedule_detail_id: number;
    reason: string;
    status: string; // 'pending' | 'approved' | 'rejected'
    created_at: string;
    teacher_name?: string | null;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiSuccessResponse<T = any> {
    status: 'success' | true;
    message?: string;
    data: T;
}

export interface ApiErrorResponse {
    status: 'error' | false;
    message: string;
    errors?: any;
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

// ============================================================================
// STUDENT EVALUATION TYPES
// ============================================================================

export interface EvaluationForm {
    bill_detail_id: number;
    class_name: string;
    course_name: string;
    id_class: number;
    deadline_1: string; // "YYYY-MM-DD"
    deadline_2: string; // "YYYY-MM-DD"
    so_lan_danh_gia: number;
    lan_danh_gia: number;
}

export interface EvaluationDetail {
    // According to JSON example "data": null, but assuming structure might exist later.
    // For now keeping it flexible or generic.
    [key: string]: any;
}

// ============================================================================
// FACULTY RATING TYPES
// ============================================================================

export interface FacultyRatingData {
    // JSON example data: []
    [key: string]: any;
}

export interface FacultyRatingInfo {
    id: number;
    schedule_id: number;
    student_id: number;
    is_learn: number;
    comment: string | null;
    lecturers_id: number;
    start: string; // "YYYY-MM-DD HH:mm:ss"
    end: string;   // "YYYY-MM-DD HH:mm:ss"
    class_name: string;
    class_id: number;
    content_review_by_lecturers: string | null;
    content_review_by_student: string | null;
    content_rating_home_work: string | null;
    raid_by_lecturers: number | null;
    raid_by_student: number | null;
    is_home_work: number;
    is_bt_nlp: number;
    phan_tram_btvn: number | null;
    phan_tram_btnlp: number | null;
    ghi_chu_btvn: string | null;
    ghi_chu_btnlp: string | null;
    diem_thuong: number;
    da_nop_btvn: number | null;
    da_nop_btnlp: number | null;
    duyet_vang: number;
    ly_do_vang: string | null;
    id_nguoi_duyet: number | null;
    price: number;
    title: string | null;
    created_at: string;
    updated_at: string;
    link_file: string | null;
    link_driver: string | null;
    nhan_xet_btvn: string | null;
    nhan_xet_btnlp: string | null;
    is_con_hoc: number;
    bill_detail_id: number | null;
}

export interface HomeworkResult {
    id: number;
    class_name: string;
    day: string; // "DD/MM/YYYY"
    phan_tram_btvn: number | null;
    phan_tram_btnlp: number | null;
    content_rating_home_work: string | null;
    ghi_chu_btvn: string | null;
    ghi_chu_btnlp: string | null;
    full_name: string;
    start: string; // "YYYY-MM-DD HH:mm:ss"
}

export interface HomeworkScoreDetail {
    id: number;
    schedule_id: number;
    phan_tram_btvn: number | null;
    phan_tram_btnlp: number | null;
    ngay_hoc: string;
    gio_bat_dau: string;
    gio_ket_thuc: string;
}

// ============================================================================
// PAYMENT TYPES
// ============================================================================

export interface PaymentReceipt {
    id: number;
    name: string;
    bill_code: string | null;
    campus_id: number;
    student_id: number;
    staff_id: number;
    content: string;
    is_open: number;
    amount_paid: number;
    cancel_reason: string | null;
    is_accept: number;
    created_at: string;
    updated_at: string;
    bill_id: number;
    is_phieu_thu: number;
    so_tien_no: number | null;
}

// ============================================================================
// LEARNING MATERIALS TYPES
// ============================================================================

export interface MaterialCourse {
    id: number;
    name: string;
    number_of_lessons: number;
}

export interface MaterialLesson {
    id: number;
    number_order: number;
    title: string;
    description: string;
    video: string | null;
    silde: string | null;
    pdf: string | null;
    link_driver: string | null;
}

export interface LossCommit {
    id: number;
    bill_code: string;
    student_id: number;
    course_id: number;
    course_name: string;
    class_id: number;
    class_name: string;
    price: number;
    ly_do: string;
    day_wating: string;
    is_mat_cam_ket: number;
    is_dung_hoc: number;
}

// ============================================================================
// TEACHER COMMENTS TYPES
// ============================================================================

export interface TeacherCommentListItem {
    class_id: number;
    class_name: string;
    course_name: string;
    student_name: string;
    student_code: string;
    has_feedback_round_1: boolean;
    has_feedback_round_2: boolean;
}

export interface FeedbackRound {
    dot_nhan_xet: number;
    created_at: string;
    [key: string]: any; // Flexible for different skill-specific fields
}

export interface SkillFeedback {
    skill: string;
    teacher_name_round_1: string | null;
    teacher_name_round_2: string | null;
    feedback_round_1: FeedbackRound | null;
    feedback_round_2: FeedbackRound | null;
}

export interface TeacherCommentDetail {
    class_id: number;
    class_name: string;
    student_name: string;
    student_code: string;
    feedback: SkillFeedback[];
}

// ============================================================================
// CONTRACT/BILLS TYPES
// ============================================================================

export interface BillListItem {
    id: number;
    day_bill: string;
}

export interface BillInfo {
    id: number;
    hash: string;
    student_id: number;
    bill_code: string;
    tong_tien_hoa_don: number;
    tong_tien_giam_gia: number;
    phan_tram_giam_gia: number;
    tong_tien_phai_tra: number;
    tong_tien_da_coc: number;
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

export interface CourseInBill {
    id: number;
    bill_code: string;
    student_id: number;
    course_id: number;
    combo_id: number | null;
    combo_name: string | null;
    course_name: string;
    price: number;
    class_id: number;
    count_lesson: number;
    campus_id: number;
    bill_id: number;
    [key: string]: any; // For additional fields
}

export interface BillDetailData {
    data_bill: BillInfo;
    course_normal: CourseInBill[];
    paid: number;
}

// ============================================================================
// PAYMENT RECEIPTS TYPES
// ============================================================================

export interface PaymentReceipt {
    id: number;
    name: string;
    bill_code: string | null;
    campus_id: number;
    student_id: number;
    staff_id: number;
    content: string;
    is_open: number;
    amount_paid: number;
    cancel_reason: string | null;
    is_accept: number;
    created_at: string;
    updated_at: string;
    bill_id: number;
    is_phieu_thu: number;
    so_tien_no: number | null;
}

export interface PaymentDetail {
    payment: PaymentReceipt;
}

// ============================================================================
// FACULTY RATING TYPES
// ============================================================================

export interface FacultyRatingSession {
    id: number;
    class_id: number;
    schedule_id: number;
    lecturers_id: number;
    content_review_by_student: string | null;
    raid_by_student: number | null;
    start: string;
    end: string;
    class_name: string;
    teacher_name: string;
    ngay_hoc: string;
    time_start: string;
    time_end: string;
}

export interface FacultyRatingSubmission {
    id: number;
    content_review_by_student: string;
    raid_by_student: number;
}

// ============================================================================
// COURSE EVALUATION TYPES
// ============================================================================

export interface CourseEvaluationForm {
    bill_detail_id: number;
    class_name: string;
    course_name: string;
    id_class: number;
    deadline_1: string;
    deadline_2: string;
    so_lan_danh_gia: number;
    lan_danh_gia?: number;
}

export interface CourseEvaluationSubmission {
    class_id: number;
    cau_1: number;
    cau_2: number;
    cau_3: number;
    cau_4: number;
    cau_5: number;
    cau_6: number;
    cau_7: number;
    cau_8: number;
    cau_9: number;
    cau_10: number;
    cau_11: number;
    ket_qua_nhan_xet: string;
}

// ============================================================================
// SUPPORT REQUEST TYPES
// ============================================================================

export interface SupportRequest {
    title: string;
    content: string;
    status: number;
    id_yeu_cau_hv: number;
    content_done: string | null;
    image_done: string | null;
    day_send: string;
    max_id: number;
}

export interface SupportRequestCreate {
    title: string;
    content: string;
}

// ============================================================================
// ABSENCE REQUEST TYPES
// ============================================================================

export interface AbsenceRequestClass {
    id: number;
    bill_code: string;
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
    change_class: number | null;
    created_at: string;
    updated_at: string;
    is_dat: number;
    bill_id: number;
    is_mat_cam_ket: number;
    is_lop_mat_cam_ket: number;
    is_buoi_mat_cam_ket: number;
    day_wating: string;
    is_dung_hoc: number;
    lop_truoc_bao_luu: number | null;
    goi_dien: string | null;
    diem_khac: string | null;
    hinh_thuc_hoc: number;
    class_name: string;
}

export interface AbsenceRequestDate {
    schedule_detail_id: number;
    id: number;
    schedule_id: number;
    student_id: number;
    is_learn: number;
    comment: string | null;
    lecturers_id: number;
    start: string;
    end: string;
    class_name: string;
    class_id: number;
    content_review_by_lecturers: string | null;
    content_review_by_student: string | null;
    content_rating_home_work: string | null;
    raid_by_lecturers: number | null;
    raid_by_student: number | null;
    is_home_work: number;
    is_bt_nlp: number;
    phan_tram_btvn: number | null;
    phan_tram_btnlp: number | null;
    ghi_chu_btvn: string | null;
    ghi_chu_btnlp: string | null;
    diem_thuong: number;
    da_nop_btvn: number | null;
    da_nop_btnlp: number | null;
    duyet_vang: number;
    ly_do_vang: string | null;
    id_nguoi_duyet: number | null;
    price: number;
    title: string | null;
    created_at: string;
    updated_at: string;
    link_file: string | null;
    link_driver: string | null;
    nhan_xet_btvn: string | null;
    nhan_xet_btnlp: string | null;
    is_con_hoc: number;
    bill_detail_id: number | null;
    date: string;
    time_start: string;
    time_end: string;
}



export interface AbsenceRequestCreate {
    class_id: number;
    schedule_id: number;
    ly_do_vang: string;
}

// ============================================================================
// EXAM SCHEDULE TYPES
// ============================================================================

export interface ExamInfo {
    id: number;
    title: string;
    type: number;
    type_label: string;
    file_path: string;
    file_url: string;
    duration_minutes: number;
    instructions: string;
    is_active: boolean;
    is_auto_graded: boolean;
    total_questions: number;
    created_by: number;
    created_at: string;
    updated_at: string;
}

export interface ExamScheduleItem {
    id: number;
    exam: ExamInfo;
    start_time: string;
    end_time: string;
    is_upcoming: boolean;
    is_ongoing: boolean;
    is_ended: boolean;
    my_status: string; // 'not_started' | ...
    my_score: number | null;
}

export interface ExamScheduleDetail {
    schedule: {
        id: number;
        exam_id: number;
        class_id: number;
        start_time: string;
        end_time: string;
        duration_minutes: number;
        is_published: boolean;
        status: number;
        status_label: string;
        is_upcoming: boolean;
        is_ongoing: boolean;
        is_ended: boolean;
        time_remaining_minutes: number;
        exam: ExamInfo;
        created_at: string;
        updated_at: string;
    };
    submission: any | null;
    can_start: boolean;
}

export interface ExamStartResponse {
    submission_id: number;
    started_at: string;
}

export interface ExamTakeResponse {
    schedule_id: number;
    exam: {
        id: number;
        title: string;
        type: number;
        type_label: string;
        duration_minutes: number;
        instructions: string;
        file_url: string;
        total_questions: number;
    };
    time_remaining_seconds: number;
    started_at: string;
    my_answers: any[];
    writing_content: string;
}

// ============================================================================
// CLASS ACTIVITY TYPES (HOAT DONG LOP)
// ============================================================================

export interface StudentClass {
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
    lop_truoc_bao_luu: number | null;
    is_chuyen: number;
    so_lan_danh_gia: number;
    lan_danh_gia?: number;
}

export interface ClassesResponse {
    status: boolean;
    message: string;
    data: {
        data: StudentClass[];
        today: string;
    };
}

export interface FeedAttachment {
    id: number;
    class_feed_id: number;
    file_path: string;
    file_type: string;
    file_size: number;
    created_at: string;
    updated_at: string;
    url: string;
}

export interface FeedCommenter {
    id: number;
    name: string;
    role: string;
    role_label: string;
    role_color: string;
}

export interface FeedComment {
    id: number;
    content: string;
    created_at: string;
    commenter: FeedCommenter;
}

export interface ClassFeedItem {
    id: number;
    class_id: number;
    employee_id: number;
    content: string;
    comments_count?: number; // Added for UI display
    created_at: string;
    updated_at: string;
    attachments: FeedAttachment[];
    teacher?: {
        id: number;
        full_name: string;
    };
    author_name?: string; // Legacy support if needed
    type?: string;
}

export interface ClassFeedResponse {
    status: boolean;
    data: {
        current_page: number;
        data: ClassFeedItem[];
        first_page_url: string;
        from: number | null;
        last_page: number;
        last_page_url: string;
        links: Array<{
            url: string | null;
            label: string;
            page: number | null;
            active: boolean;
        }>;
        next_page_url: string | null;
        path: string;
        per_page: number;
        prev_page_url: string | null;
        to: number | null;
        total: number;
    };
}
