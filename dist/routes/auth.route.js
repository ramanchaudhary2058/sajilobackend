"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = require("../controller/auth.controller");
const isValidUser_1 = require("../middleware/isValidUser");
const router = express_1.default.Router();
router.post("/create", auth_controller_1.createUser);
router.post("/login", auth_controller_1.logIn);
router.post("/verify-otp", isValidUser_1.verifyOTP);
router.post("/forgot-password", auth_controller_1.forgotPassword);
router.post("/reset-password/:token", auth_controller_1.resetPassword);
exports.default = router;
