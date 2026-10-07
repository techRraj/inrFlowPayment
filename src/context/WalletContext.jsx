import { createContext, useContext, useCallback, useEffect, useState } from 'react';
import { useAuth } from './AuthContext.jsx';
import {
  getWalletSummary, getLedger, creditWallet, debitWallet, ensureWallet,
} from '../services/walletService.js';

const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  const { currentUser } = useAuth();
  const [summary, setSummary] = useState({ balance: 0, totalCredits: 0, totalDebits: 0, totalCommission: 0 });
  const [ledger, setLedger] = useState([]);
  const [version, setVersion] = useState(0);

  const refresh = useCallback(() => {
    if (!currentUser) {
      setSummary({ balance: 0, totalCredits: 0, totalDebits: 0, totalCommission: 0 });
      setLedger([]);
      return;
    }
    ensureWallet(currentUser.id);
    setSummary(getWalletSummary(currentUser.id));
    setLedger(getLedger(currentUser.id));
    setVersion((v) => v + 1);
  }, [currentUser]);

  useEffect(() => { refresh(); }, [refresh]);

  const credit = useCallback((amount, reason, type = 'CREDIT', refId = null) => {
    if (!currentUser) throw new Error('Not authenticated.');
    const w = creditWallet(currentUser.id, amount, reason, type, refId);
    refresh();
    return w;
  }, [currentUser, refresh]);

  const debit = useCallback((amount, reason, type = 'DEBIT', refId = null) => {
    if (!currentUser) throw new Error('Not authenticated.');
    const w = debitWallet(currentUser.id, amount, reason, type, refId);
    refresh();
    return w;
  }, [currentUser, refresh]);

  return (
    <WalletContext.Provider value={{ ...summary, ledger, credit, debit, refresh, version }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used inside WalletProvider');
  return ctx;
}