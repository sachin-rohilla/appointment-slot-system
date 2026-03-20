"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { io, Socket } from "socket.io-client";
import { useNotifications } from "./NotificationContext";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType | null>(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within SocketProvider");
  }
  return context;
};

export const SocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { addNotification } = useNotifications();

  useEffect(() => {
    // Get user from localStorage or auth context
    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : null;

    if (user) {
      const socketUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      
      console.log("🔌 Initializing socket connection...");
      console.log("📍 Socket URL:", socketUrl);
      console.log("👤 User ID:", user.id);
      
      const newSocket = io(socketUrl, {
        query: {
          userId: user.id,
        },
        transports: ["polling", "websocket"],
        timeout: 20000,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      newSocket.on("connect", () => {
        console.log("✅ Connected to socket server successfully!");
        console.log("🔗 Socket ID:", newSocket.id);
        setIsConnected(true);
      });

      newSocket.on("disconnect", (reason) => {
        console.log("❌ Disconnected from socket server. Reason:", reason);
        setIsConnected(false);
      });

      newSocket.on("connect_error", (error) => {
        console.log("🚫 Socket connection error:", error);
        console.log("🚫 Error details:", error.message);
      });

      newSocket.on("slotAvailable", (data: { slotId: string; message: string; heldUntil?: Date }) => {
        console.log("🔔 Received slotAvailable notification:", data);
        addNotification({
          message: data.message || "A slot is now available!",
          type: "success",
          data: { slotId: data.slotId, heldUntil: data.heldUntil },
        });
      });

      setSocket(newSocket);

      return () => {
        console.log("🔄 Cleaning up socket connection...");
        newSocket.close();
        setSocket(null);
        setIsConnected(false);
      };
    } else {
      console.log("🚫 No user found, skipping socket connection");
    }
  }, [addNotification]);

  const value: SocketContextType = {
    socket,
    isConnected,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
