
import express from "express";
import cors from "cors";
import Logger from "./middleware/Logger";
import {
  AuthRoute,
  BookingRoute,
  UserRoute,
  RoomRoute,
  CloudeRoute,
  Payment,
  otp,
} from "./routes/";

import { app, serverInstance } from "./real-time/RealTime";
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// ✅ No need to call pool.getConnection() here again

app.use("/auth", AuthRoute);
app.use("/user", UserRoute);
app.use("/book", BookingRoute);
app.use("/room", RoomRoute);
app.use("/otp", otp);
app.use("/cloudinary", CloudeRoute);
app.use("/payment", Payment);
app.use(Logger);
serverInstance.listen(3333, () => {
  console.log("🚀 Server has started on port 3333");
});
