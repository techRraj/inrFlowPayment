// src/services/orderService.js
import { getOrders, saveOrders } from './storageService.js';
import { generateOrderId } from '../utils/ids.js';
import { nowISO } from '../utils/dates.js';

export function createOrder({ userId, type, amount, commissionRate, commission, status = 'READY' }) {
  const order = {
    id: generateOrderId(),
    userId,
    type,
    amount: +Number(amount).toFixed(2),
    commissionRate: Number(commissionRate),
    commission: +Number(commission).toFixed(2),
    status,
    createdAt: nowISO(),
  };
  const list = getOrders();
  list.unshift(order);
  saveOrders(list);
  return order;
}

export function updateOrderStatus(orderId, status) {
  const list = getOrders().map((o) =>
    o.id === orderId ? { ...o, status, updatedAt: nowISO() } : o
  );
  saveOrders(list);
}

export function getUserOrders(userId) {
  return getOrders()
    .filter((o) => o.userId === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}