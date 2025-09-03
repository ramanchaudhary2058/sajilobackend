"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.forgotPassword = exports.logIn = exports.createUser = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = __importDefault(require("crypto"));
const db_1 = require("../db");
const utils_1 = require("../utils");
const CusomError_1 = __importDefault(require("../middleware/CusomError"));
const createUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userName, email, contact, address, password, role } = req.body;
        if (!userName || !email || !contact || !password) {
            return CusomError_1.default.entityPropsMissingError(next);
        }
        // Check if user exists
        const [existing] = yield db_1.pool.query("SELECT * FROM users WHERE email = ?", [email]);
        if (existing.length > 0) {
            return CusomError_1.default.entityAlreadyExistsError(next);
        }
        // Hash password
        const hashedPwd = yield bcrypt_1.default.hash(password, 10);
        // Generate OTP
        const otpToSend = (0, utils_1.GenerateOtp)().toString();
        // Send email
        const emailBody = `<h3>Your OTP is: ${otpToSend}</h3>`;
        yield (0, utils_1.sendMail)(email, "Email Verification", emailBody);
        // Insert user
        const [result] = yield db_1.pool.query("INSERT INTO users (userName, email, contact, address, password, role, isVerify, otp) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [userName, email, contact, address, hashedPwd, role, false, otpToSend]);
        const payload = {
            id: result.insertId,
            userName,
            email,
            contact,
            role,
            otp: otpToSend,
        };
        const token = (0, utils_1.generateToken)(payload);
        res
            .status(200)
            .json({
            msg: "Otp has been sent to your mail!!!",
            token,
            userId: result.insertId,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.createUser = createUser;
const logIn = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return CusomError_1.default.entityPropsMissingError(next);
        const [rows] = yield db_1.pool.query("SELECT * FROM users WHERE email = ?", [email]);
        if (rows.length === 0)
            return CusomError_1.default.searchEntityMissingError(next);
        const user = rows[0];
        const isMatch = yield bcrypt_1.default.compare(password, user.password);
        if (!isMatch)
            return CusomError_1.default.invalidField(next);
        if (!user.isVerify)
            return CusomError_1.default.notVerify(next);
        const token = (0, utils_1.generateToken)(user);
        res.status(200).json({ token, user, msg: "Logged in Successfully!!!" });
    }
    catch (error) {
        next(error);
    }
});
exports.logIn = logIn;
// ✅ Forgot Password (send token to email)
const forgotPassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        if (!email)
            return CusomError_1.default.entityPropsMissingError(next);
        const [rows] = yield db_1.pool.query("SELECT * FROM users WHERE email=?", [
            email,
        ]);
        if (rows.length === 0)
            return CusomError_1.default.invalidField(next);
        const user = rows[0];
        // Generate reset token (JWT or random string)
        const resetToken = crypto_1.default.randomBytes(32).toString("hex");
        const resetTokenExpiry = Date.now() + 1000 * 60 * 10; // 10 mins expiry
        yield db_1.pool.query("UPDATE users SET resetToken=?, resetTokenExpiry=? WHERE id=?", [resetToken, resetTokenExpiry, user.id]);
        // Link (frontend reset page)
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
        // Send email
        yield (0, utils_1.sendMail)(email, "Password Reset Request", `Click here to reset password: ${resetUrl}`);
        res.status(200).json({ msg: "Password reset email sent!" });
    }
    catch (error) {
        next(error);
    }
});
exports.forgotPassword = forgotPassword;
// ✅ Reset Password
const resetPassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.params;
        const { password } = req.body;
        if (!token || !password)
            return CusomError_1.default.entityPropsMissingError(next);
        const [rows] = yield db_1.pool.query("SELECT * FROM users WHERE resetToken=?", [token]);
        if (rows.length === 0)
            return CusomError_1.default.invalidField(next);
        const user = rows[0];
        // Check expiry
        if (Date.now() > user.resetTokenExpiry)
            return CusomError_1.default.invalidField(next);
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        yield db_1.pool.query("UPDATE users SET password=?, resetToken=NULL, resetTokenExpiry=NULL WHERE id=?", [hashedPassword, user.id]);
        res.status(200).json({ msg: "Password reset successful!" });
    }
    catch (error) {
        next(error);
    }
});
exports.resetPassword = resetPassword;
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const { token } = req.params;
//     const { password } = req.body;
//     if (!token || !password) return CustomError.entityPropsMissingError(next);
//     const [rows]: any = await pool.query(
//       "SELECT * FROM users WHERE resetToken=?",
//       [token]
//     );
//     if (rows.length === 0) 
//       return res.status(400).json({ msg: "Invalid token" });
//     const user = rows[0];
//     // Check expiry
//     if (Date.now() > user.resetTokenExpiry)
//       return res.status(400).json({ msg: "Token has expired" });
//     const hashedPassword = await bcrypt.hash(password, 10);
//     await pool.query(
//       "UPDATE users SET password=?, resetToken=NULL, resetTokenExpiry=NULL WHERE id=?",
//       [hashedPassword, user.id]
//     );
//     res.status(200).json({ msg: "Password reset successful!" });
//   } catch (error) {
//     next(error);
//   }
// };
