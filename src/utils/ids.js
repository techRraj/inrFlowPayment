export function generateId(prefix) {
  const n = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}-${n}`;
}

export function generatePaymentId() { return generateId('PAY'); }
export function generateOrderId() { return generateId('ORD'); }
export function generateTxnId() { return generateId('TXN'); }
export function generateCommissionId() { return generateId('COM'); }
export function generateUserId() { return generateId('USR'); }
export function generateDisputeId() { return generateId('DSP'); }
export function generateSettlementId() { return generateId('SET'); }
export function generateNotifId() { return `NTF-${Date.now()}-${Math.floor(Math.random()*9999)}`; }
export function generateLedgerId() { return `LED-${Date.now()}-${Math.floor(Math.random()*9999)}`; }
export function generateAuditId() { return `AUD-${Date.now()}-${Math.floor(Math.random()*9999)}`; }
export function generateKycId() { return `KYC-${Date.now()}-${Math.floor(Math.random()*9999)}`; }