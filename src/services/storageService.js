const KEYS = {
  users: 'inrflow_users',
  currentUser: 'inrflow_current_user',
  wallets: 'inrflow_wallets',
  transactions: 'inrflow_transactions',
  orders: 'inrflow_orders',
  commissions: 'inrflow_commissions',
  kyc: 'inrflow_kyc',
  disputes: 'inrflow_disputes',
  notifications: 'inrflow_notifications',
  settlements: 'inrflow_settlements',
  auditLogs: 'inrflow_audit_logs',
  settings: 'inrflow_settings',
  ledger: 'inrflow_ledger',
  seedVersion: 'inrflow_seed_version',
};

export const STORAGE_KEYS = KEYS;
export const ALL_KEYS = Object.values(KEYS);

export function getStorage(key, defaultValue) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return defaultValue;
    return JSON.parse(raw);
  } catch (e) {
    console.warn('storage parse error', key, e);
    return defaultValue;
  }
}

export function setStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('storage save error', key, e);
  }
}

export function removeStorage(key) { localStorage.removeItem(key); }

export function clearDemoData() {
  ALL_KEYS.forEach((k) => localStorage.removeItem(k));
}

// Users
export const getUsers = () => getStorage(KEYS.users, []);
export const saveUsers = (v) => setStorage(KEYS.users, v);

// Current user
export const getCurrentUser = () => getStorage(KEYS.currentUser, null);
export const setCurrentUser = (v) => setStorage(KEYS.currentUser, v);
export const clearCurrentUser = () => removeStorage(KEYS.currentUser);

// Wallets (map userId -> wallet)
export const getWallets = () => getStorage(KEYS.wallets, {});
export const saveWallets = (v) => setStorage(KEYS.wallets, v);
export const getWallet = (userId) => {
  const w = getWallets();
  return w[userId] || null;
};
export const saveWallet = (wallet) => {
  const all = getWallets();
  all[wallet.userId] = wallet;
  saveWallets(all);
};

// Ledger
export const getLedgerAll = () => getStorage(KEYS.ledger, []);
export const saveLedgerAll = (v) => setStorage(KEYS.ledger, v);

// Transactions
export const getTransactions = () => getStorage(KEYS.transactions, []);
export const saveTransactions = (v) => setStorage(KEYS.transactions, v);

// Orders
export const getOrders = () => getStorage(KEYS.orders, []);
export const saveOrders = (v) => setStorage(KEYS.orders, v);

// Commissions
export const getCommissions = () => getStorage(KEYS.commissions, []);
export const saveCommissions = (v) => setStorage(KEYS.commissions, v);

// KYC
export const getKYC = () => getStorage(KEYS.kyc, []);
export const saveKYC = (v) => setStorage(KEYS.kyc, v);

// Disputes
export const getDisputes = () => getStorage(KEYS.disputes, []);
export const saveDisputes = (v) => setStorage(KEYS.disputes, v);

// Notifications
export const getNotifications = () => getStorage(KEYS.notifications, []);
export const saveNotifications = (v) => setStorage(KEYS.notifications, v);

// Settlements
export const getSettlements = () => getStorage(KEYS.settlements, []);
export const saveSettlements = (v) => setStorage(KEYS.settlements, v);

// Audit logs
export const getAuditLogs = () => getStorage(KEYS.auditLogs, []);
export const saveAuditLogs = (v) => setStorage(KEYS.auditLogs, v);

// Settings
export const DEFAULT_SETTINGS = {
  commissionRate: 2,
  appName: 'INRFlow',
  demoMode: true,
  notifyEmail: true,
  notifyPush: true,
};
export const getSettings = () => ({ ...DEFAULT_SETTINGS, ...getStorage(KEYS.settings, {}) });
export const saveSettings = (v) => setStorage(KEYS.settings, v);

// Seed version
export const getSeedVersion = () => getStorage(KEYS.seedVersion, 0);
export const setSeedVersion = (v) => setStorage(KEYS.seedVersion, v);