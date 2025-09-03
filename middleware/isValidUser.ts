import { NextFunction, Request, Response } from "express";
import { user } from "../types";
import jwt from "jsonwebtoken";
import CustomError from "./CusomError";
import { pool } from "../db";

interface CustomRequest extends Request {
  user?: user;
}

export const isOwner = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return CustomError.noTokenError(next);
  try {
    const decode = jwt.verify(token, "SecretKey");

    req.user = decode as user;
    if (req.user.role === "owner") {
      next();
    } else {
      CustomError.unAuthorizedError(next);
    }
  } catch (error) {
    next(error);
  }
};

export const isAuthorized = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return CustomError.unAuthorizedError(next);
  }
  try {
    const decode = jwt.verify(token, "SecretKey");
    req.user = decode as user;
    next();
  } catch (err) {
    return CustomError.noTokenError(next);
  }
};

export const bookingverifyOTP = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { otp, userId } = req.body;

    if (!otp || !userId) return CustomError.entityPropsMissingError(next);

    const [rows]: any = await pool.query(
      "SELECT * FROM users WHERE id=? AND otp=?",
      [userId, otp]
    );

    if (rows.length === 0) return CustomError.invalidField(next);

    // Mark as verified and remove OTP
    await pool.query("UPDATE users SET isVerify = ?, otp = NULL WHERE id = ?", [true, userId]);

    // ✅ Instead of responding, call next()
    next();
  } catch (error) {
    next(error);
  }
};
export const verifyOTP = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { otp, userId } = req.body;  // frontend must send userId too

    if (!otp || !userId) return CustomError.entityPropsMissingError(next);

    const [rows]: any = await pool.query("SELECT * FROM users WHERE id=? AND otp=?", [userId, otp]);

    if (rows.length === 0) return CustomError.invalidField(next);

    // Mark as verified and remove OTP
    await pool.query("UPDATE users SET isVerify = ?, otp = NULL WHERE id = ?", [true, userId]);

    res.status(200).json({ msg: "Verified successfully!!!" });
  } catch (error) {
    next(error);
  }
};
