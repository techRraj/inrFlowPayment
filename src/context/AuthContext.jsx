import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  getUsers, saveUsers, getCurrentUser, setCurrentUser, clearCurrentUser,
  getNotifications,
} from '../services/storageService.js';
import { ensureWallet } from '../services/walletService.js';
import { createNotification } from '../services/notificationService.js';
import { generateUserId } from '../utils/ids.js';
import { nowISO } from '../utils/dates.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setUser] = useState(() => getCurrentUser());
  const [ready, setReady] = useState(false);

  useEffect(() => { setReady(true); }, []);

  const login = useCallback((email, password) => {
    const users = getUsers();
    const u = users.find((x) => x.email.toLowerCase() === String(email).toLowerCase().trim());
    if (!u) throw new Error('No demo account found with this email.');
    if (u.password !== password) throw new Error('Incorrect password.');
    if (u.status === 'SUSPENDED') throw new Error('This demo account is suspended.');
    setCurrentUser(u);
    setUser(u);
    ensureWallet(u.id);
    return u;
  }, []);

  const logout = useCallback(() => {
    clearCurrentUser();
    setUser(null);
  }, []);

  const register = useCallback(({ name, email, mobile, password }) => {
    const users = getUsers();
    if (users.some((u) => u.email.toLowerCase() === String(email).toLowerCase().trim())) {
      throw new Error('An account with this email already exists.');
    }
    const user = {
      id: generateUserId(),
      name: String(name).trim(),
      email: String(email).toLowerCase().trim(),
      mobile: String(mobile).trim(),
      password,
      role: 'USER',
      status: 'ACTIVE',
      createdAt: nowISO(),
      isDemo: false,
    };
    users.push(user);
    saveUsers(users);
    ensureWallet(user.id);
    createNotification(user.id, {
      title: 'Welcome to INRFlow Demo',
      message: 'Your demo account is ready. Fund your wallet with demo money and try the buy/sell workflow.',
      type: 'SUCCESS',
    });
    return user;
  }, []);

  const value = { currentUser, login, logout, register, ready, isAuthenticated: !!currentUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}