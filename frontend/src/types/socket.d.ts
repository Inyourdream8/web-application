// src/types/socket.d.ts
import { SelectProps } from "your-select-library";

declare module "your-select-library" {
  interface SelectProps {
    label?: string;
    required?: boolean;
    defaultValue?: string;
  }
}

interface NotificationData {
  id: string;
  message: string;
  type: "info" | "warning" | "error";
  timestamp: string;
}

// Define your WebSocket event types
interface WebSocketEventMap {
  // Server-to-client events
  notification: (data: NotificationData) => void;
  auth_response: (data: { success: boolean; message?: string }) => void;
  user_update: (data: { userId: string; status: string }) => void;

  // Client-to-server events (these would be sent via ws.send())
  authenticate: { token: string };
  join_room: { roomId: string };
  leave_room: { roomId: string };
}

// Extend the WebSocket interface
interface WebSocket {
  sendJson<T extends keyof WebSocketEventMap>(
    type: T,
    data: WebSocketEventMap[T] extends (...args: unknown) => unknown
      ? never
      : WebSocketEventMap[T]
  ): void;
}

declare global {
  interface Window {
    socket?: WebSocket;
  }
}
