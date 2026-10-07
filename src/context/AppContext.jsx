import { createContext, useContext, useCallback, useEffect, useState } from 'react';
import { useAuth } from './AuthContext.jsx';
import { getSettings, saveSettings, getNotifications, saveNotifications } from '../services/storageService.js';
import { getUserNotifications, markAllRead, markNotificationRead } from '../services/notificationService.js';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const { currentUser } = useAuth();
  const [settings, setSettingsState] = useState(() => getSettings());
  const [notifications, setNotifications] = useState([]);
  const [dataVersion, setDataVersion] = useState(0);

  const refreshNotifications = useCallback(() => {
    if (!currentUser) { setNotifications([]); return; }
    setNotifications(getUserNotifications(currentUser.id));
  }, [currentUser]);

  useEffect(() => { refreshNotifications(); }, [refreshNotifications]);

  useEffect(() => {
    const onStorage = () => setDataVersion((v) => v + 1);
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const updateSettings = useCallback((patch) => {
    const next = { ...settings, ...patch };
    saveSettings(next);
    setSettingsState(next);
    setDataVersion((v) => v + 1);
  }, [settings]);

  const bumpData = useCallback(() => setDataVersion((v) => v + 1), []);

  const markRead = useCallback((id) => {
    markNotificationRead(id);
    refreshNotifications();
  }, [refreshNotifications]);

  const markAll = useCallback(() => {
    if (!currentUser) return;
    markAllRead(currentUser.id);
    refreshNotifications();
  }, [currentUser, refreshNotifications]);

  return (
    <AppContext.Provider value={{
      settings, updateSettings,
      notifications, refreshNotifications, markRead, markAll,
      dataVersion, bumpData,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}