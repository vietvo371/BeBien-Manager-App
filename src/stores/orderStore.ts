import { create } from 'zustand';
import { Order, OrderStatus, OrderFilters } from '../types/order.types';

interface OrderState {
  orders: Order[];
  selectedOrder: Order | null;
  filters: OrderFilters;
  setOrders: (orders: Order[]) => void;
  addOrder: (order: Order) => void;
  updateOrder: (orderId: number, updatedOrder: Partial<Order>) => void;
  removeOrder: (orderId: number) => void;
  setSelectedOrder: (order: Order | null) => void;
  setFilters: (filters: OrderFilters) => void;
  resetFilters: () => void;
}

const defaultFilters: OrderFilters = {
  status: 'all',
  searchQuery: '',
};

export const useOrderStore = create<OrderState>((set) => ({
  orders: [],
  selectedOrder: null,
  filters: defaultFilters,

  setOrders: (orders) => set({ orders }),

  addOrder: (order) =>
    set((state) => ({
      orders: [order, ...state.orders],
    })),

  updateOrder: (orderId, updatedOrder) =>
    set((state) => ({
      orders: state.orders.map((order) =>
        order.id === orderId ? { ...order, ...updatedOrder } : order
      ),
      selectedOrder:
        state.selectedOrder?.id === orderId
          ? { ...state.selectedOrder, ...updatedOrder }
          : state.selectedOrder,
    })),

  removeOrder: (orderId) =>
    set((state) => ({
      orders: state.orders.filter((order) => order.id !== orderId),
      selectedOrder:
        state.selectedOrder?.id === orderId ? null : state.selectedOrder,
    })),

  setSelectedOrder: (order) => set({ selectedOrder: order }),

  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),

  resetFilters: () => set({ filters: defaultFilters }),
}));
