/**
 * TypeScript type definitions for Order Management
 * BeBien Manager - Restaurant Management System
 */

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PREPARING = 'preparing',
  READY = 'ready',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  price: number;
  subtotal: number;
  notes?: string;
}

export interface Order {
  id: number;
  order_code: string;
  table_number?: string;
  customer_name?: string;
  customer_phone?: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  payment_method?: string;
  notes?: string;
  created_by: number;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  cancelled_at?: string;
  cancellation_reason?: string;
  cancellation_status?: 'pending' | 'approved' | 'rejected';
}

export interface OrderFilters {
  status?: OrderStatus | 'all';
  dateFrom?: string;
  dateTo?: string;
  searchQuery?: string;
  tableNumber?: string;
  minTotal?: number;
  maxTotal?: number;
  cancellation_status?: 'pending' | 'approved' | 'rejected';
}

export interface OrdersResponse {
  status: 'success' | 'error';
  message?: string;
  data: {
    orders: Order[];
    pagination: {
      current_page: number;
      per_page: number;
      total: number;
      last_page: number;
    };
  };
}

export interface OrderDetailResponse {
  status: 'success' | 'error';
  message?: string;
  data: Order;
}

export interface CancelOrderRequest {
  order_id: number;
  reason: string;
}

export interface CancelOrderResponse {
  status: 'success' | 'error';
  message: string;
  data?: {
    order: Order;
  };
}

// is_duyet_huy: 1 = chờ duyệt, 2 = đã duyệt xóa, -1 = đã từ chối xóa
export interface PendingCancelItem {
  id: number;
  id_hoa_don: number;
  id_mat_hang: number;
  so_luong: string;
  don_gia: string;
  thanh_tien: string;
  ghi_chu?: string;
  is_duyet_huy: 1 | 2 | -1;
  ten_mat_hang: string;
  ma_hoa_don: string;
  ten_ban: string;
  ten_nhan_vien_order: string;
}

export interface PendingCancelResponse {
  status: boolean;
  data: PendingCancelItem[];
}

export interface ApproveCancelResponse {
  status: boolean;
  message: string;
}

// /api/nguoi-kiem-duyet/action-duyet
// type: 2 = duyệt xóa, -1 = từ chối xóa
export interface ActionDuyetRequest {
  id_chi_tiet: number;
  type: 2 | -1;
}

export interface ActionDuyetResponse {
  status: boolean;
  message: string;
}

// Chuẩn 422 Validation Error từ server
export interface ValidationError422 {
  message: string;
  errors: Record<string, string[]>;
}

// ─── Hóa đơn đang mở (khu vực 1) ─────────────────────────────────────────────

/** Một hóa đơn chưa thanh toán từ /api/nguoi-kiem-duyet/hoa-don-open */
export interface HoaDonOpen {
  id_ban: number;
  ten_ban: string;
  status: number;
  /** id hóa đơn — dùng làm id_hoa_don khi gọi chi-tiet */
  id: number;
  thoi_gian_vao: string;
  /** API có thể trả về string hoặc number */
  tien_giam_gia: string | number;
  phan_tram_giam_gia: string | number;
  tong_tien: string | number;
  /** API trả về string "4" hoặc number 4 */
  tong_mon: string | number;
  /** API trả về string "0" hoặc number 0 */
  so_mon_con: string | number;
}

export interface HoaDonOpenListResponse {
  data: HoaDonOpen[];
  so_luong_ban: number;
  doanh_thu: number;
}

// ─── Chi tiết món của hóa đơn ─────────────────────────────────────────────────

/**
 * Một dòng món trong hóa đơn từ /api/nguoi-kiem-duyet/hoa-don-open/chi-tiet/{id}
 *
 * Badge màu trạng thái:
 *  - is_print=0              → xám  "Không In"
 *  - is_print=1 & is_che_bien=0 → cam  "Đang chế biến"
 *  - is_print=1 & is_che_bien=1 → xanh "Xong"
 */
export interface HoaDonChiTietItem {
  id: number;
  id_hoa_don: number;
  id_mat_hang: number;
  so_luong: string;
  don_gia: string;
  thanh_tien: string;
  ghi_chu?: string;
  is_print: 0 | 1;
  is_che_bien: 0 | 1;
  ten_mat_hang: string;
}

export interface HoaDonChiTietResponse {
  data: HoaDonChiTietItem[];
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Trích xuất lỗi 422 thành chuỗi hiển thị cho người dùng.
 * Ưu tiên field đầu tiên nếu có, fallback về `message` gốc.
 */
export const parse422Error = (error: any): string => {
  const data = error?.response?.data as ValidationError422 | undefined;
  if (!data) return 'Đã xảy ra lỗi. Vui lòng thử lại.';
  if (data.errors) {
    const firstField = Object.values(data.errors)[0];
    if (firstField?.length) return firstField[0];
  }
  return data.message || 'Dữ liệu không hợp lệ';
};
