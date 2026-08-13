'use client';
import React, { createContext, useContext, useState, useCallback } from 'react';

export interface Notification { id: string; type: 'success' | 'error' | 'info' | 'warning'; message: string; }
interface NotifCtx { notifications: Notification[]; addNotification: (type: Notification['type'], message: string) => void; removeNotification: (id: string) => void; }

const NotificationContext = createContext<NotifCtx>({ notifications: [], addNotification: () => {}, removeNotification: () => {} });
export const useNotification = () => useContext(NotificationContext);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const addNotification = useCallback((type: Notification['type'], message: string) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, type, message }]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 5000);
  }, []);
  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);
  return <NotificationContext.Provider value={{ notifications, addNotification, removeNotification }}>{children}</NotificationContext.Provider>;
}
