// import http from "http";
// import dotenv from "dotenv";
// import app from "./app.js";

// dotenv.config();

// const PORT = process.env.PORT || 5000;

// const server = http.createServer(app);

// // Start Server
// server.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
// });

import http from "http";
import dotenv from "dotenv";
import app from "./app.js";
import { initSocket } from "./utils/socket.js";


dotenv.config();

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Start WebSocket
initSocket(server);

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
