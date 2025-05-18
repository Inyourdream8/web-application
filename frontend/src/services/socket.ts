class SocketService {
  private socket: WebSocket | null = null;
  private eventListeners: Map<string, ((...args: unknown[]) => void)[]> =
    new Map();
  private reconnectAttempts = 0; // Tracks the number of retries
  private maxReconnectAttempts = 5; // Maximum retries before stopping

  // Initialize WebSocket with token
  initialize(token: string): void {
    if (!token || typeof token !== "string" || token.trim() === "") {
      console.error("Invalid token. Cannot initialize WebSocket.");
      return;
    }

    const url = `ws://localhost:5173/ws/ws=${encodeURIComponent(token)}`;
    this.connect(url, token)
      .then(() => console.log("WebSocket connection initialized"))
      .catch((error) =>
        console.error("WebSocket initialization failed:", error)
      );
  }

  // Connect to WebSocket server
  connect(url: string, token?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket = new WebSocket(url);

      this.socket.onopen = () => {
        console.log("WebSocket connected");
        this.reconnectAttempts = 0; // Reset attempts on successful connection
        if (token) {
          this.send("authenticate", { token });
        }
        resolve();
      };

      this.socket.onmessage = (event) => this.handleMessage(event);

      this.socket.onclose = (event) => {
        console.log("WebSocket disconnected. Reason:", event.reason);
        if (
          !event.wasClean &&
          this.reconnectAttempts < this.maxReconnectAttempts
        ) {
          console.log("Attempting to reconnect in 5 seconds...");
          this.reconnectAttempts++;
          setTimeout(() => this.connect(url, token), 5000);
        } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.error("Max reconnect attempts reached. Giving up.");
        }
      };
    });
  }

  // Handle incoming WebSocket messages
  private handleMessage(event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data);
      if (data.type) {
        this.emit(data.type, data.payload); // Trigger listeners for the event type
      } else {
        console.warn("Message type missing:", data);
      }
    } catch (error) {
      console.error("Error parsing WebSocket message:", error);
    }
  }

  // Send data via WebSocket
  send<T>(type: string, data: T): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type, data }));
    } else {
      console.error("WebSocket is not open. Unable to send data.");
    }
  }

  // Register an event listener
  on(event: string, callback: (...args: unknown[]) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)?.push(callback);
  }

  // Trigger registered event listeners
  private emit(event: string, ...args: unknown[]): void {
    const listeners = this.eventListeners.get(event);
    if (listeners && listeners.length > 0) {
      listeners.forEach((callback) => callback(...args));
    } else {
      console.warn(`No listeners registered for event: ${event}`);
    }
  }

  // Disconnect WebSocket and clean up
  disconnect(): void {
    if (this.socket) {
      if (this.socket.readyState !== WebSocket.CLOSED) {
        this.socket.close();
      }
      this.socket = null;
      this.eventListeners.clear();
      console.log("WebSocket connection closed and cleaned up");
    }
  }
}

export const socketService = new SocketService();

export const initializeSocket = async (
  url: string,
  token?: string
): Promise<void> => {
  try {
    await socketService.connect(url, token);
    console.log("WebSocket initialized");
  } catch (error) {
    console.error("Failed to initialize WebSocket:", error);
  }
};

export const disconnectSocket = (): void => {
  socketService.disconnect();
};

export const getSocket = (): SocketService => {
  return socketService;
};
