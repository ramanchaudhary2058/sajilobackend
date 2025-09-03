import express from "express";
import { SendOtp } from "../controller/otp.controller";


const router = express.Router();

router.post("/get-otp", SendOtp);

export default router;
