import { useEffect, useState } from "react";
import WebSocket from "ws";

const server = new WebSocket.Server({ port: 5173 });

server.on("connection", (socket) => {
  console.log("Client connected");

  socket.on("message", (message) => {
    console.log("Message from client:", message);

    // Broadcast message to all connected clients
    server.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(`Received: ${message}`);
      }
    });
  });

  socket.on("close", () => {
    console.log("Client disconnected");
  });
});
