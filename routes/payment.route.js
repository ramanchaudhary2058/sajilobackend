"use strict";
// import express from "express";
// import { Payment } from "../controller/payment";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// const router = express.Router();
// router.get("/:id", Payment);
// export default router;
const express_1 = __importDefault(require("express"));
const payment_1 = require("../controller/payment");
const router = express_1.default.Router();
router.get("/:amount", payment_1.initiatePayment);
router.post("/verify", payment_1.verifyPayment);
exports.default = router;
