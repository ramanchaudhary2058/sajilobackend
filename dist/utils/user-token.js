"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyTokens = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const AppError_1 = __importDefault(require("../middleware/AppError"));
const generateToken = (user) => {
    const payload = {
        name: user.userName,
        role: user.role,
        email: user.email,
        contact: user.contact,
        address: user.address,
        _id: user._id,
        otp: user.otp,
    };
    const token = jsonwebtoken_1.default.sign(payload, "SecretKey", {
        expiresIn: "30d",
    });
    return token;
};
exports.generateToken = generateToken;
const verifyTokens = (userToken, req, next) => {
    return new Promise((resolve, reject) => {
        jsonwebtoken_1.default.verify(userToken, "SecretKey", (err, decoded) => {
            if (err) {
                const errorMessage = "Invalid token. Please log in again.";
                next(new AppError_1.default(errorMessage, 401));
                reject(err);
            }
            else {
                if (typeof decoded === "object" && decoded !== null) {
                    req.user = decoded;
                    resolve(decoded);
                }
                else {
                    const errorMessage = "Invalid token format.";
                    next(new AppError_1.default(errorMessage, 401));
                    reject(new Error(errorMessage));
                }
            }
        });
    });
};
exports.verifyTokens = verifyTokens;
