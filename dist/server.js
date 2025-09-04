"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const routes_1 = require("./routes");
const RealTime_1 = require("./real-time/RealTime");
RealTime_1.app.use((0, cors_1.default)());
RealTime_1.app.use(express_1.default.json({ limit: "10mb" }));
RealTime_1.app.use(express_1.default.urlencoded({ limit: "10mb", extended: true }));
// ✅ No need to call pool.getConnection() here again
RealTime_1.app.use("/auth", routes_1.AuthRoute);
RealTime_1.app.use("/user", routes_1.UserRoute);
RealTime_1.app.use("/book", routes_1.BookingRoute);
RealTime_1.app.use("/room", routes_1.RoomRoute);
RealTime_1.app.use("/otp", routes_1.otp);
RealTime_1.app.use("/cloudinary", routes_1.CloudeRoute);
RealTime_1.app.use("/payment", routes_1.Payment);
// app.use(Logger);
RealTime_1.serverInstance.listen(3333, () => {
    console.log("🚀 Server has started on port 3333");
});
