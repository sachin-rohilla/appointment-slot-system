import http from "http";
import app from "./app";
import { Server } from "socket.io";

const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId as string;
  console.log(`User connected: ${userId}`);

  if (userId) {
    socket.join(userId);
  }

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${userId}`);
  });
});
const PORT = process.env.PORT;

if (!PORT) {
  console.error("PORT environment variable is not set");
  process.exit(1);
}

server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
