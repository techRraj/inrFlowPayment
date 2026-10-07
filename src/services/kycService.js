import { getKYC, saveKYC } from './storageService.js';
import { generateKycId } from '../utils/ids.js';
import { nowISO } from '../utils/dates.js';

export function getKYCForUser(userId) {
  return getKYC().filter((k) => k.userId === userId).sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))[0] || null;
}

export function submitKYC(userId, data) {
  const list = getKYC();
  const record = {
    id: generateKycId(),
    userId,
    fullName: data.fullName,
    dob: data.dob,
    idType: data.idType,
    idNumber: data.idNumber,
    address: data.address,
    documentName: data.documentName || null,
    status: 'PENDING',
    submittedAt: nowISO(),
    reviewedAt: null,
    reviewedBy: null,
    rejectionReason: null,
  };
  list.unshift(record);
  saveKYC(list);
  return record;
}

export function reviewKYC(id, { status, reviewedBy, rejectionReason = null }) {
  const list = getKYC().map((k) =>
    k.id === id
      ? { ...k, status, reviewedAt: nowISO(), reviewedBy, rejectionReason }
      : k
  );
  saveKYC(list);
  return list.find((k) => k.id === id);
}

export function getKYCStatus(userId) {
  const k = getKYCForUser(userId);
  return k ? k.status : 'NOT_SUBMITTED';
}