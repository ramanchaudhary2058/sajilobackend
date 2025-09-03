import { Server } from "socket.io";
import express from "express";
import { createServer } from "http";

export const app = express();

export const serverInstance = createServer(app);

export const io = new Server(serverInstance, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://sajilofrontend.vercel.app/",
       "*",
    ],
    methods: ["POST", "GET"],
    credentials: true,
  },
});

const users: { [key: string]: string } = {};

export const getUserSocketId = (userId: string) => {
  let searchUserId = "";
  if (users) {
    searchUserId = users[userId];
  }
  return searchUserId;
};

io.on("connection", (socket) => {
  console.log("Connect to Socket server", socket.id);
  const userId = socket.handshake.query.userId as string;

  if (userId) users[userId] = socket.id;

  socket.on("disconnect", () => {
    console.log("Disconnected from socket server", socket.id);
  });
});
