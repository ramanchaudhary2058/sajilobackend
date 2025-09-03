"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const roomSchema = new mongoose_1.default.Schema({
    title: {
        type: String,
    },
    hostelName: {
        type: String,
    },
    imgUrl: {
        type: String,
    },
    location: {
        type: String,
    },
    price: {
        type: String,
    },
    frequency: {
        type: String,
    },
    peopleNumber: {
        type: Number,
    },
    totalbed: {
        type: Number,
    },
    email: {
        type: String,
    },
    contact: {
        type: Number,
    },
    ownerEmail: {
        type: String,
    },
    owner: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    isAvailable: {
        type: Boolean,
        default: true,
    },
});
const roomModel = mongoose_1.default.model("hostel", roomSchema);
exports.default = roomModel;
