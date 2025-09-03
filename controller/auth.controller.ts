import { NextFunction, Request, Response } from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { pool } from "../db";
import { GenerateOtp, generateToken, sendMail } from "../utils";
import CustomError from "../middleware/CusomError";

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userName, email, contact, address, password, role } = req.body;

    if (!userName || !email || !contact || !password) {
      return CustomError.entityPropsMissingError(next);
    }

    // Check if user exists
    const [existing]: any = await pool.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    if (existing.length > 0) {
      return CustomError.entityAlreadyExistsError(next);
    }

    // Hash password
    const hashedPwd = await bcrypt.hash(password, 10);

    // Generate OTP
    const otpToSend = GenerateOtp().toString();

    // Send email
    const emailBody = `<h3>Your OTP is: ${otpToSend}</h3>`;
    await sendMail(email, "Email Verification", emailBody);

    // Insert user
    const [result]: any = await pool.query(
      "INSERT INTO users (userName, email, contact, address, password, role, isVerify, otp) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [userName, email, contact, address, hashedPwd, role, false, otpToSend]
    );

    const payload = {
      id: result.insertId,
      userName,
      email,
      contact,
      role,
      otp: otpToSend,
    };

    const token = generateToken(payload as any);

    res
      .status(200)
      .json({
        msg: "Otp has been sent to your mail!!!",
        token,
        userId: result.insertId,
      });
  } catch (error) {
    next(error);
  }
};

export const logIn = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return CustomError.entityPropsMissingError(next);

    const [rows]: any = await pool.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    if (rows.length === 0) return CustomError.searchEntityMissingError(next);

    const user = rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return CustomError.invalidField(next);

    if (!user.isVerify) return CustomError.notVerify(next);

    const token = generateToken(user);

    res.status(200).json({ token, user, msg: "Logged in Successfully!!!" });
  } catch (error) {
    next(error);
  }
};

// ✅ Forgot Password (send token to email)
export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;
    if (!email) return CustomError.entityPropsMissingError(next);

    const [rows]: any = await pool.query("SELECT * FROM users WHERE email=?", [
      email,
    ]);
    if (rows.length === 0) return CustomError.invalidField(next);

    const user = rows[0];

    // Generate reset token (JWT or random string)
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = Date.now() + 1000 * 60 * 10; // 10 mins expiry

    await pool.query(
      "UPDATE users SET resetToken=?, resetTokenExpiry=? WHERE id=?",
      [resetToken, resetTokenExpiry, user.id]
    );

    // Link (frontend reset page)
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // Send email
    await sendMail(
      email,
      "Password Reset Request",
      `Click here to reset password: ${resetUrl}`
    );

    res.status(200).json({ msg: "Password reset email sent!" });
  } catch (error) {
    next(error);
  }
};

// ✅ Reset Password
export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token || !password) return CustomError.entityPropsMissingError(next);

    const [rows]: any = await pool.query(
      "SELECT * FROM users WHERE resetToken=?",
      [token]
    );
    if (rows.length === 0) return CustomError.invalidField(next);

    const user = rows[0];

    // Check expiry
    if (Date.now() > user.resetTokenExpiry)
      return CustomError.invalidField(next);

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      "UPDATE users SET password=?, resetToken=NULL, resetTokenExpiry=NULL WHERE id=?",
      [hashedPassword, user.id]
    );

    res.status(200).json({ msg: "Password reset successful!" });
  } catch (error) {
    next(error);
  }
};

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
