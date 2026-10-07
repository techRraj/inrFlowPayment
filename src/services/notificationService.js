import { getNotifications, saveNotifications } from './storageService.js';
import { generateNotifId } from '../utils/ids.js';
import { nowISO } from '../utils/dates.js';

export function createNotification(userId, { title, message, type = 'INFO' }) {
  const list = getNotifications();
  const n = {
    id: generateNotifId(),
    userId,
    title,
    message,
    type,
    read: false,
    createdAt: nowISO(),
  };
  list.unshift(n);
  saveNotifications(list);
  return n;
}

export function getUserNotifications(userId) {
  return getNotifications().filter((n) => n.userId === userId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function markNotificationRead(id) {
  const list = getNotifications().map((n) => (n.id === id ? { ...n, read: true } : n));
  saveNotifications(list);
}

export function markAllRead(userId) {
  const list = getNotifications().map((n) => (n.userId === userId ? { ...n, read: true } : n));
  saveNotifications(list);
}