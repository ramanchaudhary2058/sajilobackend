"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendOtp = void 0;
const utils_1 = require("../utils");
const db_1 = require("../db");
const CusomError_1 = __importDefault(require("../middleware/CusomError"));
const SendOtp = async (req, res, next) => {
    try {
        const { userId, userName, role, email, contact, address } = req.body;
        if (!userId)
            return CusomError_1.default.entityPropsMissingError(next);
        const otp = (0, utils_1.GenerateOtp)();
        // Save OTP in database for verification
        await db_1.pool.query("UPDATE users SET otp=? WHERE id=?", [otp, userId]);
        const payload = {
            userName,
            role,
            email,
            contact,
            address,
            id: userId, // MySQL id
            otp: otp.toString(),
        };
        const emailBody = ` <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
      <h2 style="color: #4CAF50; text-align: center;">Your OTP Code</h2>
      <p style="font-size: 16px; color: #333;">Hi <strong>${userName}</strong>,</p>
      <p style="font-size: 16px; color: #333;">Use the following OTP (One Time Password) to complete your booking process.</p>
      <div style="text-align: center; margin: 20px 0;">
        <p style="font-size: 24px; font-weight: bold; color: #000;"> ${otp}</p>
      </div>
      <p style="font-size: 16px; color: #333;">If you did not request this, please ignore this email or contact support.</p>
      <p style="font-size: 16px; color: #333;">Sajilo Aawas Best Regards,</p>
      <p style="font-size: 16px; color: #333;"><strong>Aawas</strong></p>
      <hr style="border-top: 1px solid #ddd; margin-top: 20px;">
      <p style="font-size: 12px; text-align: center; color: #999;">&copy; 2025 Sajilo Aawas. All rights reserved.</p>
    </div>`;
        const token = (0, utils_1.generateToken)(payload);
        await (0, utils_1.sendMail)(email, "Booking Verification", emailBody);
        return res.status(200).json({ msg: "OTP has been sent to your mail!!!", token });
    }
    catch (error) {
        return CusomError_1.default.tryCatchError(next);
    }
};
exports.SendOtp = SendOtp;
