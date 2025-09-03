import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_ACCOUNT,
    pass: process.env.GMAIL_PASSWORD,
  },
});

export const sendMail = async (to: string|string[], subject: string, text: string) => {
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
  } catch (error) {
    console.error("Error sending email:", error);
  }
};
