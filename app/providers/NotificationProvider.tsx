"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { NotificationType } from "@/types/notification.types";

type NotificationContextType = {
  notifications: NotificationType[];
  addNotification: (notification: Omit<NotificationType, "timeout">) => void;
  removeNotification: (index: number) => void;
};

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

/**
 * Provides notification context to its children.
 * @param children - React children nodes
 * @returns React element
 */
export const NotificationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const timersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  /**
   * Adds a new notification.
   * @param notification - notification details without timeout
   * @returns void
   */
  const addNotification = useCallback(
    (notification: Omit<NotificationType, "timeout">) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const timeoutAt = Date.now() + 5000;

      const newNotification: NotificationType & { id: string } = {
        ...notification,
        timeout: timeoutAt,
        id,
      } as NotificationType & { id: string };

      setNotifications((prev) => [...prev, newNotification]);

      // schedule automatic removal
      const timer = setTimeout(() => {
        setNotifications((prev) =>
          prev.filter((n) => (n as unknown as { id?: string }).id !== id),
        );
        delete timersRef.current[id];
      }, 5000);

      timersRef.current[id] = timer;
    },
    [],
  );

  /**   * Removes a notification by index.
   * @param index - index of the notification to remove
   * @returns void
   */
  const removeNotification = useCallback((index: number) => {
    setNotifications((prev) => {
      const notif = prev[index] as unknown as { id?: string } | undefined;
      if (notif?.id && timersRef.current[notif.id]) {
        clearTimeout(timersRef.current[notif.id]);
        delete timersRef.current[notif.id];
      }
      return prev.filter((_, notifIndex) => notifIndex !== index);
    });
  }, []);

  // clear any timers on unmount
  useEffect(() => {
    return () => {
      Object.values(timersRef.current).forEach((t) => {
        // `t` is a timer id return from setTimeout; clear it
        clearTimeout(t as ReturnType<typeof setTimeout>);
      });
      timersRef.current = {};
    };
  }, []);

  return (
    <NotificationContext.Provider
      value={{ notifications, addNotification, removeNotification }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

/**
 * Custom hook to use notification context.
 * @returns React context for notifications
 */
export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification must be used within a NotificationProvider",
    );
  }
  return context;
}
