"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyOTP = exports.bookingverifyOTP = exports.isAuthorized = exports.isOwner = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const CusomError_1 = __importDefault(require("./CusomError"));
const db_1 = require("../db");
const isOwner = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token)
        return CusomError_1.default.noTokenError(next);
    try {
        const decode = jsonwebtoken_1.default.verify(token, "SecretKey");
        req.user = decode;
        if (req.user.role === "owner") {
            next();
        }
        else {
            CusomError_1.default.unAuthorizedError(next);
        }
    }
    catch (error) {
        next(error);
    }
};
exports.isOwner = isOwner;
const isAuthorized = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return CusomError_1.default.unAuthorizedError(next);
    }
    try {
        const decode = jsonwebtoken_1.default.verify(token, "SecretKey");
        req.user = decode;
        next();
    }
    catch (err) {
        return CusomError_1.default.noTokenError(next);
    }
};
exports.isAuthorized = isAuthorized;
const bookingverifyOTP = async (req, res, next) => {
    try {
        const { otp, userId } = req.body;
        if (!otp || !userId)
            return CusomError_1.default.entityPropsMissingError(next);
        const [rows] = await db_1.pool.query("SELECT * FROM users WHERE id=? AND otp=?", [userId, otp]);
        if (rows.length === 0)
            return CusomError_1.default.invalidField(next);
        // Mark as verified and remove OTP
        await db_1.pool.query("UPDATE users SET isVerify = ?, otp = NULL WHERE id = ?", [true, userId]);
        // ✅ Instead of responding, call next()
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.bookingverifyOTP = bookingverifyOTP;
const verifyOTP = async (req, res, next) => {
    try {
        const { otp, userId } = req.body; // frontend must send userId too
        if (!otp || !userId)
            return CusomError_1.default.entityPropsMissingError(next);
        const [rows] = await db_1.pool.query("SELECT * FROM users WHERE id=? AND otp=?", [userId, otp]);
        if (rows.length === 0)
            return CusomError_1.default.invalidField(next);
        // Mark as verified and remove OTP
        await db_1.pool.query("UPDATE users SET isVerify = ?, otp = NULL WHERE id = ?", [true, userId]);
        res.status(200).json({ msg: "Verified successfully!!!" });
    }
    catch (error) {
        next(error);
    }
};
exports.verifyOTP = verifyOTP;
