"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const userSchema = new mongoose_1.default.Schema({
    userName: {
        type: String,
    },
    email: {
        type: String,
    },
    contact: {
        type: String,
    },
    address: {
        type: String,
    },
    password: {
        type: String,
    },
    role: {
        type: String,
    },
    isVerify: {
        type: Boolean,
        default: false,
    },
});
const UserModel = mongoose_1.default.model("User", userSchema);
exports.default = UserModel;
