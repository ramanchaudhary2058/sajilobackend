"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserSocketId = exports.io = exports.serverInstance = exports.app = void 0;
const socket_io_1 = require("socket.io");
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
exports.app = (0, express_1.default)();
exports.serverInstance = (0, http_1.createServer)(exports.app);
exports.io = new socket_io_1.Server(exports.serverInstance, {
    cors: {
        origin: [
            "http://localhost:5173",
            // "https://city-hostel-zeta.vercel.app/",
            // "*",
        ],
        methods: ["POST", "GET"],
        credentials: true,
    },
});
const users = {};
const getUserSocketId = (userId) => {
    let searchUserId = "";
    if (users) {
        searchUserId = users[userId];
    }
    return searchUserId;
};
exports.getUserSocketId = getUserSocketId;
exports.io.on("connection", (socket) => {
    console.log("Connect to Socket server", socket.id);
    const userId = socket.handshake.query.userId;
    if (userId)
        users[userId] = socket.id;
    socket.on("disconnect", () => {
        console.log("Disconnected from socket server", socket.id);
    });
});
