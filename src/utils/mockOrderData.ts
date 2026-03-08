/**
 * Mock Order Data Generator
 * For development and testing purposes
 */

import { Order, OrderStatus, OrderItem } from '../types/order.types';

const SAMPLE_DISHES = [
  { id: 1, name: 'Phở bò đặc biệt', price: 75000 },
  { id: 2, name: 'Bún chả Hà Nội', price: 65000 },
  { id: 3, name: 'Cơm tấm sườn bì chả', price: 55000 },
  { id: 4, name: 'Bánh mì thịt nguội', price: 25000 },
  { id: 5, name: 'Cà phê sữa đá', price: 30000 },
  { id: 6, name: 'Trà đá chanh', price: 15000 },
  { id: 7, name: 'Nem rán', price: 45000 },
  { id: 8, name: 'Gỏi cuốn tôm thịt', price: 40000 },
  { id: 9, name: 'Bún bò Huế', price: 70000 },
  { id: 10, name: 'Mì Quảng', price: 65000 },
];

const STATUSES = [
  OrderStatus.PENDING,
  OrderStatus.CONFIRMED,
  OrderStatus.PREPARING,
  OrderStatus.READY,
  OrderStatus.COMPLETED,
  OrderStatus.CANCELLED,
];

const CUSTOMER_NAMES = [
  'Nguyễn Văn An',
  'Trần Thị Bích',
  'Lê Hoàng Cường',
  'Phạm Thu Hà',
  'Hoàng Minh Khôi',
  'Vũ Thị Lan',
  'Đặng Quốc Minh',
  'Bùi Thị Nga',
];

const CUSTOMER_PHONES = [
  '0901234567',
  '0912345678',
  '0923456789',
  '0934567890',
  '0945678901',
  '0956789012',
  '0967890123',
  '0978901234',
];

function randomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateOrderItems(): OrderItem[] {
  const itemCount = randomInt(1, 5);
  const items: OrderItem[] = [];
  const usedDishes = new Set<number>();

  for (let i = 0; i < itemCount; i++) {
    let dish;
    do {
      dish = randomItem(SAMPLE_DISHES);
    } while (usedDishes.has(dish.id));
    
    usedDishes.add(dish.id);
    const quantity = randomInt(1, 3);
    const subtotal = dish.price * quantity;

    items.push({
      id: i + 1,
      order_id: 0,
      product_id: dish.id,
      product_name: dish.name,
      quantity,
      price: dish.price,
      subtotal,
      notes: Math.random() > 0.7 ? 'Ít cay, không rau thơm' : undefined,
    });
  }

  return items;
}

function generateOrderCode(): string {
  const timestamp = Date.now().toString().slice(-6);
  const random = randomInt(100, 999);
  return `DH${timestamp}${random}`;
}

function generatePastDate(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(randomInt(8, 20), randomInt(0, 59), randomInt(0, 59));
  return date.toISOString();
}

export function generateMockOrder(id: number, daysAgo: number = 0): Order {
  const items = generateOrderItems();
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const tax = Math.round(subtotal * 0.1);
  const discount = Math.random() > 0.7 ? Math.round(subtotal * 0.1) : 0;
  const total = subtotal + tax - discount;
  const status = randomItem(STATUSES);
  const createdAt = generatePastDate(daysAgo);

  const order: Order = {
    id,
    order_code: generateOrderCode(),
    table_number: Math.random() > 0.3 ? randomInt(1, 20).toString() : undefined,
    customer_name: Math.random() > 0.5 ? randomItem(CUSTOMER_NAMES) : undefined,
    customer_phone: Math.random() > 0.5 ? randomItem(CUSTOMER_PHONES) : undefined,
    status,
    items: items.map(item => ({ ...item, order_id: id })),
    subtotal,
    tax,
    discount,
    total,
    payment_method: Math.random() > 0.5 ? 'cash' : 'card',
    notes: Math.random() > 0.7 ? 'Giao nhanh, khách đang đợi' : undefined,
    created_by: randomInt(1, 10),
    created_by_name: randomItem(CUSTOMER_NAMES),
    created_at: createdAt,
    updated_at: createdAt,
  };

  if (status === OrderStatus.COMPLETED) {
    const completedDate = new Date(createdAt);
    completedDate.setMinutes(completedDate.getMinutes() + randomInt(15, 45));
    order.completed_at = completedDate.toISOString();
  }

  if (status === OrderStatus.CANCELLED) {
    const cancelledDate = new Date(createdAt);
    cancelledDate.setMinutes(cancelledDate.getMinutes() + randomInt(5, 30));
    order.cancelled_at = cancelledDate.toISOString();
    order.cancellation_reason = 'Khách hàng hủy đơn';
    order.cancellation_status = Math.random() > 0.5 ? 'approved' : 'pending';
  }

  return order;
}

export function generateMockOrders(count: number = 50): Order[] {
  const orders: Order[] = [];
  
  for (let i = 1; i <= count; i++) {
    const daysAgo = Math.floor(i / 10);
    orders.push(generateMockOrder(i, daysAgo));
  }

  return orders.sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}
