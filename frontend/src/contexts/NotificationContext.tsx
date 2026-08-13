'use client';
import React, { createContext, useContext, useState, useCallback } from 'react';

export interface Notification { id: string; type: 'success' | 'error' | 'info' | 'warning'; message: string; }

interface NotifCtx {
  notifications: Notification[];
  addNotification: (type: Notification['type'], message: string) => void;
  notify: (type: Notification['type'], message: string) => void;
  removeNotification: (id: string) => void;
  dismiss: (id: string) => void;
}

const NotificationContext = createContext<NotifCtx>({
  notifications: [],
  addNotification: () => {},
  notify: () => {},
  removeNotification: () => {},
  dismiss: () => {}
});

export const useNotification = () => useContext(NotificationContext);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  const addNotification = useCallback((type: Notification['type'], message: string) => {
    const id = Date.now().toString() + Math.random();
    setNotifications(prev => [...prev, { id, type, message }]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 5000);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      notify: addNotification,
      removeNotification,
      dismiss: removeNotification
    }}>
      {children}
    </NotificationContext.Provider>
  );
}
