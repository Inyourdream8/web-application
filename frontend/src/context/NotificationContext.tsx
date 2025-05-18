import React, { createContext, useContext, useState, useEffect } from "react";
import { getSocket } from "@/services/socket";

const NotificationContext = createContext<string[]>([]);

export const NotificationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [notifications, setNotifications] = useState<string[]>([]);

  useEffect(() => {
    const socketService = getSocket();
    socketService.on("new_notification", (payload: { message: string }) => {
      setNotifications((prev) => [...prev, payload.message]);
    });

    return () => {
      socketService.disconnect();
    };
  }, []);

  return (
    <NotificationContext.Provider value={notifications}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  return useContext(NotificationContext);
};
