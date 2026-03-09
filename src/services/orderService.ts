import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosInstance } from 'axios';
import env from '../config/env';
import api from '../utils/Api';
import {
  Order,
  OrdersResponse,
  OrderDetailResponse,
  CancelOrderRequest,
  CancelOrderResponse,
  OrderFilters,
  OrderStatus,
  PendingCancelItem,
  PendingCancelResponse,
  ApproveCancelResponse,
  ActionDuyetRequest,
  ActionDuyetResponse,
} from '../types/order.types';
import { generateMockOrders } from '../utils/mockOrderData';

const USE_MOCK_DATA = true;

class OrderService {
  private api: AxiosInstance;
  private mockOrders: Order[] = [];

  constructor() {
    this.api = axios.create({
      baseURL: `${env.API_URL}/api`,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    this.api.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          await AsyncStorage.removeItem('auth_token');
          await AsyncStorage.removeItem('user_data');
        }
        return Promise.reject(error);
      }
    );

    if (USE_MOCK_DATA) {
      this.mockOrders = generateMockOrders(100);
    }
  }

  async getOrders(
    page: number = 1,
    perPage: number = 20,
    filters?: OrderFilters
  ): Promise<OrdersResponse> {
    if (USE_MOCK_DATA) {
      await new Promise<void>(resolve => setTimeout(resolve, 500));

      let filtered = [...this.mockOrders];

      if (filters?.status && filters.status !== 'all') {
        filtered = filtered.filter(o => o.status === filters.status);
      }

      if (filters?.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        filtered = filtered.filter(
          o =>
            o.order_code.toLowerCase().includes(query) ||
            o.table_number?.toLowerCase().includes(query) ||
            o.customer_name?.toLowerCase().includes(query)
        );
      }

      if (filters?.tableNumber) {
        filtered = filtered.filter(
          o => o.table_number?.toLowerCase().includes(filters.tableNumber!.toLowerCase())
        );
      }

      if (filters?.minTotal) {
        filtered = filtered.filter(o => o.total >= filters.minTotal!);
      }

      if (filters?.maxTotal) {
        filtered = filtered.filter(o => o.total <= filters.maxTotal!);
      }

      if (filters?.cancellation_status) {
        filtered = filtered.filter(o => o.cancellation_status === filters.cancellation_status);
      }

      const start = (page - 1) * perPage;
      const end = start + perPage;

      return {
        status: 'success',
        data: {
          orders: filtered.slice(start, end),
          pagination: {
            current_page: page,
            per_page: perPage,
            total: filtered.length,
            last_page: Math.ceil(filtered.length / perPage),
          },
        },
      };
    }

    const params: any = {
      page,
      per_page: perPage,
    };

    if (filters?.status && filters.status !== 'all') {
      params.status = filters.status;
    }

    if (filters?.searchQuery) {
      params.search = filters.searchQuery;
    }

    if (filters?.tableNumber) {
      params.table_number = filters.tableNumber;
    }

    if (filters?.dateFrom) {
      params.date_from = filters.dateFrom;
    }

    if (filters?.dateTo) {
      params.date_to = filters.dateTo;
    }

    if (filters?.minTotal) {
      params.min_total = filters.minTotal;
    }

    if (filters?.maxTotal) {
      params.max_total = filters.maxTotal;
    }

    if (filters?.cancellation_status) {
      params.cancellation_status = filters.cancellation_status;
    }

    const response = await this.api.get<OrdersResponse>('/orders', { params });
    return response.data;
  }

  async getOrderById(orderId: number): Promise<Order> {
    if (USE_MOCK_DATA) {
      await new Promise<void>(resolve => setTimeout(resolve, 300));

      const order = this.mockOrders.find(o => o.id === orderId);
      if (!order) {
        throw new Error('Order not found');
      }
      return order;
    }

    const response = await this.api.get<OrderDetailResponse>(`/orders/${orderId}`);
    return response.data.data;
  }

  async cancelOrder(request: CancelOrderRequest): Promise<CancelOrderResponse> {
    if (USE_MOCK_DATA) {
      await new Promise<void>(resolve => setTimeout(resolve, 500));

      const orderIndex = this.mockOrders.findIndex(o => o.id === request.order_id);
      if (orderIndex !== -1) {
        this.mockOrders[orderIndex] = {
          ...this.mockOrders[orderIndex],
          cancellation_status: 'pending',
          cancellation_reason: request.reason,
        };
      }

      return {
        status: 'success',
        message: 'Yêu cầu hủy đơn hàng đã được gửi',
      };
    }

    const response = await this.api.post<CancelOrderResponse>('/orders/cancel', request);
    return response.data;
  }

  async approveCancellation(orderId: number): Promise<CancelOrderResponse> {
    if (USE_MOCK_DATA) {
      await new Promise<void>(resolve => setTimeout(resolve, 300));

      const orderIndex = this.mockOrders.findIndex(o => o.id === orderId);
      if (orderIndex !== -1) {
        this.mockOrders[orderIndex] = {
          ...this.mockOrders[orderIndex],
          status: OrderStatus.CANCELLED,
          cancellation_status: 'approved',
          cancelled_at: new Date().toISOString(),
        };
      }

      return {
        status: 'success',
        message: 'Đã duyệt hủy đơn hàng',
      };
    }

    const response = await this.api.post<CancelOrderResponse>(
      `/orders/${orderId}/cancel/approve`
    );
    return response.data;
  }

  async rejectCancellation(orderId: number, reason: string): Promise<CancelOrderResponse> {
    if (USE_MOCK_DATA) {
      await new Promise<void>(resolve => setTimeout(resolve, 300));

      const orderIndex = this.mockOrders.findIndex(o => o.id === orderId);
      if (orderIndex !== -1) {
        this.mockOrders[orderIndex] = {
          ...this.mockOrders[orderIndex],
          cancellation_status: 'rejected',
        };
      }

      return {
        status: 'success',
        message: 'Đã từ chối yêu cầu hủy đơn hàng',
      };
    }

    const response = await this.api.post<CancelOrderResponse>(
      `/orders/${orderId}/cancel/reject`,
      { reason }
    );
    return response.data;
  }

  async getPendingCancelItems(): Promise<PendingCancelItem[]> {
    const response = await api.get<PendingCancelResponse>(
      '/nguoi-kiem-duyet/data-chua-duyet'
    );
    console.log(' getPendingCancelItems nguoi-kiem-duyet/data-chua-duyet');
    console.log('response', response);
    return response.data.data;
  }

  async getResolvedCancelItems(type: 2 | -1): Promise<PendingCancelItem[]> {
    const response = await api.post<PendingCancelResponse>(
      '/nguoi-kiem-duyet/data-da-duyet-tu-choi',
      { type }
    );
    return response.data.data;
  }

  async approveCancelItem(itemId: number): Promise<ApproveCancelResponse> {
    const response = await api.post<ApproveCancelResponse>(
      `/nguoi-kiem-duyet/duyet-huy/${itemId}`
    );
    console.log(' approveCancelItem nguoi-kiem-duyet/duyet-huy/${itemId}', itemId);
    console.log('response', response);
    return response.data;
  }

  async rejectCancelItem(itemId: number, reason: string): Promise<ApproveCancelResponse> {
    const response = await api.post<ApproveCancelResponse>(
      `/nguoi-kiem-duyet/tu-choi-huy/${itemId}`,
      { reason }
    );
    console.log(' rejectCancelItem nguoi-kiem-duyet/tu-choi-huy/${itemId} ${reason}', itemId, reason);
    console.log('response', response);
    return response.data;
  }

  /**
   * Duyệt hoặc từ chối yêu cầu hủy món (unified endpoint).
   * type = 2  → duyệt xóa
   * type = -1 → từ chối xóa
   * Throws 422 ValidationError nếu id_chi_tiet thiếu / không hợp lệ.
   */
  async actionDuyet(request: ActionDuyetRequest): Promise<ActionDuyetResponse> {
    const response = await api.post<ActionDuyetResponse>(
      '/nguoi-kiem-duyet/action-duyet',
      request
    );
    return response.data;
  }

  async updateOrderStatus(orderId: number, status: string): Promise<Order> {
    if (USE_MOCK_DATA) {
      await new Promise<void>(resolve => setTimeout(resolve, 500));

      const orderIndex = this.mockOrders.findIndex(o => o.id === orderId);
      if (orderIndex === -1) {
        throw new Error('Order not found');
      }

      this.mockOrders[orderIndex] = {
        ...this.mockOrders[orderIndex],
        status: status as OrderStatus,
        updated_at: new Date().toISOString(),
      };

      if (status === OrderStatus.COMPLETED) {
        this.mockOrders[orderIndex].completed_at = new Date().toISOString();
      }

      return this.mockOrders[orderIndex];
    }

    const response = await this.api.patch<OrderDetailResponse>(
      `/orders/${orderId}/status`,
      { status }
    );
    return response.data.data;
  }
}

export const orderService = new OrderService();
