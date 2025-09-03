import jwt from "jsonwebtoken";
import { user } from "../types";
import { NextFunction, Request } from "express";
import AppError from "../middleware/AppError";

export const generateToken = (user: user) => {
  const payload = {
    name: user.userName,
    role: user.role,
    email: user.email,
    contact: user.contact,
    address: user.address,
    _id: user._id,
    otp: user.otp,
  };
  const token = jwt.sign(payload, "SecretKey", {
    expiresIn: "30d",
  });
  return token;
};

interface CustomRequest extends Request {
  user?: user;
}

export const verifyTokens = (
  userToken: string,
  req: CustomRequest,
  next: NextFunction
): Promise<user | void> => {
  return new Promise((resolve, reject) => {
    jwt.verify(userToken, "SecretKey", (err, decoded) => {
      if (err) {
        const errorMessage = "Invalid token. Please log in again.";
        next(new AppError(errorMessage, 401));
        reject(err);
      } else {
        if (typeof decoded === "object" && decoded !== null) {
          req.user = decoded as user;
          resolve(decoded as user);
        } else {
          const errorMessage = "Invalid token format.";
          next(new AppError(errorMessage, 401));
          reject(new Error(errorMessage));
        }
      }
    });
  });
};
