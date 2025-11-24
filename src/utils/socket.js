// import { Server } from "socket.io";

// let io = null;

// export function initSocket(server) {
//   io = new Server(server, {
//     cors: { origin: "*" }
//   });

//   io.on("connection", (socket) => {
//     console.log("Socket connected:", socket.id);

//     socket.on("join", (room) => {
//       socket.join(room);
//       console.log(`Socket ${socket.id} joined room: ${room}`);
//     });

//     socket.on("disconnect", () => {
//       console.log("Socket disconnected:", socket.id);
//     });
//   });
// }

// export function emitLiveData(userId, payload) {
//   if (!io) return;
//   io.to(`user:${userId}`).emit("live-data", payload);
// }
import { Server } from "socket.io";

let io = null;

export function initSocket(server) {
  io = new Server(server, {
    cors: { origin: "*" }
  });

  io.on("connection", (socket) => {
    console.log("🔌 Socket connected:", socket.id);

    socket.on("join", (room) => {
      socket.join(room);
      console.log(`➡ Socket ${socket.id} joined: ${room}`);
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected:", socket.id);
    });
  });
}

export function emitLiveData(raw) {
  if (!io) return;

  // 🛠 CLEAN & SAFE FORMAT FOR FRONTEND
  const payload = {
    temperature: raw.temperature ?? 0,
    humidity: raw.humidity ?? 0,
    moisture: raw.moisture ?? 0,
    light: raw.light ?? 0,
    motion: raw.motion ?? 0,
    pump: raw.pump ?? 0
  };

  io.emit("live-data", payload);

  console.log("📡 Emitted live data:", payload);
}

export { io };
