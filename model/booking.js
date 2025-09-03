"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const bookingSchema = new mongoose_1.default.Schema({
    user: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    room: {
        type: mongoose_1.default.Schema.Types.ObjectId,
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
}, {
    timestamps: true,
});
const Booking = mongoose_1.default.model("booking", bookingSchema);
exports.default = Booking;
