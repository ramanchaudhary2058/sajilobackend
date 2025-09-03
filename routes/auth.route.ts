import express from "express";



import { createUser, forgotPassword, logIn, resetPassword } from "../controller/auth.controller";
import { verifyOTP } from "../middleware/isValidUser";

const router = express.Router();

router.post("/create", createUser);
router.post("/login",logIn);
router.post("/verify-otp",verifyOTP );
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
export default router;

