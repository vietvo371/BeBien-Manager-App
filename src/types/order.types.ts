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
