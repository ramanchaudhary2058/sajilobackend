"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomModel = exports.UserModel = exports.Booking = void 0;
var booking_1 = require("./booking");
Object.defineProperty(exports, "Booking", { enumerable: true, get: function () { return __importDefault(booking_1).default; } });
var user_model_1 = require("./user-model");
Object.defineProperty(exports, "UserModel", { enumerable: true, get: function () { return __importDefault(user_model_1).default; } });
var room_model_1 = require("./room-model");
Object.defineProperty(exports, "RoomModel", { enumerable: true, get: function () { return __importDefault(room_model_1).default; } });
