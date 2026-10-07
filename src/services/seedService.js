import {
  getUsers, saveUsers, getWallets, saveWallets, getTransactions, saveTransactions,
  getOrders, saveOrders, getCommissions, saveCommissions, getKYC, saveKYC,
  getDisputes, saveDisputes, getNotifications, saveNotifications,
  getSettlements, saveSettlements, getAuditLogs, saveAuditLogs,
  getSettings, saveSettings, getLedgerAll, saveLedgerAll,
  getSeedVersion, setSeedVersion, clearDemoData, DEFAULT_SETTINGS,
} from './storageService.js';
import { daysAgoISO, nowISO } from '../utils/dates.js';
import {
  generateUserId, generateTxnId, generateOrderId, generateCommissionId,
  generateNotifId, generateLedgerId, generateAuditId, generateDisputeId,
  generateSettlementId, generateKycId, generatePaymentId,
} from '../utils/ids.js';

const SEED_VERSION = 1;

export function seedIfEmpty() {
  const v = getSeedVersion();
  if (v === SEED_VERSION && getUsers().length > 0) return;
  resetDemoData();
}

export function resetDemoData() {
  clearDemoData();

  const userPassword = 'User@123';
  const adminPassword = 'Admin@123';

  const user = {
    id: generateUserId(),
    name: 'Rahul Sharma',
    email: 'user@demo.com',
    mobile: '9876543210',
    password: userPassword,
    role: 'USER',
    status: 'ACTIVE',
    createdAt: daysAgoISO(45),
    isDemo: true,
  };

  const admin = {
    id: generateUserId(),
    name: 'INRFlow Admin',
    email: 'admin@demo.com',
    mobile: '9000000000',
    password: adminPassword,
    role: 'ADMIN',
    status: 'ACTIVE',
    createdAt: daysAgoISO(60),
    isDemo: true,
  };

  saveUsers([user, admin]);

  // Wallet for user
  const wallet = {
    userId: user.id,
    balance: 25000,
    totalCredits: 25000,
    totalDebits: 0,
    totalCommission: 0,
    updatedAt: nowISO(),
  };
  saveWallets({ [user.id]: wallet });

  // Ledger with initial deposit
  const ledger = [{
    id: generateLedgerId(),
    userId: user.id,
    type: 'DEMO_DEPOSIT',
    credit: 25000,
    debit: 0,
    balance: 25000,
    description: 'Initial demo wallet funding',
    createdAt: daysAgoISO(45),
    refId: 'SEED',
  }];
  saveLedgerAll(ledger);

  // Demo transactions
  const txnSeeds = [
    { type: 'BUY', amount: 10000, rate: 2, days: 3 },
    { type: 'SELL', amount: 5000, rate: 2, days: 5 },
    { type: 'BUY', amount: 2500, rate: 2, days: 8 },
    { type: 'SELL', amount: 15000, rate: 2, days: 12 },
    { type: 'BUY', amount: 7500, rate: 2, days: 15, status: 'PENDING' },
    { type: 'BUY', amount: 3000, rate: 2, days: 20, status: 'FAILED' },
  ];

  const transactions = [];
  const orders = [];
  const commissions = [];

  txnSeeds.forEach((s, i) => {
    const createdAt = daysAgoISO(s.days);
    const orderId = generateOrderId();
    const txnId = generateTxnId();
    const paymentId = generatePaymentId();
    const commissionAmount = +(s.amount * s.rate / 100).toFixed(2);
    const status = s.status || 'SUCCESS';

    orders.push({
      id: orderId,
      userId: user.id,
      type: s.type,
      amount: s.amount,
      commissionRate: s.rate,
      commission: commissionAmount,
      status,
      createdAt,
    });

    transactions.push({
      id: txnId,
      orderId,
      userId: user.id,
      paymentId,
      type: s.type,
      amount: s.amount,
      commission: commissionAmount,
      commissionRate: s.rate,
      status,
      createdAt,
      timeline: {
        orderCreated: createdAt,
        paymentInitiated: createdAt,
        paymentSuccess: status === 'SUCCESS' ? createdAt : null,
        commissionCalculated: status === 'SUCCESS' ? createdAt : null,
        commissionCredited: status === 'SUCCESS' ? createdAt : null,
        completed: status === 'SUCCESS' ? createdAt : null,
      },
    });

    if (status === 'SUCCESS') {
      commissions.push({
        id: generateCommissionId(),
        userId: user.id,
        transactionId: txnId,
        amount: commissionAmount,
        rate: s.rate,
        transactionAmount: s.amount,
        status: 'CREDITED',
        createdAt,
      });
    }
  });

  saveOrders(orders);
  saveTransactions(transactions);
  saveCommissions(commissions);

  // Compute total commission and add commission ledger entries
  const totalCommission = commissions.reduce((a, c) => a + c.amount, 0);
  let runningBalance = 25000;

  commissions.forEach((c) => {
    runningBalance += c.amount;
    ledger.push({
      id: generateLedgerId(),
      userId: user.id,
      type: 'COMMISSION',
      credit: c.amount,
      debit: 0,
      balance: runningBalance,
      description: `Commission ${c.rate}% on ${c.transactionId}`,
      createdAt: c.createdAt,
      refId: c.transactionId,
    });
  });

  // A withdrawal for realism
  const withdrawal = 3000;
  runningBalance -= withdrawal;
  ledger.push({
    id: generateLedgerId(),
    userId: user.id,
    type: 'WITHDRAWAL',
    credit: 0,
    debit: withdrawal,
    balance: runningBalance,
    description: 'Demo withdrawal to Bank Account',
    createdAt: daysAgoISO(2),
    refId: 'WD-SEED',
  });

  saveLedgerAll(ledger);

  // Update wallet with computed values
  wallet.balance = runningBalance;
  wallet.totalCommission = totalCommission;
  wallet.totalDebits = withdrawal;
  wallet.totalCredits = 25000 + totalCommission;
  wallet.updatedAt = nowISO();
  saveWallets({ [user.id]: wallet });

  // KYC
  saveKYC([
    {
      id: generateKycId(),
      userId: user.id,
      fullName: 'Rahul Sharma',
      dob: '1994-04-12',
      idType: 'DEMO_AADHAAR',
      idNumber: 'XXXX-XXXX-1234',
      address: '42, MG Road, Bengaluru, Karnataka 560001',
      documentName: 'demo_id.pdf',
      status: 'VERIFIED',
      submittedAt: daysAgoISO(30),
      reviewedAt: daysAgoISO(28),
      reviewedBy: admin.id,
      rejectionReason: null,
    },
  ]);

  // Disputes
  saveDisputes([
    {
      id: generateDisputeId(),
      userId: user.id,
      transactionId: transactions[5].id,
      reason: 'Transaction Failed',
      description: 'The demo payment failed but the amount was held. Requesting refund.',
      status: 'OPEN',
      createdAt: daysAgoISO(18),
      updatedAt: daysAgoISO(18),
      adminResponse: null,
    },
  ]);

  // Notifications
  saveNotifications([
    {
      id: generateNotifId(),
      userId: user.id,
      title: 'Welcome to INRFlow Demo',
      message: 'Your demo wallet has been created and funded with ₹25,000. Explore the full workflow with simulated transactions.',
      type: 'INFO',
      read: true,
      createdAt: daysAgoISO(45),
    },
    {
      id: generateNotifId(),
      userId: user.id,
      title: 'KYC verified',
      message: 'Your simulated KYC has been verified. You can now use all demo features.',
      type: 'SUCCESS',
      read: false,
      createdAt: daysAgoISO(28),
    },
    {
      id: generateNotifId(),
      userId: user.id,
      title: `₹${commissions[0]?.amount.toFixed(2)} commission credited`,
      message: `Commission credited for transaction ${commissions[0]?.transactionId}.`,
      type: 'SUCCESS',
      read: false,
      createdAt: commissions[0]?.createdAt || nowISO(),
    },
  ]);

  // Settlements
  saveSettlements([
    {
      id: generateSettlementId(),
      userId: user.id,
      amount: 20000,
      transactionCount: 4,
      commission: 600,
      status: 'PENDING',
      createdAt: daysAgoISO(2),
    },
  ]);

  // Audit logs
  saveAuditLogs([
    { id: generateAuditId(), action: 'DEMO_INITIALIZED', admin: 'SYSTEM', target: 'ALL', description: 'Demo data initialized', createdAt: daysAgoISO(45) },
    { id: generateAuditId(), action: 'KYC_VERIFIED', admin: 'INRFlow Admin', target: user.id, description: 'Verified demo KYC for Rahul Sharma', createdAt: daysAgoISO(28) },
    { id: generateAuditId(), action: 'ADMIN_LOGIN', admin: 'INRFlow Admin', target: 'admin@demo.com', description: 'Admin signed in', createdAt: daysAgoISO(1) },
  ]);

  saveSettings(DEFAULT_SETTINGS);
  setSeedVersion(SEED_VERSION);
}