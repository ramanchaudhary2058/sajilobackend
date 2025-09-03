import mongoose from "mongoose";
import { Booking } from "../types";

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "hostel",
      required: true,
    },
    checkInDate: {
      type: Date,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["HalfPayment", "FullPayment", "Pending"],
      default: "Pending",
    },
    people: {
      type: Number,
    },

    payment: {
      type: String,
      default: "0",
    },
    checkOutDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

const Booking = mongoose.model<Booking & mongoose.Document>(
  "booking",
  bookingSchema
);

export default Booking;
