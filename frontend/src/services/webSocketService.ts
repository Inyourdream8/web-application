export const createWebSocket = (url: string): WebSocket | null => {
  if (!url) {
    console.error("WebSocket URL is required");
    return null;
  }

  if (!("WebSocket" in window)) {
    console.error("WebSocket is not supported by your browser");
    return null;
  }

  const socket = new WebSocket(url);

  socket.onopen = () => console.log("WebSocket connected!");
  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log("Message received:", data);
    } catch (error) {
      console.error("Failed to parse message:", event.data);
    }
  };
  socket.onerror = (error) => console.error("WebSocket error:", error);
  socket.onclose = (event) => {
    console.log("WebSocket closed!", event.reason);
    if (!event.wasClean) {
      console.log("Attempting to reconnect...");
      setTimeout(() => createWebSocket(url), 5000);
    }
  };

  return socket;
};
