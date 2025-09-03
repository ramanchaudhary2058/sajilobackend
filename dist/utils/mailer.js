"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const transporter = nodemailer_1.default.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GMAIL_ACCOUNT,
        pass: process.env.GMAIL_PASSWORD,
    },
});
const sendMail = async (to, subject, text) => {
    console.log(process.env.GMAIL_ACCOUNT);
    const mailOptions = {
        from: process.env.GMAIL_ACCOUNT,
        to,
        subject,
        html: text,
    };
    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${to}`);
    }
    catch (error) {
        console.error("Error sending email:", error);
    }
};
exports.sendMail = sendMail;
